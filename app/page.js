import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
const Img = ({ a }) => a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} /> : <div className="ph" />
const Tag = ({ a }) => <span className="tag">{a.categories?.name}{a.is_demo ? ' · DÉMO' : ''}</span>
const By = ({ a }) => <span className="meta">{a.profiles?.name ? `Par ${a.profiles.name} · ` : ''}{fmt(a.published_at)}</span>
export default async function Home({ searchParams }) {
  const sb = supabaseServer()
  let query = sb.from('articles').select('title,slug,summary,image_url,published_at,is_demo,categories(name,slug),profiles(name)')
    .eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(40)
  if (searchParams?.rubrique) {
    const { data: c } = await sb.from('categories').select('id').eq('slug', searchParams.rubrique).single()
    if (c) query = query.eq('category_id', c.id)
  }
  const { data } = await query
  const [hero, ...rest] = data || []
  const side = rest.slice(0, 3), more = rest.slice(3)
  return (
    <main className="wrap">
      {!hero && <p className="sans" style={{ margin: '24px 0' }}>Aucun article publié dans cette rubrique pour le moment.</p>}
      {hero && <section className="hero">
        <Link href={`/article/${hero.slug}`} className="hero-main"><Img a={hero} />
          <div className="hero-text"><Tag a={hero} /><h1>{hero.title}</h1><p>{hero.summary}</p><By a={hero} /></div></Link>
        <div className="hero-side">{side.map(a => (
          <Link key={a.slug} href={`/article/${a.slug}`} className="side-item"><Img a={a} />
            <div><Tag a={a} /><h3>{a.title}</h3><By a={a} /></div></Link>))}</div>
      </section>}
      {more.length > 0 && <><h2 className="sec">Dernières publications</h2>
        <div className="grid">{more.map(a => (
          <Link key={a.slug} href={`/article/${a.slug}`} className="card"><Img a={a} />
            <div className="in"><Tag a={a} /><h3>{a.title}</h3><By a={a} /></div></Link>))}</div></>}
    </main>)
}
