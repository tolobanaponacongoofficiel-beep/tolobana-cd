-- Phase 6 : Tolobana TV (vidéos YouTube et directs). À exécuter UNE FOIS dans Supabase > SQL Editor.
create table if not exists videos(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  kind text not null default 'reportage' check (kind in ('journal','interview','reportage','actualite','emission','direct','archive')),
  youtube_id text not null,
  description text,
  is_live boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists videos_pub_idx on videos(is_published, published_at desc);
alter table videos enable row level security;
drop policy if exists "videos publiques" on videos;
drop policy if exists "videos redaction" on videos;
create policy "videos publiques" on videos for select using (is_published or public.is_staff('editor'));
create policy "videos redaction" on videos for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
