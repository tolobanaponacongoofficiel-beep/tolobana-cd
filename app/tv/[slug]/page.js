import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { KINDS, thumb } from '@/lib/tv'
import YouTubePlayer from '../../components/YouTubePlayer'
import VideoCard from '../../components/VideoCard'
import ShareBar from '../../components/ShareBar'
import '../../components/tv.css'
import '../../components/extras.css'

async function load(slug) {
  const { data } = await supabaseServer().from('videos').select('*').eq('slug', slug).eq('is_published', true).lte('published_at', new Date().toISOString()).single()
  return data
}
export async function generateMetadata({ params }) {
  const v = await load(params.slug)
  if (!v) return {}
  const description = v.description?.slice(0, 200) || `${KINDS[v.kind]} · Tolobana TV`
  return {
    title: v.title, description, alternates: { canonical: `/tv/${v.slug}` },
    openGraph: { title: v.title, description, type: 'video.other', url: `/tv/${v.slug}`, siteName: 'Tolobana Info', images: [thumb(v.youtube_id)] },
    twitter: { card: 'summary_large_image', title: v.title, description, images: [thumb(v.youtube_id)] },
  }
}
export default async function VideoPage({ params }) {
  const v = await load(params.slug)
  if (!v) notFound()
  const sb = supabaseServer()
  const { data: related } = await sb.from('videos').select('id,title,slug,kind,youtube_id,published_at,is_live').eq('is_published', true).eq('kind', v.kind).neq('id', v.id).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(3)
  const h = headers()
  const url = `${h.get('x-forwarded-proto') || 'https'}://${h.get('x-forwarded-host') || h.get('host')}/tv/${v.slug}`
  const ld = { '@context': 'https://schema.org', '@type': 'VideoObject', name: v.title, description: v.description || v.title, thumbnailUrl: [thumb(v.youtube_id)],
    uploadDate: v.published_at, embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtube_id}`, publisher: { '@type': 'Organization', name: 'Tolobana Info' } }
  return (
    <main className="wrap"><div className="tv-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <p className="meta"><Link href="/tv">← Tolobana TV</Link></p>
      <YouTubePlayer id={v.youtube_id} title={v.title} />
      <div className="tv-info" style={{ marginTop: 14 }}>
        {v.is_live ? <span className="live-badge">EN DIRECT</span> : <span className="tag">{KINDS[v.kind]}</span>}
        <h1 style={{ margin: '.3rem 0' }}>{v.title}</h1>
        <span className="meta">{new Date(v.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })}</span>
        <ShareBar url={url} title={v.title} label="Partager cette vidéo" />
        {v.description && v.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {related?.length > 0 && <><div className="sec-head"><h2 className="sec">À voir aussi</h2></div><div className="vgrid">{related.map(r => <VideoCard key={r.id} v={r} />)}</div></>}
    </div></main>)
}
