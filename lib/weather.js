// Météo : prévisions MET Norway (api.met.no), gratuites, usage commercial permis avec mention de la source (CC BY 4.0).
import { SITE_URL } from './site'
export const CITIES = [
  { slug: 'kinshasa', name: 'Kinshasa', lat: -4.3250, lon: 15.3222, tz: 1 },
  { slug: 'lubumbashi', name: 'Lubumbashi', lat: -11.6647, lon: 27.4794, tz: 2 },
  { slug: 'goma', name: 'Goma', lat: -1.6792, lon: 29.2228, tz: 2 },
  { slug: 'kisangani', name: 'Kisangani', lat: 0.5153, lon: 25.1910, tz: 2 },
  { slug: 'mbuji-mayi', name: 'Mbuji-Mayi', lat: -6.1360, lon: 23.5897, tz: 2 },
  { slug: 'kananga', name: 'Kananga', lat: -5.8970, lon: 22.4170, tz: 2 },
  { slug: 'bukavu', name: 'Bukavu', lat: -2.5083, lon: 28.8608, tz: 2 },
  { slug: 'matadi', name: 'Matadi', lat: -5.8167, lon: 13.4633, tz: 1 },
  { slug: 'mbandaka', name: 'Mbandaka', lat: 0.0487, lon: 18.2603, tz: 1 },
  { slug: 'kolwezi', name: 'Kolwezi', lat: -10.7158, lon: 25.4667, tz: 2 },
]
export const cityBySlug = s => CITIES.find(c => c.slug === s) || CITIES[0]
// Type d'icône et libellé selon le code météo MET (ex. « rainshowers_day »).
export function describe(code = '') {
  const c = String(code)
  if (c.includes('thunder')) return { icon: 'thunder', label: 'Orage' }
  if (c.includes('heavyrain')) return { icon: 'rain', label: 'Forte pluie' }
  if (c.includes('showers')) return { icon: 'rain', label: 'Averses' }
  if (c.includes('rain') || c.includes('sleet') || c.includes('snow')) return { icon: 'rain', label: 'Pluie' }
  if (c.startsWith('fog')) return { icon: 'cloud', label: 'Brouillard' }
  if (c.startsWith('clearsky')) return { icon: 'sun', label: 'Ciel dégagé' }
  if (c.startsWith('fair')) return { icon: 'sun', label: 'Plutôt dégagé' }
  if (c.startsWith('partlycloudy')) return { icon: 'partly', label: 'Éclaircies' }
  if (c.startsWith('cloudy')) return { icon: 'cloud', label: 'Nuageux' }
  return { icon: 'partly', label: 'Variable' }
}
const SEV = { sun: 0, partly: 1, cloud: 2, rain: 3, thunder: 4 }
// Découpe les données en « maintenant » + jours (selon le fuseau de la ville).
export function parseForecast(json, tz) {
  const series = json?.properties?.timeseries
  if (!Array.isArray(series) || !series.length) return null
  const local = t => new Date(new Date(t).getTime() + tz * 3600000)
  const dayKey = t => local(t).toISOString().slice(0, 10)
  const now = series[0], d = now.data?.instant?.details || {}
  const nowSym = now.data?.next_1_hours?.summary?.symbol_code || now.data?.next_6_hours?.summary?.symbol_code || ''
  const days = new Map()
  for (const e of series) {
    const k = dayKey(e.time), t = e.data?.instant?.details?.air_temperature
    if (typeof t !== 'number') continue
    const day = days.get(k) || { key: k, min: t, max: t, rain: 0, syms: [], n: 0 }
    day.min = Math.min(day.min, t); day.max = Math.max(day.max, t); day.n++
    const h1 = e.data?.next_1_hours, h6 = e.data?.next_6_hours
    const amount = h1 ? h1.details?.precipitation_amount : h6?.details?.precipitation_amount
    if (typeof amount === 'number') day.rain += amount
    const sym = (h6 || h1)?.summary?.symbol_code
    if (sym) day.syms.push({ h: local(e.time).getUTCHours(), sym })
    days.set(k, day)
  }
  const list = [...days.values()].slice(0, 6).map(d => {
    // Symbole du milieu de journée ; en cas d'orage ou de pluie dans la journée, on retient le plus marqué.
    const mid = d.syms.filter(s => s.h >= 9 && s.h <= 18)
    const best = (mid.length ? mid : d.syms).reduce((a, s) => (!a || SEV[describe(s.sym).icon] > SEV[describe(a.sym).icon] ? s : a), null)
    return { key: d.key, min: Math.round(d.min), max: Math.round(d.max), rain: Math.round(d.rain * 10) / 10, ...describe(best?.sym), partial: d.n < 4 }
  })
  return { temp: typeof d.air_temperature === 'number' ? Math.round(d.air_temperature) : null, humidity: d.relative_humidity ?? null,
    wind: typeof d.wind_speed === 'number' ? Math.round(d.wind_speed * 3.6) : null, ...describe(nowSym), days: list }
}
export async function getWeather(city) {
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${city.lat.toFixed(4)}&lon=${city.lon.toFixed(4)}`
    const res = await fetch(url, { headers: { 'User-Agent': `TolobanaInfo/1.0 (+${SITE_URL})`, Accept: 'application/json' }, next: { revalidate: 1800 } })
    if (!res.ok) return null
    return parseForecast(await res.json(), city.tz)
  } catch { return null }
}
export const dayName = (key, i) => i === 0 ? 'Aujourd’hui' : i === 1 ? 'Demain' : new Date(key + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' })
