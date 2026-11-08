'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl } from '@/lib/blocks'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const t = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n) || null
const refresh = () => { revalidatePath('/stories'); revalidatePath('/') }
export async function createStory(fd) {
  const { sb, user } = await editor()
  const title = t(fd, 'title', 140), image = String(fd.get('image_url') || '')
  if (!title || !isMediaUrl(image)) redirect('/dashboard/stories?err=1')
  const slug = String(fd.get('article_slug') || '').trim().replace(/^.*\/article\//, '').replace(/[?#].*$/, '').slice(0, 200)
  const row = { title, kicker: t(fd, 'kicker', 40), image_url: image, stat1_value: t(fd, 'stat1_value', 20), stat1_label: t(fd, 'stat1_label', 40),
    stat2_value: t(fd, 'stat2_value', 20), stat2_label: t(fd, 'stat2_label', 40), article_slug: /^[\w-]+$/.test(slug) ? slug : null, created_by: user.id }
  const { error } = await sb.from('stories').insert(row)
  if (error) redirect('/dashboard/stories?err=2')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'story_create', target: title.slice(0, 80) })
  refresh(); redirect('/dashboard/stories?ok=1')
}
export async function toggleStory(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('stories').update({ is_published: fd.get('publish') === '1' }).eq('id', id)
  refresh(); redirect('/dashboard/stories?ok=1')
}
export async function deleteStory(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('stories').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'story_delete', target: id })
  refresh(); redirect('/dashboard/stories?ok=1')
}
