'use server'
import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/blocks'
import { voterHash, ipHash, isOpen } from '@/lib/polls'

export async function vote(fd) {
  const pollId = String(fd.get('poll') || ''), optionId = Number(fd.get('option'))
  const back = ['/', '/sondages'].includes(String(fd.get('back'))) ? String(fd.get('back')) : '/sondages'
  const go = s => redirect(`${back}?sondage=${s}#contenu`)
  if (!isUuid(pollId) || !Number.isInteger(optionId)) go('indisponible')
  const db = supabaseAdmin()
  if (!db) go('indisponible')
  const { data: poll } = await db.from('polls').select('id,is_active,ends_at').eq('id', pollId).maybeSingle()
  if (!poll || !isOpen(poll)) go('clos')
  const { data: opt } = await db.from('poll_options').select('id').eq('id', optionId).eq('poll_id', pollId).maybeSingle()
  if (!opt) go('indisponible')
  const jar = cookies()
  let cid = jar.get('tv_voter')?.value
  if (!/^[a-f0-9]{32}$/.test(cid || '')) {
    cid = randomBytes(16).toString('hex')
    jar.set('tv_voter', cid, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 31536000, path: '/' })
  }
  // Protection : 1 vote par navigateur (cookie) et au plus 25 votes par connexion et par jour (les réseaux mobiles partagent des adresses IP).
  const ip = ipHash(pollId)
  const { count } = await db.from('poll_votes').select('id', { count: 'exact', head: true }).eq('poll_id', pollId).eq('ip_hash', ip).gte('created_at', new Date(Date.now() - 86400000).toISOString())
  if ((count || 0) >= 25) go('limite')
  const { error } = await db.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, voter_hash: voterHash(pollId, cid), ip_hash: ip })
  revalidatePath('/'); revalidatePath('/sondages')
  go(error ? 'deja' : 'merci')
}
