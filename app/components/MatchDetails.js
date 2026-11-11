import Link from 'next/link'
import { norm } from '@/lib/clubs'
import TeamLink from './TeamLink'
import './phase20.css'

const minOf = e => (e.minute != null ? `${e.minute}${e.extra ? `+${e.extra}` : ''}'` : '·')
const keyOf = (id, name) => id || norm(name)
const Who = ({ id, name }) => id ? <Link href={`/joueurs/${id}`} className="tl">{name}</Link> : <>{name}</>

export default function MatchDetails({ det, m }) {
  const { lineups, events, meta, homeClub, awayClub } = det
  if (!lineups.length && !events.length) return null
  const mk = {}
  const at = k => (mk[k] ||= { goals: 0, own: 0, y: 0, r: 0, off: null, on: null })
  for (const e of events) {
    const p = at(keyOf(e.player_id, e.player_name))
    if (e.type === 'goal' || e.type === 'penalty') p.goals++
    else if (e.type === 'own_goal') p.own++
    else if (e.type === 'yellow') p.y++
    else if (e.type === 'second_yellow') { p.y++; p.r++ }
    else if (e.type === 'red') p.r++
    else if (e.type === 'sub') { p.off = minOf(e); if (e.other_name) at(keyOf(e.other_id, e.other_name)).on = minOf(e) }
  }
  const marks = l => { const p = mk[keyOf(l.player_id, l.name)]; if (!p) return null
    return <span className="md-mk">{'⚽'.repeat(Math.min(p.goals, 4))}{p.own > 0 && ' c.s.c.'}{p.y > 0 && <i className="md-card y" title="Carton jaune" />}{p.r > 0 && <i className="md-card r" title="Carton rouge" />}{p.off && <span className="md-out"> ↓ {p.off}</span>}{p.on && <span className="md-in"> ↑ {p.on}</span>}</span> }
  const teamName = s => (s === 'home' ? m.home : m.away)
  const text = e => {
    const P = <Who id={e.player_id} name={e.player_name} />, O = e.other_name ? <Who id={e.other_id} name={e.other_name} /> : null
    switch (e.type) {
      case 'goal': return <>But de {P}{O && <small>Passe décisive : {O}</small>}</>
      case 'penalty': return <>But sur penalty de {P}</>
      case 'own_goal': return <>But contre son camp de {P}</>
      case 'yellow': return <>Carton jaune : {P}</>
      case 'second_yellow': return <>Deuxième jaune, puis rouge : {P}</>
      case 'red': return <>Carton rouge : {P}</>
      default: return <><span className="md-out">↓ {P}</span> sort{O && <><br /><span className="md-in">↑ {O}</span> entre</>}</>
    }
  }
  const icon = e => e.type === 'yellow' ? <i className="md-card y" /> : e.type === 'red' ? <i className="md-card r" /> : e.type === 'second_yellow' ? <i className="md-card yr" /> : e.type === 'sub' ? '🔁' : '⚽'
  const side = (s, club, formation) => {
    const rows = lineups.filter(l => l.side === s)
    const starters = rows.filter(l => l.is_starter), bench = rows.filter(l => !l.is_starter)
    const li = l => <li key={l.id}><span className="md-num">{l.shirt_number ?? '·'}</span><span><Who id={l.player_id} name={l.name} />{l.is_captain && ' (C)'}</span>{marks(l)}</li>
    return (<div className="md-team">
      <h3><TeamLink club={club} name={teamName(s)} /></h3>
      {formation && <div className="fm">Système : {formation}</div>}
      {starters.length > 0 && <><h4>Titulaires</h4><ul className="md-list">{starters.map(li)}</ul></>}
      {bench.length > 0 && <><h4>Remplaçants</h4><ul className="md-list">{bench.map(li)}</ul></>}
    </div>)
  }
  return (<>
    {events.length > 0 && <section className="fc-panel"><h2>Chronologie du match</h2>
      <ul className="md-tl">{events.map(e => (
        <li key={e.id} className={`md-ev ${e.side}`}><span className="fc-min">{minOf(e)}</span><span className="md-ico">{icon(e)}</span><span><small>{teamName(e.side)}</small>{text(e)}</span></li>))}</ul></section>}
    {lineups.length > 0 && <section className="fc-panel"><h2>Compositions</h2>
      <div className="md-teams">{side('home', homeClub, meta?.home_formation)}{side('away', awayClub, meta?.away_formation)}</div></section>}
  </>)
}
