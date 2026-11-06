import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { KINDS } from '@/lib/tv'
import YouTubePlayer from '../components/YouTubePlayer'
import VideoCard from '../components/VideoCard'
import '../components/tv.css'

export const metadata = { title: 'Tolobana TV', description: 'Journaux, interviews, reportages, émissions et directs de Tolobana Info.', alternates: { canonical: '/tv' } }
const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })

export default async function TV({ searchParams }) {
  const sb = supabaseServer(), now = new Date().toISOString()
  const type = KINDS[searchParams?.type] ? searchParams.type : null
  const cols = 'id,title,slug,kind,youtube_id,description,published_at,is_live'
  const { data: live } = await sb.from('videos').select(cols).eq('is_published', true).eq('is_live', true).lte('published_at', now).order('published_at', { ascending: false }).limit(1)
  let q = sb.from('videos').select(cols).eq('is_published', true).lte('published_at', now).order('published_at', { ascending: false }).limit(48)
  if (type) q = q.eq('kind', type)
  const { data: vids } = await q
  const featured = live?.[0] || vids?.[0] || null
  const others = (vids || []).filter(v => v.id !== featured?.id)
  return (
    <main className="wrap">
      <div className="tv-head"><h1>Tolobana TV</h1>{live?.[0] && <span className="live-badge">EN DIRECT</span>}</div>
      <nav className="chips" aria-label="Types de vidéos">
        <Link href="/tv" aria-current={!type}>Tout</Link>
        {Object.entries(KINDS).map(([k, l]) => <Link key={k} href={`/tv?type=${k}`} aria-current={type === k}>{l}</Link>)}
      </nav>
      {!featured && <p className="empty">Aucune vidéo pour le moment.</p>}
      {featured && <section className="tv-feature">
        <YouTubePlayer id={featured.youtube_id} title={featured.title} />
        <div className="tv-info">
          {featured.is_live ? <span className="live-badge">EN DIRECT</span> : <span className="tag">{KINDS[featured.kind]}</span>}
          <h2>{featured.title}</h2><span className="meta">{fmt(featured.published_at)}</span>
          {featured.description && <p>{featured.description.slice(0, 280)}{featured.description.length > 280 ? '…' : ''}</p>}
          <p><Link href={`/tv/${featured.slug}`} className="btn sm">Page de la vidéo</Link></p>
        </div>
      </section>}
      {others.length > 0 && <><div className="sec-head"><h2 className="sec">{type ? KINDS[type] : 'Dernières vidéos'}</h2></div>
        <div className="vgrid">{others.map(v => <VideoCard key={v.id} v={v} />)}</div></>}
    </main>)
}
