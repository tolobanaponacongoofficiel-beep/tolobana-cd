-- Phase 24 : notifications push
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create table if not exists push_log (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  url text,
  sent int not null default 0,
  failed int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
alter table push_log enable row level security;
drop policy if exists "push_sub redaction" on push_subscriptions;
drop policy if exists "push_log redaction" on push_log;
create policy "push_sub redaction" on push_subscriptions for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy "push_log redaction" on push_log for all using (public.is_staff('editor')) with check (public.is_staff('editor'));
-- Les visiteurs s'abonnent / se désabonnent uniquement via ces fonctions (ils ne peuvent pas lire la table).
create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text) returns void
language sql security definer set search_path = public as $$
  insert into push_subscriptions(endpoint, p256dh, auth) values (left(p_endpoint, 1000), left(p_p256dh, 200), left(p_auth, 100))
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
$$;
create or replace function public.push_unsubscribe(p_endpoint text) returns void
language sql security definer set search_path = public as $$
  delete from push_subscriptions where endpoint = p_endpoint;
$$;
grant execute on function public.push_subscribe(text, text, text) to anon, authenticated;
grant execute on function public.push_unsubscribe(text) to anon, authenticated;
