import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { TYPES, isType } from '@/lib/services'
import { fmtKin } from '@/lib/dates'
import '../../components/phase12.css'
export async function generateMetadata({ params }) { return isType(params.type) ? { title: TYPES[params.type].plural, description: TYPES[params.type].desc, alternates: { canonical: `/services/${params.type}` } } : {} }
export default async function ServiceList({ params }) {
  if (!isType(params.type)) notFound()
  const T = TYPES[params.type], now = new Date().toISOString()
  const { data } = await supabaseServer().from('service_posts').select('id,title,org,location,deadline,published_at,body').eq('type', params.type).eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${now}`).order('published_at', { ascending: false }).limit(60)
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">{T.plural}</h1></div>
    <p className="meta"><Link href="/services">Tous les services</Link> · <Link href="/services/deposer">Publier</Link></p>
    <div className="svc-list">{(data || []).map(p => (<Link key={p.id} href={`/services/${params.type}/${p.id}`} className={`svc-item ${params.type}`}>
      <span className="svc-tag">{T.label}</span><h3>{p.title}</h3>
      <p>{[p.org, p.location].filter(Boolean).join(' · ')}{p.deadline ? ` · date limite ${fmtKin(`${p.deadline}T12:00:00+01:00`, { dateStyle: 'long' })}` : ''}</p>
      <p>{p.body.slice(0, 140)}{p.body.length > 140 ? '…' : ''}</p></Link>))}</div>
    {!data?.length && <p className="empty">Aucune publication en ce moment.</p>}
  </main>)
}
