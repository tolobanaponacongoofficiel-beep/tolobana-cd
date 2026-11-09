import Link from 'next/link'
import { timeOf, dateLabel } from '@/lib/sport'
import Crest from './Crest'
import './phase13.css'
export default function MatchList({ matches, showDate = false, saver = false }) {
  return (
    <ul className="sp-list">
      {matches.map(m => {
        const has = m.hs != null && m.as != null && m.status !== 'scheduled'
        const when = m.status === 'live' ? <span className="sp-live">En direct</span> : m.status === 'postponed' ? 'Reporté' : showDate ? `${dateLabel(m.kickoff)} · ${timeOf(m.kickoff)}` : m.status === 'finished' ? 'Terminé' : timeOf(m.kickoff)
        return (<li key={m.id}>
          <Link href={`/sport/match/${m.id}`} aria-label={`${m.home} contre ${m.away}, voir le détail`}>
            <span className="sp-when">{when}</span>
            <span className="sp-home"><span>{m.home}</span><Crest src={m.hc} name={m.home} saver={saver} /></span>
            <span className={`sp-score${has ? '' : ' sched'}${m.status === 'live' ? ' live' : ''}`}>{has ? `${m.hs} - ${m.as}` : 'vs'}</span>
            <span className="sp-away"><Crest src={m.ac} name={m.away} saver={saver} /><span>{m.away}</span></span>
          </Link></li>)
      })}
    </ul>)
}
