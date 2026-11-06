'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isMediaUrl, isUuid } from '@/lib/blocks'

async function admin() {
  const c = await getUserAndRole()
  if (!c.user || !atLeast(c.role, 'admin')) redirect('/')
  return c
}
const fields = fd => {
  const photo = String(fd.get('photo_url') || '')
  return {
    name: String(fd.get('name') || '').trim().slice(0, 120),
    title: String(fd.get('title') || '').trim().slice(0, 120) || null,
    bio: String(fd.get('bio') || '').trim().slice(0, 1000) || null,
    photo_url: isMediaUrl(photo) ? photo : null,
  }
}
const done = () => { revalidatePath('/', 'layout'); }

export async function addAuthor(fd) {
  const { sb, user } = await admin()
  const f = fields(fd)
  if (!f.name) redirect('/dashboard/auteurs?err=nom')
  const { error } = await sb.from('authors').insert(f)
  if (error) redirect('/dashboard/auteurs?err=enregistrement')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'author_add', target: f.name })
  done(); redirect('/dashboard/auteurs?ok=ajoute')
}

export async function updateAuthor(fd) {
  const { sb, user } = await admin()
  const id = String(fd.get('id') || '')
  const f = fields(fd)
  if (!isUuid(id) || !f.name) redirect('/dashboard/auteurs?err=nom')
  const { error } = await sb.from('authors').update(f).eq('id', id)
  if (error) redirect('/dashboard/auteurs?err=enregistrement')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'author_update', target: id })
  done(); redirect('/dashboard/auteurs?ok=modifie')
}

export async function deleteAuthor(fd) {
  const { sb, user } = await admin()
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect('/dashboard/auteurs')
  await sb.from('authors').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'author_delete', target: id })
  done(); redirect('/dashboard/auteurs?ok=supprime')
}
