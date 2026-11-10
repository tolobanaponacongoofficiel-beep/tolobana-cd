import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import ConfirmButton from '../../../components/ConfirmButton'
import { saveDetails, addEvent, deleteEvent } from './actions'
export const metadata = { title: 'Détails du match' }
const KIND = { goal: 'But', penalty: 'But sur penalty', own_goal: 'But contre son camp', yellow: 'Carton jaune', red: 'Carton rouge', sub: 'Remplacement' }
export default async function MatchDash({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  if (!isUuid(params.id)) notFound()
  const { data: m } = await sb.from('matches').select('*').eq('id', params.id).maybeSingle()
  if (!m) notFound()
  const [{ data: teams }, { data: evs }, { data: pls }] = await Promise.all([
    sb.from('teams').select('id,name').order('name', { ascending: true }).limit(300),
    sb.from('match_events').select('*').eq('match_id', m.id).order('minute', { ascending: true }).order('extra', { ascending: true }).limit(150),
    sb.from('players').select('name,team_id').in('team_id', [m.home_team_id, m.away_team_id].filter(Boolean)).limit(120)])
  const Opts = () => <><option value="">Aucune (nom libre)</option>{(teams || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</>
  return (<>
    <div className="dash-head"><h1>{m.home} - {m.away}</h1><Link className="btn ghost sm" href={`/sport/match/${m.id}`} target="_blank">Voir la page publique</Link></div>
    <p className="meta"><Link href="/dashboard/sport">← Tous les matchs</Link> · {m.competition}</p>
    {searchParams?.err === '1' && <p className="err" role="alert">Indiquez le type, le côté, la minute (0 à 130) et le nom du joueur.</p>}
    {searchParams?.err === '2' && <p className="err" role="alert">Enregistrement impossible : exécutez supabase/phase15.sql dans Supabase.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Équipes et compositions</h2>
      <p className="meta">Rattacher les équipes rend leurs noms cliquables sur la page du match. Compositions : un joueur par ligne, avec son numéro devant (ex. « 10 Mputu »). Les noms identiques à ceux de l’effectif deviennent des liens.</p>
      <form className="f" action={saveDetails}><input type="hidden" name="id" value={m.id} />
        <label>Équipe à domicile ({m.home})<select name="home_team_id" defaultValue={m.home_team_id ?? ''}><Opts /></select></label>
        <label>Équipe visiteuse ({m.away})<select name="away_team_id" defaultValue={m.away_team_id ?? ''}><Opts /></select></label>
        <label>Titulaires {m.home}<textarea name="home_lineup" rows={6} maxLength={900} defaultValue={m.home_lineup ?? ''} /></label>
        <label>Remplaçants {m.home}<textarea name="home_bench" rows={3} maxLength={600} defaultValue={m.home_bench ?? ''} /></label>
        <label>Titulaires {m.away}<textarea name="away_lineup" rows={6} maxLength={900} defaultValue={m.away_lineup ?? ''} /></label>
        <label>Remplaçants {m.away}<textarea name="away_bench" rows={3} maxLength={600} defaultValue={m.away_bench ?? ''} /></label>
        <div><button className="btn">Enregistrer</button></div></form></section>
    <section className="panel"><h2>Ajouter un événement</h2>
      <form className="f" action={addEvent}><input type="hidden" name="id" value={m.id} />
        <label>Type<select name="kind" defaultValue="goal">{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Équipe<select name="side" defaultValue="home"><option value="home">{m.home}</option><option value="away">{m.away}</option></select></label>
        <label>Minute<input name="minute" inputMode="numeric" required /></label>
        <label>Temps additionnel (ex. 2 pour 45+2, facultatif)<input name="extra" inputMode="numeric" /></label>
        <label>Joueur (pour un remplacement : celui qui entre)<input name="player_name" list="plnames" required maxLength={100} /></label>
        <datalist id="plnames">{(pls || []).map((p, i) => <option key={i} value={p.name} />)}</datalist>
        <label>Autre joueur (passeur pour un but ; joueur qui sort pour un remplacement)<input name="other_name" list="plnames" maxLength={100} /></label>
        <div><button className="btn">Ajouter</button></div></form></section>
    <section className="panel"><h2>Chronologie ({evs?.length || 0})</h2>
      {(evs || []).map(e => (<div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
        <b>{e.minute}{e.extra ? `+${e.extra}` : ''}'</b><span className="chip">{KIND[e.kind]}</span><span>{e.player_name}{e.other_name ? ` (${e.other_name})` : ''}</span><span className="meta">{e.side === 'home' ? m.home : m.away}</span>
        <form action={deleteEvent}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="match_id" value={m.id} /><ConfirmButton message="Supprimer cet événement ?">Supprimer</ConfirmButton></form></div>))}
      {!evs?.length && <p className="meta">Aucun événement. Tant qu’il n’y en a pas, les buteurs saisis dans la liste des matchs (ancienne méthode) restent affichés.</p>}</section></>)
}
