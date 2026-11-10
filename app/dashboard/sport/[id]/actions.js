'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const lines = (v, max) => String(v ?? '').replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30).join('\n').slice(0, max) || null
const KINDS = ['goal', 'penalty', 'own_goal', 'yellow', 'red', 'sub']
const refresh = () => revalidatePath('/sport', 'layout')
export async function saveDetails(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  const tid = k => { const v = String(fd.get(k) || ''); return isUuid(v) ? v : null }
  const { error } = await sb.from('matches').update({ home_team_id: tid('home_team_id'), away_team_id: tid('away_team_id'), home_lineup: lines(fd.get('home_lineup'), 900), away_lineup: lines(fd.get('away_lineup'), 900), home_bench: lines(fd.get('home_bench'), 600), away_bench: lines(fd.get('away_bench'), 600) }).eq('id', id)
  if (error) redirect(`/dashboard/sport/${id}?err=2`)
  refresh(); redirect(`/dashboard/sport/${id}?ok=1`)
}
export async function addEvent(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  const kind = String(fd.get('kind')), side = String(fd.get('side')), minute = parseInt(String(fd.get('minute') || ''), 10), extra = parseInt(String(fd.get('extra') || '0'), 10) || 0
  const name = String(fd.get('player_name') || '').trim().slice(0, 100), other = String(fd.get('other_name') || '').trim().slice(0, 100) || null
  if (!KINDS.includes(kind) || !['home', 'away'].includes(side) || !(minute >= 0 && minute <= 130) || !name) redirect(`/dashboard/sport/${id}?err=1`)
  const { data: m } = await sb.from('matches').select('home_team_id,away_team_id').eq('id', id).maybeSingle()
  const team = side === 'home' ? m?.home_team_id : m?.away_team_id
  let pid = null
  if (team) { const { data: p } = await sb.from('players').select('id,name').eq('team_id', team).limit(120); pid = (p || []).find(x => String(x.name).toLowerCase() === name.toLowerCase())?.id || null }
  const { error } = await sb.from('match_events').insert({ match_id: id, kind, side, minute, extra: Math.min(Math.max(extra, 0), 20), player_name: name, player_id: pid, other_name: other })
  if (error) redirect(`/dashboard/sport/${id}?err=2`)
  refresh(); redirect(`/dashboard/sport/${id}?ok=1`)
}
export async function deleteEvent(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''), match = String(fd.get('match_id') || ''); if (!isUuid(id) || !isUuid(match)) return
  await sb.from('match_events').delete().eq('id', id)
  refresh(); redirect(`/dashboard/sport/${match}?ok=1`)
}
