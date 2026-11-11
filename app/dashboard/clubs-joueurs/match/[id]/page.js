import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { getMatch } from '@/lib/sport'
import { getDetails } from '@/lib/clubs'
import EventsEditor from '../../../../components/EventsEditor'
import { saveMatchDetails } from '../actions'
import '../../../../components/phase20.css'
export const metadata = { title: 'Détails du match' }
export default async function MatchEditor({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const m = await getMatch(sb, params.id)
  if (!m) notFound()
  const det = await getDetails(sb, params.id, m)
  const lines = (side, starter) => det.lineups.filter(l => l.side === side && l.is_starter === starter)
    .map(l => `${l.shirt_number != null ? `${l.shirt_number} ` : ''}${l.name}${l.is_captain ? ' (C)' : ''}`).join('\n')
  const events = det.events.map(e => ({ minute: e.minute ?? '', extra: e.extra || '', type: e.type, side: e.side, player: e.player_name, other: e.other_name || '' }))
  const hid = { match_ref: String(params.id), home: m.home, away: m.away, hc: m.hc || '', ac: m.ac || '', kickoff: m.kickoff ? String(m.kickoff) : '', hs: m.hs ?? '', as: m.as ?? '', status: m.status || '', competition: m.competition || '' }
  return (<>
    <div className="dash-head"><h1>{m.home} - {m.away}</h1><p className="meta"><Link href={`/sport/match/${params.id}`}>← Voir le match</Link> · <Link href="/dashboard/clubs-joueurs">Clubs et joueurs</Link></p></div>
    {searchParams?.err && <p className="err" role="alert">Enregistrement impossible : la base est-elle à jour (supabase/phase20.sql) ?</p>}
    <section className="panel"><h2>Comment saisir</h2>
      <ul className="meta"><li><b>Compositions</b> : une ligne par joueur, « numéro nom ». Ajoutez (C) pour le capitaine. Exemple : <i>10 Meschack Elia (C)</i>. Un nom de famille suffit si le joueur est déjà dans l’effectif.</li>
        <li><b>Événements</b> : buts, cartons, remplacements avec la minute. Pour un remplacement, indiquez le joueur qui sort puis celui qui entre.</li>
        <li>Les clubs et les joueurs absents sont créés automatiquement.</li></ul></section>
    <form action={saveMatchDetails} className="f" style={{ maxWidth: 'none' }}>
      {Object.entries(hid).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="mini-grid">
        {[['home', m.home], ['away', m.away]].map(([side, name]) => (
          <section key={side} className="panel"><h2>{name}</h2>
            <label>Système de jeu<input name={`${side}_formation`} maxLength={12} defaultValue={side === 'home' ? det.meta?.home_formation || '' : det.meta?.away_formation || ''} placeholder="4-3-3" /></label>
            <label>Titulaires (11)<textarea name={`${side}_starters`} rows={11} defaultValue={lines(side, true)} /></label>
            <label>Remplaçants<textarea name={`${side}_bench`} rows={7} defaultValue={lines(side, false)} /></label></section>))}</div>
      <section className="panel"><h2>Événements du match</h2><EventsEditor initial={events} home={m.home} away={m.away} /></section>
      <div><button className="btn">Enregistrer et voir le match</button></div>
    </form></>)
}
