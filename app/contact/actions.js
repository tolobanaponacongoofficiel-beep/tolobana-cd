'use server'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSettings } from '@/lib/settings'
import { mailReady, sendBatch } from '@/lib/mail'
const OK = { ok: true, msg: 'Merci, votre message a bien été envoyé.' }
export async function sendMessage(_prev, fd) {
  if (fd.get('website')) return OK // piège à robots
  // Un humain met plus de 3 secondes à remplir le formulaire ; un robot l'envoie aussitôt.
  const ts = Number(fd.get('ts'))
  if (!Number.isFinite(ts) || Date.now() - ts < 3000) return OK
  const name = String(fd.get('name') || '').trim().slice(0, 120)
  const email = String(fd.get('email') || '').trim().slice(0, 190)
  const subject = String(fd.get('subject') || '').trim().slice(0, 200)
  const message = String(fd.get('message') || '').trim().slice(0, 4000)
  if (!name || message.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, msg: 'Vérifiez votre nom, votre e-mail et votre message.' }
  if ((message.match(/https?:\/\//g) || []).length > 3) return OK // message plein de liens : probablement du spam
  const sb = supabaseServer(), db = supabaseAdmin()
  const row = { name, email, subject: subject || null, message }
  let error
  if (db) {
    // Au plus 5 messages par heure et par connexion.
    const ip = createHash('sha256').update(`contact:${(headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'x'}:${process.env.VOTE_SALT || 'tolobana'}`).digest('hex')
    const { count } = await db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('ip_hash', ip).gte('created_at', new Date(Date.now() - 3600000).toISOString())
    if ((count || 0) >= 5) return { ok: false, msg: 'Vous avez envoyé plusieurs messages. Réessayez dans une heure.' }
    ;({ error } = await db.from('contact_messages').insert({ ...row, ip_hash: ip }))
  } else ({ error } = await sb.from('contact_messages').insert(row))
  if (error) return { ok: false, msg: 'Le message n’a pas pu être envoyé. Réessayez plus tard.' }
  try {
    const s = await getSettings(sb)
    if (mailReady() && s.email) {
      const esc = x => x.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
      await sendBatch([{ to: s.email, subject: `Nouveau message : ${subject || 'Contact'}`, html: `<p><b>${esc(name)}</b> (${esc(email)})</p><p>${esc(message).replace(/\n/g, '<br>')}</p>` }])
    }
  } catch {}
  return OK
}
