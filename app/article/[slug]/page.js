import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import Comments from './Comments'
async function load(slug) {
  const { data } = await supabaseServer().from('articles').select('*,categories(name),profiles(name)').eq('slug', slug).eq('status', 'published').single()
  return data
}
export async function generateMetadata({ params }) {
  const a = await load(params.slug)
  return a ? { title: a.title, description: a.summary, openGraph: { title: a.title, description: a.summary, type: 'article', images: a.image_url ? [a.image_url] : [] } } : {}
}
export default async function ArticlePage({ params }) {
  const a = await load(params.slug)
  if (!a) notFound()
  const sb = supabaseServer()
  await sb.rpc('increment_views', { p_slug: params.slug })
  const { data: related } = await sb.from('articles').select('title,slug,image_url').eq('status', 'published').eq('category_id', a.category_id).neq('id', a.id).order('published_at', { ascending: false }).limit(3)
  const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, datePublished: a.published_at, dateModified: a.updated_at,
    image: a.image_url ? [a.image_url] : undefined, author: [{ '@type': 'Person', name: a.profiles?.name }], publisher: { '@type': 'Organization', name: 'Tolobana Info' } }
  return (
    <article className="full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <span className="tag">{a.categories?.name}{a.is_demo ? ' · DÉMO' : ''}</span>
      <h1>{a.title}</h1>{a.subtitle && <h2 style={{ fontWeight: 400 }}>{a.subtitle}</h2>}
      <div className="byline"><span>Par <Link href={`/auteur/${a.author_id}`}>{a.profiles?.name}</Link></span>
        <span>· {new Date(a.published_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' })}</span></div>
      {a.image_url && <figure className="photo"><img src={a.image_url} alt={a.title} />{a.image_caption && <figcaption>{a.image_caption}</figcaption>}</figure>}
      {a.body.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
      {related?.length > 0 && <div className="related"><h2 className="sec">À lire aussi</h2>
        <div className="grid4">{related.map(r => (<Link key={r.slug} href={`/article/${r.slug}`} className="card">
          {r.image_url ? <img className="thumb" src={r.image_url} alt={r.title} /> : <div className="ph">TOLOBANA INFO</div>}<div className="in"><h3 style={{ fontSize: '.95rem' }}>{r.title}</h3></div></Link>))}</div></div>}
      <Comments articleId={a.id} slug={a.slug} />
    </article>)
}
