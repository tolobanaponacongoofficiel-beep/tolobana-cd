import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
export const revalidate = 60
const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
export default async function Home({ searchParams }) {
  const sb = supabaseServer()
  let query = sb.from('articles').select('title,subtitle,slug,summary,published_at,is_breaking,is_demo,categories(name,slug)')
    .eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(30)
  if (searchParams?.rubrique) {
    const { data: c } = await sb.from('categories').select('id').eq('slug', searchParams.rubrique).single()
    if (c) query = query.eq('category_id', c.id)
  }
  const { data: articles } = await query
  const breaking = (articles || []).find(a => a.is_breaking)
  return (<>
    {breaking && <div className="breaking"><div className="wrap">DERNIÈRE MINUTE : <Link href={`/article/${breaking.slug}`}>{breaking.title}</Link></div></div>}
    <main className="wrap">
      <p className="meta" style={{ marginTop: 16 }}>{fmt(new Date())}</p>
      {(articles || []).length === 0 && <p className="sans">Aucun article publié pour le moment. Connectez-vous pour en rédiger un.</p>}
      <div className="grid">{(articles || []).map(a => (
        <Link key={a.slug} href={`/article/${a.slug}`} className="card">
          <span className="tag">{a.categories?.name}{a.is_demo ? ' · DÉMO' : ''}</span>
          <h3>{a.title}</h3><p>{a.summary}</p><span className="meta">{fmt(a.published_at)}</span>
        </Link>))}
      </div>
    </main></>)
}
