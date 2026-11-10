'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, safeUrl } from '@/lib/blocks'
import { streamEmbed } from '@/lib/stream'
import { kinshasaToISO } from '@/lib/dates'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const t = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n)
const refresh = () => revalidatePath('/direct-foot')
const B = '/dashboard/direct-foot'
export async function addStream(fd) {
  const { sb, user } = await editor()
  const title = t(fd, 'title', 80), url = t(fd, 'embed_url', 500)
  if (title.length < 2) redirect(`${B}?err=1`)
  if (!streamEmbed(url)) redirect(`${B}?err=2`)
  const { error } = await sb.from('foot_streams').insert({ title, embed_url: url, note: t(fd, 'note', 200) || null, created_by: user.id })
  if (error) redirect(`${B}?err=4`)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'footstream_add', target: title.slice(0, 80) })
  refresh(); redirect(`${B}?ok=1`)
}
export async function toggleStream(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('foot_streams').update({ is_active: fd.get('on') === '1' }).eq('id', id)
  refresh(); redirect(`${B}?ok=1`)
}
export async function deleteStream(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('foot_streams').delete().eq('id', id)
  refresh(); redirect(`${B}?ok=1`)
}
export async function addGuide(fd) {
  const { sb } = await editor()
  const label = t(fd, 'match_label', 120), channels = t(fd, 'channels', 200), when = kinshasaToISO(String(fd.get('kickoff') || ''))
  if (label.length < 3 || channels.length < 2 || !when) redirect(`${B}?err=3`)
  const link = String(fd.get('link_url') || '').trim()
  const { error } = await sb.from('foot_guide').insert({ match_label: label, competition: t(fd, 'competition', 80) || null, kickoff: when, channels, link_url: link ? (safeUrl(link) || null) : null })
  if (error) redirect(`${B}?err=4`)
  refresh(); redirect(`${B}?ok=1`)
}
export async function deleteGuide(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('foot_guide').delete().eq('id', id)
  refresh(); redirect(`${B}?ok=1`)
}
