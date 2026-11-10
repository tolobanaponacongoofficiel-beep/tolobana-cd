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
// Pages équipe/joueur des grands championnats : réservées à l'offre payante « Deep Data » (variable FOOTBALL_DATA_DEEP=1). Les équipes saisies par la rédaction sont toujours cliquables.
export const deepOn = () => process.env.FOOTBALL_DATA_DEEP === '1'
export const canLink = id => !!id && (!String(id).startsWith('fd-') || deepOn())

export async function fd(path, revalidate = 300) {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return null
  try {
    const res = await fetch(`https://api.football-data.org/v4${path}`, { headers: { 'X-Auth-Token': token }, next: { revalidate } })
    return res.ok ? await res.json() : null
  } catch { return null }
}
const stat = s => (s === 'FINISHED' || s === 'AWARDED') ? 'finished' : ['IN_PLAY', 'PAUSED', 'LIVE'].includes(s) ? 'live' : ['POSTPONED', 'SUSPENDED', 'CANCELLED'].includes(s) ? 'postponed' : 'scheduled'
const STAGES = { GROUP_STAGE: 'Phase de groupes', LEAGUE_STAGE: 'Phase de ligue', LAST_16: '8es de finale', QUARTER_FINALS: 'Quarts de finale', SEMI_FINALS: 'Demi-finales', FINAL: 'Finale', PLAYOFFS: 'Barrages', THIRD_PLACE: 'Match pour la 3e place', ROUND_OF_16: '8es de finale', LAST_32: '16es de finale' }
export const norm = m => ({
  hid: m.homeTeam?.id ? `fd-${m.homeTeam.id}` : null, aid: m.awayTeam?.id ? `fd-${m.awayTeam.id}` : null,
  id: `fd-${m.id}`, code: m.competition?.code || null, competition: compByCode(m.competition?.code)?.name || m.competition?.name || 'Football',
  home: m.homeTeam?.shortName || m.homeTeam?.name || '?', away: m.awayTeam?.shortName || m.awayTeam?.name || '?', hc: m.homeTeam?.crest || null, ac: m.awayTeam?.crest || null,
  hs: m.score?.fullTime?.home ?? null, as: m.score?.fullTime?.away ?? null, kickoff: m.utcDate, status: stat(m.status),
  matchday: m.matchday || null, stage: STAGES[m.stage] || null, auto: true,
})
const manualNorm = m => ({ hid: m.home_team_id || null, aid: m.away_team_id || null, id: m.id, code: null, competition: m.competition, home: m.home, away: m.away, hc: null, ac: null, hs: m.home_score, as: m.away_score, kickoff: m.kickoff, status: m.status, matchday: null, stage: null, auto: false })

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

const GROUPS = [['gardien', 'Gardiens'], ['defenseur', 'Défenseurs'], ['milieu', 'Milieux'], ['attaquant', 'Attaquants']]
export const GROUP_LABEL = Object.fromEntries(GROUPS)
export const GROUP_ORDER = GROUPS.map(g => g[0])
export const posGroup = p => { const x = String(p || '').toLowerCase(); return /goal|gardien/.test(x) ? 'gardien' : /mid/.test(x) ? 'milieu' : /def|back/.test(x) ? 'defenseur' : /off|forward|wing|strik|attack/.test(x) ? 'attaquant' : null }
export const age = d => { if (!d) return null; const b = new Date(d); if (isNaN(b)) return null; const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a >= 0 && a < 80 ? a : null }
const minNum = (m, extra) => (parseInt(m, 10) || 0) + (parseInt(extra, 10) || 0) / 100
const minLabel = (m, extra) => m == null ? null : `${m}${extra ? `+${extra}` : ''}`

