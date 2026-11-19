'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, blocksToText as blocksText } from '@/lib/blocks'
import { kinshasaToISO } from '@/lib/dates'
import { saveRevision } from '@/lib/wp'
import { parseTags } from '@/lib/tags'
const B = '/dashboard/articles'
const refresh = () => { revalidatePath('/', 'layout'); revalidatePath(B) }
const back = fd => { const r = String(fd.get('back') || ''); return r.startsWith(B) ? r : B }
const withQ = (u, k, v) => `${u}${u.includes('?') ? '&' : '?'}${k}=${encodeURIComponent(v)}`

// Retirer du site : l'article repasse en brouillon (rien n'est perdu).
export async function unpublish(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/')
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect(B)
  await sb.from('articles').update({ status: 'draft' }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'unpublish', target: id })
  refresh(); redirect(`${B}?ok=retire`)
}

// Suppression définitive : administrateur, et seulement depuis la corbeille.
export async function deleteArticle(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/')
  const id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect(B)
  await sb.from('articles').delete().eq('id', id).eq('status', 'trash')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'article_delete', target: id })
  refresh(); redirect(`${B}?status=trash&ok=supprime`)
}

// Actions groupées. Un journaliste ne peut mettre à la corbeille que ses propres articles non publiés.
const OPS = ['publish', 'draft', 'reject', 'trash', 'restore', 'delete', 'category', 'tag']
export async function bulk(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const editor = atLeast(role, 'editor'), admin = atLeast(role, 'admin')
  const to = back(fd), op = String(fd.get('op') || '')
  const ids = [...new Set(fd.getAll('ids').map(String).filter(isUuid))].slice(0, 100)
  if (!OPS.includes(op) || !ids.length) redirect(withQ(to, 'err', 'rien'))
  if (!editor && op !== 'trash') redirect(withQ(to, 'err', 'interdit'))
  if (op === 'delete' && !admin) redirect(withQ(to, 'err', 'interdit'))
  let q = sb.from('articles').select('id,status,slug,tags').in('id', ids)
  if (!editor) q = q.eq('author_id', user.id).neq('status', 'published')
  const { data: rows } = await q
  const list = rows || []
  if (!list.length) redirect(withQ(to, 'err', 'rien'))
  const idsOk = list.map(r => r.id), now = new Date().toISOString()
  let n = idsOk.length
  if (op === 'publish') await sb.from('articles').update({ status: 'published', published_at: now }).in('id', idsOk)
  else if (op === 'draft') await sb.from('articles').update({ status: 'draft' }).in('id', idsOk)
  else if (op === 'reject') await sb.from('articles').update({ status: 'rejected' }).in('id', idsOk)
  else if (op === 'trash') await sb.from('articles').update({ status: 'trash', updated_at: now }).in('id', idsOk).neq('status', 'trash')
  else if (op === 'restore') await sb.from('articles').update({ status: 'draft' }).in('id', idsOk).eq('status', 'trash')
  else if (op === 'delete') { const t = list.filter(r => r.status === 'trash').map(r => r.id); n = t.length; if (t.length) await sb.from('articles').delete().in('id', t) }
  else if (op === 'category') {
    const c = Number(fd.get('cat'))
    if (!Number.isInteger(c) || c <= 0) redirect(withQ(to, 'err', 'rubrique'))
    await sb.from('articles').update({ category_id: c }).in('id', idsOk)
  } else if (op === 'tag') {
    const add = parseTags(fd.get('tag'))
    if (!add.length) redirect(withQ(to, 'err', 'etiquette'))
    for (const r of list) await sb.from('articles').update({ tags: [...new Set([...(r.tags || []), ...add])].slice(0, 12) }).eq('id', r.id)
  }
  await sb.from('audit_log').insert({ user_id: user.id, action: `bulk_${op}`, target: `${n} article(s)` })
  refresh(); redirect(withQ(withQ(to, 'ok', 'groupe'), 'n', String(n)))
}

