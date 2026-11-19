import Link from 'next/link'
import { getAllRates, fmt } from '@/lib/rates'
import './phase30.css'
// Bandeau très fin des taux de change : une vingtaine de devises en défilement continu (pause au survol).
export default async function RatesBar({ settings }) {
  let r = null
  try { r = await getAllRates(settings) } catch {}
  if (!r?.list?.length) return null
  const row = hid => (<ul className="rb-row" aria-hidden={hid || undefined}>{r.list.map(x => <li key={x.code}><b>{x.code}/CDF</b> <span>{fmt(x.cdf)}</span></li>)}</ul>)
  return (<div className="rb" role="region" aria-label="Taux de change en francs congolais">
    <div className="rb-scroll"><div className="rb-track">{row(false)}{row(true)}</div></div>
    <Link href="/taux" className="rb-all">Tous les taux <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></Link>
  </div>)
}
