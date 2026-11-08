'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl } from '@/lib/blocks'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { mailReady, sendBatch } from '@/lib/mail'
import { digestHtml } from '@/lib/newsletter'
import { SITE_URL } from '@/lib/site'
const slugify = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const fields = fd => { const cover = String(fd.get('cover_url') || ''); return {
  title: String(fd.get('title') || '').trim().slice(0, 200), description: String(fd.get('description') || '').trim().slice(0, 1000) || null,
  cover_url: isMediaUrl(cover) ? cover : null, is_published: fd.get('is_published') === 'on' } }
export async function createDossier(fd) {
  const { sb, user } = await editor()
  const f = fields(fd); if (!f.title) redirect('/dashboard/dossiers?err=1')
  const { data, error } = await sb.from('dossiers').insert({ ...f, slug: `${slugify(f.title) || 'dossier'}-${Date.now().toString(36).slice(-4)}` }).select('id').single()
  if (error || !data) redirect('/dashboard/dossiers?err=1')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'dossier_create', target: f.title })
  revalidatePath('/dossiers'); redirect(`/dashboard/dossiers/${data.id}`)
}
export async function updateDossier(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  const f = fields(fd); if (!f.title) redirect(`/dashboard/dossiers/${id}?err=1`)
  await sb.from('dossiers').update(f).eq('id', id)
  revalidatePath('/dossiers'); revalidatePath('/', 'layout'); redirect(`/dashboard/dossiers/${id}?ok=1`)
}
export async function deleteDossier(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  await sb.from('dossiers').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'dossier_delete', target: id })
  revalidatePath('/dossiers'); redirect('/dashboard/dossiers?ok=1')
}
export async function addToDossier(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  const rows = fd.getAll('article').map(String).filter(isUuid).slice(0, 50).map(article_id => ({ dossier_id: id, article_id }))
  if (rows.length) await sb.from('dossier_articles').upsert(rows, { onConflict: 'dossier_id,article_id', ignoreDuplicates: true })
  revalidatePath('/dossiers'); revalidatePath('/', 'layout'); redirect(`/dashboard/dossiers/${id}?ok=1`)
}
export async function removeFromDossier(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''), a = String(fd.get('article') || '')
  if (!isUuid(id) || !isUuid(a)) redirect('/dashboard/dossiers')
  await sb.from('dossier_articles').delete().eq('dossier_id', id).eq('article_id', a)
  revalidatePath('/dossiers'); redirect(`/dashboard/dossiers/${id}?ok=1`)
}
// Envoie aux abonnés du dossier les articles publiés depuis le dernier envoi.
export async function notifyFollowers(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect('/dashboard/dossiers')
  const back = q => redirect(`/dashboard/dossiers/${id}?${q}`)
  const db = supabaseAdmin()
  if (!db || !mailReady()) back('err=mail')
  const { data: d } = await sb.from('dossiers').select('id,title,last_notified_at').eq('id', id).single()
  if (!d) redirect('/dashboard/dossiers')
  const { data: links } = await sb.from('dossier_articles').select('articles(title,slug,summary,image_url,status,published_at)').eq('dossier_id', id)
  const since = d.last_notified_at ? new Date(d.last_notified_at).getTime() : 0, now = Date.now()
  const fresh = (links || []).map(l => l.articles).filter(a => a && a.status === 'published' && new Date(a.published_at).getTime() <= now && new Date(a.published_at).getTime() > since)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at)).slice(0, 10)
  if (!fresh.length) back('err=nonew')
  const { data: subs } = await db.from('dossier_follows').select('email,token').eq('dossier_id', id).eq('status', 'confirmed').limit(5000)
  if (!subs?.length) back('err=nosubs')
  const subject = `Nouveau dans le dossier « ${d.title} »`.slice(0, 150)
  const base = digestHtml({ subject, intro: `${fresh.length} nouvel${fresh.length > 1 ? 's' : ''} article${fresh.length > 1 ? 's' : ''} dans le dossier « ${d.title} ».`, articles: fresh })
    .replace('à la newsletter de Tolobana Info', 'au dossier « ' + d.title.replace(/[<>&"]/g, '') + ' »')
  let sent = 0
  for (let i = 0; i < subs.length; i += 100) {
    const chunk = subs.slice(i, i + 100)
    const r = await sendBatch(chunk.map(s => { const u = `${SITE_URL}/suivi/desabonnement?token=${s.token}`
      return { to: s.email, subject, html: base.replace(/\{\{UNSUB\}\}/g, u), headers: { 'List-Unsubscribe': `<${u}>` } } }))
    if (!r.ok) break
    sent += chunk.length
  }
  if (sent) await sb.from('dossiers').update({ last_notified_at: new Date().toISOString() }).eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'dossier_notify', target: `${d.title.slice(0, 60)} (${sent})` })
  back(sent ? `sent=${sent}` : 'err=send')
}
