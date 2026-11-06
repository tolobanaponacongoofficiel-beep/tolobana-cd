'use server'
import { randomBytes } from 'node:crypto'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { mailReady, sendBatch } from '@/lib/mail'
import { confirmEmail } from '@/lib/newsletter'
import { SITE_URL } from '@/lib/site'

const TOKEN = /^[a-f0-9]{48}$/

export async function subscribe(_prev, fd) {
  if (fd.get('website')) return { ok: true, msg: 'Merci !' } // piège à robots
  const email = String(fd.get('email') || '').trim().toLowerCase()
  if (email.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, msg: 'Adresse e-mail invalide.' }
  const sb = supabaseAdmin()
  if (!sb) return { ok: false, msg: 'La newsletter sera bientôt disponible.' }
  // Anti-abus : trop de demandes d'inscription en peu de temps (évite d'utiliser le site pour inonder des boîtes e-mail).
  const since = new Date(Date.now() - 10 * 60000).toISOString()
  const { count: recent } = await sb.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('requested_at', since)
  if ((recent || 0) >= 40) return { ok: false, msg: 'Beaucoup de demandes en ce moment. Réessayez dans quelques minutes.' }
  const { data: ex } = await sb.from('subscribers').select('id,status,requested_at').eq('email', email).maybeSingle()
  if (ex?.status === 'confirmed') return { ok: true, msg: 'Vous êtes déjà abonné(e). Merci !' }
  if (ex?.status === 'pending' && Date.now() - new Date(ex.requested_at).getTime() < 60000) return { ok: true, msg: 'Un e-mail de confirmation vient de vous être envoyé.' }
  const token = randomBytes(24).toString('hex')
  const now = new Date().toISOString()
  const { error } = ex
    ? await sb.from('subscribers').update({ status: 'pending', token, requested_at: now, unsubscribed_at: null }).eq('id', ex.id)
    : await sb.from('subscribers').insert({ email, token })
  if (error) return { ok: false, msg: 'Une erreur est survenue, réessayez plus tard.' }
  if (!mailReady()) return { ok: true, msg: 'Inscription enregistrée. L’e-mail de confirmation sera envoyé dès l’activation du service d’envoi.' }
  const url = `${SITE_URL}/newsletter/confirmer?token=${token}`
  const m = confirmEmail(url)
  const r = await sendBatch([{ to: email, subject: m.subject, html: m.html.replace(/\{\{UNSUB\}\}/g, `${SITE_URL}/`) }])
  return r.ok ? { ok: true, msg: 'Merci ! Consultez votre boîte e-mail pour confirmer (pensez aux courriers indésirables).' }
    : { ok: false, msg: 'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez plus tard.' }
}
export async function confirmSubscription(fd) {
  const token = String(fd.get('token') || '')
  const sb = supabaseAdmin()
  if (!sb || !TOKEN.test(token)) redirect('/newsletter/confirmer?err=1')
  await sb.from('subscribers').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('token', token).in('status', ['pending', 'confirmed'])
  redirect('/newsletter/confirmer?done=1')
}
export async function unsubscribe(fd) {
  const token = String(fd.get('token') || '')
  const sb = supabaseAdmin()
  if (!sb || !TOKEN.test(token)) redirect('/newsletter/desabonnement?err=1')
  await sb.from('subscribers').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('token', token)
  redirect('/newsletter/desabonnement?done=1')
}
