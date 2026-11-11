// API-Football (api-sports.io) : calendriers, classements, buteurs, chronologie et compositions, y compris CAN, éliminatoires, Euro, Copa América, Ligue des nations, Asie et Océanie.
// Variable d'environnement : APIFOOTBALL_KEY. L'offre gratuite autorise 100 requêtes par jour : toutes les réponses sont mises en cache.
import { COMPS, compByAp, compByCode, today, shiftDay } from './comps'
export const apOn = () => !!process.env.APIFOOTBALL_KEY
export async function ap(path, revalidate = 600) {
  const key = process.env.APIFOOTBALL_KEY
  if (!key) return null
  try {
    const res = await fetch(`https://v3.football.api-sports.io${path}`, { headers: { 'x-apisports-key': key }, next: { revalidate } })
    if (!res.ok) return null
    const j = await res.json()
    const bad = j?.errors && (Array.isArray(j.errors) ? j.errors.length : Object.keys(j.errors).length)
    if (bad) console.error('[apifootball]', path, JSON.stringify(j.errors).slice(0, 300))
    return bad ? null : (j.response ?? null)
  } catch { return null }
}
const stat = s => ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(s) ? 'finished' : ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'].includes(s) ? 'live' : ['PST', 'CANC', 'ABD', 'SUSP'].includes(s) ? 'postponed' : 'scheduled'
const ROUND = { 'Group Stage': 'Phase de groupes', 'Round of 16': '8es de finale', 'Quarter-finals': 'Quarts de finale', 'Semi-finals': 'Demi-finales', 'Final': 'Finale', '3rd Place Final': 'Match pour la 3e place', 'Round of 32': '16es de finale' }
const roundInfo = r => { const t = String(r || ''), n = t.match(/(\d+)\s*$/); return { matchday: /regular season|group|matchday|round \d|journée/i.test(t) && n ? parseInt(n[1], 10) : null, stage: ROUND[t] || (/^Group/i.test(t) ? t.replace(/^Group Stage ?-? ?/i, 'Phase de groupes ').trim() : null) } }
export const apNorm = f => {
  const c = compByAp(f.league?.id), r = roundInfo(f.league?.round)
  return { hid: f.teams?.home?.id ? `ap-${f.teams.home.id}` : null, aid: f.teams?.away?.id ? `ap-${f.teams.away.id}` : null, id: `ap-${f.fixture?.id}`, code: c?.code || null, competition: c?.name || f.league?.name || 'Football',
    home: f.teams?.home?.name || '?', away: f.teams?.away?.name || '?', hc: f.teams?.home?.logo || null, ac: f.teams?.away?.logo || null, hs: f.goals?.home ?? null, as: f.goals?.away ?? null,
    clogo: f.league?.logo || null, kickoff: f.fixture?.date, status: stat(f.fixture?.status?.short), matchday: r.matchday, stage: r.stage, auto: true }
}
const known = f => !!compByAp(f.league?.id)

// Matchs d'un jour (heure de Kinshasa) : une seule requête pour toutes les compétitions.
export async function apDay(day) {
  const j = await ap(`/fixtures?date=${day}&timezone=Africa%2FKinshasa`, day === today() ? 120 : 900)
  return j ? j.filter(known).map(apNorm) : null
}
async function season(id) {
  const j = await ap(`/leagues?id=${id}&current=true`, 43200)
  const l = j?.[0]; if (!l) return null
  const s = l.seasons?.find(x => x.current) || l.seasons?.[l.seasons.length - 1]
  return s ? { year: s.year, name: l.league?.name, logo: l.league?.logo || null, start: s.start, end: s.end } : null
}
export async function apCompetition(code) {
  const c = compByCode(code); if (!c?.ap) return null
  const s = await season(c.ap); if (!s) return null
  let matchday = null
  const rd = await ap(`/fixtures/rounds?league=${c.ap}&season=${s.year}&current=true`, 3600)
  if (rd?.[0]) matchday = roundInfo(rd[0]).matchday
  const y = String(s.start || '').slice(0, 4), z = String(s.end || '').slice(2, 4)
  return { name: c.name, emblem: s.logo, matchday, season: y && z && y.slice(2) !== z ? `${y}/${z}` : y || String(s.year), year: s.year }
}
export async function apCompMatches(code, matchday) {
  const c = compByCode(code); if (!c?.ap) return null
  const s = await season(c.ap); if (!s) return null
  const q = `league=${c.ap}&season=${s.year}`
  let j = matchday ? await ap(`/fixtures?${q}&round=${encodeURIComponent(`Regular Season - ${matchday}`)}`, 300)
    : await ap(`/fixtures?${q}&from=${shiftDay(today(), -4)}&to=${shiftDay(today(), 6)}&timezone=Africa%2FKinshasa`, 600)
  if (!matchday && j && !j.length) j = await ap(`/fixtures?${q}&last=10&timezone=Africa%2FKinshasa`, 1800)
  return j ? j.map(apNorm).filter(m => m.kickoff).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)) : null
}
export async function apStandings(code) {
  const c = compByCode(code); if (!c?.ap) return null
  const s = await season(c.ap); if (!s) return null
  const j = await ap(`/standings?league=${c.ap}&season=${s.year}`, 3600)
  const groups = j?.[0]?.league?.standings; if (!Array.isArray(groups)) return null
  return groups.filter(g => g?.length).map(g => ({
    group: g.length && g[0].group && !/regular season|league/i.test(g[0].group) ? String(g[0].group).replace(/^Group ?/i, 'Groupe ').replace(/^(.*): ?$/, '$1') : null,
    table: g.map(r => ({ pos: r.rank, team: r.team?.name, crest: r.team?.logo || null, p: r.all?.played, w: r.all?.win, d: r.all?.draw, l: r.all?.lose, gf: r.all?.goals?.for, ga: r.all?.goals?.against, gd: r.goalsDiff, pts: r.points, form: r.form ? String(r.form).split('').slice(-5) : [] })) }))
}
export async function apScorers(code) {
  const c = compByCode(code); if (!c?.ap) return null
  const s = await season(c.ap); if (!s) return null
  const j = await ap(`/players/topscorers?league=${c.ap}&season=${s.year}`, 3600)
  return j ? j.slice(0, 20).map(x => { const st = x.statistics?.[0] || {}; return { name: x.player?.name, team: st.team?.name, crest: st.team?.logo || null, played: st.games?.appearences, goals: st.goals?.total ?? 0, assists: st.goals?.assists, pens: st.penalty?.scored } }) : null
}

