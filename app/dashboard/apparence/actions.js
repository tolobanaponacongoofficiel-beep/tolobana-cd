'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { parseMenuLinks, HOME_BLOCKS } from '@/lib/wp'
import { CITIES } from '@/lib/weather'
import { isMediaUrl } from '@/lib/blocks'
export async function saveAppearance(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const links = parseMenuLinks(fd.get('menu_links')).map(l => `${l.label} | ${l.href}`).join('\n')
  const count = Math.min(8, Math.max(1, Number(fd.get('menu_count')) || 3))
  const shown = new Set(fd.getAll('show').map(String))
  const hide = HOME_BLOCKS.map(([k]) => k).filter(k => !shown.has(k)).join(',')
  const photos = Object.fromEntries(CITIES.map(c => [c.slug, String(fd.get(`city_${c.slug}`) || '')]).filter(([, u]) => isMediaUrl(u)))
  await sb.from('site_settings').upsert([{ k: 'menu_links', v: links }, { k: 'menu_count', v: String(count) }, { k: 'home_hide', v: hide }, { k: 'city_photos', v: Object.keys(photos).length ? JSON.stringify(photos) : '' }], { onConflict: 'k' })
  await sb.from('audit_log').insert({ user_id: user.id, action: 'appearance_save', target: 'site' })
  revalidatePath('/', 'layout'); redirect('/dashboard/apparence?ok=1')
}
