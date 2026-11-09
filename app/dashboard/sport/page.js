import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { fmtKin } from '@/lib/dates'
import { createMatch, updateMatch, deleteMatch } from './actions'
export const metadata = { title: 'Sport' }
const COMPS = ['Linafoot', 'Léopards (équipe nationale)', 'Ligue des champions CAF', 'Coupe de la Confédération CAF', 'Éliminatoires Coupe du monde', 'Coupe d’Afrique des nations', 'Championnat provincial']
export default async function SportDash({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: list, error } = await sb.from('matches').select('*').order('kickoff', { ascending: false }).limit(60)
  return (<>
    <div className="dash-head"><h1>Sport</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase12.sql puis supabase/phase13.sql.</p>}
    {searchParams?.err === '3' ? <p className="err" role="alert">Enregistrement impossible : exécutez supabase/phase13.sql dans Supabase.</p> : searchParams?.err && <p className="err" role="alert">Compétition, équipes et date du coup d’envoi sont obligatoires.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    {process.env.FOOTBALL_DATA_TOKEN ? <p className="meta">Les grands championnats s’ajoutent automatiquement, avec classements et buteurs. Ici, vous saisissez le football congolais et africain, avec les buteurs (un par ligne, par exemple « Mputu 12' »).</p> : <p className="meta">Saisissez ici les matchs et résultats. Pour ajouter automatiquement les grands championnats européens, voir LISEZMOI-phase12 (variable FOOTBALL_DATA_TOKEN).</p>}
    <section className="panel"><h2>Ajouter un match</h2>
      <form className="f" action={createMatch}>
        <label>Compétition<input name="competition" list="comps" required maxLength={80} /><datalist id="comps">{COMPS.map(c => <option key={c} value={c} />)}</datalist></label>
        <label>Équipe à domicile<input name="home" required maxLength={60} /></label>
        <label>Équipe visiteuse<input name="away" required maxLength={60} /></label>
        <label>Coup d’envoi (heure de Kinshasa)<input type="datetime-local" name="kickoff" required /></label>
        <label>Stade (facultatif)<input name="venue" maxLength={120} /></label>
        <div><button className="btn">Ajouter</button></div></form></section>
    <section className="panel"><h2>Matchs ({list?.length || 0})</h2>
      {(list || []).map(m => (<div key={m.id} style={{ borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
        <div><span className="chip">{m.competition}</span> <b>{m.home} - {m.away}</b> <span className="meta">· {fmtKin(m.kickoff, { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
        <form action={updateMatch} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}><input type="hidden" name="id" value={m.id} />
          <input name="hs" inputMode="numeric" defaultValue={m.home_score ?? ''} style={{ width: 56 }} aria-label={`Buts ${m.home}`} /> - <input name="as" inputMode="numeric" defaultValue={m.away_score ?? ''} style={{ width: 56 }} aria-label={`Buts ${m.away}`} />
          <select name="status" defaultValue={m.status} style={{ width: 150 }}><option value="scheduled">À venir</option><option value="live">En direct</option><option value="finished">Terminé</option></select>
          <input name="venue" defaultValue={m.venue ?? ''} placeholder="Stade" maxLength={120} style={{ width: 180 }} aria-label="Stade" />
          <textarea name="home_scorers" defaultValue={m.home_scorers ?? ''} rows={2} placeholder={`Buteurs ${m.home} (un par ligne, ex. Mputu 12')`} style={{ flex: '1 1 220px' }} aria-label={`Buteurs ${m.home}`} />
          <textarea name="away_scorers" defaultValue={m.away_scorers ?? ''} rows={2} placeholder={`Buteurs ${m.away} (un par ligne)`} style={{ flex: '1 1 220px' }} aria-label={`Buteurs ${m.away}`} />
          <button className="btn sm">Mettre à jour</button> <a className="btn ghost sm" href={`/sport/match/${m.id}`} target="_blank" rel="noopener noreferrer">Voir la page</a></form>
        <form action={deleteMatch}><input type="hidden" name="id" value={m.id} /><ConfirmButton message="Supprimer ce match ?">Supprimer</ConfirmButton></form></div>))}
      {!list?.length && <p className="meta">Aucun match pour le moment.</p>}</section></>)
}
