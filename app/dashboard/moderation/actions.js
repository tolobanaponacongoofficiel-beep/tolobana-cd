'use server'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
export async function moderate(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) return
  const d = fd.get('decision'), id = Number(fd.get('id'))
  if (d === 'approve') await sb.from('comments').update({ status: 'approved' }).eq('id', id)
  else if (d === 'delete') await sb.from('comments').delete().eq('id', id)
  else if (d === 'dismiss') await sb.from('comment_reports').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: `comment_${d}`, target: String(id) })
  revalidatePath('/', 'layout')
}
