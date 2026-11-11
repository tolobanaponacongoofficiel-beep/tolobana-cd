'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { slugify, norm, parsePos, parseBirth, safeUrl } from '@/lib/clubs'

const B = '/dashboard/clubs-joueurs'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const txt = (v, max) => String(v || '').trim().slice(0, max) || null
const int = (v, lo, hi) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) && n >= lo && n <= hi ? n : null }
const aud = (sb, user, action, target) => sb.from('audit_log').insert({ user_id: user.id, action, target: String(target).slice(0, 120) })

async function uniqueSlug(sb, name) {
  const base = slugify(name)
  for (let i = 0; i < 8; i++) {
    const slug = i ? `${base}-${Math.random().toString(36).slice(2, 5)}` : base
    const { data } = await sb.from('fc_clubs').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
  }
  return `${base}-${Date.now().toString(36)}`
}
export async function createClub(fd) {
  const { sb, user } = await editor()
  const name = txt(fd.get('name'), 80)
  if (!name || name.length < 2) redirect(`${B}?err=1`)
  const { data, error } = await sb.from('fc_clubs').insert({ name, slug: await uniqueSlug(sb, name), country: txt(fd.get('country'), 60), city: txt(fd.get('city'), 60) }).select('id').single()
  if (error || !data) redirect(`${B}?err=1`)
  await aud(sb, user, 'club_create', name)
  revalidatePath('/clubs'); redirect(`${B}/club/${data.id}`)
}
export async function updateClub(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect(B)
  const name = txt(fd.get('name'), 80); if (!name || name.length < 2) redirect(`${B}/club/${id}?err=1`)
  const site = txt(fd.get('website'), 200)
  const aliases = String(fd.get('aliases') || '').split(',').map(s => s.trim().slice(0, 80)).filter(Boolean).slice(0, 10)
  const { data: row } = await sb.from('fc_clubs').update({
    name, short_name: txt(fd.get('short_name'), 40), aliases, country: txt(fd.get('country'), 60), city: txt(fd.get('city'), 60),
    founded: int(fd.get('founded'), 1800, 2100), stadium: txt(fd.get('stadium'), 100), colors: txt(fd.get('colors'), 80), coach: txt(fd.get('coach'), 80),
    website: site && /^https?:\/\//.test(site) ? site : null, crest_url: safeUrl(fd.get('crest_url')),
    history: txt(fd.get('history'), 8000), honours: txt(fd.get('honours'), 4000), is_published: fd.get('is_published') === 'on',
  }).eq('id', id).select('slug').single()
  await aud(sb, user, 'club_update', name)
  revalidatePath('/clubs'); if (row) revalidatePath(`/clubs/${row.slug}`)
  redirect(`${B}/club/${id}?ok=1`)
}
export async function deleteClub(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect(B)
  await sb.from('fc_clubs').delete().eq('id', id)
  await aud(sb, user, 'club_delete', id)
  revalidatePath('/clubs'); redirect(`${B}?ok=1`)
}
// Import de l'effectif : « numéro ; nom ; poste ; naissance ; nationalité » (un joueur par ligne)
export async function importSquad(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect(B)
  const lines = String(fd.get('squad') || '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 60)
  const { data: squad } = await sb.from('fc_players').select('id,name').eq('club_id', id)
  const byName = new Map((squad || []).map(p => [norm(p.name), p.id]))
  const fresh = []
  for (const line of lines) {
    const parts = line.split(/[;\t]/).map(s => s.trim())
    const shirt = /^\d{1,2}$/.test(parts[0]) ? Number(parts.shift()) : null
    const name = (parts[0] || '').slice(0, 80); if (name.length < 2) continue
    const row = { name, shirt_number: shirt, position: parsePos(parts[1]), birth_date: parseBirth(parts[2]), nationality: txt(parts[3], 60) }
    const known = byName.get(norm(name))
    if (known) { const upd = Object.fromEntries(Object.entries(row).filter(([k, v]) => k !== 'name' && v != null)); if (Object.keys(upd).length) await sb.from('fc_players').update({ ...upd, is_active: true }).eq('id', known) }
    else if (!fresh.some(f => norm(f.name) === norm(name))) fresh.push({ ...row, club_id: id })
  }
  if (fresh.length) await sb.from('fc_players').insert(fresh)
  await aud(sb, user, 'squad_import', `${id} (+${fresh.length})`)
  revalidatePath('/clubs'); redirect(`${B}/club/${id}?ok=1`)
}
export async function updatePlayer(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('id') || ''); if (!isUuid(id)) redirect(B)
  const name = txt(fd.get('name'), 80); if (!name || name.length < 2) redirect(`${B}/joueur/${id}?err=1`)
  const club = String(fd.get('club_id') || '')
  const pos = ['gardien', 'defenseur', 'milieu', 'attaquant'].includes(fd.get('position')) ? fd.get('position') : null
  const foot = ['droit', 'gauche', 'ambidextre'].includes(fd.get('foot')) ? fd.get('foot') : null
  await sb.from('fc_players').update({
    name, club_id: isUuid(club) ? club : null, position: pos, shirt_number: int(fd.get('shirt_number'), 0, 99), birth_date: parseBirth(fd.get('birth_date')),
    nationality: txt(fd.get('nationality'), 60), height_cm: int(fd.get('height_cm'), 100, 230), foot, photo_url: safeUrl(fd.get('photo_url')),
    bio: txt(fd.get('bio'), 4000), is_active: fd.get('is_active') === 'on',
  }).eq('id', id)
  await aud(sb, user, 'player_update', name)
  revalidatePath('/clubs'); revalidatePath(`/joueurs/${id}`)
  redirect(`${B}/joueur/${id}?ok=1`)
}
export async function deletePlayer(fd) {
  const { sb, user } = await editor()
  const id = String(fd.get('id') || ''), back = isUuid(String(fd.get('club') || '')) ? `${B}/club/${fd.get('club')}` : B
  if (!isUuid(id)) redirect(B)
  await sb.from('fc_players').delete().eq('id', id)
  await aud(sb, user, 'player_delete', id)
  revalidatePath('/clubs'); redirect(`${back}?ok=1`)
}
