'use server'
import { randomBytes, createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { mailReady, sendBatch } from '@/lib/mail'
import { digestHtml } from '@/lib/newsletter'
import { SITE_URL } from '@/lib/site'
import { isUuid } from '@/lib/blocks'
const TOKEN = /^[a-f0-9]{48}$/
const esc = s => String(s ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' }[c]))

// Le lecteur demande à suivre un dossier : on lui envoie un e-mail de confirmation (double confirmation).
export async function followDossier(_prev, fd) {
  if (fd.get('website')) return { ok: true, msg: 'Merci !' }
  const id = String(fd.get('dossier') || '')
  const email = String(fd.get('email') || '').trim().toLowerCase()
  if (!isUuid(id) || email.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, msg: 'Adresse e-mail invalide.' }
  const sb = supabaseAdmin()
  if (!sb) return { ok: false, msg: 'Le suivi de dossier sera bientôt disponible.' }
  const { data: d } = await sb.from('dossiers').select('id,title,is_published').eq('id', id).maybeSingle()
  if (!d || !d.is_published) return { ok: false, msg: 'Dossier introuvable.' }
  // Au plus 5 demandes par heure et par connexion.
  const ip = createHash('sha256').update(`follow:${(headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'x'}:${process.env.VOTE_SALT || 'tolobana'}`).digest('hex')
  const { data: ex } = await sb.from('dossier_follows').select('id,status,requested_at').eq('dossier_id', id).eq('email', email).maybeSingle()
  if (ex?.status === 'confirmed') return { ok: true, msg: 'Vous suivez déjà ce dossier. Merci !' }
  if (ex?.status === 'pending' && Date.now() - new Date(ex.requested_at).getTime() < 60000) return { ok: true, msg: 'Un e-mail de confirmation vient de vous être envoyé.' }
  const { count } = await sb.from('dossier_follows').select('id', { count: 'exact', head: true }).eq('ip_hash', ip).gte('requested_at', new Date(Date.now() - 3600000).toISOString())
  if ((count || 0) >= 5) return { ok: false, msg: 'Trop de demandes depuis cette connexion. Réessayez dans une heure.' }
  const token = randomBytes(24).toString('hex'), now = new Date().toISOString()
  const { error } = ex
    ? await sb.from('dossier_follows').update({ status: 'pending', token, requested_at: now, ip_hash: ip }).eq('id', ex.id)
    : await sb.from('dossier_follows').insert({ dossier_id: id, email, token, ip_hash: ip })
  if (error) return { ok: false, msg: 'Une erreur est survenue, réessayez plus tard.' }
  if (!mailReady()) return { ok: true, msg: 'Demande enregistrée. L’e-mail de confirmation sera envoyé dès l’activation du service d’envoi.' }
  const url = `${SITE_URL}/suivi/confirmer?token=${token}`
  const html = digestHtml({ subject: 'Confirmez le suivi du dossier', intro: `Vous avez demandé à suivre le dossier « ${d.title} ». Confirmez en cliquant sur ce lien :\n${url}`, articles: [] })
    .replace(/\{\{UNSUB\}\}/g, `${SITE_URL}/`).replace('à la newsletter de Tolobana Info', 'au suivi d’un dossier de Tolobana Info')
    .replace(esc(url), `<a href="${esc(url)}" style="color:#0a84d6;font-weight:bold">Confirmer le suivi du dossier</a>`)
  const r = await sendBatch([{ to: email, subject: `Confirmez le suivi : ${d.title}`.slice(0, 150), html }])
  return r.ok ? { ok: true, msg: 'Merci ! Consultez votre boîte e-mail pour confirmer (pensez aux courriers indésirables).' } : { ok: false, msg: 'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez plus tard.' }
}
export async function confirmFollow(fd) {
  const token = String(fd.get('token') || ''), sb = supabaseAdmin()
  if (!sb || !TOKEN.test(token)) redirect('/suivi/confirmer?err=1')
  await sb.from('dossier_follows').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('token', token).in('status', ['pending', 'confirmed'])
  redirect('/suivi/confirmer?done=1')
}
export async function unfollow(fd) {
  const token = String(fd.get('token') || ''), sb = supabaseAdmin()
  if (!sb || !TOKEN.test(token)) redirect('/suivi/desabonnement?err=1')
  await sb.from('dossier_follows').update({ status: 'unsubscribed' }).eq('token', token)
  redirect('/suivi/desabonnement?done=1')
}
