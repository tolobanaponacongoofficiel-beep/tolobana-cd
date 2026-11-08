import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { FACT, isFact } from '@/lib/fact'
import FactBadge from '../components/FactBadge'
import { fmtKin } from '@/lib/dates'
import '../components/phase10.css'
export const metadata = { title: 'Vérification des faits', description: 'Rumeurs, informations virales et déclarations passées au crible par la rédaction.', alternates: { canonical: '/verification' } }
export default async function Verification({ searchParams }) {
  const v = isFact(searchParams?.v) ? searchParams.v : null
  let q = supabaseServer().from('articles').select('title,slug,summary,published_at,fact_verdict,fact_claim').eq('status', 'published').lte('published_at', new Date().toISOString()).not('fact_verdict', 'is', null).order('published_at', { ascending: false }).limit(40)
  if (v) q = q.eq('fact_verdict', v)
  const { data } = await q
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Vérification des faits</h1></div>
    <p className="meta">Nous examinons les rumeurs et les affirmations qui circulent, puis nous donnons notre verdict, avec les sources.</p>
    <div className="chips"><Link href="/verification">Tous</Link>{Object.entries(FACT).map(([k, l]) => <Link key={k} href={`/verification?v=${k}`}>{l}</Link>)}</div>
    <div className="grid" style={{ gap: 14, paddingTop: 8 }}>
      {(data || []).map(a => (<Link key={a.slug} href={`/article/${a.slug}`} className="vcard"><FactBadge verdict={a.fact_verdict} />
        {a.fact_claim && <p className="meta" style={{ margin: '8px 0 0' }}>Affirmation : « {a.fact_claim} »</p>}
        <h3 style={{ margin: '6px 0' }}>{a.title}</h3><span className="meta">{fmtKin(a.published_at, { dateStyle: 'long' })}</span></Link>))}</div>
    {!data?.length && <p className="empty">Aucune vérification publiée pour le moment.</p>}
  </main>)
}
