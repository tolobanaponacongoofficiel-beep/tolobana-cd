-- Phase 17 : permettre aux administrateurs de modifier les rubriques (nom, ordre, présence dans le menu). Sans risque si relancé.
drop policy if exists "categories admin maj" on categories;
create policy "categories admin maj" on categories for update using (public.is_staff('admin')) with check (public.is_staff('admin'));
