import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getPlayer } from '@/lib/teams'
import { GROUP_LABEL, canLink } from '@/lib/sport'
import { saverOn } from '@/lib/saver'
import Crest from '../../../components/Crest'
import { SportHero } from '../../../components/SportHero'
import '../../../components/phase13.css'
import '../../../components/phase15.css'
export const revalidate = 300
export async function generateMetadata({ params }) {
  const p = await getPlayer(supabaseServer(), params.id)
  return p ? { title: `${p.name} : fiche joueur`, description: `${p.name}${p.team ? `, ${p.team.name}` : ''} : poste, âge, nationalité et statistiques.`, alternates: { canonical: `/sport/joueur/${params.id}` } } : { title: 'Joueur' }
}
const fr = d => new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export default async function Player({ params }) {
  const p = await getPlayer(supabaseServer(), params.id); if (!p) notFound()
  const saver = saverOn()
  const pos = p.group ? GROUP_LABEL[p.group]?.replace(/s$/, '') : p.position
  const facts = [['Poste', pos], ['Numéro', p.num], ['Âge', p.age != null ? `${p.age} ans` : null], ['Naissance', p.born ? fr(String(p.born).slice(0, 10)) : null], ['Nationalité', p.nationality]].filter(([, v]) => v)
  const ld = { '@context': 'https://schema.org', '@type': 'Person', name: p.name, ...(p.nationality ? { nationality: p.nationality } : {}), ...(p.born ? { birthDate: String(p.born).slice(0, 10) } : {}), jobTitle: 'Footballeur', ...(p.team ? { affiliation: { '@type': 'SportsTeam', name: p.team.name } } : {}) }
  return (<main className="wrap sport-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <SportHero crumb={p.team && canLink(p.team.id) ? <Link href={`/sport/equipe/${p.team.id}`}>← {p.team.name}</Link> : <Link href="/sport">← Sport</Link>} title={p.name} sub={[pos, p.team?.name].filter(Boolean).join(' · ') || undefined} />
    <section className="tm-head">
      {p.photo && !saver ? <img className="pl-photo" src={p.photo} alt={p.name} /> : <span className="pl-photo ini" aria-hidden="true">{p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span>}
      <dl className="tm-facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        {p.team && <div><dt>Club</dt><dd>{canLink(p.team.id) ? <Link href={`/sport/equipe/${p.team.id}`}>{p.team.name}</Link> : p.team.name}</dd></div>}</dl></section>
    {p.stats && <section className="sp-panel"><h2>Statistiques enregistrées sur Tolobana</h2>
      <div className="st-grid"><div><b>{p.stats.goals}</b><span>Buts</span></div><div><b>{p.stats.yellow}</b><span>Cartons jaunes</span></div><div><b>{p.stats.red}</b><span>Cartons rouges</span></div><div><b>{p.stats.subs}</b><span>Entrées en jeu</span></div></div></section>}
    {p.bio && <section className="sp-panel"><h2>Parcours</h2>{p.bio.split('\n').filter(Boolean).map((x, i) => <p key={i}>{x}</p>)}</section>}
  </main>)
}
