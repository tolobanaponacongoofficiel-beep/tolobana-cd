'use server'
import { parseTags } from '@/lib/tags'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { sanitizeBlocks, blocksToText, firstParagraph, isMediaUrl, isUuid } from '@/lib/blocks'
import { kinshasaToISO } from '@/lib/dates'

// Date future saisie dans le formulaire (heure de Kinshasa), sinon null.
const futureDate = v => { const iso = kinshasaToISO(v); return iso && new Date(iso).getTime() > Date.now() ? iso : null }

const slugify = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

// Les logos de partenaires passent encore par le formulaire (fichiers légers).
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
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const isEditor = atLeast(role, 'editor')
  const title = String(fd.get('title') || '').trim().slice(0, 220)
  const blocks = sanitizeBlocks(fd.get('blocks'))
  const categoryId = Number(fd.get('category_id'))
  if (!title || !blocks.length || !categoryId) redirect('/dashboard/nouvel-article?err=incomplet')

  const intent = String(fd.get('intent') || 'draft')
  const image = String(fd.get('image_url') || '')
  const writer = String(fd.get('writer_id') || '')
  const { data: row, error } = await sb.from('articles').insert({
    title, subtitle: String(fd.get('subtitle') || '').trim().slice(0, 300) || null,
    summary: String(fd.get('summary') || '').trim().slice(0, 400) || firstParagraph(blocks) || null,
    body: blocksToText(blocks), blocks,
    slug: `${slugify(title) || 'article'}-${Date.now().toString(36)}`,
    author_id: user.id, writer_id: isEditor && isUuid(writer) ? writer : null,
    category_id: categoryId,
    image_url: isMediaUrl(image) ? image : null, image_caption: String(fd.get('image_caption') || '').trim().slice(0, 300) || null,
    status: intent === 'draft' ? 'draft' : 'submitted', is_demo: fd.get('is_demo') === 'on', tags: parseTags(fd.get('tags')),
    is_breaking: isEditor && fd.get('is_breaking') === 'on',
  }).select('id').single()
  if (error || !row) redirect('/dashboard/nouvel-article?err=enregistrement')

  if (intent === 'publish' && isEditor) {
    const when = futureDate(fd.get('publish_at'))
    await sb.from('articles').update({ status: 'published', published_at: when || new Date().toISOString() }).eq('id', row.id)
    await sb.from('audit_log').insert({ user_id: user.id, action: when ? 'schedule' : 'publish', target: String(row.id) })
    revalidatePath('/', 'layout')
  }
  revalidatePath('/dashboard')
  if (intent === 'publish' && isEditor && futureDate(fd.get('publish_at'))) redirect('/dashboard/statistiques?ok=programme')
  redirect(`/dashboard?ok=${intent === 'publish' && isEditor ? 'publie' : intent === 'draft' ? 'brouillon' : 'soumis'}`)
}

export async function updateArticle(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const isEditor = atLeast(role, 'editor')
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect('/dashboard/articles')
  const { data: old } = await sb.from('articles').select('id,slug,author_id,status,image_url,published_at,last_update_at').eq('id', id).single()
  if (!old) redirect('/dashboard/articles?err=introuvable')
  // Un journaliste ne modifie que ses propres articles non publiés ; un éditeur modifie tout.
  if (!isEditor && (old.author_id !== user.id || old.status === 'published')) redirect('/dashboard/articles?err=interdit')

  const title = String(fd.get('title') || '').trim().slice(0, 220)
  const blocks = sanitizeBlocks(fd.get('blocks'))
  const categoryId = Number(fd.get('category_id'))
  if (!title || !blocks.length || !categoryId) redirect(`/dashboard/articles/${id}?err=incomplet`)

  const image = String(fd.get('image_url') || '')
  const upd = {
    title, subtitle: String(fd.get('subtitle') || '').trim().slice(0, 300) || null,
    summary: String(fd.get('summary') || '').trim().slice(0, 400) || firstParagraph(blocks) || null,
    body: blocksToText(blocks), blocks, category_id: categoryId,
    image_url: image && (isMediaUrl(image) || image === old.image_url) ? image : null,
    image_caption: String(fd.get('image_caption') || '').trim().slice(0, 300) || null,
    is_demo: fd.get('is_demo') === 'on', tags: parseTags(fd.get('tags')), updated_at: new Date().toISOString(),
  }
  if (isEditor) {
    const writer = String(fd.get('writer_id') || '')
    upd.writer_id = isUuid(writer) ? writer : null
    upd.is_breaking = fd.get('is_breaking') === 'on'
  }
  const intent = String(fd.get('intent') || 'save')
  if (intent === 'submit' && old.status !== 'published') upd.status = 'submitted'
  const nowISO = new Date().toISOString()
  const scheduledNow = old.status === 'published' && old.published_at && new Date(old.published_at).getTime() > Date.now()
  if (intent === 'publish' && isEditor && old.status !== 'published') { upd.status = 'published'; upd.published_at = futureDate(fd.get('publish_at')) || (old.published_at && new Date(old.published_at).getTime() <= Date.now() ? old.published_at : nowISO) }
  // Article déjà programmé : l'éditeur peut changer la date ; champ vide ou date passée = publication immédiate.
  if (isEditor && scheduledNow && fd.has('publish_at')) upd.published_at = futureDate(fd.get('publish_at')) || nowISO
  // Mention « Mis à jour le … » affichée sur l'article publié (correction ou ajout important).
  if (isEditor && old.status === 'published' && !scheduledNow && fd.get('mark_updated') === 'on') upd.last_update_at = nowISO

  const { error } = await sb.from('articles').update(upd).eq('id', id)
  if (error) redirect(`/dashboard/articles/${id}?err=enregistrement`)
  await sb.from('audit_log').insert({ user_id: user.id, action: intent === 'publish' ? 'publish' : 'article_edit', target: id })
  revalidatePath('/', 'layout'); revalidatePath(`/article/${old.slug}`)
  if (upd.published_at && new Date(upd.published_at).getTime() > Date.now()) redirect('/dashboard/statistiques?ok=programme')
  redirect(`/dashboard/articles?ok=${intent === 'publish' ? 'publie' : intent === 'submit' ? 'soumis' : 'modifie'}`)
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
  const photo = String(fd.get('photo_url') || '')
  await sb.from('profiles').update({ name: String(fd.get('name')).trim(), bio: fd.get('bio') || null, photo_url: isMediaUrl(photo) ? photo : null }).eq('id', user.id)
  revalidatePath('/', 'layout')
  redirect('/dashboard/profil?ok=1')
}

export async function addPartner(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) return
  const link = String(fd.get('link_url') || '').trim()
  const logo_url = await uploadImage(sb, user.id, fd.get('logo'), 'partners')
  const banner = String(fd.get('banner_url') || '')
  await sb.from('partners').insert({ name: String(fd.get('name')).trim(), link_url: /^https?:\/\//.test(link) ? link : null, logo_url, banner_url: isMediaUrl(banner) ? banner : null })
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

export async function setPartnerBanner(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) return
  const id = Number(fd.get('id'))
  if (!Number.isInteger(id)) return
  const banner = String(fd.get('banner_url') || '')
  await sb.from('partners').update({ banner_url: isMediaUrl(banner) ? banner : null }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'partner_banner', target: String(id) })
  revalidatePath('/', 'layout')
  redirect('/dashboard/partenaires?ok=1')
}