// Détail d'un match : une seule requête renvoie l'événement, la chronologie et les compositions.
const minLabel = (m, e) => m == null ? null : `${m}${e ? `+${e}` : ''}`
const minNum = (m, e) => (m || 0) + (e || 0) / 100
export async function apMatch(id) {
  const n = String(id).slice(3)
  const j = await ap(`/fixtures?id=${n}&timezone=Africa%2FKinshasa`, 45)
  const f = j?.[0]; if (!f) return null
  const hid = f.teams?.home?.id, side = t => t?.id === hid ? 'home' : 'away', pid = p => p?.id ? `ap-${p.id}` : null
  const ev = []
  for (const e of f.events || []) {
    const base = { side: side(e.team), minute: minLabel(e.time?.elapsed, e.time?.extra), sort: minNum(e.time?.elapsed, e.time?.extra) }
    if (e.type === 'Goal' && e.detail !== 'Missed Penalty') ev.push({ ...base, kind: e.detail === 'Own Goal' ? 'own_goal' : e.detail === 'Penalty' ? 'penalty' : 'goal', name: e.player?.name || '?', pid: pid(e.player), other: e.assist?.name || null })
    else if (e.type === 'Card') ev.push({ ...base, kind: /red|second yellow/i.test(e.detail || '') ? 'red' : 'yellow', name: e.player?.name || '?', pid: pid(e.player), other: null })
    else if (e.type === 'subst') ev.push({ ...base, kind: 'sub', name: e.assist?.name || '?', pid: pid(e.assist), other: e.player?.name || null, otherId: pid(e.player) })
  }
  ev.sort((a, b) => a.sort - b.sort)
  const lu = t => { const l = (f.lineups || []).find(x => x.team?.id === t?.id); if (!l) return null
    const row = x => ({ name: x.player?.name, num: x.player?.number ?? null, id: pid(x.player), pos: x.player?.pos || null })
    return { formation: l.formation || null, coach: l.coach?.name || null, start: (l.startXI || []).map(row), bench: (l.substitutes || []).map(row) } }
  const lineups = { home: lu(f.teams?.home), away: lu(f.teams?.away) }
  const ht = f.score?.halftime?.home != null ? `${f.score.halftime.home} - ${f.score.halftime.away}` : null
  return { ...apNorm(f), events: ev, lineups: lineups.home || lineups.away ? lineups : null, ht, venue: f.fixture?.venue?.name || null, referee: f.fixture?.referee || null }
}

// Équipe et joueur
const posG = p => /goal/i.test(p || '') ? 'gardien' : /mid/i.test(p || '') ? 'milieu' : /def/i.test(p || '') ? 'defenseur' : /att|forw/i.test(p || '') ? 'attaquant' : null
export async function apTeam(id, norm) {
  const n = String(id).slice(3)
  const [t, sq, fin, nxt] = await Promise.all([ap(`/teams?id=${n}`, 21600), ap(`/players/squads?team=${n}`, 21600), ap(`/fixtures?team=${n}&last=10&timezone=Africa%2FKinshasa`, 1800), ap(`/fixtures?team=${n}&next=6&timezone=Africa%2FKinshasa`, 1800)])
  const x = t?.[0]; if (!x?.team) return null
  const byDate = (a, b) => new Date(b.kickoff) - new Date(a.kickoff)
  return { id, auto: true, name: x.team.name, full: x.team.name, crest: x.team.logo || null, founded: x.team.founded || null, stadium: x.venue?.name || null, colors: null, website: null, country: x.team.country || null, city: x.venue?.city || null, coach: null, history: null, comps: [],
    squad: (sq?.[0]?.players || []).map(p => ({ id: `ap-${p.id}`, name: p.name, group: posG(p.position), position: p.position || null, nationality: null, num: p.number ?? null, age: p.age ?? null })),
    results: (fin || []).map(apNorm).sort(byDate), next: (nxt || []).map(apNorm).sort((a, b) => -byDate(a, b)) }
}
export async function apPlayer(id) {
  const n = String(id).slice(3)
  const j = await ap(`/players/profiles?player=${n}`, 21600)
  const p = j?.[0]?.player; if (!p) return null
  return { id, auto: true, name: p.name, group: posG(p.position), position: p.position || null, nationality: p.nationality || null, num: p.number ?? null, born: p.birth?.date || null, age: p.age ?? null, bio: null, photo: p.photo || null, team: null, stats: null }
}
