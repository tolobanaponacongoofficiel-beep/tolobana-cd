-- Phase 7 : newsletter + mots-clés. À exécuter UNE FOIS dans Supabase > SQL Editor.
create table if not exists subscribers(
  id bigserial primary key,
  email text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  token text not null unique,
  created_at timestamptz default now(),
  requested_at timestamptz default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
create table if not exists newsletter_campaigns(
  id bigserial primary key,
  subject text not null,
  body text,
  sent_count int not null default 0,
  created_by uuid references profiles(id) on delete set null,
  sent_at timestamptz default now()
);
alter table subscribers enable row level security;
alter table newsletter_campaigns enable row level security;
-- Aucune lecture publique : seuls les administrateurs (et le serveur via la clé secrète) accèdent aux abonnés.
drop policy if exists "abonnes admin" on subscribers;
drop policy if exists "campagnes admin" on newsletter_campaigns;
create policy "abonnes admin" on subscribers for all using (public.is_staff('admin')) with check (public.is_staff('admin'));
create policy "campagnes admin" on newsletter_campaigns for all using (public.is_staff('admin')) with check (public.is_staff('admin'));

-- Mots-clés des articles
alter table articles add column if not exists tags text[] not null default '{}';
create index if not exists articles_tags_idx on articles using gin (tags);
