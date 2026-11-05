import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
async function load(slug) {
  const sb = supabaseServer()
  const { data } = await sb.from('articles').select('*,categories(name),profiles(name)').eq('slug', slug).eq('status', 'published').single()
  return data
}
export async function generateMetadata({ params }) {
  const a = await load(params.slug)
  return a ? { title: a.title, description: a.summary, openGraph: { title: a.title, description: a.summary, type: 'article' } } : {}
}
export default async function ArticlePage({ params }) {
  const a = await load(params.slug)
  if (!a) notFound()
  const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, datePublished: a.published_at, dateModified: a.updated_at,
    author: [{ '@type': 'Person', name: a.profiles?.name }], publisher: { '@type': 'Organization', name: 'Tolobana Info' } }
  return (
    <article className="full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <span className="tag">{a.categories?.name}{a.is_demo ? ' · DÉMO' : ''}</span>
      <h1>{a.title}</h1>{a.subtitle && <h2 style={{ fontWeight: 400 }}>{a.subtitle}</h2>}
      <p className="meta">Par {a.profiles?.name} · {new Date(a.published_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' })}</p>
      {a.body.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
    </article>)
}
