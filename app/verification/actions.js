'use server'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
const OK = { ok: true, msg: 'Merci ! Votre signalement a bien été transmis à la rédaction.' }
// Un lecteur soumet une rumeur ou une affirmation à vérifier : elle arrive dans « Messages reçus » de l'espace rédaction.
export async function submitClaim(_prev, fd) {
  if (fd.get('website')) return OK
  const ts = Number(fd.get('ts'))
  if (!Number.isFinite(ts) || Date.now() - ts < 3000) return OK
  const claim = String(fd.get('claim') || '').trim().slice(0, 600)
  const source = String(fd.get('source') || '').trim().slice(0, 300)
  const email = String(fd.get('email') || '').trim().slice(0, 190)
  const name = String(fd.get('name') || '').trim().slice(0, 120)
  if (claim.length < 10) return { ok: false, msg: 'Décrivez la rumeur ou l’affirmation en quelques mots (10 caractères minimum).' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, msg: 'Adresse e-mail invalide (elle est facultative).' }
  if ((claim.match(/https?:\/\//g) || []).length > 3) return OK
  const row = { name: name || 'Lecteur (anonyme)', email: email || 'anonyme@tolobana.invalid', subject: `À vérifier : ${claim.slice(0, 120)}`.slice(0, 200),
    message: `${claim}${source ? `\n\nOù l'avez-vous vue ? ${source}` : ''}` }
  const db = supabaseAdmin()
  let error
  if (db) {
    const ip = createHash('sha256').update(`contact:${(headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'x'}:${process.env.VOTE_SALT || 'tolobana'}`).digest('hex')
    const { count } = await db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('ip_hash', ip).gte('created_at', new Date(Date.now() - 3600000).toISOString())
    if ((count || 0) >= 5) return { ok: false, msg: 'Vous avez envoyé plusieurs messages. Réessayez dans une heure.' }
    ;({ error } = await db.from('contact_messages').insert({ ...row, ip_hash: ip }))
  } else ({ error } = await supabaseServer().from('contact_messages').insert(row))
  return error ? { ok: false, msg: 'Le signalement n’a pas pu être envoyé. Réessayez plus tard.' } : OK
}
