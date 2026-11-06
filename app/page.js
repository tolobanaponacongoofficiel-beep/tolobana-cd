import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
const SEL = 'title,slug,summary,image_url,published_at,is_demo,categories(name,slug),profiles(name)'
const SECTIONS = [
  { title: 'Politique congolaise', slugs: ['politique'] },
  { title: 'Économie et finances', slugs: ['economie', 'finance-et-budget'] },
  { title: 'Société et justice', slugs: ['societe', 'justice', 'securite-et-defense'] },
  { title: 'Actualités des provinces', slugs: ['provinces'] },
  { title: 'Afrique et international', slugs: ['afrique', 'international', 'diplomatie'] },
  { title: 'Sport', slugs: ['sport', 'football'] },
  { title: 'Culture et musique', slugs: ['culture', 'musique'] },
]
const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
const Img = ({ a }) => a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} /> : <div className="ph">TOLOBANA INFO</div>
const Tag = ({ a }) => <span className="tag">{a.categories?.name}{a.is_demo ? ' · DÉMO' : ''}</span>
const By = ({ a }) => <span className="meta">{a.profiles?.name ? `Par ${a.profiles.name} · ` : ''}{fmt(a.published_at)}</span>
const Card = ({ a }) => (
  <Link href={`/article/${a.slug}`} className="card"><Img a={a} /><div className="in"><Tag a={a} /><h3>{a.title}</h3><By a={a} /></div></Link>)
function idsFor(cats, slugs) {
  const byId = Object.fromEntries(cats.map(c => [c.id, c]))
  return cats.filter(c => slugs.includes(c.slug) || slugs.includes(byId[c.parent_id]?.slug)).map(c => c.id)
}
export default async function Home({ searchParams }) {
  const sb = supabaseServer()
  const now = new Date().toISOString()
  const pub = () => sb.from('articles').select(SEL).eq('status', 'published').lte('published_at', now).order('published_at', { ascending: false })
  const { data: cats } = await sb.from('categories').select('id,name,slug,parent_id')
  const rub = searchParams?.rubrique

  if (rub) {
    const cat = cats.find(c => c.slug === rub)
    const ids = idsFor(cats, [rub])
    const kids = cats.filter(c => c.parent_id === cat?.id)
    const { data } = ids.length ? await pub().in('category_id', ids).limit(40) : { data: [] }
    return (<main className="wrap">
      <h2 className="sec">{cat?.name || 'Rubrique'}</h2>
      {kids.length > 0 && <div className="chips">{kids.map(k => <Link key={k.id} href={`/?rubrique=${k.slug}`}>{k.name}</Link>)}</div>}
      <div className="grid" style={{ paddingTop: 8 }}>{(data || []).map(a => <Card key={a.slug} a={a} />)}</div>
      {!data?.length && <p className="sans">Aucun article dans cette rubrique pour le moment.</p>}
    </main>)
  }

  const [{ data: latest }, { data: most }] = await Promise.all([
    pub().limit(8),
    sb.from('articles').select('title,slug,views').eq('status', 'published').lte('published_at', now).order('views', { ascending: false }).limit(5),
  ])
  const [hero, ...rest] = latest || []
  const side = rest.slice(0, 3), recent = rest.slice(3, 7)
  const used = new Set([hero, ...side].filter(Boolean).map(a => a.slug))
  const sections = (await Promise.all(SECTIONS.map(async s => {
    const ids = idsFor(cats, s.slugs)
    if (!ids.length) return null
    const { data } = await pub().in('category_id', ids).limit(8)
    const items = (data || []).filter(a => !used.has(a.slug)).slice(0, 4)
    return items.length ? { ...s, items } : null
  }))).filter(Boolean)
  return (
    <main className="wrap">
      {!hero && <p className="sans" style={{ margin: '24px 0' }}>Aucun article publié pour le moment.</p>}
      {hero && <section className="hero">
        <Link href={`/article/${hero.slug}`} className="hero-main"><Img a={hero} />
          <div className="hero-text"><Tag a={hero} /><h1>{hero.title}</h1><p>{hero.summary}</p><By a={hero} /></div></Link>
        <div className="hero-side">{side.map(a => (
          <Link key={a.slug} href={`/article/${a.slug}`} className="side-item"><Img a={a} />
            <div><Tag a={a} /><h3>{a.title}</h3><By a={a} /></div></Link>))}</div>
      </section>}
      <div className="cols">
        <div>
          {recent.length > 0 && <><div className="sec-head"><h2 className="sec">Dernières publications</h2></div>
            <div className="grid4">{recent.map(a => <Card key={a.slug} a={a} />)}</div></>}
          {sections.map(s => (<section key={s.title}>
            <div className="sec-head"><h2 className="sec">{s.title}</h2><Link href={`/?rubrique=${s.slugs[0]}`}>Voir tout →</Link></div>
            <div className="grid4">{s.items.map(a => <Card key={a.slug} a={a} />)}</div></section>))}
        </div>
        <aside>{most?.length > 0 && <div className="most"><h2>Les plus lus</h2>
          <ol>{most.map(a => <li key={a.slug}><Link href={`/article/${a.slug}`}>{a.title}<br /><span className="meta">{a.views} lecture{a.views > 1 ? 's' : ''}</span></Link></li>)}</ol></div>}</aside>
      </div>
    </main>)
}
