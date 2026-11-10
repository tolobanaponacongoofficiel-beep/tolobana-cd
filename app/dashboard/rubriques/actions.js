'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
export async function updateCategory(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const slug = String(fd.get('slug') || ''); if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) return
  const name = String(fd.get('name') || '').trim().slice(0, 40), pos = parseInt(String(fd.get('position') || ''), 10)
  if (name.length < 2) redirect('/dashboard/rubriques?err=1')
  const { error } = await sb.from('categories').update({ name, position: Number.isInteger(pos) && pos >= 0 && pos < 1000 ? pos : 0, show_in_menu: fd.get('show_in_menu') === 'on' }).eq('slug', slug)
  if (error) redirect('/dashboard/rubriques?err=2')
  revalidatePath('/', 'layout'); redirect('/dashboard/rubriques?ok=1')
}
