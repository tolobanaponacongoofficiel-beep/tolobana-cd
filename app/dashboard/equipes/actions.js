'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, isMediaUrl, safeUrl } from '@/lib/blocks'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const t = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n) || null
const POS = ['gardien', 'defenseur', 'milieu', 'attaquant']
const refresh = () => revalidatePath('/sport', 'layout')
function teamFields(fd) {
  const name = t(fd, 'name', 80); if (!name || name.length < 2) return null
  const f = parseInt(String(fd.get('founded') || ''), 10), logo = String(fd.get('logo_url') || '')
  return { name, city: t(fd, 'city', 80), country: t(fd, 'country', 80) || 'RDC', founded: f >= 1800 && f <= 2100 ? f : null, stadium: t(fd, 'stadium', 120), coach: t(fd, 'coach', 100), website: safeUrl(fd.get('website')) || null, history: t(fd, 'history', 6000), ...(isMediaUrl(logo) ? { logo_url: logo } : {}) }
}
export async function createTeam(fd) {
  const { sb } = await editor(); const row = teamFields(fd); if (!row) redirect('/dashboard/equipes?err=1')
  const { data, error } = await sb.from('teams').insert(row).select('id').single()
  if (error || !data) redirect('/dashboard/equipes?err=2')
  refresh(); redirect(`/dashboard/equipes/${data.id}?ok=1`)
}
export async function updateTeam(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  const row = teamFields(fd); if (!row) redirect(`/dashboard/equipes/${id}?err=1`)
  const { error } = await sb.from('teams').update(row).eq('id', id)
  if (error) redirect(`/dashboard/equipes/${id}?err=2`)
  refresh(); redirect(`/dashboard/equipes/${id}?ok=1`)
}
export async function deleteTeam(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('teams').delete().eq('id', id)
  refresh(); redirect('/dashboard/equipes?ok=1')
}
export async function addPlayer(fd) {
  const { sb } = await editor(); const team = String(fd.get('team_id') || ''); if (!isUuid(team)) return
  const name = t(fd, 'name', 100); if (!name || name.length < 2) redirect(`/dashboard/equipes/${team}?err=1`)
  const shirt = parseInt(String(fd.get('shirt') || ''), 10), photo = String(fd.get('photo_url') || ''), bd = String(fd.get('birth_date') || '')
  const { error } = await sb.from('players').insert({ team_id: team, name, position: POS.includes(String(fd.get('position'))) ? String(fd.get('position')) : null, shirt: shirt >= 1 && shirt <= 99 ? shirt : null,
    birth_date: /^\d{4}-\d{2}-\d{2}$/.test(bd) ? bd : null, nationality: t(fd, 'nationality', 60) || 'RDC', bio: t(fd, 'bio', 3000), photo_url: isMediaUrl(photo) ? photo : null })
  if (error) redirect(`/dashboard/equipes/${team}?err=2`)
  refresh(); redirect(`/dashboard/equipes/${team}?ok=1`)
}
export async function setPlayerActive(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''), team = String(fd.get('team_id') || ''); if (!isUuid(id) || !isUuid(team)) return
  await sb.from('players').update({ is_active: fd.get('active') === '1' }).eq('id', id)
  refresh(); redirect(`/dashboard/equipes/${team}?ok=1`)
}
export async function deletePlayer(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''), team = String(fd.get('team_id') || ''); if (!isUuid(id) || !isUuid(team)) return
  await sb.from('players').delete().eq('id', id)
  refresh(); redirect(`/dashboard/equipes/${team}?ok=1`)
}
