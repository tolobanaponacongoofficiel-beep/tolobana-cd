import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { parseAmount, money, sumBy } from '@/lib/money'
import { fmtKin } from '@/lib/dates'
import '../../components/phase14.css'
export const metadata = { title: 'Revenus' }
const PERIODS = { '30': '30 jours', '90': '3 mois', '365': '12 mois', all: 'Tout' }
const TYPE = { deces: 'Avis de décès', communique: 'Communiqués', emploi: 'Emplois', appel: 'Appels d’offres', annonce: 'Petites annonces' }
const monthKey = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Africa/Kinshasa' }).slice(0, 7)
const monthName = k => new Date(`${k}-15T12:00:00Z`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const Totals = ({ t }) => { const e = Object.entries(t); return e.length ? e.map(([c, v]) => money(v, c)).join(' + ') : '0' }
export default async function Revenus({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const p = Object.keys(PERIODS).includes(searchParams?.p) ? searchParams.p : '90'
  const since = p === 'all' ? '1970-01-01T00:00:00Z' : new Date(Date.now() - Number(p) * 86400000).toISOString()
  const [{ data: svc, error: e1 }, { data: ads, error: e2 }] = await Promise.all([
    sb.from('service_posts').select('id,type,title,amount_note,published_at').eq('is_paid', true).gte('published_at', since).order('published_at', { ascending: false }).limit(2000),
    sb.from('ads').select('id,title,advertiser,amount_note,starts_at,impressions,clicks,is_active').gte('starts_at', since).order('starts_at', { ascending: false }).limit(500)])
  const services = (svc || []).map(s => ({ ...s, a: parseAmount(s.amount_note) })), adv = (ads || []).map(a => ({ ...a, a: parseAmount(a.amount_note) }))
  const tSvc = sumBy(services.map(s => s.amount_note)), tAds = sumBy(adv.map(a => a.amount_note))
  const all = {}; for (const t of [tSvc, tAds]) for (const [c, v] of Object.entries(t)) all[c] = (all[c] || 0) + v
  const months = {}
  for (const s of services) if (s.a) { const k = monthKey(s.published_at), o = (months[k] = months[k] || { svc: {}, ads: {} }); o.svc[s.a.cur] = (o.svc[s.a.cur] || 0) + s.a.value }
  for (const a of adv) if (a.a) { const k = monthKey(a.starts_at), o = (months[k] = months[k] || { svc: {}, ads: {} }); o.ads[a.a.cur] = (o.ads[a.a.cur] || 0) + a.a.value }
  const byType = {}; for (const s of services) { const o = (byType[s.type] = byType[s.type] || { n: 0, t: {} }); o.n++; if (s.a) o.t[s.a.cur] = (o.t[s.a.cur] || 0) + s.a.value }
  const unread = services.filter(s => !s.a).length + adv.filter(a => !a.a && a.amount_note).length
  return (<>
    <div className="dash-head"><h1>Revenus</h1><a className="btn ghost sm" href={`/dashboard/revenus/export?p=${p}`}>Exporter en CSV</a></div>
    {(e1 || e2) && <p className="err" role="alert">Base non à jour : exécutez supabase/phase14.sql.</p>}
    <nav className="ag-cats" aria-label="Période">{Object.entries(PERIODS).map(([k, v]) => <Link key={k} href={`/dashboard/revenus?p=${k}`} className={p === k ? 'on' : ''}>{v}</Link>)}</nav>
    <div className="rev-cards">
      <div><span>Total</span><b><Totals t={all} /></b></div>
      <div><span>Services payés ({services.length})</span><b><Totals t={tSvc} /></b></div>
      <div><span>Publicités ({adv.length})</span><b><Totals t={tAds} /></b></div></div>
    <p className="meta">Les montants sont lus dans le texte saisi (« 50 USD », « 150 000 FC », « 20 € »). Sans devise, le dollar est supposé. Les devises ne sont jamais converties entre elles. {unread > 0 && `${unread} ligne(s) sans montant lisible ne sont pas comptées.`}</p>
    <section className="panel"><h2>Par mois</h2>
      {Object.keys(months).sort().reverse().map(k => (<div key={k} className="rev-row"><b style={{ textTransform: 'capitalize' }}>{monthName(k)}</b><span>Services : <Totals t={months[k].svc} /></span><span>Publicités : <Totals t={months[k].ads} /></span></div>))}
      {!Object.keys(months).length && <p className="meta">Aucun montant enregistré sur cette période. Renseignez le montant lors de la publication d’un service payé ou d’une publicité.</p>}</section>
    <section className="panel"><h2>Services payés par type</h2>
      {Object.entries(byType).map(([t, o]) => <div key={t} className="rev-row"><b>{TYPE[t] || t}</b><span>{o.n} publication{o.n > 1 ? 's' : ''}</span><span><Totals t={o.t} /></span></div>)}
      {!services.length && <p className="meta">Aucun service payé sur cette période.</p>}</section>
    <section className="panel"><h2>Performance des publicités</h2>
      <div className="tablewrap"><table className="rev-table"><thead><tr><th className="l">Annonce</th><th>Affichages</th><th>Clics</th><th>Taux de clic</th><th>Montant</th></tr></thead>
        <tbody>{adv.map(a => <tr key={a.id}><td className="l"><b>{a.title}</b><small>{a.advertiser || '·'} · depuis le {fmtKin(a.starts_at, { dateStyle: 'medium' })}</small></td><td>{a.impressions}</td><td>{a.clicks}</td><td>{a.impressions ? (a.clicks / a.impressions * 100).toFixed(1) : '0.0'} %</td><td>{a.a ? money(a.a.value, a.a.cur) : '·'}</td></tr>)}</tbody></table></div>
      {!adv.length && <p className="meta">Aucune publicité sur cette période.</p>}
      <p className="meta">Les affichages et clics incluent des visites de robots : prenez-les comme un ordre de grandeur.</p></section></>)
}
