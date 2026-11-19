import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { getAllRates, fmt } from '@/lib/rates'
import Converter from '../components/Converter'
import '../components/phase12.css'
import '../components/phase30.css'
export const metadata = { title: 'Taux de change : franc congolais (CDF) face aux devises', description: 'Le dollar, l’euro et une vingtaine de devises en francs congolais, avec convertisseur.', alternates: { canonical: '/taux' } }
export default async function Taux() {
  const r = await getAllRates(await getSettings(supabaseServer()))
  const usd = r?.list.find(x => x.code === 'USD'), eur = r?.list.find(x => x.code === 'EUR')
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Taux de change</h1></div>
    {!r || !usd ? <p className="empty">Le taux n’est pas disponible pour le moment.</p> : (<>
      <section className="rate-big"><div><span>1 USD</span><strong>{fmt(usd.cdf)} CDF</strong></div>{eur && <div><span>1 EUR</span><strong>{fmt(eur.cdf)} CDF</strong></div>}</section>
      <p className="meta">{r.source === 'officiel' ? `Taux officiel publié par la rédaction${r.date ? ` (${r.date})` : ''}.` : `Taux indicatif${r.date ? ` du ${r.date}` : ''}, calculé automatiquement : il peut différer du taux officiel de la Banque Centrale du Congo et des taux pratiqués par les bureaux de change.`}</p>
      <h2 className="wx-h">Convertisseur</h2>
      <Converter rates={{ CDF: 1, ...Object.fromEntries(r.list.map(x => [x.code, x.cdf])) }} />
      <h2 className="wx-h">Toutes les devises</h2>
      <table className="rt"><thead><tr><th>Devise</th><th>1 unité en CDF</th></tr></thead><tbody>{r.list.map(x => <tr key={x.code}><td><b>{x.code}</b>{x.name}</td><td>{fmt(x.cdf)}</td></tr>)}</tbody></table>
      {r.source === 'indicatif' && <p className="meta"><a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">Rates By Exchange Rate API</a></p>}</>)}
  </main>)
}
