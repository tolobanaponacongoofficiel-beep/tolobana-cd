'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl, safeUrl } from '@/lib/blocks'
import { kinshasaToISO } from '@/lib/dates'
import { CATS } from '@/lib/agenda'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const t = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n) || null
const refresh = () => { revalidatePath('/agenda', 'layout'); revalidatePath('/') }
function fields(fd) {
  const title = t(fd, 'title', 160), starts = kinshasaToISO(fd.get('starts_at')), ends = kinshasaToISO(fd.get('ends_at'))
  if (!title || title.length < 3 || !starts) return null
  const img = String(fd.get('image_url') || '')
  return { title, description: t(fd, 'description', 3000), category: Object.keys(CATS).includes(String(fd.get('category'))) ? String(fd.get('category')) : 'autre', venue: t(fd, 'venue', 150), city: t(fd, 'city', 80) || 'Kinshasa',
    starts_at: starts, ends_at: ends && new Date(ends) > new Date(starts) ? ends : null, link_url: safeUrl(fd.get('link_url')) || null, ...(isMediaUrl(img) ? { image_url: img } : {}) }
}
export async function createEvent(fd) {
  const { sb, user } = await editor(); const row = fields(fd)
  if (!row) redirect('/dashboard/agenda?err=1')
  const { error } = await sb.from('events').insert({ ...row, created_by: user.id })
  if (error) redirect('/dashboard/agenda?err=2')
  refresh(); redirect('/dashboard/agenda?ok=1')
}
export async function updateEvent(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  const row = fields(fd); if (!row) redirect('/dashboard/agenda?err=1')
  const { error } = await sb.from('events').update(row).eq('id', id)
  if (error) redirect('/dashboard/agenda?err=2')
  refresh(); redirect('/dashboard/agenda?ok=1')
}
export async function toggleEvent(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('events').update({ is_published: fd.get('publish') === '1' }).eq('id', id)
  refresh(); redirect('/dashboard/agenda?ok=1')
}
export async function deleteEvent(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('events').delete().eq('id', id)
  refresh(); redirect('/dashboard/agenda?ok=1')
}
