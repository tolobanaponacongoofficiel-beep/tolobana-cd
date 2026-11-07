'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
export async function setFeatured(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect('/dashboard/a-la-une')
  const v = JSON.stringify({ id, title: String(fd.get('title') || '').trim().slice(0, 200), summary: String(fd.get('summary') || '').trim().slice(0, 400) })
  await sb.from('site_settings').upsert({ k: 'featured', v }, { onConflict: 'k' })
  await sb.from('audit_log').insert({ user_id: user.id, action: 'featured_set', target: id })
  revalidatePath('/'); redirect('/dashboard/a-la-une?ok=1')
}
export async function clearFeatured() {
  const { sb, user } = await editor()
  await sb.from('site_settings').delete().eq('k', 'featured')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'featured_clear', target: 'home' })
  revalidatePath('/'); redirect('/dashboard/a-la-une?ok=1')
}
