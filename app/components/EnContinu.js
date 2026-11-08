import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { groupByDay, hm } from '@/lib/feed'
import './phase11.css'
// Fil des dernières publications, jour par jour. `compact` : version de l'accueil.
export default async function EnContinu({ limit = 12, compact = true }) {
  const { data } = await supabaseServer().from('articles').select('title,slug,published_at,categories(name)')
    .eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(limit)
  const groups = groupByDay(data)
  if (!groups.length) return null
  return (
    <section className="encontinu" aria-label="En continu">
      <div className="ec-head"><h2><span className="live-dot" aria-hidden="true" />En continu</h2>{compact && <Link href="/en-continu">Voir tout le fil</Link>}</div>
      {groups.map(g => (
        <div key={g.key} className="ec-day"><h3>{g.label}</h3>
          <ol>{g.items.map(a => (
            <li key={a.slug}><time dateTime={a.published_at}>{hm(a.published_at)}</time>
              <Link href={`/article/${a.slug}`}>{a.categories?.name && <span className="ec-cat">{a.categories.name}</span>}{a.title}</Link></li>))}</ol>
        </div>))}
    </section>)
}
