// Heure de Kinshasa = UTC+1 toute l'année (pas d'heure d'été). Les champs « datetime-local » sont saisis à l'heure de Kinshasa.
const H = 3600000
export function kinshasaToISO(v) {
  const m = String(v || '').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/)
  if (!m) return null
  const d = new Date(`${m[1]}T${m[2]}:00+01:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
export function isoToKinshasaInput(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? '' : new Date(t + H).toISOString().slice(0, 16)
}
export const fmtKin = (iso, opts = { dateStyle: 'long', timeStyle: 'short' }) =>
  new Date(iso).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', ...opts })
