'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { slugify, matchClub, findPlayer, parseLineup, parseEvents, safeUrl } from '@/lib/clubs'

const B = '/dashboard/clubs-joueurs'
const txt = (v, max) => String(v || '').trim().slice(0, max) || null
const num = v => { const n = Number.parseInt(v, 10); return Number.isFinite(n) && n >= 0 && n <= 60 ? n : null }

// Retrouve le club (par nom ou alias) ou le crée à la volée, avec son écusson du flux.
async function ensureClub(sb, clubs, name, crest) {
  const found = matchClub(clubs, name); if (found) return found
  const base = slugify(name); let slug = base
  for (let i = 0; i < 6; i++) {
    const { data } = await sb.from('fc_clubs').select('id').eq('slug', slug).maybeSingle()
    if (!data) break
    slug = `${base}-${Math.random().toString(36).slice(2, 5)}`
  }
  const { data } = await sb.from('fc_clubs').insert({ name: name.slice(0, 80), slug, crest_url: safeUrl(crest) }).select('id,slug,name,short_name,aliases').single()
  if (data) clubs.push(data)
  return data
}
const loadSquad = async (sb, clubId) => clubId ? (await sb.from('fc_players').select('id,name,shirt_number').eq('club_id', clubId)).data || [] : []

export async function saveMatchDetails(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const ref = String(fd.get('match_ref') || '')
  if (!/^[\w.-]{1,80}$/.test(ref)) redirect(B)
  const fail = () => redirect(`${B}/match/${ref}?err=1`)
  const home = txt(fd.get('home'), 80), away = txt(fd.get('away'), 80)
  if (!home || !away) fail()

  const { data: clubs } = await sb.from('fc_clubs').select('id,slug,name,short_name,aliases')
  const list = clubs || []
  const hc = await ensureClub(sb, list, home, fd.get('hc')), ac = await ensureClub(sb, list, away, fd.get('ac'))
  const ko = new Date(String(fd.get('kickoff') || ''))
  const { error } = await sb.from('fc_matches').upsert({
    match_ref: ref, home, away, kickoff: Number.isNaN(ko.getTime()) ? null : ko.toISOString(), home_score: num(fd.get('hs')), away_score: num(fd.get('as')),
    competition: txt(fd.get('competition'), 80), status: txt(fd.get('status'), 30), home_club: hc?.id ?? null, away_club: ac?.id ?? null,
    home_formation: txt(fd.get('home_formation'), 12), away_formation: txt(fd.get('away_formation'), 12), updated_at: new Date().toISOString(),
  }, { onConflict: 'match_ref' })
  if (error) fail()

  // Compositions : les joueurs inconnus sont ajoutés à l'effectif du club.
  const sides = [['home', hc], ['away', ac]]
  const entries = []
  for (const [side] of sides) {
    parseLineup(fd.get(`${side}_starters`)).forEach(e => entries.push({ ...e, side, starter: true }))
    parseLineup(fd.get(`${side}_bench`)).forEach(e => entries.push({ ...e, side, starter: false }))
  }
  const squads = { home: await loadSquad(sb, hc?.id), away: await loadSquad(sb, ac?.id) }
  const toCreate = []
  for (const e of entries) {
    const club = e.side === 'home' ? hc : ac
    if (club && !findPlayer(squads[e.side], e.name) && !toCreate.some(t => t.club_id === club.id && t.name.toLowerCase() === e.name.toLowerCase())) toCreate.push({ club_id: club.id, name: e.name, shirt_number: e.shirt })
  }
  if (toCreate.length) { await sb.from('fc_players').insert(toCreate); squads.home = await loadSquad(sb, hc?.id); squads.away = await loadSquad(sb, ac?.id) }

  await sb.from('fc_lineups').delete().eq('match_ref', ref)
  await sb.from('fc_events').delete().eq('match_ref', ref)
  if (entries.length) {
    await sb.from('fc_lineups').insert(entries.map((e, i) => ({
      match_ref: ref, side: e.side, player_id: findPlayer(squads[e.side], e.name)?.id ?? null, name: e.name, shirt_number: e.shirt,
      is_starter: e.starter, is_captain: e.captain, sort: i })))
  }
  const events = parseEvents(fd.get('events'))
  if (events.length) {
    await sb.from('fc_events').insert(events.map(e => {
      const p = findPlayer(squads[e.side], e.player), o = e.other ? findPlayer(squads[e.side], e.other) : null
      return { match_ref: ref, minute: e.minute, extra: e.extra, type: e.type, side: e.side, player_id: p?.id ?? null, player_name: p?.name ?? e.player, other_id: o?.id ?? null, other_name: e.other ? (o?.name ?? e.other) : null }
    }))
  }
  await sb.from('audit_log').insert({ user_id: user.id, action: 'match_details_save', target: `${ref} ${home}-${away}` })
  revalidatePath(`/sport/match/${ref}`); revalidatePath('/clubs')
  redirect(`/sport/match/${ref}`)
}
