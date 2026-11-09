// Sport : matchs saisis par la rédaction + grands championnats via football-data.org (variable FOOTBALL_DATA_TOKEN).
import { isUuid } from './blocks'
const TZ = 'Africa/Kinshasa'
export const dayOf = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
export const timeOf = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
export const dateLabel = iso => new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })
export const today = () => dayOf(new Date().toISOString())
export const shiftDay = (day, n) => new Date(new Date(day + 'T12:00:00Z').getTime() + n * 86400000).toISOString().slice(0, 10)
export const validDay = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) && !isNaN(new Date(d + 'T12:00:00Z'))

// Les 12 compétitions de l'offre gratuite de football-data.org
export const COMPS = [
  { code: 'PL', name: 'Premier League', country: 'Angleterre' }, { code: 'PD', name: 'Liga', country: 'Espagne' },
  { code: 'SA', name: 'Serie A', country: 'Italie' }, { code: 'BL1', name: 'Bundesliga', country: 'Allemagne' },
  { code: 'FL1', name: 'Ligue 1', country: 'France' }, { code: 'CL', name: 'Ligue des champions', country: 'Europe' },
  { code: 'WC', name: 'Coupe du monde', country: 'Monde' }, { code: 'EC', name: 'Euro', country: 'Europe' },
  { code: 'ELC', name: 'Championship', country: 'Angleterre' }, { code: 'DED', name: 'Eredivisie', country: 'Pays-Bas' },
  { code: 'PPL', name: 'Liga Portugal', country: 'Portugal' }, { code: 'BSA', name: 'Brasileirão', country: 'Brésil' },
]
export const compByCode = c => COMPS.find(x => x.code === String(c || '').toUpperCase())
export const hasFeed = () => !!process.env.FOOTBALL_DATA_TOKEN

async function fd(path, revalidate = 300) {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return null
  try {
    const res = await fetch(`https://api.football-data.org/v4${path}`, { headers: { 'X-Auth-Token': token }, next: { revalidate } })
    return res.ok ? await res.json() : null
  } catch { return null }
}
const stat = s => (s === 'FINISHED' || s === 'AWARDED') ? 'finished' : ['IN_PLAY', 'PAUSED', 'LIVE'].includes(s) ? 'live' : ['POSTPONED', 'SUSPENDED', 'CANCELLED'].includes(s) ? 'postponed' : 'scheduled'
const STAGES = { GROUP_STAGE: 'Phase de groupes', LEAGUE_STAGE: 'Phase de ligue', LAST_16: '8es de finale', QUARTER_FINALS: 'Quarts de finale', SEMI_FINALS: 'Demi-finales', FINAL: 'Finale', PLAYOFFS: 'Barrages', THIRD_PLACE: 'Match pour la 3e place', ROUND_OF_16: '8es de finale', LAST_32: '16es de finale' }
const norm = m => ({
  id: `fd-${m.id}`, code: m.competition?.code || null, competition: compByCode(m.competition?.code)?.name || m.competition?.name || 'Football',
  home: m.homeTeam?.shortName || m.homeTeam?.name || '?', away: m.awayTeam?.shortName || m.awayTeam?.name || '?', hc: m.homeTeam?.crest || null, ac: m.awayTeam?.crest || null,
  hs: m.score?.fullTime?.home ?? null, as: m.score?.fullTime?.away ?? null, kickoff: m.utcDate, status: stat(m.status),
  matchday: m.matchday || null, stage: STAGES[m.stage] || null, auto: true,
})
const manualNorm = m => ({ id: m.id, code: null, competition: m.competition, home: m.home, away: m.away, hc: null, ac: null, hs: m.home_score, as: m.away_score, kickoff: m.kickoff, status: m.status, matchday: null, stage: null, auto: false })

// Matchs d'un jour (heure de Kinshasa)
export async function getDay(sb, day) {
  const from = shiftDay(day, -1), to = shiftDay(day, 1)
  const [{ data }, j] = await Promise.all([
    sb.from('matches').select('id,competition,home,away,home_score,away_score,kickoff,status').gte('kickoff', `${from}T00:00:00Z`).lte('kickoff', `${to}T23:59:59Z`).order('kickoff', { ascending: true }).limit(200),
    fd(`/matches?dateFrom=${from}&dateTo=${to}`, day === today() ? 60 : 600),
  ])
  const all = [...(data || []).map(manualNorm), ...((j?.matches || []).map(norm))].filter(m => m.kickoff)
  return all.filter(m => dayOf(m.kickoff) === day).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
}
export const byComp = list => { const o = {}; for (const m of list) (o[m.competition] = o[m.competition] || []).push(m); return Object.entries(o) }

