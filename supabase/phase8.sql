-- Phase 8 : mention « Mis à jour » + index de performance. À exécuter UNE FOIS dans Supabase > SQL Editor (sans risque si relancé).
alter table articles add column if not exists last_update_at timestamptz;
create index if not exists articles_status_pub_idx on articles(status, published_at desc);
create index if not exists articles_views_idx on articles(views desc);
