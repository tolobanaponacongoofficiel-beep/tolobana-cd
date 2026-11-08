import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { groupByDay, hm } from '@/lib/feed'
import '../components/phase11.css'
export const metadata = { title: 'En continu', description: 'Toutes les publications, jour après jour.', alternates: { canonical: '/en-continu' } }
const PER = 40
export default async function Fil({ searchParams }) {
  const page = Math.max(1, Math.min(200, parseInt(searchParams?.page, 10) || 1))
  const { data } = await supabaseServer().from('articles').select('title,slug,published_at,categories(name)')
    .eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).range((page - 1) * PER, page * PER)
  const rows = data || [], more = rows.length > PER, groups = groupByDay(rows.slice(0, PER))
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">En continu</h1></div>
    <section className="encontinu full">
      {groups.map(g => (<div key={g.key} className="ec-day"><h3>{g.label}</h3>
        <ol>{g.items.map(a => (<li key={a.slug}><time dateTime={a.published_at}>{hm(a.published_at)}</time>
          <Link href={`/article/${a.slug}`}>{a.categories?.name && <span className="ec-cat">{a.categories.name}</span>}{a.title}</Link></li>))}</ol></div>))}
      {!groups.length && <p className="empty">Aucune publication pour le moment.</p>}
    </section>
    <nav className="pager" aria-label="Pages">
      {page > 1 && <Link className="btn gray sm" href={`/en-continu?page=${page - 1}`}>← Plus récent</Link>}
      {more && <Link className="btn sm" href={`/en-continu?page=${page + 1}`}>Plus ancien →</Link>}
    </nav></main>)
}
