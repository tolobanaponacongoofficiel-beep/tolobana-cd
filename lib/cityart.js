import { isMediaUrl } from './blocks'
// Photos des villes choisies par la rédaction (réglage « city_photos » = JSON { slug: url }). Seules les images de la médiathèque sont acceptées.
export function cityPhotos(settings) {
  try { const o = JSON.parse(settings?.city_photos || '{}'); return Object.fromEntries(Object.entries(o).filter(([, u]) => isMediaUrl(u))) } catch { return {} }
}
const SKY = { sun: ['#2f8cff', '#cfe9ff'], partly: ['#5a9bd0', '#dbe8f4'], cloud: ['#7f93a8', '#cdd6de'], rain: ['#4d5f73', '#9aa9b8'], thunder: ['#26313f', '#68778a'] }
const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0 }
// Illustration de secours (sans photo) : ciel selon la météo + silhouette de ville propre à chaque ville. Retourne une URL « data: » SVG.
export function cityArt(slug, icon = 'sun') {
  const [a, b] = SKY[icon] || SKY.sun
  let h = hash(slug), r = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296)
  let x = 0, bld = '', win = ''
  while (x < 800) {
    const w = 28 + Math.floor(r() * 44), hh = 50 + Math.floor(r() * 150), y = 300 - hh
    bld += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#0b2239" opacity="${0.78 + r() * 0.22}"/>`
    if (r() > 0.55) bld += `<rect x="${x + w / 2 - 1}" y="${y - 26}" width="2" height="26" fill="#0b2239"/>`
    for (let wy = y + 12; wy < 290; wy += 18) for (let wx = x + 7; wx < x + w - 8; wx += 12) if (r() > 0.62) win += `<rect x="${wx}" y="${wy}" width="5" height="7" fill="#ffd45a" opacity=".85"/>`
    x += w + Math.floor(r() * 6)
  }
  const sun = icon === 'sun' || icon === 'partly' ? `<circle cx="${560 + Math.floor(r() * 140)}" cy="${70 + Math.floor(r() * 40)}" r="34" fill="#fff6c9" opacity=".95"/>` : ''
  const clouds = icon !== 'sun' ? `<g fill="#fff" opacity="${icon === 'thunder' ? 0.35 : 0.7}"><ellipse cx="180" cy="80" rx="80" ry="22"/><ellipse cx="260" cy="95" rx="60" ry="18"/><ellipse cx="560" cy="60" rx="90" ry="24"/></g>` : ''
  const rain = icon === 'rain' || icon === 'thunder' ? '<g stroke="#dfe9f3" stroke-width="1.5" opacity=".5">' + Array.from({ length: 40 }, () => { const rx = Math.floor(r() * 800), ry = Math.floor(r() * 260); return `<line x1="${rx}" y1="${ry}" x2="${rx - 6}" y2="${ry + 16}"/>` }).join('') + '</g>' : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="300" fill="url(#g)"/>${sun}${clouds}${rain}${bld}${win}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
export const cityBg = (slug, icon, photos) => {
  const src = photos?.[slug] || cityArt(slug, icon)
  return { backgroundImage: `linear-gradient(180deg,rgba(6,20,36,.15),rgba(6,20,36,.72)),url("${src}")` }
}
