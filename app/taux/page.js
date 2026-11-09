import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { getRates, fmt } from '@/lib/rates'
import Converter from '../components/Converter'
import '../components/phase12.css'
export const metadata = { title: 'Taux de change CDF, USD, EUR', description: 'Le taux du dollar et de l’euro en francs congolais, avec convertisseur.', alternates: { canonical: '/taux' } }
export default async function Taux() {
  const r = await getRates(await getSettings(supabaseServer()))
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Taux de change</h1></div>
    {!r ? <p className="empty">Le taux n’est pas disponible pour le moment.</p> : (<>
      <section className="rate-big"><div><span>1 USD</span><strong>{fmt(r.usd)} CDF</strong></div>{r.eur && <div><span>1 EUR</span><strong>{fmt(r.eur)} CDF</strong></div>}</section>
      <p className="meta">{r.source === 'officiel' ? `Taux officiel publié par la rédaction${r.date ? ` (${r.date})` : ''}.` : `Taux indicatif${r.date ? ` du ${r.date}` : ''}, calculé automatiquement : il peut différer du taux officiel de la Banque Centrale du Congo et des taux pratiqués par les bureaux de change.`}</p>
      <h2 className="wx-h">Convertisseur</h2>
      <Converter rates={{ CDF: 1, USD: r.usd, ...(r.eur ? { EUR: r.eur } : {}) }} />
      {r.source === 'indicatif' && <p className="meta"><a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">Rates By Exchange Rate API</a></p>}</>)}
  </main>)
}
