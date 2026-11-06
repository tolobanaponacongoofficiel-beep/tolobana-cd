import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
const fmt = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
const decode = s => { try { return decodeURIComponent(s) } catch { return String(s) } }
export async function generateMetadata({ params }) {
  const tag = decode(params.tag)
  return { title: `#${tag}`, description: `Tous les articles de Tolobana Info sur « ${tag} ».`, alternates: { canonical: `/tag/${encodeURIComponent(tag)}` } }
}
export default async function TagPage({ params }) {
  const tag = decode(params.tag).slice(0, 40)
  const { data } = await supabaseServer().from('articles').select('title,slug,summary,image_url,published_at,categories(name)')
    .eq('status', 'published').lte('published_at', new Date().toISOString()).contains('tags', [tag]).order('published_at', { ascending: false }).limit(40)
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">#{tag}</h1></div>
    <div className="grid">{(data || []).map(a => (
      <Link key={a.slug} href={`/article/${a.slug}`} className="card">
        <div className="media">{a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} /> : <div className="ph">Tolobana Info</div>}</div>
        <div className="in"><span className="tag">{a.categories?.name}</span><h3>{a.title}</h3><span className="meta">{fmt(a.published_at)}</span></div></Link>))}</div>
    {!data?.length && <p className="empty">Aucun article avec ce mot-clé.</p>}
  </main>)
}
