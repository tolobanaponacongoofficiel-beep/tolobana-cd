// Taux de change : taux officiel saisi par la rédaction (réglages) sinon taux indicatif automatique (open.er-api.com, mention de la source requise).
const num = v => { const n = Number(String(v || '').replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : null }
export async function getRates(settings) {
  const usd = num(settings?.rate_usd_cdf), eur = num(settings?.rate_eur_cdf)
  if (usd) return { usd, eur: eur || null, source: 'officiel', date: settings.rate_date || '' }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const j = await res.json()
    const cdf = j?.rates?.CDF, e = j?.rates?.EUR
    if (!(cdf > 0)) return null
    return { usd: Math.round(cdf * 100) / 100, eur: e > 0 ? Math.round((cdf / e) * 100) / 100 : null, source: 'indicatif',
      date: j.time_last_update_utc ? new Date(j.time_last_update_utc).toLocaleDateString('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Kinshasa' }) : '' }
  } catch { return null }
}
export const fmt = n => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n)

// Phase 30 : une vingtaine de devises face au franc congolais (CDF), pour le bandeau et la page Taux.
export const CURRENCIES = [['USD', 'Dollar américain'], ['EUR', 'Euro'], ['GBP', 'Livre sterling'], ['CAD', 'Dollar canadien'], ['CHF', 'Franc suisse'], ['CNY', 'Yuan chinois'], ['JPY', 'Yen japonais'], ['AED', 'Dirham des Émirats'], ['INR', 'Roupie indienne'], ['TRY', 'Livre turque'], ['ZAR', 'Rand sud-africain'], ['XAF', 'Franc CFA (CEMAC)'], ['XOF', 'Franc CFA (UEMOA)'], ['AOA', 'Kwanza angolais'], ['RWF', 'Franc rwandais'], ['UGX', 'Shilling ougandais'], ['KES', 'Shilling kényan'], ['TZS', 'Shilling tanzanien'], ['BIF', 'Franc burundais'], ['ZMW', 'Kwacha zambien'], ['MAD', 'Dirham marocain'], ['EGP', 'Livre égyptienne'], ['NGN', 'Naira nigérian'], ['GHS', 'Cedi ghanéen'], ['BRL', 'Réal brésilien']]
// Retourne { list: [{ code, name, cdf }], source, date } ; le dollar (et l'euro) officiels saisis par la rédaction priment, les autres devises sont alignées dessus.
export async function getAllRates(settings) {
  const usdOff = num(settings?.rate_usd_cdf), eurOff = num(settings?.rate_eur_cdf)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 1800 } })
    if (!res.ok) throw new Error('http')
    const j = await res.json(), R = j?.rates || {}
    if (!(R.CDF > 0)) throw new Error('cdf')
    const k = usdOff ? usdOff / R.CDF : 1
    const list = CURRENCIES.filter(([c]) => c === 'USD' || R[c] > 0).map(([code, name]) => {
      let cdf = code === 'USD' ? R.CDF * k : (R.CDF / R[code]) * k
      if (code === 'EUR' && eurOff) cdf = eurOff
      return { code, name, cdf: Math.round(cdf * 100) / 100 }
    })
    const date = j.time_last_update_utc ? new Date(j.time_last_update_utc).toLocaleDateString('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Kinshasa' }) : ''
    return { list, source: usdOff ? 'officiel' : 'indicatif', date: usdOff && settings.rate_date ? settings.rate_date : date }
  } catch {
    const b = await getRates(settings)
    if (!b) return null
    return { list: [{ code: 'USD', name: 'Dollar américain', cdf: b.usd }, ...(b.eur ? [{ code: 'EUR', name: 'Euro', cdf: b.eur }] : [])], source: b.source, date: b.date }
  }
}
