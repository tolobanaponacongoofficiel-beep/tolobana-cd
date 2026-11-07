import { createHash } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
const sha = s => createHash('sha256').update(s).digest('hex')
const SALT = process.env.VOTE_SALT || 'tolobana'
export const voterHash = (pollId, cookieId) => sha(`${pollId}:${cookieId}`)
export const ipHash = pollId => sha(`${pollId}:${(headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'x'}:${SALT}`)
export async function hasVoted(pollId) {
  const cid = cookies().get('tv_voter')?.value
  const db = supabaseAdmin()
  if (!db || !/^[a-f0-9]{32}$/.test(cid || '')) return false
  const { count } = await db.from('poll_votes').select('id', { count: 'exact', head: true }).eq('poll_id', pollId).eq('voter_hash', voterHash(pollId, cid))
  return (count || 0) > 0
}
export const isOpen = p => p.is_active && (!p.ends_at || new Date(p.ends_at).getTime() > Date.now())
