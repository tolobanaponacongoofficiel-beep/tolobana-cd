-- Phase 14 : Agenda des événements + montants des publicités. À exécuter UNE FOIS dans Supabase > SQL Editor > New query (sans risque si relancé).
create table if not exists events(
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  description text check (char_length(description) <= 3000),
  category text not null default 'autre' check (category in ('culture','politique','sport','sante','economie','religion','education','autre')),
  venue text check (char_length(venue) <= 150),
  city text check (char_length(city) <= 80),
  starts_at timestamptz not null,
  ends_at timestamptz,
  image_url text,
  link_url text,
  is_published boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now());
create index if not exists events_start_idx on events(starts_at);
alter table events enable row level security;
drop policy if exists "events lecture" on events; drop policy if exists "events redaction" on events;
create policy "events lecture" on events for select using (is_published or public.is_staff('editor'));
create policy "events redaction" on events for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
-- Montant facturé d'une publicité (texte libre, ex. « 150 USD »), pour la page Revenus
alter table ads add column if not exists amount_note text check (char_length(amount_note) <= 80);
