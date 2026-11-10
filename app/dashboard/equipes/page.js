import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { createTeam } from './actions'
export const metadata = { title: 'Équipes et joueurs' }
export default async function Equipes({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: list, error } = await sb.from('teams').select('id,name,city,country').order('name', { ascending: true }).limit(300)
  return (<>
    <div className="dash-head"><h1>Équipes et joueurs</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase15.sql.</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez au moins le nom de l’équipe.</p>}
    <p className="meta">Créez ici les clubs et sélections que vous suivez (TP Mazembe, AS Vita Club, Léopards…), puis ajoutez leurs joueurs. Ensuite, dans Sport, rattachez chaque match à ses deux équipes pour saisir buteurs, cartons, remplacements et compositions.</p>
    <section className="panel"><h2>Nouvelle équipe</h2>
      <form className="f" action={createTeam}>
        <label>Nom<input name="name" required maxLength={80} /></label>
        <label>Ville<input name="city" maxLength={80} /></label>
        <label>Pays<input name="country" maxLength={80} defaultValue="RDC" /></label>
        <div><button className="btn">Créer l’équipe</button></div></form></section>
    <section className="panel"><h2>Équipes ({list?.length || 0})</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>{(list || []).map(t => <li key={t.id}><Link href={`/dashboard/equipes/${t.id}`}><b>{t.name}</b></Link> <span className="meta">{[t.city, t.country].filter(Boolean).join(' · ')}</span></li>)}</ul>
      {!list?.length && <p className="meta">Aucune équipe pour le moment.</p>}</section></>)
}
