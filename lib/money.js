// Montants saisis librement par la rédaction (« 50 USD », « 150 000 FC », « 1.200,50 € ») : lecture tolérante pour les totaux.
export function parseAmount(note) {
  const s = String(note ?? '')
  const m = s.match(/(\d[\d\s\u00a0.,]*\d|\d)/)
  if (!m) return null
  let n = m[1].replace(/[\s\u00a0]/g, '')
  const lastDot = n.lastIndexOf('.'), lastCom = n.lastIndexOf(',')
  if (lastDot >= 0 && lastCom >= 0) { const dec = Math.max(lastDot, lastCom); n = n.slice(0, dec).replace(/[.,]/g, '') + '.' + n.slice(dec + 1) }
  else if (lastDot >= 0 || lastCom >= 0) { const i = Math.max(lastDot, lastCom), tail = n.length - i - 1; n = tail === 3 ? n.replace(/[.,]/g, '') : n.slice(0, i).replace(/[.,]/g, '') + '.' + n.slice(i + 1) }
  const value = Number(n)
  if (!isFinite(value) || value <= 0 || value > 1e10) return null
  const low = s.toLowerCase()
  const cur = /€|eur/.test(low) ? 'EUR' : /\bfc\b|cdf|franc/.test(low) ? 'CDF' : 'USD'
  return { value, cur }
}
export const CURS = { USD: '$', CDF: 'FC', EUR: '€' }
export const money = (v, cur) => `${Number(v).toLocaleString('fr-FR', { maximumFractionDigits: cur === 'CDF' ? 0 : 2 })} ${CURS[cur] || cur}`
export function sumBy(items) { const t = {}; for (const i of items) { const a = parseAmount(i); if (a) t[a.cur] = (t[a.cur] || 0) + a.value } return t }
