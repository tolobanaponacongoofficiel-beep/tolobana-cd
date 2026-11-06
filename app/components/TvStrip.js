import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import VideoCard from './VideoCard'
import './tv.css'
// Bandeau « Tolobana TV » de l'accueil : le direct en premier, puis les dernières vidéos.
export default async function TvStrip() {
  const { data } = await supabaseServer().from('videos').select('id,title,slug,kind,youtube_id,published_at,is_live')
    .eq('is_published', true).lte('published_at', new Date().toISOString())
    .order('is_live', { ascending: false }).order('published_at', { ascending: false }).limit(4)
  if (!data?.length) return null
  return (
    <section className="tv-strip" aria-label="Tolobana TV">
      <div className="sec-head"><h2 className="sec">Tolobana TV</h2><Link href="/tv">Toutes les vidéos</Link></div>
      <div className="vgrid">{data.map(v => <VideoCard key={v.id} v={v} />)}</div>
    </section>)
}
