'use server'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
export async function deleteFile(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard/mediatheque?err=1')
  const path = String(fd.get('path') || '')
  if (!/^[a-z0-9_-]{1,30}(\/[\w.-]{1,120}){1,2}$/i.test(path) || path.includes('..')) redirect('/dashboard/mediatheque?err=2')
  const { error } = await sb.storage.from('media').remove([path])
  if (!error) await sb.from('audit_log').insert({ user_id: user.id, action: 'media_delete', target: path.slice(0, 120) })
  redirect(error ? '/dashboard/mediatheque?err=3' : '/dashboard/mediatheque?ok=1')
}
