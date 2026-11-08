import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { saverOn } from '@/lib/saver'
import { SITE_URL } from '@/lib/site'
import { fmtKin } from '@/lib/dates'
import LiveFeed from '../../components/LiveFeed'
import ShareBar from '../../components/ShareBar'
import '../../components/phase10.css'
export const dynamic = 'force-dynamic'
async function load(slug) {
  const sb = supabaseServer()
  const { data: live } = await sb.from('lives').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
  if (!live) return {}
  const { data: entries } = await sb.from('live_entries').select('id,body,image_url,important,created_at').eq('live_id', live.id).order('created_at', { ascending: false }).limit(150)
  return { live, entries: entries || [] }
}
export async function generateMetadata({ params }) {
  const { live } = await load(params.slug)
  return live ? { title: `En direct : ${live.title}`, description: live.summary || live.title, alternates: { canonical: `/direct/${live.slug}` },
    openGraph: { title: live.title, description: live.summary || live.title, type: 'article', url: `/direct/${live.slug}` } } : {}
}
export default async function LivePage({ params }) {
  const { live, entries } = await load(params.slug)
  if (!live) notFound()
  const url = `${SITE_URL}/direct/${live.slug}`
  const ld = { '@context': 'https://schema.org', '@type': 'LiveBlogPosting', headline: live.title, description: live.summary || undefined, url,
    coverageStartTime: live.created_at, ...(live.ended_at ? { coverageEndTime: live.ended_at } : {}), datePublished: live.created_at,
    dateModified: entries[0]?.created_at || live.created_at, inLanguage: 'fr',
    liveBlogUpdate: entries.slice(0, 20).map(e => ({ '@type': 'BlogPosting', headline: e.body.slice(0, 110), datePublished: e.created_at, articleBody: e.body })) }
  return (
    <main className="wrap"><article className="full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <div className="live-head">
        <span className={`live-state${live.status === 'live' ? '' : ' end'}`}>{live.status === 'live' ? <><span className="live-dot" aria-hidden="true" />En direct</> : 'Direct terminé'}</span>
        <h1>{live.title}</h1>
        {live.summary && <p className="deck">{live.summary}</p>}
        <p className="meta">Commencé le {fmtKin(live.created_at)}{live.ended_at ? ` · terminé le ${fmtKin(live.ended_at)}` : ''}</p>
      </div>
      <ShareBar url={url} title={live.title} />
      <LiveFeed slug={live.slug} initial={entries} initialStatus={live.status} saver={saverOn()} />
    </article></main>)
}
