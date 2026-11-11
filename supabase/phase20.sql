-- Phase 20 : fc_clubs, joueurs, compositions et événements de match. À exécuter UNE FOIS (sans risque si relancé).
create table if not exists fc_clubs(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null check (char_length(name) between 2 and 80),
  short_name text check (char_length(short_name) <= 40),
  aliases text[] not null default '{}',
  country text, city text, founded int check (founded between 1800 and 2100),
  stadium text, colors text, coach text, website text, crest_url text,
  history text check (char_length(history) <= 8000), honours text check (char_length(honours) <= 4000),
  is_published boolean not null default true, created_at timestamptz default now());
create table if not exists fc_players(
  id uuid primary key default gen_random_uuid(),
  club_id uuid references fc_clubs(id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  position text check (position in ('gardien','defenseur','milieu','attaquant')),
  shirt_number int check (shirt_number between 0 and 99),
  birth_date date, nationality text, height_cm int check (height_cm between 100 and 230),
  foot text check (foot in ('droit','gauche','ambidextre')), photo_url text,
  bio text check (char_length(bio) <= 4000), is_active boolean not null default true, created_at timestamptz default now());
create table if not exists fc_matches(
  match_ref text primary key, home text not null, away text not null, kickoff timestamptz,
  home_score int, away_score int, competition text, status text,
  home_club uuid references fc_clubs(id) on delete set null, away_club uuid references fc_clubs(id) on delete set null,
  home_formation text, away_formation text, updated_at timestamptz default now());
create table if not exists fc_lineups(
  id bigserial primary key, match_ref text not null references fc_matches(match_ref) on delete cascade,
  side text not null check (side in ('home','away')), player_id uuid references fc_players(id) on delete set null,
  name text not null, shirt_number int, is_starter boolean not null default true, is_captain boolean not null default false, sort int not null default 0);
create table if not exists fc_events(
  id bigserial primary key, match_ref text not null references fc_matches(match_ref) on delete cascade,
  minute int, extra int not null default 0,
  type text not null check (type in ('goal','penalty','own_goal','yellow','second_yellow','red','sub')),
  side text not null check (side in ('home','away')),
  player_id uuid references fc_players(id) on delete set null, player_name text not null,
  other_id uuid references fc_players(id) on delete set null, other_name text, note text);
create index if not exists fc_players_club_idx on fc_players(club_id);
create index if not exists fc_lineups_match_idx on fc_lineups(match_ref);
create index if not exists fc_lineups_player_idx on fc_lineups(player_id);
create index if not exists fc_events_match_idx on fc_events(match_ref);
create index if not exists fc_events_player_idx on fc_events(player_id);
create index if not exists fc_events_other_idx on fc_events(other_id);
create index if not exists fc_meta_home_idx on fc_matches(home_club);
create index if not exists fc_meta_away_idx on fc_matches(away_club);
alter table fc_clubs enable row level security; alter table fc_players enable row level security; alter table fc_matches enable row level security;
alter table fc_lineups enable row level security; alter table fc_events enable row level security;
drop policy if exists "fc_clubs lecture" on fc_clubs; drop policy if exists "fc_clubs redaction" on fc_clubs;
create policy "fc_clubs lecture" on fc_clubs for select using (is_published or public.is_staff('editor'));
create policy "fc_clubs redaction" on fc_clubs for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "joueurs lecture" on fc_players; drop policy if exists "joueurs redaction" on fc_players;
create policy "joueurs lecture" on fc_players for select using (true);
create policy "joueurs redaction" on fc_players for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "meta lecture" on fc_matches; drop policy if exists "meta redaction" on fc_matches;
create policy "meta lecture" on fc_matches for select using (true);
create policy "meta redaction" on fc_matches for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "compos lecture" on fc_lineups; drop policy if exists "compos redaction" on fc_lineups;
create policy "compos lecture" on fc_lineups for select using (true);
create policy "compos redaction" on fc_lineups for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "evenements lecture" on fc_events; drop policy if exists "evenements redaction" on fc_events;
create policy "evenements lecture" on fc_events for select using (true);
create policy "evenements redaction" on fc_events for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
