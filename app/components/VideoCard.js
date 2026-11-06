import Link from 'next/link'
import { KINDS, thumb } from '@/lib/tv'
const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
export default function VideoCard({ v }) {
  return (
    <Link href={`/tv/${v.slug}`} className="vcard">
      <div className="vthumb"><img src={thumb(v.youtube_id)} alt="" loading="lazy" />
        {v.is_live && <span className="live-badge">EN DIRECT</span>}
        <span className="play"><span>▶</span></span></div>
      <div className="in"><span className="tag">{KINDS[v.kind]}</span><h3>{v.title}</h3><span className="meta">{fmt(v.published_at)}</span></div>
    </Link>)
}
