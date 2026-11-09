export const CATS = { culture: 'Culture et loisirs', politique: 'Politique', sport: 'Sport', sante: 'Santé', economie: 'Économie et emploi', religion: 'Religion', education: 'Éducation', autre: 'Autre' }
const TZ = 'Africa/Kinshasa'
export const dayKey = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
export const dayTitle = iso => new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const monthTitle = iso => new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, month: 'long', year: 'numeric' })
export const hm = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
// Début du jour courant à Kinshasa (UTC+1), en ISO UTC : les événements d'aujourd'hui restent visibles toute la journée.
export const startOfTodayISO = () => new Date(`${dayKey(new Date().toISOString())}T00:00:00+01:00`).toISOString()
const esc = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const stamp = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
export function ics(e, url) {
  const end = e.ends_at || new Date(new Date(e.starts_at).getTime() + 2 * 3600000).toISOString()
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tolobana Info//Agenda//FR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${e.id}@tolobana`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(e.starts_at)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`, `LOCATION:${esc([e.venue, e.city].filter(Boolean).join(', '))}`, `DESCRIPTION:${esc(`${e.description || ''}\n${url}`.trim())}`, `URL:${url}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
}
