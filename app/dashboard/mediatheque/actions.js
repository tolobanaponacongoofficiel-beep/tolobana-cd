'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { PATH_RE } from '@/lib/media'
const B = '/dashboard/mediatheque'
export async function deleteFile(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect(`${B}?err=1`)
  const path = String(fd.get('path') || '')
  if (!PATH_RE.test(path) || path.includes('..')) redirect(`${B}?err=2`)
  const { error } = await sb.storage.from('media').remove([path])
  if (!error) { await sb.from('media_meta').delete().eq('path', path); await sb.from('audit_log').insert({ user_id: user.id, action: 'media_delete', target: path.slice(0, 120) }) }
  redirect(error ? `${B}?err=3` : `${B}?ok=1`)
}
// Renommer / décrire un fichier (comme WordPress) : l'adresse du fichier ne change pas.
export async function updateMeta(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect(`${B}?err=4`)
  const path = String(fd.get('path') || '')
  if (!PATH_RE.test(path) || path.includes('..')) redirect(`${B}?err=2`)
  const c = k => String(fd.get(k) || '').replace(/\s+/g, ' ').trim()
  const row = { path, title: c('title').slice(0, 120) || null, alt: c('alt').slice(0, 200) || null, caption: c('caption').slice(0, 300) || null, updated_by: user.id, updated_at: new Date().toISOString() }
  const { error } = await sb.from('media_meta').upsert(row, { onConflict: 'path' })
  if (error) redirect(`${B}?err=5`)
  revalidatePath(B)
  redirect(`${B}?saved=1`)
}
