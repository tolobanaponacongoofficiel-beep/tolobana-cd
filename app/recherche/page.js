import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
export const metadata = { title: 'Recherche' }
export default async function Search({ searchParams }) {
  const q = String(searchParams?.q || '').replace(/[,()%*\\_"]/g, ' ').trim().slice(0, 80)
  let items = []
  if (q.length >= 2) {
    const t = `"%${q}%"`
    const { data } = await supabaseServer().from('articles').select('title,slug,summary,image_url,published_at,categories(name)')
      .eq('status', 'published').lte('published_at', new Date().toISOString())
      .or(`title.ilike.${t},subtitle.ilike.${t},summary.ilike.${t},body.ilike.${t}`).order('published_at', { ascending: false }).limit(40)
    items = data || []
  }
  return (<main className="wrap">
    <h2 className="sec">Recherche{q ? ` : ${q}` : ''}</h2>
    {q.length < 2 && <p className="sans">Saisissez au moins 2 caractères dans la barre de recherche.</p>}
    {q.length >= 2 && <p className="meta">{items.length} résultat{items.length > 1 ? 's' : ''}</p>}
    <div className="grid">{items.map(a => (
      <Link key={a.slug} href={`/article/${a.slug}`} className="card">
        {a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} /> : <div className="ph">TOLOBANA INFO</div>}
        <div className="in"><span className="tag">{a.categories?.name}</span><h3>{a.title}</h3><p className="meta">{a.summary}</p></div></Link>))}</div>
  </main>)
}
