'use server'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
const slugify = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
async function uploadImage(sb, userId, file, folder) {
  if (!file || typeof file === 'string' || !file.size) return null
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) return null
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${folder}/${userId}-${Date.now()}.${ext}`
  const { error } = await sb.storage.from('media').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  return error ? null : sb.storage.from('media').getPublicUrl(path).data.publicUrl
}
export async function createArticle(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) return
  const title = String(fd.get('title')).trim()
  const image_url = await uploadImage(sb, user.id, fd.get('image'), 'articles')
  await sb.from('articles').insert({
    title, subtitle: fd.get('subtitle') || null, summary: fd.get('summary') || null, body: String(fd.get('body')),
    slug: `${slugify(title)}-${Date.now().toString(36)}`, author_id: user.id, category_id: Number(fd.get('category_id')),
    image_url, image_caption: fd.get('image_caption') || null,
    status: fd.get('submit') ? 'submitted' : 'draft', is_demo: fd.get('is_demo') === 'on',
    is_breaking: atLeast(role, 'editor') && fd.get('is_breaking') === 'on',
  })
  revalidatePath('/dashboard')
}
export async function review(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) return
  const d = fd.get('decision')
  const upd = d === 'reject' ? { status: 'rejected' } : { status: 'published', published_at: new Date().toISOString(), is_breaking: d === 'publish_breaking' }
  await sb.from('articles').update(upd).eq('id', fd.get('id'))
  await sb.from('audit_log').insert({ user_id: user.id, action: d, target: String(fd.get('id')) })
  revalidatePath('/', 'layout')
}
export async function updateProfile(fd) {
  const { sb, user } = await getUserAndRole()
  if (!user) return
  await sb.from('profiles').update({ name: String(fd.get('name')).trim(), bio: fd.get('bio') || null }).eq('id', user.id)
  revalidatePath('/', 'layout')
}
export async function addPartner(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) return
  const link = String(fd.get('link_url') || '').trim()
  const logo_url = await uploadImage(sb, user.id, fd.get('logo'), 'partners')
  await sb.from('partners').insert({ name: String(fd.get('name')).trim(), link_url: /^https?:\/\//.test(link) ? link : null, logo_url })
  await sb.from('audit_log').insert({ user_id: user.id, action: 'partner_add', target: String(fd.get('name')) })
  revalidatePath('/', 'layout')
}
export async function deletePartner(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) return
  await sb.from('partners').delete().eq('id', fd.get('id'))
  await sb.from('audit_log').insert({ user_id: user.id, action: 'partner_delete', target: String(fd.get('id')) })
  revalidatePath('/', 'layout')
}
