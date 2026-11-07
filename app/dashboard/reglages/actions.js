'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { SETTING_FIELDS } from '@/lib/settings'
import { PAGE_SLUGS } from '@/lib/pages'
async function admin() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'admin')) redirect('/dashboard'); return c }
export async function saveSettings(fd) {
  const { sb, user } = await admin()
  const rows = SETTING_FIELDS.map(([k]) => ({ k, v: String(fd.get(k) || '').trim().slice(0, 300) }))
  await sb.from('site_settings').upsert(rows, { onConflict: 'k' })
  await sb.from('audit_log').insert({ user_id: user.id, action: 'settings_save', target: 'site' })
  revalidatePath('/', 'layout'); redirect('/dashboard/reglages?ok=1')
}
export async function savePage(fd) {
  const { sb, user } = await admin()
  const slug = String(fd.get('slug') || '')
  if (!PAGE_SLUGS.includes(slug)) redirect('/dashboard/reglages')
  if (fd.get('intent') === 'reset') await sb.from('pages').delete().eq('slug', slug)
  else await sb.from('pages').upsert({ slug, body: String(fd.get('body') || '').slice(0, 20000), updated_at: new Date().toISOString() }, { onConflict: 'slug' })
  await sb.from('audit_log').insert({ user_id: user.id, action: 'page_save', target: slug })
  revalidatePath(`/${slug}`); redirect('/dashboard/reglages?ok=1')
}
