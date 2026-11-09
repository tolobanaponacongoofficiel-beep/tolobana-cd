import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { CATS, dayKey, dayTitle, monthTitle, hm, startOfTodayISO } from '@/lib/agenda'
import '../components/phase14.css'
export const metadata = { title: 'Agenda : événements à Kinshasa et en RDC', description: 'Concerts, conférences, matchs, cérémonies et rendez-vous à venir en République démocratique du Congo.', alternates: { canonical: '/agenda' } }
export const revalidate = 300
export default async function Agenda({ searchParams }) {
  const cat = Object.keys(CATS).includes(searchParams?.c) ? searchParams.c : null
  let q = supabaseServer().from('events').select('id,title,category,venue,city,starts_at,ends_at,image_url').eq('is_published', true).gte('starts_at', startOfTodayISO()).order('starts_at', { ascending: true }).limit(150)
  if (cat) q = q.eq('category', cat)
  const { data } = await q
  const events = data || []
  const months = []
  for (const e of events) { const m = monthTitle(e.starts_at); let g = months.find(x => x.m === m); if (!g) months.push(g = { m, days: [] }); const k = dayKey(e.starts_at); let d = g.days.find(x => x.k === k); if (!d) g.days.push(d = { k, t: dayTitle(e.starts_at), list: [] }); d.list.push(e) }
  return (<main className="wrap" style={{ maxWidth: 900 }}>
    <div className="sec-head"><h1 className="sec">Agenda</h1></div>
    <nav className="ag-cats" aria-label="Catégories">
      <Link href="/agenda" className={!cat ? 'on' : ''}>Tout</Link>
      {Object.entries(CATS).map(([k, v]) => <Link key={k} href={`/agenda?c=${k}`} className={cat === k ? 'on' : ''}>{v}</Link>)}
    </nav>
    {months.map(g => (<section key={g.m}><h2 className="ag-month">{g.m}</h2>
      {g.days.map(d => (<div key={d.k} className="ag-day"><h3>{d.t}</h3>
        <ul className="ag-list">{d.list.map(e => (<li key={e.id}><Link href={`/agenda/${e.id}`}>
          <span className="ag-time">{hm(e.starts_at)}</span>
          <span className="ag-main"><b>{e.title}</b><small>{[e.venue, e.city].filter(Boolean).join(' · ')}</small></span>
          <span className="chip">{CATS[e.category] || 'Autre'}</span></Link></li>))}</ul></div>))}</section>))}
    {!events.length && <p className="empty">Aucun événement à venir pour le moment.</p>}
    <p className="meta">Un événement à signaler ? <Link href="/contact">Écrivez-nous</Link> ou <Link href="/services/deposer?type=communique">publiez un communiqué</Link>.</p>
  </main>)
}
