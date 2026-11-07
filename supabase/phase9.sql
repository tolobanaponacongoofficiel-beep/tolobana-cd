-- Phase 9 : pages institutionnelles, réglages, À la une manuelle, dossiers, sondages. À exécuter UNE FOIS (sans risque si relancé).
create table if not exists site_settings(k text primary key, v text);
create table if not exists pages(slug text primary key, body text not null, updated_at timestamptz default now());
create table if not exists contact_messages(
  id bigserial primary key,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 5 and 190),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 5 and 4000),
  is_read boolean not null default false,
  created_at timestamptz default now());
create table if not exists dossiers(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, description text, cover_url text,
  is_published boolean not null default true, created_at timestamptz default now());
create table if not exists dossier_articles(
  dossier_id uuid references dossiers(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  added_at timestamptz default now(), primary key (dossier_id, article_id));
create table if not exists polls(
  id uuid primary key default gen_random_uuid(),
  question text not null, is_active boolean not null default true, ends_at timestamptz,
  created_by uuid references profiles(id) on delete set null, created_at timestamptz default now());
create table if not exists poll_options(
  id bigserial primary key, poll_id uuid not null references polls(id) on delete cascade,
  label text not null, position int not null default 0);
create table if not exists poll_votes(
  id bigserial primary key, poll_id uuid not null references polls(id) on delete cascade,
  option_id bigint not null references poll_options(id) on delete cascade,
  voter_hash text not null, ip_hash text not null, created_at timestamptz default now(),
  unique (poll_id, voter_hash));
create index if not exists poll_votes_ip_idx on poll_votes(poll_id, ip_hash, created_at);

alter table site_settings enable row level security; alter table pages enable row level security;
alter table contact_messages enable row level security; alter table dossiers enable row level security;
alter table dossier_articles enable row level security; alter table polls enable row level security;
alter table poll_options enable row level security; alter table poll_votes enable row level security;

drop policy if exists "reglages lecture" on site_settings; drop policy if exists "reglages admin" on site_settings;
create policy "reglages lecture" on site_settings for select using (true);
create policy "reglages admin" on site_settings for all using (public.is_staff('admin')) with check (public.is_staff('admin'));
drop policy if exists "pages lecture" on pages; drop policy if exists "pages admin" on pages;
create policy "pages lecture" on pages for select using (true);
create policy "pages admin" on pages for all using (public.is_staff('admin')) with check (public.is_staff('admin'));
drop policy if exists "contact envoi" on contact_messages; drop policy if exists "contact admin" on contact_messages;
create policy "contact envoi" on contact_messages for insert to anon, authenticated with check (true);
create policy "contact admin" on contact_messages for all using (public.is_staff('admin')) with check (public.is_staff('admin'));
drop policy if exists "dossiers lecture" on dossiers; drop policy if exists "dossiers redaction" on dossiers;
create policy "dossiers lecture" on dossiers for select using (is_published or public.is_staff('editor'));
create policy "dossiers redaction" on dossiers for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "dossier_articles lecture" on dossier_articles; drop policy if exists "dossier_articles redaction" on dossier_articles;
create policy "dossier_articles lecture" on dossier_articles for select using (true);
create policy "dossier_articles redaction" on dossier_articles for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "polls lecture" on polls; drop policy if exists "polls redaction" on polls;
create policy "polls lecture" on polls for select using (true);
create policy "polls redaction" on polls for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "options lecture" on poll_options; drop policy if exists "options redaction" on poll_options;
create policy "options lecture" on poll_options for select using (true);
create policy "options redaction" on poll_options for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
-- Les votes ne s'écrivent que depuis le serveur (clé secrète) : aucune politique d'insertion publique.
drop policy if exists "votes redaction" on poll_votes;
create policy "votes redaction" on poll_votes for select using (public.is_staff('editor'));

create or replace function public.poll_results(p_poll uuid)
returns table(option_id bigint, label text, votes bigint)
language sql security definer stable set search_path = public as $$
  select o.id, o.label, count(v.id)
  from poll_options o left join poll_votes v on v.option_id = o.id
  where o.poll_id = p_poll group by o.id, o.label, o.position order by o.position, o.id $$;
