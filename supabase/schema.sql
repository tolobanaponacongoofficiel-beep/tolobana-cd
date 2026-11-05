create extension if not exists unaccent;
create type user_role as enum ('reader','journalist','editor','admin','super_admin');
create type article_status as enum ('draft','submitted','approved','rejected','scheduled','published','archived');

create table profiles(id uuid primary key references auth.users on delete cascade,name text,role user_role not null default 'reader',bio text,created_at timestamptz default now());
create table categories(id serial primary key,parent_id int references categories(id) on delete set null,name text not null,slug text unique not null,position int default 0,show_in_menu boolean default true);
create table articles(id uuid primary key default gen_random_uuid(),title text not null,subtitle text,slug text unique not null,summary text,body text not null,
 author_id uuid not null references profiles(id),category_id int not null references categories(id),status article_status not null default 'draft',review_note text,
 is_breaking boolean default false,is_featured boolean default false,is_demo boolean default false,views int default 0,
 published_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());
create index on articles(status,published_at desc);
create table audit_log(id bigserial primary key,user_id uuid,action text not null,target text,created_at timestamptz default now());

create function is_staff(min user_role) returns boolean language sql security definer stable as $$
 select exists(select 1 from profiles p where p.id=auth.uid() and p.role>=min) $$;
create function on_signup() returns trigger language plpgsql security definer as $$
 begin insert into profiles(id,name) values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1))); return new; end $$;
create trigger t_signup after insert on auth.users for each row execute function on_signup();

alter table profiles enable row level security;alter table categories enable row level security;alter table articles enable row level security;alter table audit_log enable row level security;
create policy "profiles lisibles" on profiles for select using(true);
create policy "profil modifiable par soi" on profiles for update using(auth.uid()=id) with check(role=(select role from profiles where id=auth.uid()));
create policy "categories publiques" on categories for select using(true);
create policy "categories admin" on categories for all using(is_staff('admin')) with check(is_staff('admin'));
create policy "articles publies publics" on articles for select using(status='published' and published_at<=now());
create policy "auteur voit les siens" on articles for select using(author_id=auth.uid());
create policy "redaction voit tout" on articles for select using(is_staff('editor'));
create policy "journaliste cree" on articles for insert with check(is_staff('journalist') and author_id=auth.uid() and status in ('draft','submitted'));
create policy "auteur modifie brouillon" on articles for update using(author_id=auth.uid() and status in ('draft','rejected')) with check(status in ('draft','submitted'));
create policy "editeur modifie tout" on articles for update using(is_staff('editor'));
create policy "admin supprime" on articles for delete using(is_staff('admin'));
create policy "audit lisible admin" on audit_log for select using(is_staff('admin'));
create policy "audit ecriture staff" on audit_log for insert with check(is_staff('journalist'));

insert into categories(name,slug,position)
select n,regexp_replace(lower(unaccent(n)),'[^a-z0-9]+','-','g'),row_number() over() from unnest(array['À la Une','Dernière minute','Politique','Économie','Finance et Budget','Société','Sécurité et Défense','Justice','Diplomatie','Afrique','International','Provinces','Kinshasa','Santé','Éducation','Environnement','Technologie et Numérique','Culture','Musique','Sport','Football','Opinions','Analyses','Interviews','Enquêtes','Vidéos','Tolobana TV']) as n;
insert into categories(parent_id,name,slug,show_in_menu)
select (select id from categories where slug='provinces'),n,'province-'||regexp_replace(lower(unaccent(n)),'[^a-z0-9]+','-','g'),false
from unnest(array['Bas-Uele','Équateur','Haut-Katanga','Haut-Lomami','Haut-Uele','Ituri','Kasaï','Kasaï-Central','Kasaï-Oriental','Kongo-Central','Kwango','Kwilu','Lomami','Lualaba','Kinshasa-Province','Mai-Ndombe','Maniema','Mongala','Nord-Kivu','Nord-Ubangi','Sankuru','Sud-Kivu','Sud-Ubangi','Tanganyika','Tshopo','Tshuapa']) as n;
-- Après votre inscription : update profiles set role='super_admin' where id=(select id from auth.users where email='VOTRE@EMAIL');
