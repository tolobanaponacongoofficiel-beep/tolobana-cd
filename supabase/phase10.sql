-- Phase 10 : vérification des faits, directs, publicités, anti-spam du contact.
-- À exécuter UNE FOIS dans Supabase > SQL Editor > New query (sans risque si relancé).

-- 1) Vérification des faits
alter table articles add column if not exists fact_verdict text;
alter table articles add column if not exists fact_claim text;
do $$ begin
  alter table articles add constraint articles_fact_verdict_chk check (fact_verdict is null or fact_verdict in ('true','false','misleading','unverified'));
exception when duplicate_object then null; end $$;
create index if not exists articles_fact_idx on articles(published_at desc) where fact_verdict is not null;

-- 2) Contact : empreinte de connexion pour limiter le spam
alter table contact_messages add column if not exists ip_hash text;
create index if not exists contact_ip_idx on contact_messages(ip_hash, created_at);

-- 3) Directs (live blogs)
create table if not exists lives(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null check (char_length(title) between 1 and 160),
  summary text check (char_length(summary) <= 300),
  status text not null default 'live' check (status in ('live','ended')),
  is_published boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  ended_at timestamptz);
create table if not exists live_entries(
  id bigserial primary key,
  live_id uuid not null references lives(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  image_url text,
  important boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now());
create index if not exists live_entries_idx on live_entries(live_id, created_at desc);
create index if not exists lives_status_idx on lives(status, created_at desc);
alter table lives enable row level security; alter table live_entries enable row level security;
drop policy if exists "lives lecture" on lives; drop policy if exists "lives redaction" on lives;
create policy "lives lecture" on lives for select using (is_published or public.is_staff('editor'));
create policy "lives redaction" on lives for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
drop policy if exists "live_entries lecture" on live_entries; drop policy if exists "live_entries redaction" on live_entries;
create policy "live_entries lecture" on live_entries for select using (exists (select 1 from lives l where l.id = live_id and (l.is_published or public.is_staff('editor'))));
create policy "live_entries redaction" on live_entries for all using (public.is_staff('editor')) with check (public.is_staff('editor'));

-- Lien de diffusion (YouTube, Facebook, Vimeo, MP4) pour suivre le direct en vidéo
alter table lives add column if not exists stream_url text;

-- 4) Publicités
create table if not exists ads(
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 150),
  advertiser text,
  image_url text not null,
  link_url text,
  placement text not null check (placement in ('banner','sidebar','article')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  created_at timestamptz default now());
create index if not exists ads_place_idx on ads(placement, is_active);
alter table ads enable row level security;
drop policy if exists "ads lecture" on ads; drop policy if exists "ads admin" on ads;
create policy "ads lecture" on ads for select using ((is_active and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_staff('admin'));
create policy "ads admin" on ads for all using (public.is_staff('admin')) with check (public.is_staff('admin'));

-- Compteurs : réservés au serveur (clé secrète), pour que personne ne puisse gonfler les chiffres.
create or replace function public.increment_ad(p_id uuid, p_kind text)
returns void language sql security definer set search_path = public as $$
  update ads set impressions = impressions + (case when p_kind = 'view' then 1 else 0 end),
                 clicks = clicks + (case when p_kind = 'click' then 1 else 0 end)
  where id = p_id $$;
revoke all on function public.increment_ad(uuid, text) from public, anon, authenticated;
grant execute on function public.increment_ad(uuid, text) to service_role;

-- 5) OPTIONNEL, une fois SUPABASE_SECRET_KEY bien configurée dans Vercel : le contact passe alors uniquement par le serveur.
-- drop policy if exists "contact envoi" on contact_messages;
