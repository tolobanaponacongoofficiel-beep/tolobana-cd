import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { fmtKin } from '@/lib/dates'
export const metadata = { title: 'En direct', description: 'Suivez l’actualité minute par minute.', alternates: { canonical: '/direct' } }
export default async function DirectList() {
  const { data } = await supabaseServer().from('lives').select('title,slug,summary,status,created_at').eq('is_published', true).order('created_at', { ascending: false }).limit(40)
  const lives = data || []
  const now = lives.filter(l => l.status === 'live'), past = lives.filter(l => l.status !== 'live')
  const Item = ({ l }) => (<Link href={`/direct/${l.slug}`} className="vcard"><span className={`live-state${l.status === 'live' ? '' : ' end'}`}>{l.status === 'live' ? <><span className="live-dot" aria-hidden="true" />En direct</> : 'Terminé'}</span>
    <h3 style={{ margin: '6px 0' }}>{l.title}</h3>{l.summary && <p className="meta">{l.summary}</p>}<span className="meta">{fmtKin(l.created_at, { dateStyle: 'long' })}</span></Link>)
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">En direct</h1></div>
    {!lives.length && <p className="empty">Aucun direct pour le moment.</p>}
    <div className="grid" style={{ gap: 14 }}>{now.map(l => <Item key={l.slug} l={l} />)}</div>
    {past.length > 0 && <><div className="sec-head"><h2 className="sec">Directs précédents</h2></div><div className="grid" style={{ gap: 14 }}>{past.map(l => <Item key={l.slug} l={l} />)}</div></>}
  </main>)
}
