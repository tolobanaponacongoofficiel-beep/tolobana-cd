import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { initials } from '@/lib/blocks'

// /auteur/<id> sert les rédacteurs ajoutés depuis l'espace rédaction ET les comptes de l'équipe (phase 3).
export default async function Auteur({ params }) {
  const sb = supabaseServer()
  const { data: w } = await sb.from('authors').select('id,name,title,bio,photo_url').eq('id', params.id).maybeSingle()
  let p = w, arts
  const cols = 'title,slug,published_at,image_url,categories(name)'
  if (w) {
    ;({ data: arts } = await sb.from('articles').select(cols).eq('writer_id', w.id).eq('status', 'published').order('published_at', { ascending: false }))
  } else {
    const { data } = await sb.from('profiles').select('id,name,bio').eq('id', params.id).maybeSingle()
    if (!data) notFound()
    p = data
    ;({ data: arts } = await sb.from('articles').select(cols).eq('author_id', p.id).is('writer_id', null).eq('status', 'published').order('published_at', { ascending: false }))
  }
  return (
    <main className="wrap">
      <div className="author-head">
        {p.photo_url ? <img className="avatar xl" src={p.photo_url} alt="" /> : <span className="avatar xl">{initials(p.name)}</span>}
        <div><h1>{p.name}</h1>{p.title && <p className="role">{p.title}</p>}<p className="bio">{p.bio || 'Rédaction de Tolobana Info.'}</p></div>
      </div>
      <div className="sec-head"><h2 className="sec">Ses articles ({arts?.length || 0})</h2></div>
      <div className="grid">{(arts || []).map(a => (
        <Link key={a.slug} href={`/article/${a.slug}`} className="card">
          <div className="media">{a.image_url ? <img className="thumb" src={a.image_url} alt={a.title} /> : <div className="ph">Tolobana Info</div>}</div>
          <div className="in"><span className="tag">{a.categories?.name}</span><h3>{a.title}</h3></div></Link>))}</div>
      {!arts?.length && <p className="empty">Aucun article publié pour le moment.</p>}
    </main>)
}
