'use server'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
export async function addComment(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || fd.get('website')) return
  const body = String(fd.get('body') || '').trim()
  if (body.length < 2 || body.length > 1500) return
  const { data: last } = await sb.from('comments').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
  if (last?.[0] && Date.now() - new Date(last[0].created_at).getTime() < 20000) return
  await sb.from('comments').insert({ article_id: fd.get('article_id'), user_id: user.id, body,
    parent_id: fd.get('parent_id') ? Number(fd.get('parent_id')) : null, status: atLeast(role, 'editor') ? 'approved' : 'pending' })
  revalidatePath(`/article/${fd.get('slug')}`)
}
export async function reportComment(fd) {
  const { sb, user } = await getUserAndRole()
  if (!user) return
  await sb.from('comment_reports').insert({ comment_id: Number(fd.get('comment_id')), user_id: user.id, reason: 'Signalé par un lecteur' })
}
