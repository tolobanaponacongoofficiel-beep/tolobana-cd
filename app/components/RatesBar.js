import Link from 'next/link'
import { getRates, fmt } from '@/lib/rates'
// Bandeau des taux de change au-dessus de l'en-tête (USD/CDF, EUR/CDF) + lien vers la page complète.
export default async function RatesBar({ settings }) {
  let r = null
  try { r = await getRates(settings) } catch {}
  if (!r) return null
  return (<div className="rb"><div className="wrap rb-in">
    <span className="rb-chip"><b>USD/CDF</b> {fmt(r.usd)}</span>
    {r.eur && <span className="rb-chip"><b>EUR/CDF</b> {fmt(r.eur)}</span>}
    <Link href="/taux" className="rb-all">Voir tous les indicateurs <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></Link>
  </div></div>)
}
