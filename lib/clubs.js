// Outils communs : clubs, joueurs, compositions, événements de match.
export const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export const slugify = s => norm(s).replace(/ /g, '-').slice(0, 70) || 'club'
export const POS = { gardien: 'Gardiens', defenseur: 'Défenseurs', milieu: 'Milieux', attaquant: 'Attaquants' }
export const POS_ONE = { gardien: 'Gardien', defenseur: 'Défenseur', milieu: 'Milieu', attaquant: 'Attaquant' }
export const EVENT_TYPES = ['goal', 'penalty', 'own_goal', 'yellow', 'second_yellow', 'red', 'sub']
export const safeUrl = u => (/^https:\/\/[^\s"'<>]{4,300}$/.test(String(u || '')) ? String(u) : null)
export const paras = t => String(t || '').split(/\n+/).map(s => s.trim()).filter(Boolean)

export function parsePos(s) {
  const t = norm(s)
  if (/^(g|gk|gardien)/.test(t)) return 'gardien'
  if (/^(d|def)/.test(t)) return 'defenseur'
  if (/^(m|mil)/.test(t)) return 'milieu'
  if (/^(a|att|f|avant)/.test(t)) return 'attaquant'
  return null
}
export function parseBirth(s) {
  const t = String(s || '').trim()
  if (/^\d{4}$/.test(t)) return `${t}-01-01`
  let m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? t : null
}
export const ageFrom = d => {
  if (!d) return null
  const b = new Date(d), n = new Date()
  if (Number.isNaN(b.getTime())) return null
  let a = n.getUTCFullYear() - b.getUTCFullYear()
  if (n.getUTCMonth() < b.getUTCMonth() || (n.getUTCMonth() === b.getUTCMonth() && n.getUTCDate() < b.getUTCDate())) a--
  return a >= 0 && a < 70 ? a : null
}
export function matchClub(clubs, name) {
  const n = norm(name); if (!n) return null
  return (clubs || []).find(c => norm(c.name) === n || (c.short_name && norm(c.short_name) === n) || (c.aliases || []).some(a => norm(a) === n)) || null
}
// « Mutamba » retrouve « Meschack Mutamba » si un seul joueur de l'effectif correspond.
export function findPlayer(squad, name) {
  const n = norm(name); if (!n) return null
  const exact = (squad || []).find(p => norm(p.name) === n); if (exact) return exact
  const toks = n.split(' ')
  const cand = (squad || []).filter(p => { const pt = norm(p.name).split(' '); return toks.every(t => pt.includes(t)) })
  return cand.length === 1 ? cand[0] : null
}
// Lignes de composition : « 10 Meschack Mutamba (C) »
export function parseLineup(text) {
  return String(text || '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 30).map(l => {
    const m = l.match(/^(?:(\d{1,2})\s*[.)\-–]?\s+)?(.+?)\s*(\([cC]\))?$/)
    return m ? { shirt: m[1] ? Number(m[1]) : null, name: m[2].trim().slice(0, 80), captain: !!m[3] } : null
  }).filter(e => e && e.name.length >= 2)
}
export function parseEvents(json) {
  let arr; try { arr = JSON.parse(String(json || '[]')) } catch { return [] }
  if (!Array.isArray(arr)) return []
  return arr.slice(0, 80).map(e => {
    const minute = Number.parseInt(e?.minute, 10), extra = Number.parseInt(e?.extra, 10)
    return {
      minute: Number.isFinite(minute) ? Math.min(Math.max(minute, 0), 130) : null, extra: Number.isFinite(extra) ? Math.min(Math.max(extra, 0), 15) : 0,
      type: EVENT_TYPES.includes(e?.type) ? e.type : null, side: e?.side === 'away' ? 'away' : 'home',
      player: String(e?.player || '').trim().slice(0, 80), other: String(e?.other || '').trim().slice(0, 80),
    }
  }).filter(e => e.type && e.player)
}
export async function getDetails(sb, id, m) {
  const ref = String(id)
  const [{ data: clubs }, { data: meta }, { data: lineups }, { data: events }] = await Promise.all([
    sb.from('fc_clubs').select('id,slug,name,short_name,aliases,crest_url').eq('is_published', true),
    sb.from('fc_matches').select('*').eq('match_ref', ref).maybeSingle(),
    sb.from('fc_lineups').select('*').eq('match_ref', ref).order('sort'),
    sb.from('fc_events').select('*').eq('match_ref', ref).order('minute').order('extra').order('id'),
  ])
  return { meta, lineups: lineups || [], events: events || [], homeClub: matchClub(clubs, m?.home), awayClub: matchClub(clubs, m?.away) }
}
