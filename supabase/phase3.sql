create table if not exists comments(id bigserial primary key,article_id uuid not null references articles(id) on delete cascade,user_id uuid not null references profiles(id) on delete cascade,
 parent_id bigint references comments(id) on delete cascade,body text not null check(char_length(body) between 2 and 1500),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),created_at timestamptz default now());
create index if not exists comments_article_idx on comments(article_id,status,created_at);
create table if not exists comment_reports(id bigserial primary key,comment_id bigint not null references comments(id) on delete cascade,user_id uuid not null references profiles(id) on delete cascade,reason text,created_at timestamptz default now(),unique(comment_id,user_id));
alter table comments enable row level security;alter table comment_reports enable row level security;
create policy "commentaires approuves publics" on comments for select using(status='approved');
create policy "auteur voit ses commentaires" on comments for select using(user_id=auth.uid());
create policy "moderation voit tout" on comments for select using(public.is_staff('editor'));
create policy "membre commente" on comments for insert with check(user_id=auth.uid() and (status='pending' or public.is_staff('editor')));
create policy "moderation modifie" on comments for update using(public.is_staff('editor'));
create policy "moderation ou auteur supprime" on comments for delete using(public.is_staff('editor') or user_id=auth.uid());
create policy "signalement membre" on comment_reports for insert with check(user_id=auth.uid());
create policy "signalements lus par moderation" on comment_reports for select using(public.is_staff('editor'));
create policy "moderation supprime signalements" on comment_reports for delete using(public.is_staff('editor'));
create or replace function public.increment_views(p_slug text) returns void language sql security definer set search_path=public as $$
 update articles set views=views+1 where slug=p_slug and status='published' $$;
