'use server'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSettings } from '@/lib/settings'
import { mailReady, sendBatch } from '@/lib/mail'
import { isType } from '@/lib/services'
const OK = { ok: true, msg: 'Merci ! Votre demande a été reçue. La rédaction la vérifie et vous contacte, notamment pour les conditions de publication.' }
const esc = x => String(x).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
export async function submitPost(_prev, fd) {
  if (fd.get('website')) return OK
  const ts = Number(fd.get('ts'))
  if (!Number.isFinite(ts) || Date.now() - ts < 5000) return OK
  const type = String(fd.get('type') || '')
  const t = (k, n) => String(fd.get(k) || '').trim().slice(0, n)
  const title = t('title', 160), body = t('body', 4000), org = t('org', 150), location = t('location', 120), contact = t('contact', 200)
  const name = t('name', 120), email = t('email', 190), deadline = t('deadline', 10)
  if (!isType(type)) return { ok: false, msg: 'Choisissez un type de publication.' }
  if (title.length < 3 || body.length < 10) return { ok: false, msg: 'Renseignez au moins un titre et un texte.' }
  if (!contact) return { ok: false, msg: 'Indiquez un contact (téléphone, WhatsApp ou e-mail) : il sera affiché avec la publication.' }
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, msg: 'Indiquez votre nom et un e-mail valide : la rédaction vous répondra.' }
  if ((body.match(/https?:\/\//g) || []).length > 3) return OK
  const row = { type, title, body, org: org || null, location: location || null, contact, submitter_name: name, submitter_email: email,
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null, status: 'pending' }
  const sb = supabaseServer(), db = supabaseAdmin()
  let error
  if (db) {
    const ip = createHash('sha256').update(`svc:${(headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'x'}:${process.env.VOTE_SALT || 'tolobana'}`).digest('hex')
    const { count } = await db.from('service_posts').select('id', { count: 'exact', head: true }).eq('ip_hash', ip).gte('created_at', new Date(Date.now() - 86400000).toISOString())
    if ((count || 0) >= 5) return { ok: false, msg: 'Vous avez déjà envoyé plusieurs demandes aujourd’hui. Réessayez demain.' }
    ;({ error } = await db.from('service_posts').insert({ ...row, ip_hash: ip }))
  } else ({ error } = await sb.from('service_posts').insert(row))
  if (error) return { ok: false, msg: 'La demande n’a pas pu être envoyée. Réessayez plus tard.' }
  try {
    const s = await getSettings(sb)
    if (mailReady() && s.email) await sendBatch([{ to: s.email, subject: `Nouvelle demande de publication : ${title.slice(0, 80)}`, html: `<p>Type : <b>${esc(type)}</b></p><p><b>${esc(title)}</b></p><p>${esc(body).replace(/\n/g, '<br>')}</p><p>Contact : ${esc(contact)}<br>Demandeur : ${esc(name)} (${esc(email)})</p><p>À valider dans Espace rédaction > Services.</p>` }])
  } catch {}
  return OK
}
