import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { saverOn } from '@/lib/saver'
import Crest from '../components/Crest'
import '../components/phase20.css'
export const metadata = { title: 'Équipes et clubs', description: 'Fiches des clubs : effectif, résultats et historique.', alternates: { canonical: '/clubs' } }
export default async function Equipes({ searchParams }) {
  const q = String(searchParams?.q || '').replace(/[,()%*\\_"]/g, ' ').trim().slice(0, 60)
  let query = supabaseServer().from('fc_clubs').select('slug,name,country,city,crest_url').eq('is_published', true).order('name').limit(300)
  if (q) query = query.ilike('name', `%${q}%`)
  const { data } = await query
  const saver = saverOn()
  const byCountry = {}
  for (const c of data || []) (byCountry[c.country || 'Autres'] ||= []).push(c)
  return (<main className="wrap fc-page">
    <h1 className="fc-title">Clubs de football</h1><p className="meta">Choisissez un club pour voir son effectif, ses résultats et son histoire. · <Link href="/sport">← Sport</Link></p>
    <form method="get" className="cform" style={{ margin: '12px 0', maxWidth: 420 }}><input name="q" defaultValue={q} placeholder="Rechercher un club" aria-label="Rechercher un club" /></form>
    {Object.entries(byCountry).sort(([a], [b]) => a.localeCompare(b, 'fr')).map(([country, list]) => (
      <section key={country}><h2 className="fc-h">{country}</h2>
        <div className="squad">{list.map(c => (
          <Link key={c.slug} href={`/clubs/${c.slug}`} className="pcard"><Crest src={c.crest_url} name={c.name} size={36} saver={saver} /><span><b>{c.name}</b>{c.city && <small>{c.city}</small>}</span></Link>))}</div></section>))}
    {!data?.length && <p className="empty">Aucun club pour le moment. Les fiches se créent depuis la page d’un match (Saisir les détails) ou dans Espace rédaction, Clubs et joueurs.</p>}
  </main>)
}