export async function getCompetition(code) {
  const j = await fd(`/competitions/${code}`, 3600)
  return j ? { name: compByCode(code)?.name || j.name, emblem: j.emblem || null, matchday: j.currentSeason?.currentMatchday || null, season: j.currentSeason ? `${String(j.currentSeason.startDate).slice(0, 4)}/${String(j.currentSeason.endDate).slice(2, 4)}` : null } : null
}
export async function getCompMatches(code, matchday) {
  let j
  if (matchday) j = await fd(`/competitions/${code}/matches?matchday=${matchday}`, 300)
  else j = await fd(`/competitions/${code}/matches?dateFrom=${shiftDay(today(), -4)}&dateTo=${shiftDay(today(), 6)}`, 300)
  return (j?.matches || []).map(norm).filter(m => m.kickoff).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
}
export async function getStandings(code) {
  const j = await fd(`/competitions/${code}/standings`, 600)
  return (j?.standings || []).filter(s => s.type === 'TOTAL' && s.table?.length).map(s => ({
    group: s.group ? String(s.group).replace('GROUP_', 'Groupe ').replace('_', ' ') : null,
    table: s.table.map(r => ({ pos: r.position, team: r.team?.shortName || r.team?.name, crest: r.team?.crest || null, p: r.playedGames, w: r.won, d: r.draw, l: r.lost, gf: r.goalsFor, ga: r.goalsAgainst, gd: r.goalDifference, pts: r.points, form: r.form ? String(r.form).split(',').filter(Boolean).slice(-5) : [] })),
  }))
}
export async function getScorers(code) {
  const j = await fd(`/competitions/${code}/scorers?limit=20`, 900)
  return (j?.scorers || []).map(s => ({ name: s.player?.name, team: s.team?.shortName || s.team?.name, crest: s.team?.crest || null, played: s.playedMatches, goals: s.goals ?? 0, assists: s.assists, pens: s.penalties }))
}

const parseLines = (txt, side) => String(txt || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12).map(line => {
  const m = line.match(/^(.*?)\s*(\d{1,3}(?:\+\d{1,2})?)\s*['’′]?$/)
  return m && m[1] ? { minute: m[2], name: m[1], side, type: 'REGULAR' } : { minute: null, name: line, side, type: 'REGULAR' }
})
// Détail d'un match (football-data « fd-123 » ou match saisi par la rédaction)
export async function getMatch(sb, id) {
  if (/^fd-\d{1,10}$/.test(id)) {
    const m = await fd(`/matches/${id.slice(3)}`, 60)
    if (!m || !m.id) return null
    const base = norm(m), hid = m.homeTeam?.id
    const goals = (m.goals || []).map(g => ({ minute: g.minute != null ? String(g.minute) + (g.injuryTime ? `+${g.injuryTime}` : '') : null, name: g.scorer?.name || '?', assist: g.assist?.name || null, side: g.team?.id === hid ? 'home' : 'away', type: g.type || 'REGULAR' }))
    const cards = (m.bookings || []).map(b => ({ minute: b.minute != null ? String(b.minute) : null, name: b.player?.name || '?', side: b.team?.id === hid ? 'home' : 'away', card: b.card === 'RED' || b.card === 'YELLOW_RED' ? 'red' : 'yellow' }))
    const ht = m.score?.halfTime?.home != null ? `${m.score.halfTime.home} - ${m.score.halfTime.away}` : null
    return { ...base, goals, cards, ht, venue: m.venue || null, referee: m.referees?.find(r => r.type === 'REFEREE')?.name || m.referees?.[0]?.name || null, note: null }
  }
  if (!isUuid(id)) return null
  const { data: m } = await sb.from('matches').select('*').eq('id', id).maybeSingle()
  if (!m) return null
  return { ...manualNorm(m), goals: [...parseLines(m.home_scorers, 'home'), ...parseLines(m.away_scorers, 'away')], cards: [], ht: null, venue: m.venue || null, referee: null, note: null }
}
