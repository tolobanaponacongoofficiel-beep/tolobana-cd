-- Phase 5 : bannière large (au-dessus des articles) pour chaque partenaire
alter table partners add column if not exists banner_url text;
