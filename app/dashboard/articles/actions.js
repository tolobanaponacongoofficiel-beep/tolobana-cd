'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'

// Retirer du site : l'article repasse en brouillon (rien n'est perdu).
export async function unpublish(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/')
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect('/dashboard/articles')
  await sb.from('articles').update({ status: 'draft' }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'unpublish', target: id })
  revalidatePath('/', 'layout')
  redirect('/dashboard/articles?ok=retire')
}

export async function deleteArticle(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/')
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect('/dashboard/articles')
  await sb.from('articles').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'article_delete', target: id })
  revalidatePath('/', 'layout')
  redirect('/dashboard/articles?ok=supprime')
}
