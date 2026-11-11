import { isUuid } from './blocks'
import { fd, norm, canLink, posGroup, age } from './sport'
import { apTeam, apPlayer } from './apifootball'
const manualMatch = (m, id) => ({ id: m.id, code: null, competition: m.competition, home: m.home, away: m.away, hc: null, ac: null, hs: m.home_score, as: m.away_score, kickoff: m.kickoff, status: m.status, hid: m.home_team_id, aid: m.away_team_id, matchday: null, stage: null })
const byDate = (a, b) => new Date(b.kickoff) - new Date(a.kickoff)

// Équipe : « fd-57 » (football-data, offre payante) ou équipe créée par la rédaction (uuid)
export async function getTeam(sb, id) {
  if (/^ap-\d{1,10}$/.test(id)) return apTeam(id)
  if (/^fd-\d{1,10}$/.test(id)) {
    if (!canLink(id)) return null
    const n = id.slice(3)
    const [t, fin, nxt] = await Promise.all([fd(`/teams/${n}`, 3600), fd(`/teams/${n}/matches?status=FINISHED&limit=10`, 900), fd(`/teams/${n}/matches?status=SCHEDULED&limit=6`, 900)])
    if (!t || !t.id) return null
    return { id, auto: true, name: t.shortName || t.name, full: t.name, crest: t.crest || null, founded: t.founded || null, stadium: t.venue || null, colors: t.clubColors || null, website: t.website || null, country: t.area?.name || null, city: null, coach: t.coach?.name || null, history: null,
      comps: (t.runningCompetitions || []).map(c => c.name).filter(Boolean),
      squad: (t.squad || []).map(p => ({ id: `fd-${p.id}`, name: p.name, group: posGroup(p.position), position: p.position || null, nationality: p.nationality || null, num: p.shirtNumber || null, age: age(p.dateOfBirth) })),
      results: (fin?.matches || []).map(norm).sort(byDate), next: (nxt?.matches || []).map(norm).sort((a, b) => -byDate(a, b)) }
  }
  if (!isUuid(id)) return null
  const { data: t } = await sb.from('teams').select('*').eq('id', id).maybeSingle()
  if (!t) return null
  const [{ data: pls }, { data: ms }] = await Promise.all([
    sb.from('players').select('id,name,position,shirt,birth_date,nationality,is_active').eq('team_id', id).eq('is_active', true).order('shirt', { ascending: true, nullsFirst: false }).limit(80),
    sb.from('matches').select('id,competition,home,away,home_score,away_score,kickoff,status,home_team_id,away_team_id').or(`home_team_id.eq.${id},away_team_id.eq.${id}`).order('kickoff', { ascending: false }).limit(60)])
  const all = (ms || []).map(manualMatch)
  return { id, auto: false, name: t.name, full: t.name, crest: t.logo_url || null, founded: t.founded || null, stadium: t.stadium || null, colors: null, website: t.website || null, country: t.country || null, city: t.city || null, coach: t.coach || null, history: t.history || null, comps: [],
    squad: (pls || []).map(p => ({ id: p.id, name: p.name, group: p.position, position: null, nationality: p.nationality || null, num: p.shirt ?? null, age: age(p.birth_date) })),
    results: all.filter(m => m.status === 'finished'), next: all.filter(m => m.status !== 'finished').reverse() }
}

export async function getPlayer(sb, id) {
  if (/^ap-\d{1,10}$/.test(id)) return apPlayer(id)
  if (/^fd-\d{1,10}$/.test(id)) {
    if (!canLink(id)) return null
    const p = await fd(`/persons/${id.slice(3)}`, 3600)
    if (!p || !p.id) return null
    const ct = p.currentTeam
    return { id, auto: true, name: p.name, group: posGroup(p.position), position: p.position || null, nationality: p.nationality || null, num: p.shirtNumber || null, born: p.dateOfBirth || null, age: age(p.dateOfBirth), bio: null, photo: null, team: ct?.id ? { id: `fd-${ct.id}`, name: ct.shortName || ct.name, crest: ct.crest || null } : null, stats: null }
  }
  if (!isUuid(id)) return null
  const { data: p } = await sb.from('players').select('*, teams(id,name,logo_url)').eq('id', id).maybeSingle()
  if (!p) return null
  const { data: ev } = await sb.from('match_events').select('kind').eq('player_id', id).limit(500)
  const c = k => (ev || []).filter(e => k.includes(e.kind)).length
  return { id, auto: false, name: p.name, group: p.position, position: null, nationality: p.nationality || null, num: p.shirt ?? null, born: p.birth_date || null, age: age(p.birth_date), bio: p.bio || null, photo: p.photo_url || null,
    team: p.teams ? { id: p.teams.id, name: p.teams.name, crest: p.teams.logo_url || null } : null,
    stats: { goals: c(['goal', 'penalty']), yellow: c(['yellow']), red: c(['red']), subs: c(['sub']) } }
}
