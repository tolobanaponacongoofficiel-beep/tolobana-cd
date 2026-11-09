// Résultats sportifs : matchs saisis par la rédaction + (facultatif) grands championnats via football-data.org (variable FOOTBALL_DATA_TOKEN).
const TZ = 'Africa/Kinshasa'
export const dayOf = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
export const timeOf = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
export const dateLabel = iso => new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })
async function auto() {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return []
  const d = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
  try {
    const res = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${d(-2)}&dateTo=${d(3)}`, { headers: { 'X-Auth-Token': token }, next: { revalidate: 120 } })
    if (!res.ok) return []
    const j = await res.json()
    return (j.matches || []).map(m => ({
      id: `fd-${m.id}`, competition: m.competition?.name || 'Football', home: m.homeTeam?.shortName || m.homeTeam?.name || '?', away: m.awayTeam?.shortName || m.awayTeam?.name || '?',
      hs: m.score?.fullTime?.home ?? null, as: m.score?.fullTime?.away ?? null, kickoff: m.utcDate,
      status: m.status === 'FINISHED' ? 'finished' : ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status) ? 'live' : 'scheduled', auto: true })).filter(m => m.kickoff)
  } catch { return [] }
}
export async function getMatches(sb) {
  const from = new Date(Date.now() - 3 * 86400000).toISOString(), to = new Date(Date.now() + 8 * 86400000).toISOString()
  const { data } = await sb.from('matches').select('id,competition,home,away,home_score,away_score,kickoff,status').gte('kickoff', from).lte('kickoff', to).order('kickoff', { ascending: true }).limit(300)
  const manual = (data || []).map(m => ({ id: m.id, competition: m.competition, home: m.home, away: m.away, hs: m.home_score, as: m.away_score, kickoff: m.kickoff, status: m.status }))
  return [...manual, ...(await auto())].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
}
export function split(matches) {
  const today = dayOf(new Date().toISOString())
  const todayList = matches.filter(m => dayOf(m.kickoff) === today || m.status === 'live')
  const past = matches.filter(m => dayOf(m.kickoff) < today && m.status !== 'live').reverse()
  const next = matches.filter(m => dayOf(m.kickoff) > today && m.status !== 'live')
  return { today: todayList, past, next }
}
export const byComp = list => { const o = {}; for (const m of list) (o[m.competition] = o[m.competition] || []).push(m); return Object.entries(o) }
