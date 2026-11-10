-- Phase 18 : Direct Foot (diffusions officielles + guide "Où regarder")
create table if not exists foot_streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  embed_url text not null,
  note text,
  sort int not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists foot_guide (
  id uuid primary key default gen_random_uuid(),
  match_label text not null,
  competition text,
  kickoff timestamptz not null,
  channels text not null,
  link_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table foot_streams enable row level security;
alter table foot_guide enable row level security;
drop policy if exists "foot_streams lecture" on foot_streams;
drop policy if exists "foot_streams redaction" on foot_streams;
drop policy if exists "foot_guide lecture" on foot_guide;
drop policy if exists "foot_guide redaction" on foot_guide;
create policy "foot_streams lecture" on foot_streams for select using (is_active or public.is_staff('editor'));
create policy "foot_streams redaction" on foot_streams for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "foot_guide lecture" on foot_guide for select using (is_active or public.is_staff('editor'));
create policy "foot_guide redaction" on foot_guide for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create index if not exists foot_guide_kickoff on foot_guide (kickoff);
