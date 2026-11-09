'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl, safeUrl } from '@/lib/blocks'
import { kinshasaToISO } from '@/lib/dates'
async function admin() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'admin')) redirect('/dashboard'); return c }
const PLACES = ['banner', 'sidebar', 'article']
export async function createAd(fd) {
  const { sb, user } = await admin()
  const title = String(fd.get('title') || '').trim().slice(0, 150)
  const image = String(fd.get('image_url') || '')
  const place = String(fd.get('placement') || '')
  const link = safeUrl(fd.get('link_url'))
  if (!title || !isMediaUrl(image) || !PLACES.includes(place)) redirect('/dashboard/publicites?err=1')
  const row = { title, advertiser: String(fd.get('advertiser') || '').trim().slice(0, 150) || null, image_url: image, link_url: link || null, placement: place,
    starts_at: kinshasaToISO(fd.get('starts_at')) || new Date().toISOString(), ends_at: kinshasaToISO(fd.get('ends_at')), amount_note: String(fd.get('amount_note') || '').trim().slice(0, 80) || null }
  const { error } = await sb.from('ads').insert(row)
  if (error) redirect('/dashboard/publicites?err=2')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'ad_create', target: title.slice(0, 80) })
  revalidatePath('/', 'layout'); redirect('/dashboard/publicites?ok=1')
}
export async function toggleAd(fd) {
  const { sb } = await admin(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('ads').update({ is_active: fd.get('active') === '1' }).eq('id', id)
  revalidatePath('/', 'layout'); redirect('/dashboard/publicites?ok=1')
}
export async function deleteAd(fd) {
  const { sb, user } = await admin(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('ads').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'ad_delete', target: id })
  revalidatePath('/', 'layout'); redirect('/dashboard/publicites?ok=1')
}
export async function setAdAmount(fd) {
  const { sb } = await admin(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('ads').update({ amount_note: String(fd.get('amount_note') || '').trim().slice(0, 80) || null }).eq('id', id)
  redirect('/dashboard/publicites?ok=1')
}
