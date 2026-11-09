-- Phase 12 : Services (annonces), résultats sportifs. À exécuter UNE FOIS dans Supabase > SQL Editor > New query (sans risque si relancé).

-- 1) Services : avis de décès, communiqués, emplois, appels d'offres, petites annonces
create table if not exists service_posts(
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('deces','communique','emploi','appel','annonce')),
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 10 and 4000),
  org text check (char_length(org) <= 150),
  location text check (char_length(location) <= 120),
  contact text not null check (char_length(contact) <= 200),
  image_url text,
  deadline date,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  is_paid boolean not null default false,
  amount_note text check (char_length(amount_note) <= 80),
  submitter_name text,
  submitter_email text,
  ip_hash text,
  created_at timestamptz default now(),
  published_at timestamptz,
  expires_at timestamptz);
create index if not exists service_posts_idx on service_posts(type, status, published_at desc);
create index if not exists service_posts_ip_idx on service_posts(ip_hash, created_at);
alter table service_posts enable row level security;
drop policy if exists "service lecture" on service_posts; drop policy if exists "service depot" on service_posts; drop policy if exists "service redaction" on service_posts;
create policy "service lecture" on service_posts for select using ((status = 'published' and (expires_at is null or expires_at > now())) or public.is_staff('editor'));
-- Dépôt public : uniquement en attente, jamais publié ni marqué payé.
create policy "service depot" on service_posts for insert with check (status = 'pending' and is_paid = false and published_at is null and image_url is null);
create policy "service redaction" on service_posts for all using (public.is_staff('editor')) with check (public.is_staff('editor'));

-- 2) Résultats sportifs saisis par la rédaction
create table if not exists matches(
  id uuid primary key default gen_random_uuid(),
  competition text not null check (char_length(competition) <= 80),
  home text not null check (char_length(home) <= 60),
  away text not null check (char_length(away) <= 60),
  home_score int check (home_score between 0 and 99),
  away_score int check (away_score between 0 and 99),
  kickoff timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now());
create index if not exists matches_kickoff_idx on matches(kickoff);
alter table matches enable row level security;
drop policy if exists "matches lecture" on matches; drop policy if exists "matches redaction" on matches;
create policy "matches lecture" on matches for select using (true);
create policy "matches redaction" on matches for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
