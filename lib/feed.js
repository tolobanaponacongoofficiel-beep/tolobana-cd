// Fil « En continu » : regroupe les articles par jour (heure de Kinshasa).
const TZ = 'Africa/Kinshasa'
export const hm = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
const dayKey = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
export function dayLabel(iso) {
  const k = dayKey(iso), today = dayKey(new Date().toISOString()), yest = dayKey(new Date(Date.now() - 86400000).toISOString())
  if (k === today) return 'Aujourd’hui'
  if (k === yest) return 'Hier'
  return new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })
}
export function groupByDay(list) {
  const out = []
  for (const a of list || []) {
    const k = dayKey(a.published_at)
    const last = out[out.length - 1]
    if (last && last.key === k) last.items.push(a)
    else out.push({ key: k, label: dayLabel(a.published_at), items: [a] })
  }
  return out
}
