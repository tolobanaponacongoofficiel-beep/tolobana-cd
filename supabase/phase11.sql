-- Phase 11 : Stories, suivi de dossiers. À exécuter UNE FOIS dans Supabase > SQL Editor > New query (sans risque si relancé).

-- 1) Stories (cartes verticales illustrées)
create table if not exists stories(
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  kicker text check (char_length(kicker) <= 40),
  image_url text not null,
  stat1_value text check (char_length(stat1_value) <= 20), stat1_label text check (char_length(stat1_label) <= 40),
  stat2_value text check (char_length(stat2_value) <= 20), stat2_label text check (char_length(stat2_label) <= 40),
  article_slug text,
  is_published boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now());
create index if not exists stories_pub_idx on stories(is_published, created_at desc);
alter table stories enable row level security;
drop policy if exists "stories lecture" on stories; drop policy if exists "stories redaction" on stories;
create policy "stories lecture" on stories for select using (is_published or public.is_staff('editor'));
create policy "stories redaction" on stories for all using (public.is_staff('editor')) with check (public.is_staff('editor'));

-- 2) Suivre un dossier (double confirmation par e-mail ; écriture réservée au serveur)
create table if not exists dossier_follows(
  id bigserial primary key,
  dossier_id uuid not null references dossiers(id) on delete cascade,
  email text not null check (char_length(email) between 5 and 190),
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  requested_at timestamptz default now(),
  confirmed_at timestamptz,
  ip_hash text,
  unique (dossier_id, email));
create index if not exists dossier_follows_idx on dossier_follows(dossier_id, status);
alter table dossier_follows enable row level security;
drop policy if exists "follows redaction" on dossier_follows;
create policy "follows redaction" on dossier_follows for select using (public.is_staff('editor'));
alter table dossiers add column if not exists last_notified_at timestamptz;
