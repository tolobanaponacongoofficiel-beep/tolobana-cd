import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { getRates, fmt } from '@/lib/rates'
import './phase12.css'
export default async function RateWidget() {
  const r = await getRates(await getSettings(supabaseServer()))
  if (!r) return null
  return (
    <Link href="/taux" className="rate-mini" aria-label="Taux de change">
      <b>Taux de change</b>
      <span>1 USD = <strong>{fmt(r.usd)} CDF</strong></span>
      {r.eur && <span>1 EUR = <strong>{fmt(r.eur)} CDF</strong></span>}
      <span className="wx-sub">{r.source === 'officiel' ? `Taux officiel${r.date ? ` · ${r.date}` : ''}` : 'Taux indicatif'}</span>
    </Link>)
}
