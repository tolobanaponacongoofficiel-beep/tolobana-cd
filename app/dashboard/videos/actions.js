'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { youtubeId, isUuid } from '@/lib/blocks'

const KINDS = ['journal', 'interview', 'reportage', 'actualite', 'emission', 'direct', 'archive']
const slugify = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function editor() {
  const { sb, user, role } = await getUserAndRole()
  return user && atLeast(role, 'editor') ? { sb, user } : null
}
export async function addVideo(fd) {
  const ctx = await editor(); if (!ctx) return
  const { sb, user } = ctx
  const title = String(fd.get('title') || '').trim().slice(0, 200)
  const yt = youtubeId(fd.get('url'))
  const kind = String(fd.get('kind') || '')
  if (!title || !yt || !KINDS.includes(kind)) redirect('/dashboard/videos?err=1')
  const isLive = fd.get('is_live') === 'on'
  // Le champ date est saisi à l'heure de Kinshasa (UTC+1).
  const raw = String(fd.get('published_at') || '')
  const when = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? new Date(`${raw}:00+01:00`) : new Date()
  const { error } = await sb.from('videos').insert({
    title, slug: `${slugify(title).slice(0, 80) || 'video'}-${Date.now().toString(36)}`, kind: isLive ? 'direct' : kind, youtube_id: yt,
    description: String(fd.get('description') || '').trim().slice(0, 2000) || null, is_live: isLive,
    published_at: isNaN(when) ? new Date().toISOString() : when.toISOString(), created_by: user.id })
  if (error) redirect('/dashboard/videos?err=1')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'video_add', target: yt })
  revalidatePath('/tv'); revalidatePath('/', 'layout')
  redirect('/dashboard/videos?ok=1')
}
export async function toggleLive(fd) {
  const ctx = await editor(); if (!ctx || !isUuid(fd.get('id'))) return
  const { sb, user } = ctx
  const on = fd.get('live') === '1'
  await sb.from('videos').update(on ? { is_live: true, kind: 'direct' } : { is_live: false, kind: 'archive' }).eq('id', fd.get('id'))
  await sb.from('audit_log').insert({ user_id: user.id, action: on ? 'video_live_on' : 'video_live_off', target: String(fd.get('id')) })
  revalidatePath('/tv'); revalidatePath('/', 'layout')
  redirect('/dashboard/videos?ok=1')
}
export async function deleteVideo(fd) {
  const ctx = await editor(); if (!ctx || !isUuid(fd.get('id'))) return
  const { sb, user } = ctx
  await sb.from('videos').delete().eq('id', fd.get('id'))
  await sb.from('audit_log').insert({ user_id: user.id, action: 'video_delete', target: String(fd.get('id')) })
  revalidatePath('/tv'); revalidatePath('/', 'layout')
  redirect('/dashboard/videos?ok=1')
}
