'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
export async function messageAction(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const id = Number(fd.get('id')); if (!Number.isInteger(id)) return
  if (fd.get('op') === 'delete') await sb.from('contact_messages').delete().eq('id', id)
  else await sb.from('contact_messages').update({ is_read: true }).eq('id', id)
  revalidatePath('/dashboard/messages'); redirect('/dashboard/messages')
}