// Modification rapide depuis la liste : titre, rubrique, étiquettes, statut et date de publication.
export async function quickEdit(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const editor = atLeast(role, 'editor'), to = back(fd), id = String(fd.get('id') || '')
  if (!isUuid(id)) redirect(to)
  const { data: old } = await sb.from('articles').select('id,slug,author_id,status,published_at,title,subtitle,summary,image_url,blocks').eq('id', id).single()
  if (!old || old.status === 'trash') redirect(withQ(to, 'err', 'introuvable'))
  if (!editor && (old.author_id !== user.id || old.status === 'published')) redirect(withQ(to, 'err', 'interdit'))
  const title = String(fd.get('title') || '').trim().slice(0, 220), cat = Number(fd.get('category_id'))
  if (!title || !Number.isInteger(cat) || cat <= 0) redirect(withQ(to, 'err', 'incomplet'))
  const upd = { title, category_id: cat, tags: parseTags(fd.get('tags')), updated_at: new Date().toISOString() }
  if (editor) {
    const st = String(fd.get('status') || old.status)
    if (['draft', 'submitted', 'published', 'rejected'].includes(st)) {
      upd.status = st
      if (st === 'published') {
        const iso = kinshasaToISO(fd.get('publish_at')), cur = old.published_at && new Date(old.published_at).getTime()
        upd.published_at = iso || (cur && old.status === 'published' ? old.published_at : new Date().toISOString())
        if (iso && new Date(iso).getTime() <= Date.now() && !cur) upd.published_at = iso
      }
    }
  }
  if (title !== old.title) await saveRevision(sb, old, user.id, 'Avant modification rapide')
  const { error } = await sb.from('articles').update(upd).eq('id', id)
  if (error) redirect(withQ(to, 'err', 'enregistrement'))
  await sb.from('audit_log').insert({ user_id: user.id, action: 'article_quick_edit', target: id })
  refresh(); revalidatePath(`/article/${old.slug}`)
  redirect(withQ(to, 'ok', 'modifie'))
}

// Restaurer une ancienne version (l'état actuel est d'abord gardé comme nouvelle version).
export async function restoreRevision(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const id = String(fd.get('id') || ''), rev = String(fd.get('rev') || '')
  if (!isUuid(id) || !isUuid(rev)) redirect(B)
  const [{ data: a }, { data: r }] = await Promise.all([
    sb.from('articles').select('id,slug,author_id,status,title,subtitle,summary,image_url,blocks').eq('id', id).single(),
    sb.from('article_revisions').select('*').eq('id', rev).eq('article_id', id).single()])
  if (!a || !r) redirect(`${B}?err=introuvable`)
  if (!atLeast(role, 'editor') && (a.author_id !== user.id || a.status === 'published')) redirect(`${B}?err=interdit`)
  await saveRevision(sb, a, user.id, 'Avant restauration')
  const { error } = await sb.from('articles').update({ title: r.title, subtitle: r.subtitle, summary: r.summary, image_url: r.image_url, blocks: r.blocks, body: blocksText(r.blocks), updated_at: new Date().toISOString() }).eq('id', id)
  if (error) redirect(`${B}/${id}/revisions?err=1`)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'revision_restore', target: id })
  refresh(); revalidatePath(`/article/${a.slug}`)
  redirect(`${B}/${id}?restaure=1`)
}

// Notes internes
export async function addNote(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const id = String(fd.get('id') || ''), body = String(fd.get('body') || '').trim().slice(0, 1000)
  if (!isUuid(id)) redirect(B)
  if (body) await sb.from('article_notes').insert({ article_id: id, user_id: user.id, body })
  revalidatePath(`${B}/${id}`); redirect(`${B}/${id}#notes`)
}
export async function deleteNote(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const id = String(fd.get('id') || ''), nid = String(fd.get('nid') || '')
  if (!isUuid(id) || !isUuid(nid)) redirect(B)
  let q = sb.from('article_notes').delete().eq('id', nid)
  if (!atLeast(role, 'admin')) q = q.eq('user_id', user.id)
  await q
  revalidatePath(`${B}/${id}`); redirect(`${B}/${id}#notes`)
}