const lineLines = (txt, map) => String(txt || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30).map(line => {
  const m = line.match(/^(\d{1,2})[\s.)-]+(.+)$/), name = (m ? m[2] : line).trim(), num = m ? m[1] : null
  return { name, num, id: map?.get(name.toLowerCase()) || null }
})
const parseLegacy = (txt, side) => String(txt || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12).map(line => {
  const m = line.match(/^(.*?)\s*(\d{1,3}(?:\+\d{1,2})?)\s*['’′]?$/), [mn, ex] = m && m[1] ? String(m[2]).split('+') : [null, null]
  return { kind: 'goal', side, name: m && m[1] ? m[1] : line, pid: null, other: null, minute: minLabel(mn, ex), sort: minNum(mn, ex) }
})

// Détail d'un match : chronologie (buts, cartons, remplacements), compositions
export async function getMatch(sb, id) {
  if (/^fd-\d{1,10}$/.test(id)) {
    const m = await fd(`/matches/${id.slice(3)}`, 60)
    if (!m || !m.id) return null
    const base = norm(m), hid = m.homeTeam?.id, side = t => t?.id === hid ? 'home' : 'away', pid = p => p?.id ? `fd-${p.id}` : null
    const ev = [
      ...(m.goals || []).map(g => ({ kind: g.type === 'OWN' ? 'own_goal' : g.type === 'PENALTY' ? 'penalty' : 'goal', side: side(g.team), name: g.scorer?.name || '?', pid: pid(g.scorer), other: g.assist?.name || null, minute: minLabel(g.minute, g.injuryTime), sort: minNum(g.minute, g.injuryTime) })),
      ...(m.bookings || []).map(b => ({ kind: b.card === 'RED' || b.card === 'YELLOW_RED' ? 'red' : 'yellow', side: side(b.team), name: b.player?.name || '?', pid: pid(b.player), other: null, minute: minLabel(b.minute), sort: minNum(b.minute) })),
      ...(m.substitutions || []).map(x => ({ kind: 'sub', side: side(x.team), name: x.playerIn?.name || '?', pid: pid(x.playerIn), other: x.playerOut?.name || null, otherId: pid(x.playerOut), minute: minLabel(x.minute), sort: minNum(x.minute) })),
    ].sort((a, b) => a.sort - b.sort)
    const lu = t => { const l = (t?.lineup || []).map(p => ({ name: p.name, num: p.shirtNumber ?? null, id: pid(p), pos: p.position || null })); const b = (t?.bench || []).map(p => ({ name: p.name, num: p.shirtNumber ?? null, id: pid(p) })); return l.length || b.length ? { formation: t?.formation || null, coach: t?.coach?.name || null, start: l, bench: b } : null }
    const ht = m.score?.halfTime?.home != null ? `${m.score.halfTime.home} - ${m.score.halfTime.away}` : null
    const lineups = { home: lu(m.homeTeam), away: lu(m.awayTeam) }
    return { ...base, events: ev, lineups: lineups.home || lineups.away ? lineups : null, ht, venue: m.venue || null, referee: m.referees?.find(r => r.type === 'REFEREE')?.name || m.referees?.[0]?.name || null }
  }
  if (!isUuid(id)) return null
  const { data: m } = await sb.from('matches').select('*').eq('id', id).maybeSingle()
  if (!m) return null
  const [{ data: evs }, { data: pls }] = await Promise.all([
    sb.from('match_events').select('kind,side,minute,extra,player_name,player_id,other_name').eq('match_id', id).order('minute', { ascending: true }).order('extra', { ascending: true }).limit(120),
    (m.home_team_id || m.away_team_id) ? sb.from('players').select('id,name,team_id').in('team_id', [m.home_team_id, m.away_team_id].filter(Boolean)).limit(120) : Promise.resolve({ data: [] }),
  ])
  const byTeam = t => new Map((pls || []).filter(p => p.team_id === t).map(p => [String(p.name).toLowerCase(), p.id]))
  const events = (evs || []).length ? evs.map(e => ({ kind: e.kind, side: e.side, name: e.player_name, pid: e.player_id || null, other: e.other_name || null, minute: minLabel(e.minute, e.extra), sort: minNum(e.minute, e.extra) }))
    : [...parseLegacy(m.home_scorers, 'home'), ...parseLegacy(m.away_scorers, 'away')]
  const hm = byTeam(m.home_team_id), am = byTeam(m.away_team_id)
  const hs = lineLines(m.home_lineup, hm), as = lineLines(m.away_lineup, am), hb = lineLines(m.home_bench, hm), ab = lineLines(m.away_bench, am)
  const side = (start, bench) => start.length || bench.length ? { formation: null, coach: null, start, bench } : null
  const lineups = { home: side(hs, hb), away: side(as, ab) }
  return { ...manualNorm(m), events, lineups: lineups.home || lineups.away ? lineups : null, ht: null, venue: m.venue || null, referee: null }
}
