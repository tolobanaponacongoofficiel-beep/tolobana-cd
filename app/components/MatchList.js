import { timeOf, dateLabel } from '@/lib/sport'
import './phase12.css'
export default function MatchList({ matches, showDate = false }) {
  return (
    <ul className="sp-list">
      {matches.map(m => {
        const has = m.hs != null && m.as != null
        return (<li key={m.id}>
          <span className="sp-when">{m.status === 'live' ? <span className="sp-live">En direct</span> : showDate ? `${dateLabel(m.kickoff)} · ${timeOf(m.kickoff)}` : m.status === 'finished' ? 'Terminé' : 'À venir'}</span>
          <span className="sp-home">{m.home}</span>
          <span className={`sp-score${has ? '' : ' sched'}`}>{has ? `${m.hs} - ${m.as}` : showDate ? 'vs' : timeOf(m.kickoff)}</span>
          <span className="sp-away">{m.away}</span></li>)
      })}
    </ul>)
}
