-- Phase 15 : équipes, joueurs, chronologie et compositions saisies par la rédaction. À exécuter UNE FOIS dans Supabase > SQL Editor > New query (sans risque si relancé).
create table if not exists teams(
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  city text check (char_length(city) <= 80),
  country text default 'RDC' check (char_length(country) <= 80),
  founded int check (founded between 1800 and 2100),
  stadium text check (char_length(stadium) <= 120),
  coach text check (char_length(coach) <= 100),
  website text check (char_length(website) <= 300),
  logo_url text,
  history text check (char_length(history) <= 6000),
  created_at timestamptz default now());
create table if not exists players(
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  position text check (position in ('gardien','defenseur','milieu','attaquant')),
  shirt int check (shirt between 1 and 99),
  birth_date date,
  nationality text default 'RDC' check (char_length(nationality) <= 60),
  bio text check (char_length(bio) <= 3000),
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz default now());
create index if not exists players_team_idx on players(team_id);
alter table matches add column if not exists home_team_id uuid references teams(id) on delete set null;
alter table matches add column if not exists away_team_id uuid references teams(id) on delete set null;
alter table matches add column if not exists home_lineup text check (char_length(home_lineup) <= 900);
alter table matches add column if not exists away_lineup text check (char_length(away_lineup) <= 900);
alter table matches add column if not exists home_bench text check (char_length(home_bench) <= 600);
alter table matches add column if not exists away_bench text check (char_length(away_bench) <= 600);
create index if not exists matches_home_team_idx on matches(home_team_id);
create index if not exists matches_away_team_idx on matches(away_team_id);
create table if not exists match_events(
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  kind text not null check (kind in ('goal','penalty','own_goal','yellow','red','sub')),
  side text not null check (side in ('home','away')),
  minute int not null check (minute between 0 and 130),
  extra int not null default 0 check (extra between 0 and 20),
  player_name text not null check (char_length(player_name) between 1 and 100),
  player_id uuid references players(id) on delete set null,
  other_name text check (char_length(other_name) <= 100),
  created_at timestamptz default now());
create index if not exists match_events_match_idx on match_events(match_id, minute);
create index if not exists match_events_player_idx on match_events(player_id);
alter table teams enable row level security; alter table players enable row level security; alter table match_events enable row level security;
drop policy if exists "teams lecture" on teams; drop policy if exists "teams redaction" on teams;
drop policy if exists "players lecture" on players; drop policy if exists "players redaction" on players;
drop policy if exists "events lecture sport" on match_events; drop policy if exists "events redaction sport" on match_events;
create policy "teams lecture" on teams for select using (true);
create policy "teams redaction" on teams for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "players lecture" on players for select using (is_active or public.is_staff('editor'));
create policy "players redaction" on players for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "events lecture sport" on match_events for select using (true);
create policy "events redaction sport" on match_events for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
