-- Phase 4 : articles par blocs + rédacteurs (auteurs sans compte)
-- À exécuter UNE FOIS dans Supabase > SQL Editor, AVANT de déployer le code de la phase 4.

-- 1) Contenu par blocs (la colonne `body` reste remplie en texte brut pour la recherche)
alter table articles add column if not exists blocks jsonb;

-- 2) Rédacteurs : des signatures publiques, avec ou sans compte de connexion
create table if not exists authors(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table authors enable row level security;
drop policy if exists "redacteurs publics" on authors;
drop policy if exists "redacteurs admin" on authors;
create policy "redacteurs publics" on authors for select using (true);
create policy "redacteurs admin" on authors for all using (public.is_staff('admin')) with check (public.is_staff('admin'));

-- 3) Lien article -> rédacteur (si le rédacteur est supprimé, l'article reste en ligne)
alter table articles add column if not exists writer_id uuid;
do $$ begin
  alter table articles add constraint articles_writer_fk foreign key (writer_id) references authors(id) on delete set null;
exception when duplicate_object then null; end $$;
create index if not exists articles_writer_idx on articles(writer_id);
