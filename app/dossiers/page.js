import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import '../components/phase9.css'
export const metadata = { title: 'Dossiers', description: 'Les grands sujets de l’actualité, article par article.', alternates: { canonical: '/dossiers' } }
export default async function Dossiers() {
  const { data } = await supabaseServer().from('dossiers').select('slug,title,description,cover_url').eq('is_published', true).order('created_at', { ascending: false })
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Dossiers</h1></div>
    <div className="dgrid" style={{ paddingTop: 8 }}>{(data || []).map(d => (
      <Link key={d.slug} href={`/dossiers/${d.slug}`} className="dcard">
        {d.cover_url ? <img src={d.cover_url} alt="" loading="lazy" /> : <div className="ph">Tolobana Info</div>}
        <div className="in"><span className="tag">Dossier</span><h3>{d.title}</h3>{d.description && <p className="meta">{d.description.slice(0, 140)}</p>}</div></Link>))}</div>
    {!data?.length && <p className="empty">Aucun dossier pour le moment.</p>}
  </main>)
}
