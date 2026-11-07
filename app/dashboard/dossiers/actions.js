'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl } from '@/lib/blocks'
const slugify = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const fields = fd => { const cover = String(fd.get('cover_url') || ''); return {
  title: String(fd.get('title') || '').trim().slice(0, 200), description: String(fd.get('description') || '').trim().slice(0, 1000) || null,
  cover_url: isMediaUrl(cover) ? cover : null, is_published: fd.get('is_published') === 'on' } }
export async function createDossier(fd) {
  const { sb, user } = await editor()
  const f = fields(fd); if (!f.title) redirect('/dashboard/dossiers?err=1')
  const { data, error } = await sb.from('dossiers').insert({ ...f, slug: `${slugify(f.title) || 'dossier'}-${Date.now().toString(36).slice(-4)}` }).select('id').single()
  if (error || !data) redirect('/dashboard/dossiers?err=1')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'dossier_create', target: f.title })
  revalidatePath('/dossiers'); redirect(`/dashboard/dossiers/${data.id}`)
}
export async function updateDossier(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  const f = fields(fd); if (!f.title) redirect(`/dashboard/dossiers/${id}?err=1`)
  await sb.from('dossiers').update(f).eq('id', id)
  revalidatePath('/dossiers'); revalidatePath('/', 'layout'); redirect(`/dashboard/dossiers/${id}?ok=1`)
}
export async function deleteDossier(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  await sb.from('dossiers').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'dossier_delete', target: id })
  revalidatePath('/dossiers'); redirect('/dashboard/dossiers?ok=1')
}
export async function addToDossier(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  const rows = fd.getAll('article').map(String).filter(isUuid).slice(0, 50).map(article_id => ({ dossier_id: id, article_id }))
  if (rows.length) await sb.from('dossier_articles').upsert(rows, { onConflict: 'dossier_id,article_id', ignoreDuplicates: true })
  revalidatePath('/dossiers'); revalidatePath('/', 'layout'); redirect(`/dashboard/dossiers/${id}?ok=1`)
}
export async function removeFromDossier(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''), a = String(fd.get('article') || '')
  if (!isUuid(id) || !isUuid(a)) redirect('/dashboard/dossiers')
  await sb.from('dossier_articles').delete().eq('dossier_id', id).eq('article_id', a)
  revalidatePath('/dossiers'); redirect(`/dashboard/dossiers/${id}?ok=1`)
}
