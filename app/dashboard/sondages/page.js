import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { isOpen } from '@/lib/polls'
import { createPoll, togglePoll, deletePoll } from './actions'
export const metadata = { title: 'Sondages' }
export default async function Sondages({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: polls, error } = await sb.from('polls').select('id,question,is_active,ends_at,created_at').order('created_at', { ascending: false }).limit(30)
  const results = await Promise.all((polls || []).map(async p => ({ p, r: (await sb.rpc('poll_results', { p_poll: p.id })).data || [] })))
  return (<>
    <div className="dash-head"><h1>Sondages</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase9.sql.</p>}
    {!process.env.SUPABASE_SECRET_KEY && <p className="err" role="alert">Les votes des lecteurs nécessitent la variable SUPABASE_SECRET_KEY dans Vercel (voir LISEZMOI-phase9.md).</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez une question et au moins 2 réponses.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Nouveau sondage</h2>
      <form className="f" action={createPoll}>
        <label>Question (ex. Question du jour)<input name="question" required maxLength={250} /></label>
        <label>Réponses, une par ligne (2 à 6)<textarea name="options" rows={4} required placeholder={'Oui\nNon\nSans opinion'} /></label>
        <label>Clôture (facultative, heure de Kinshasa)<input type="datetime-local" name="ends_at" /></label>
        <div><button className="btn">Publier le sondage</button></div></form></section>
    <section className="panel"><h2>Sondages ({results.length})</h2>
      {results.map(({ p, r }) => { const tot = r.reduce((n, o) => n + Number(o.votes), 0); return (
        <div key={p.id} style={{ marginBottom: 16 }}>
          <b>{p.question}</b> <span className="meta">{isOpen(p) ? 'ouvert' : 'clos'} · {tot} vote{tot > 1 ? 's' : ''}</span>
          {r.map(o => <div key={o.option_id} className="meta">{o.label} : {o.votes} ({tot ? Math.round(Number(o.votes) / tot * 100) : 0} %)</div>)}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <form action={togglePoll}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="active" value={p.is_active ? '0' : '1'} /><button className="btn sm gray">{p.is_active ? 'Clore' : 'Rouvrir'}</button></form>
            <form action={deletePoll}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Supprimer ce sondage et ses votes ?">Supprimer</ConfirmButton></form></div>
        </div>) })}</section></>)
}
