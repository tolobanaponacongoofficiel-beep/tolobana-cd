import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { safe } from '@/lib/safe'
import { getMatch, dateLabel, timeOf, compByCode, canLink } from '@/lib/sport'
import { SITE_URL } from '@/lib/site'
import { saverOn } from '@/lib/saver'
import AutoRefresh from '../../../components/AutoRefresh'
import Crest from '../../../components/Crest'
import EvIcon from '../../../components/EvIcon'
import { SportHero } from '../../../components/SportHero'
import '../../../components/phase13.css'
import '../../../components/phase15.css'
export const revalidate = 30
export async function generateMetadata({ params }) {
  const r = await safe(() => getMatch(supabaseServer(), params.id), 'sport/match/meta'), m = r.v
  if (!m) return { title: 'Match' }
  const sc = m.hs != null && m.as != null && m.status !== 'scheduled' ? ` ${m.hs}-${m.as} ` : ' - '
  return { title: `${m.home}${sc}${m.away} : ${m.competition}`, description: `${m.home} contre ${m.away}, ${m.competition} : score, buteurs, cartons, remplacements et compositions.`, alternates: { canonical: `/sport/match/${params.id}` } }
}
function Fail({ msg }) {
  return (<main className="wrap sport-page"><p className="empty">Cette fiche est momentanément indisponible. <Link href="/sport">Retour au sport</Link></p><details className="meta"><summary>Détail technique</summary>{msg}</details></main>)
}
const KIND = { goal: 'But', penalty: 'But (penalty)', own_goal: 'But contre son camp', yellow: 'Carton jaune', red: 'Carton rouge', sub: 'Remplacement' }
const Who = ({ name, id }) => canLink(id) ? <Link href={`/sport/joueur/${id}`}>{name}</Link> : <>{name}</>
function Lineup({ l, title }) {
  if (!l) return <div className="lu-col"><h3>{title}</h3><p className="meta">Composition non communiquée.</p></div>
  const Row = ({ p }) => <li><span className="num">{p.num ?? '·'}</span><Who name={p.name} id={p.id} /></li>
  return (<div className="lu-col"><h3>{title}{l.formation ? <small> · {l.formation}</small> : null}</h3>
    {l.coach && <p className="meta">Entraîneur : {l.coach}</p>}
    {l.start.length > 0 && <><h4>Titulaires</h4><ul>{l.start.map((p, i) => <Row key={i} p={p} />)}</ul></>}
    {l.bench.length > 0 && <><h4>Remplaçants</h4><ul className="bench">{l.bench.map((p, i) => <Row key={i} p={p} />)}</ul></>}</div>)
}
export default async function MatchPage({ params }) {
  const r = await safe(() => getMatch(supabaseServer(), params.id), 'sport/match'); if (r.err) return <Fail msg={r.err} />
  const m = r.v; if (!m) notFound()
  const saver = saverOn(), has = m.hs != null && m.as != null && m.status !== 'scheduled'
  const status = m.status === 'live' ? 'En direct' : m.status === 'finished' ? 'Terminé' : m.status === 'postponed' ? 'Reporté' : 'À venir'
  const comp = m.code && compByCode(m.code), url = `${SITE_URL}/sport/match/${m.id}`
  const wa = `https://wa.me/?text=${encodeURIComponent(`${m.home}${has ? ` ${m.hs}-${m.as} ` : ' - '}${m.away} (${m.competition}) ${url}`)}`
  const ld = { '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${m.home} - ${m.away}`, startDate: m.kickoff, sport: 'Football', url, homeTeam: { '@type': 'SportsTeam', name: m.home }, awayTeam: { '@type': 'SportsTeam', name: m.away }, ...(m.venue ? { location: { '@type': 'Place', name: m.venue } } : {}) }
  const Team = ({ side }) => { const isH = side === 'home', id = isH ? m.hid : m.aid, name = isH ? m.home : m.away, crest = isH ? m.hc : m.ac
    const inner = <><Crest src={crest} name={name} size={64} saver={saver} /><b>{name}</b></>
    return canLink(id) ? <Link href={`/sport/equipe/${id}`} className="sp-team-big">{inner}</Link> : <div className="sp-team-big">{inner}</div> }
  const total = has ? m.hs + m.as : 0
  return (<main className="wrap sport-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <SportHero crumb={comp ? <Link href={`/sport/${m.code.toLowerCase()}`}>← {m.competition}</Link> : <Link href="/sport">← Sport</Link>} title={m.competition} sub={[m.stage, m.matchday ? `Journée ${m.matchday}` : null].filter(Boolean).join(' · ') || undefined} />
    {m.status === 'live' && <AutoRefresh every={30} />}
    <section className="sp-match" aria-label="Score">
      <Team side="home" />
      <div className="sp-mid">
        <div className={`sp-bigscore${m.status === 'live' ? ' live' : ''}`}>{has ? <>{m.hs}<i>-</i>{m.as}</> : <span className="vs">{timeOf(m.kickoff)}</span>}</div>
        <div className="sp-status">{m.status === 'live' ? <span className="sp-live">En direct</span> : status}</div>
        {m.status === 'live' && <div className="sp-ht">Actualisation automatique</div>}
        {m.ht && m.status !== 'scheduled' && <div className="sp-ht">Mi-temps : {m.ht}</div>}
      </div>
      <Team side="away" />
    </section>
    <p className="sp-info">{dateLabel(m.kickoff)} · {timeOf(m.kickoff)} (Kinshasa){m.venue ? ` · ${m.venue}` : ''}{m.referee ? ` · Arbitre : ${m.referee}` : ''}</p>
    <section className="sp-panel"><h2>Chronologie</h2>
      {m.events.length ? <ol className="tl">{m.events.map((e, i) => (
        <li key={i} className={e.side}><span className="tl-min">{e.minute ? `${e.minute}'` : '·'}</span>
          <span className="tl-what"><EvIcon kind={e.kind} /><span className="tl-text"><span className="tl-kind">{KIND[e.kind]} · {e.side === 'home' ? m.home : m.away}</span>
            <b><Who name={e.name} id={e.pid} /></b>
            {e.kind === 'sub' ? (e.other && <small>Sort : <Who name={e.other} id={e.otherId} /></small>) : e.other && e.kind !== 'yellow' && e.kind !== 'red' ? <small>Passe : {e.other}</small> : null}</span></span></li>))}</ol>
        : <p className="meta">{has && total > 0 ? 'Les détails de ce match (buteurs, cartons, remplacements) ne sont pas disponibles pour le moment.' : has ? 'Aucun but dans ce match.' : 'Le match n’a pas encore commencé.'}</p>}
    </section>
    {m.lineups && <section className="sp-panel"><h2>Compositions</h2><div className="lu"><Lineup l={m.lineups.home} title={m.home} /><Lineup l={m.lineups.away} title={m.away} /></div></section>}
    <div className="share10"><a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a><Link className="btn ghost" href="/sport">Tous les matchs</Link></div>
  </main>)
}
