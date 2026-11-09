'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl } from '@/lib/blocks'
import { isType, expiryFor } from '@/lib/services'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const refresh = () => { revalidatePath('/services', 'layout') }
const t = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n) || null
export async function publishPost(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  const { data: p } = await sb.from('service_posts').select('type,deadline,title').eq('id', id).single()
  if (!p) return
  await sb.from('service_posts').update({ status: 'published', published_at: new Date().toISOString(), expires_at: expiryFor(p.type, p.deadline), is_paid: fd.get('paid') === 'on', amount_note: t(fd, 'amount', 80) }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'service_publish', target: p.title.slice(0, 80) })
  refresh(); redirect('/dashboard/services?ok=1')
}
export async function setPostStatus(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''), st = String(fd.get('status') || '')
  if (!isUuid(id) || !['pending', 'rejected'].includes(st)) return
  await sb.from('service_posts').update({ status: st }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: `service_${st}`, target: id })
  refresh(); redirect('/dashboard/services?ok=1')
}
export async function deletePost(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('service_posts').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'service_delete', target: id })
  refresh(); redirect('/dashboard/services?ok=1')
}
// Publication directe par la rédaction (ex. communiqué reçu par WhatsApp, annonce payée en main propre).
export async function createPost(fd) {
  const { sb, user } = await editor()
  const type = String(fd.get('type') || ''), title = t(fd, 'title', 160), body = t(fd, 'body', 4000), contact = t(fd, 'contact', 200)
  if (!isType(type) || !title || !body || !contact) redirect('/dashboard/services?err=1')
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(String(fd.get('deadline') || '')) ? String(fd.get('deadline')) : null
  const img = String(fd.get('image_url') || '')
  const { error } = await sb.from('service_posts').insert({ type, title, body, contact, org: t(fd, 'org', 150), location: t(fd, 'location', 120), deadline,
    image_url: isMediaUrl(img) ? img : null, status: 'published', published_at: new Date().toISOString(), expires_at: expiryFor(type, deadline),
    is_paid: fd.get('paid') === 'on', amount_note: t(fd, 'amount', 80), submitter_name: user.email || null })
  if (error) redirect('/dashboard/services?err=2')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'service_create', target: title.slice(0, 80) })
  refresh(); redirect('/dashboard/services?ok=1')
}
