import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { hasVoted, isOpen } from '@/lib/polls'
import { vote } from '../sondages/actions'
import './phase9.css'
// Un sondage : formulaire de vote, ou résultats (graphique en barres + pourcentages) une fois voté ou clos.
export default async function PollCard({ poll, back = '/sondages', status }) {
  const sb = supabaseServer()
  const [{ data: res }, voted] = await Promise.all([sb.rpc('poll_results', { p_poll: poll.id }), hasVoted(poll.id)])
  const options = res || []
  const total = options.reduce((n, o) => n + Number(o.votes), 0)
  const open = isOpen(poll)
  const showResults = voted || !open
  const msg = { merci: 'Merci, votre vote est enregistré ✓', deja: 'Vous avez déjà voté pour ce sondage.', limite: 'Trop de votes depuis votre connexion. Réessayez plus tard.', indisponible: 'Le vote est momentanément indisponible.', clos: 'Ce sondage est clos.' }[status]
  return (
    <section className="poll" id={`sondage-${poll.id.slice(0, 8)}`} aria-label="Sondage">
      <span className="tagl">{open ? 'Sondage' : 'Sondage clos'}</span>
      <h3>{poll.question}</h3>
      {msg && <p className="note" role="status">{msg}</p>}
      {showResults ? options.map(o => {
        const pct = total ? Math.round((Number(o.votes) / total) * 100) : 0
        return (<div key={o.option_id} className="pbar"><div className="row"><span>{o.label}</span><b>{pct} %</b></div>
          <div className="track"><span className="fill" style={{ width: `${pct}%` }} /></div></div>)
      }) : (
        <form action={vote}>
          <input type="hidden" name="poll" value={poll.id} /><input type="hidden" name="back" value={back} />
          {options.map(o => <label key={o.option_id}><input type="radio" name="option" value={o.option_id} required /> {o.label}</label>)}
          <button className="btn sm">Voter</button>
        </form>)}
      <p className="tot">{total} vote{total > 1 ? 's' : ''}{poll.ends_at && open ? ` · clôture le ${new Date(poll.ends_at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'long' })}` : ''}{back === '/' && <> · <Link href="/sondages" style={{ color: 'var(--blue)' }}>Tous les sondages</Link></>}</p>
    </section>)
}
