import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getMatch, dateLabel, timeOf, compByCode } from '@/lib/sport'
import { SITE_URL } from '@/lib/site'
import { saverOn } from '@/lib/saver'
import Crest from '../../../components/Crest'
import { SportHero } from '../../../components/SportHero'
import '../../../components/phase13.css'
export const revalidate = 60
export async function generateMetadata({ params }) {
  const m = await getMatch(supabaseServer(), params.id)
  if (!m) return { title: 'Match' }
  const sc = m.hs != null && m.as != null && m.status !== 'scheduled' ? ` ${m.hs}-${m.as} ` : ' - '
  return { title: `${m.home}${sc}${m.away} : ${m.competition}`, description: `${m.home} contre ${m.away}, ${m.competition} : score, buteurs et détails du match.`, alternates: { canonical: `/sport/match/${params.id}` } }
}
const KIND = { OWN: ' (c.s.c.)', PENALTY: ' (pen.)' }
export default async function MatchPage({ params }) {
  const m = await getMatch(supabaseServer(), params.id); if (!m) notFound()
  const saver = saverOn(), has = m.hs != null && m.as != null && m.status !== 'scheduled'
  const status = m.status === 'live' ? 'En direct' : m.status === 'finished' ? 'Terminé' : m.status === 'postponed' ? 'Reporté' : 'À venir'
  const total = has ? m.hs + m.as : 0
  const comp = m.code && compByCode(m.code)
  const url = `${SITE_URL}/sport/match/${m.id}`
  const wa = `https://wa.me/?text=${encodeURIComponent(`${m.home}${has ? ` ${m.hs}-${m.as} ` : ' - '}${m.away} (${m.competition}) ${url}`)}`
  const ld = { '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${m.home} - ${m.away}`, startDate: m.kickoff, sport: 'Football', url, homeTeam: { '@type': 'SportsTeam', name: m.home }, awayTeam: { '@type': 'SportsTeam', name: m.away }, ...(m.venue ? { location: { '@type': 'Place', name: m.venue } } : {}) }
  const Goal = ({ g }) => (<li className={g.side}><span className="sp-min">{g.minute ? `${g.minute}'` : '·'}</span><span className="sp-who">⚽ {g.name}{KIND[g.type] || ''}{g.assist && <small> passe : {g.assist}</small>}</span></li>)
  return (<main className="wrap sport-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <SportHero crumb={comp ? <Link href={`/sport/${m.code.toLowerCase()}`}>← {m.competition}</Link> : <Link href="/sport">← Sport</Link>} title={m.competition} sub={[m.stage, m.matchday ? `Journée ${m.matchday}` : null].filter(Boolean).join(' · ') || undefined} />
    <section className="sp-match" aria-label="Score">
      <div className="sp-team-big"><Crest src={m.hc} name={m.home} size={64} saver={saver} /><b>{m.home}</b></div>
      <div className="sp-mid">
        <div className={`sp-bigscore${m.status === 'live' ? ' live' : ''}`}>{has ? <>{m.hs}<i>-</i>{m.as}</> : <span className="vs">{timeOf(m.kickoff)}</span>}</div>
        <div className="sp-status">{m.status === 'live' ? <span className="sp-live">En direct</span> : status}</div>
        {m.ht && m.status !== 'scheduled' && <div className="sp-ht">Mi-temps : {m.ht}</div>}
      </div>
      <div className="sp-team-big"><Crest src={m.ac} name={m.away} size={64} saver={saver} /><b>{m.away}</b></div>
    </section>
    <p className="sp-info">{dateLabel(m.kickoff)} · {timeOf(m.kickoff)} (Kinshasa){m.venue ? ` · ${m.venue}` : ''}{m.referee ? ` · Arbitre : ${m.referee}` : ''}</p>
    <section className="sp-panel"><h2>Buteurs</h2>
      {m.goals.length ? <ul className="sp-goals">{m.goals.map((g, i) => <Goal key={i} g={g} />)}</ul>
        : <p className="meta">{has && total > 0 ? 'Les buteurs de ce match ne sont pas encore disponibles.' : has ? 'Aucun but dans ce match.' : 'Le match n’a pas encore commencé.'}</p>}
    </section>
    {m.cards.length > 0 && <section className="sp-panel"><h2>Cartons</h2><ul className="sp-goals">{m.cards.map((c, i) => <li key={i} className={c.side}><span className="sp-min">{c.minute ? `${c.minute}'` : '·'}</span><span className="sp-who"><i className={`sp-card ${c.card}`} /> {c.name}</span></li>)}</ul></section>}
    <div className="share10"><a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a><Link className="btn ghost" href="/sport">Tous les matchs</Link></div>
  </main>)
}
