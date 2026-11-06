import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
export default async function Auteur({ params }) {
  const sb = supabaseServer()
  const { data: p } = await sb.from('profiles').select('id,name,bio').eq('id', params.id).single()
  if (!p) notFound()
  const { data: arts } = await sb.from('articles').select('title,slug,published_at,image_url,categories(name)').eq('author_id', p.id).eq('status', 'published').order('published_at', { ascending: false })
  return (
    <main className="wrap">
      <div className="panel"><h1 style={{ margin: 0 }}>{p.name}</h1><p className="sans">{p.bio || 'Journaliste à Tolobana Info.'}</p></div>
      <h2 className="sec">Ses articles</h2>
      <div className="grid">{(arts || []).map(a => (
        <Link key={a.slug} href={`/article/${a.slug}`} className="card">
          {a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} /> : <div className="ph" />}
          <div className="in"><span className="tag">{a.categories?.name}</span><h3>{a.title}</h3></div></Link>))}</div>
      {!arts?.length && <p className="sans">Aucun article publié.</p>}
    </main>)
}
