'use server'
import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { mailReady, sendBatch } from '@/lib/mail'
export async function sendMessage(_prev, fd) {
  if (fd.get('website')) return { ok: true, msg: 'Merci, votre message a bien été envoyé.' } // piège à robots
  const name = String(fd.get('name') || '').trim().slice(0, 120)
  const email = String(fd.get('email') || '').trim().slice(0, 190)
  const subject = String(fd.get('subject') || '').trim().slice(0, 200)
  const message = String(fd.get('message') || '').trim().slice(0, 4000)
  if (!name || message.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, msg: 'Vérifiez votre nom, votre e-mail et votre message.' }
  const sb = supabaseServer()
  const { error } = await sb.from('contact_messages').insert({ name, email, subject: subject || null, message })
  if (error) return { ok: false, msg: 'Le message n’a pas pu être envoyé. Réessayez plus tard.' }
  try {
    const s = await getSettings(sb)
    if (mailReady() && s.email) {
      const esc = x => x.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
      await sendBatch([{ to: s.email, subject: `Nouveau message : ${subject || 'Contact'}`, html: `<p><b>${esc(name)}</b> (${esc(email)})</p><p>${esc(message).replace(/\n/g, '<br>')}</p>` }])
    }
  } catch {}
  return { ok: true, msg: 'Merci, votre message a bien été envoyé.' }
}
