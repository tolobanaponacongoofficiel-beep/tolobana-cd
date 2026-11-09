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
