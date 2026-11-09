'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { kinshasaToISO } from '@/lib/dates'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const STATUS = ['scheduled', 'live', 'finished']
const score = v => { const s = String(v ?? '').trim(); if (s === '') return null; const n = parseInt(s, 10); return Number.isInteger(n) && n >= 0 && n < 100 ? n : null }
const refresh = () => { revalidatePath('/sport'); revalidatePath('/') }
export async function createMatch(fd) {
  const { sb, user } = await editor()
  const competition = String(fd.get('competition') || '').trim().slice(0, 80), home = String(fd.get('home') || '').trim().slice(0, 60), away = String(fd.get('away') || '').trim().slice(0, 60)
  const kickoff = kinshasaToISO(fd.get('kickoff'))
  if (!competition || !home || !away || !kickoff) redirect('/dashboard/sport?err=1')
  const { error } = await sb.from('matches').insert({ competition, home, away, kickoff, created_by: user.id })
  if (error) redirect('/dashboard/sport?err=2')
  refresh(); redirect('/dashboard/sport?ok=1')
}
export async function updateMatch(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  const status = STATUS.includes(String(fd.get('status'))) ? String(fd.get('status')) : 'scheduled'
  await sb.from('matches').update({ home_score: score(fd.get('hs')), away_score: score(fd.get('as')), status }).eq('id', id)
  refresh(); redirect('/dashboard/sport?ok=1')
}
export async function deleteMatch(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('matches').delete().eq('id', id)
  refresh(); redirect('/dashboard/sport?ok=1')
}
