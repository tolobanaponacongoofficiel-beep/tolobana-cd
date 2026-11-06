alter table articles add column if not exists image_url text, add column if not exists image_caption text;
create or replace function public.is_staff(min user_role) returns boolean language sql security definer stable set search_path=public as $$
 select exists(select 1 from profiles p where p.id=auth.uid() and p.role>=min) $$;
create table if not exists partners(id serial primary key,name text not null,logo_url text,link_url text,position int default 0,is_active boolean default true,created_at timestamptz default now());
alter table partners enable row level security;
create policy "partenaires publics" on partners for select using(is_active or public.is_staff('admin'));
create policy "partenaires admin" on partners for all using(public.is_staff('admin')) with check(public.is_staff('admin'));
insert into storage.buckets(id,name,public) values('media','media',true) on conflict (id) do nothing;
create policy "media lecture publique" on storage.objects for select using(bucket_id='media');
create policy "media envoi staff" on storage.objects for insert with check(bucket_id='media' and public.is_staff('journalist'));
create policy "media suppression admin" on storage.objects for delete using(bucket_id='media' and public.is_staff('admin'));
