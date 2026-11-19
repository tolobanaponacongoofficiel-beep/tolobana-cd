-- Phase 32 : gestion à la WordPress (corbeille, révisions, notes internes)

-- 1) Statut « trash » (corbeille) autorisé sur les articles
do $$
declare c record;
begin
  for c in select conname from pg_constraint where conrelid = 'public.articles'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%status%' loop
    execute format('alter table public.articles drop constraint %I', c.conname);
  end loop;
  alter table public.articles add constraint articles_status_chk check (status in ('draft','submitted','published','rejected','trash'));
end $$;

-- 2) Révisions (historique des versions)
create table if not exists article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  title text, subtitle text, summary text, image_url text, blocks jsonb,
  note text,
  saved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists article_revisions_idx on article_revisions(article_id, created_at desc);
alter table article_revisions enable row level security;
drop policy if exists "revisions lecture redaction" on article_revisions;
create policy "revisions lecture redaction" on article_revisions for select using (public.is_staff('journalist'));
drop policy if exists "revisions ecriture redaction" on article_revisions;
create policy "revisions ecriture redaction" on article_revisions for insert with check (public.is_staff('journalist'));
drop policy if exists "revisions menage" on article_revisions;
create policy "revisions menage" on article_revisions for delete using (public.is_staff('journalist'));

-- 3) Notes internes (visibles seulement par la rédaction)
create table if not exists article_notes (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists article_notes_idx on article_notes(article_id, created_at);
alter table article_notes enable row level security;
drop policy if exists "notes lecture redaction" on article_notes;
create policy "notes lecture redaction" on article_notes for select using (public.is_staff('journalist'));
drop policy if exists "notes ecriture redaction" on article_notes;
create policy "notes ecriture redaction" on article_notes for insert with check (public.is_staff('journalist') and user_id = auth.uid());
drop policy if exists "notes suppression" on article_notes;
create policy "notes suppression" on article_notes for delete using (user_id = auth.uid() or public.is_staff('admin'));
