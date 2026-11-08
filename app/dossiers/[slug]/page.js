import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import FollowDossier from '../../components/FollowDossier'
import '../../components/phase9.css'
const load = async slug => (await supabaseServer().from('dossiers').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()).data
export async function generateMetadata({ params }) {
  const d = await load(params.slug)
  return d ? { title: d.title, description: d.description?.slice(0, 200), alternates: { canonical: `/dossiers/${d.slug}` }, openGraph: { title: d.title, description: d.description?.slice(0, 200), images: [d.cover_url || '/logo.png'] } } : {}
}
export default async function Dossier({ params }) {
  const d = await load(params.slug)
  if (!d) notFound()
  const now = Date.now()
  const { data: links } = await supabaseServer().from('dossier_articles').select('articles(title,slug,summary,image_url,status,published_at,categories(name))').eq('dossier_id', d.id)
  const arts = (links || []).map(l => l.articles).filter(a => a && a.status === 'published' && new Date(a.published_at).getTime() <= now)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  return (<main className="wrap">
    <div className={d.cover_url ? 'dcover' : 'dcover plain'}>
      {d.cover_url && <img src={d.cover_url} alt="" />}
      <div className="txt"><span className="tag" style={{ color: 'var(--yellow)' }}>Dossier</span><h1>{d.title}</h1>{d.description && <p>{d.description}</p>}</div>
    </div>
    <p className="meta">{arts.length} article{arts.length > 1 ? 's' : ''} · <Link href="/dossiers" style={{ color: 'var(--blue)' }}>Tous les dossiers</Link></p>
    <FollowDossier dossierId={d.id} title={d.title} />
    <div className="grid">{arts.map(a => (
      <Link key={a.slug} href={`/article/${a.slug}`} className="card">
        <div className="media">{a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} loading="lazy" /> : <div className="ph">Tolobana Info</div>}</div>
        <div className="in"><span className="tag">{a.categories?.name}</span><h3>{a.title}</h3><span className="meta">{new Date(a.published_at).toLocaleDateString('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Kinshasa' })}</span></div></Link>))}</div>
    {!arts.length && <p className="empty">Aucun article publié dans ce dossier pour le moment.</p>}
  </main>)
}
