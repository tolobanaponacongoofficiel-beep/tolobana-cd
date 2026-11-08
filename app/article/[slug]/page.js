import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import Avatar from '../../components/Avatar'
import ArticleBody from '../../components/ArticleBody'
import Comments from './Comments'
import ShareBar from '../../components/ShareBar'
import PartnerBanner from '../../components/PartnerBanner'
import ReadingProgress from '../../components/ReadingProgress'
import ListenButton from '../../components/ListenButton'
import AdSlot from '../../components/AdSlot'
import FactBadge from '../../components/FactBadge'
import { saverOn } from '@/lib/saver'
import { getSettings, channelUrl } from '@/lib/settings'
import { FACT, FACT_RATING, isFact } from '@/lib/fact'
import '../../components/phase10.css'
import LazyMedia from '../../components/LazyMedia'
import { SITE_URL } from '@/lib/site'
import '../../components/phase9.css'
import '../../components/extras.css'
import '../../components/phase8.css'

async function load(slug) {
  const { data } = await supabaseServer().from('articles').select('*,categories(name),profiles(name,photo_url),authors(id,name,title,photo_url)').eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).single()
  return data
}
export async function generateMetadata({ params }) {
  const a = await load(params.slug)
  return a ? {
    title: a.title, description: a.summary, keywords: a.tags?.length ? a.tags : undefined, alternates: { canonical: `/article/${a.slug}` },
    openGraph: { title: a.title, description: a.summary, type: 'article', url: `/article/${a.slug}`, siteName: 'Tolobana Info', locale: 'fr_CD',
      publishedTime: a.published_at, modifiedTime: a.last_update_at || a.updated_at, images: [a.image_url || '/logo.png'] },
    twitter: { card: 'summary_large_image', title: a.title, description: a.summary, images: [a.image_url || '/logo.png'] },
  } : {}
}
export default async function ArticlePage({ params }) {
  const a = await load(params.slug)
  if (!a) notFound()
  const sb = supabaseServer()
  const set = await getSettings(sb), org = set.org_name || 'Tolobana Info', channel = channelUrl(set), saver = saverOn()
  await sb.rpc('increment_views', { p_slug: params.slug })
  const nowISO = new Date().toISOString()
  const base = () => sb.from('articles').select('id,title,slug,image_url').eq('status', 'published').lte('published_at', nowISO).neq('id', a.id).order('published_at', { ascending: false })
  let related = []
  if (a.tags?.length) { const { data } = await base().overlaps('tags', a.tags).limit(3); related = data || [] }
  if (related.length < 3) {
    const { data } = await base().eq('category_id', a.category_id).limit(6)
    for (const r of data || []) if (related.length < 3 && !related.some(x => x.id === r.id)) related.push(r)
  }

  const { data: dl } = await sb.from('dossier_articles').select('dossiers(title,slug,is_published)').eq('article_id', a.id)
  const dossiers = (dl || []).map(x => x.dossiers).filter(d => d?.is_published)
  const mins = Math.max(1, Math.round((a.body || '').trim().split(/\s+/).length / 200))
  const h = headers()
  const url = `${h.get('x-forwarded-proto') || 'https'}://${h.get('x-forwarded-host') || h.get('host')}/article/${a.slug}`
  const writer = a.authors
  const name = writer?.name || a.profiles?.name
  const href = `/auteur/${writer?.id || a.author_id}`
  // Anciens articles (phase 3) : pas de blocs, on découpe le texte en paragraphes.
  const blocks = Array.isArray(a.blocks) && a.blocks.length ? a.blocks : String(a.body || '').split(/\n+/).filter(Boolean).map(text => ({ type: 'p', text }))
  const when = new Date(a.published_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'long', timeStyle: 'short' })
  const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, datePublished: a.published_at, dateModified: a.last_update_at || a.updated_at,
    image: [a.image_url || `${SITE_URL}/logo.png`], inLanguage: 'fr', isAccessibleForFree: true, articleSection: a.categories?.name, keywords: a.tags?.join(', ') || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/article/${a.slug}` },
    author: [{ '@type': 'Person', name, url: `${SITE_URL}${href}` }],
    publisher: { '@type': 'NewsMediaOrganization', name: org, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } } }
  const verdict = isFact(a.fact_verdict) ? a.fact_verdict : null
  const claimLd = verdict && a.fact_claim && FACT_RATING[verdict] ? { '@context': 'https://schema.org', '@type': 'ClaimReview', url: `${SITE_URL}/article/${a.slug}`, claimReviewed: a.fact_claim,
    datePublished: a.published_at, author: { '@type': 'Organization', name: org },
    reviewRating: { '@type': 'Rating', ratingValue: FACT_RATING[verdict], bestRating: 5, worstRating: 1, alternateName: FACT[verdict] } } : null
  const waText = encodeURIComponent(`${a.title}\n${url}`)
  return (
    <article className="full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      {claimLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(claimLd).replace(/</g, '\\u003c') }} />}
      <ReadingProgress />
      <PartnerBanner />
      <span className="tag">{a.categories?.name}{a.is_demo ? ' · DÉMO' : ''}</span>
      <h1>{a.title}</h1>
      {a.subtitle && <p className="deck">{a.subtitle}</p>}
      <div className="byline">
        <Avatar name={name} url={writer?.photo_url || a.profiles?.photo_url} />
        <div><Link href={href}>{name}</Link>{writer?.title && <span className="role">{writer.title}</span>}<time dateTime={a.published_at}>{when}</time><span className="role">{mins} min de lecture</span>{a.last_update_at && <span className="role updated">Mis à jour le {new Date(a.last_update_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'long', timeStyle: 'short' })}</span>}</div>
      </div>
      {a.image_url && <figure className="photo">{saver ? <LazyMedia src={a.image_url} alt={a.title} /> : <img src={a.image_url} alt={a.title} />}{a.image_caption && <figcaption>{a.image_caption}</figcaption>}</figure>}
      <ShareBar url={url} title={a.title} />
      <div className="share10"><span className="lead">Cet article vous a servi ? Partagez-le.</span>
        <a className="btn wa" href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer">Envoyer sur WhatsApp</a>
        {channel && <a className="btn wa-line" href={channel} target="_blank" rel="noopener noreferrer">Suivre notre chaîne</a>}</div>
      {verdict && <div className="fact-box"><FactBadge verdict={verdict} />{a.fact_claim && <span className="claim">Affirmation vérifiée : « {a.fact_claim} »</span>}</div>}
      {saver && <p className="saver-note">Mode léger activé : les images et vidéos s’affichent à la demande.</p>}
      <ListenButton text={[a.title, a.subtitle, a.body].filter(Boolean).join('. ').slice(0, 20000)} />
      {dossiers.length > 0 && <div className="dossier-box"><span>Dossier</span>{dossiers.map(d => <Link key={d.slug} href={`/dossiers/${d.slug}`}>{d.title}</Link>)}</div>}
      <ArticleBody blocks={blocks} saver={saver} />
      <AdSlot placement="article" />
      {a.tags?.length > 0 && <div className="chips" aria-label="Mots-clés">{a.tags.map(t => <Link key={t} href={`/tag/${encodeURIComponent(t)}`}>#{t}</Link>)}</div>}
      {related?.length > 0 && <div className="related"><div className="sec-head"><h2 className="sec">À lire aussi</h2></div>
        <div className="grid4">{related.map(r => (<Link key={r.slug} href={`/article/${r.slug}`} className="card">
          <div className="media">{r.image_url && !saver ? <img className="thumb" src={r.image_url} alt={r.title} /> : <div className="ph">Tolobana Info</div>}</div><div className="in"><h3>{r.title}</h3></div></Link>))}</div></div>}
      <Comments articleId={a.id} slug={a.slug} />
    </article>)
}
