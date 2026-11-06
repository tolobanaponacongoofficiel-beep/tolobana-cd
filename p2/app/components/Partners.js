import { supabaseServer } from '@/lib/supabase/server'
export default async function Partners() {
  const sb = supabaseServer()
  const { data } = await sb.from('partners').select('id,name,logo_url,link_url').eq('is_active', true).order('position').order('id')
  return (
    <section className="partners"><div className="wrap">
      <h2>Nos partenaires</h2>
      {data?.length ? <div className="partner-row">{data.map(p => {
        const inner = p.logo_url ? <img src={p.logo_url} alt={p.name} /> : <span>{p.name}</span>
        return p.link_url
          ? <a key={p.id} href={p.link_url} target="_blank" rel="noopener noreferrer sponsored" className="partner">{inner}</a>
          : <div key={p.id} className="partner">{inner}</div>
      })}</div> : <p className="meta">Votre marque ici : contactez la rédaction pour devenir partenaire de Tolobana Info.</p>}
    </div></section>)
}
