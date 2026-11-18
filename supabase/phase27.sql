-- Phase 27 : médiathèque modifiable (titre, texte alternatif, légende) sans changer l'adresse du fichier
create table if not exists media_meta (
  path text primary key,
  title text,
  alt text,
  caption text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table media_meta enable row level security;
drop policy if exists "media_meta redaction" on media_meta;
create policy "media_meta redaction" on media_meta for all using (public.is_staff('journalist')) with check (public.is_staff('journalist'));
