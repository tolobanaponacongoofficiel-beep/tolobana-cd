'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl } from '@/lib/blocks'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const slugify = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
const refresh = slug => { revalidatePath('/direct'); revalidatePath('/', 'layout'); if (slug) revalidatePath(`/direct/${slug}`) }
export async function createLive(fd) {
  const { sb, user } = await editor()
  const title = String(fd.get('title') || '').trim().slice(0, 160)
  if (!title) redirect('/dashboard/direct?err=1')
  const slug = `${slugify(title) || 'direct'}-${Date.now().toString(36)}`
  const { data, error } = await sb.from('lives').insert({ title, slug, summary: String(fd.get('summary') || '').trim().slice(0, 300) || null, created_by: user.id }).select('id').single()
  if (error || !data) redirect('/dashboard/direct?err=2')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'live_create', target: title.slice(0, 80) })
  refresh(); redirect(`/dashboard/direct/${data.id}`)
}
export async function addEntry(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('live') || ''); if (!isUuid(id)) redirect('/dashboard/direct')
  const body = String(fd.get('body') || '').trim().slice(0, 3000)
  const img = String(fd.get('image_url') || '')
  if (!body) redirect(`/dashboard/direct/${id}?err=1`)
  const { data: live } = await sb.from('lives').select('slug,status').eq('id', id).single()
  if (!live || live.status !== 'live') redirect(`/dashboard/direct/${id}?err=2`)
  await sb.from('live_entries').insert({ live_id: id, body, image_url: isMediaUrl(img) ? img : null, important: fd.get('important') === 'on', created_by: user.id })
  refresh(live.slug); redirect(`/dashboard/direct/${id}?ok=1`)
}
export async function deleteEntry(fd) {
  const { sb } = await editor()
  const id = String(fd.get('live') || ''), eid = Number(fd.get('entry'))
  if (!isUuid(id) || !Number.isInteger(eid)) return
  const { data: live } = await sb.from('lives').select('slug').eq('id', id).single()
  await sb.from('live_entries').delete().eq('id', eid).eq('live_id', id)
  refresh(live?.slug); redirect(`/dashboard/direct/${id}`)
}
export async function setLiveState(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('live') || ''); if (!isUuid(id)) return
  const op = String(fd.get('op') || '')
  const { data: live } = await sb.from('lives').select('slug,title').eq('id', id).single()
  if (op === 'end') await sb.from('lives').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', id)
  else if (op === 'resume') await sb.from('lives').update({ status: 'live', ended_at: null }).eq('id', id)
  else if (op === 'hide') await sb.from('lives').update({ is_published: false }).eq('id', id)
  else if (op === 'show') await sb.from('lives').update({ is_published: true }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: `live_${op}`, target: (live?.title || id).slice(0, 80) })
  refresh(live?.slug); redirect(`/dashboard/direct/${id}`)
}
export async function deleteLive(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('live') || ''); if (!isUuid(id)) return
  const { data: live } = await sb.from('lives').select('slug,title').eq('id', id).single()
  await sb.from('lives').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'live_delete', target: (live?.title || id).slice(0, 80) })
  refresh(live?.slug); redirect('/dashboard/direct')
}
