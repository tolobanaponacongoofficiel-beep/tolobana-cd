import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { moderate } from './actions'

export const metadata = { title: 'Modération des commentaires' }

export default async function Moderation() {
  const { sb, user, role } = await getUserAndRole()
  if (!user) redirect('/login')
  if (!atLeast(role, 'editor')) redirect('/dashboard')
  const { data: pending } = await sb.from('comments').select('id,body,profiles(name),articles(title)').eq('status', 'pending').order('created_at')
  const { data: reports } = await sb.from('comment_reports').select('id,comments(id,body,profiles(name),articles(title))').order('created_at', { ascending: false }).limit(30)
  const btn = (id, decision, label, cls = '') => (
    <form action={moderate} style={{ display: 'inline' }}><input type="hidden" name="id" value={id} /><button className={`btn sm ${cls}`} name="decision" value={decision}>{label}</button></form>)
  return (<>
    <div className="dash-head"><h1>Commentaires</h1></div>
    <h2 className="sub">En attente ({pending?.length || 0})</h2>
    {!pending?.length && <p className="meta">Aucun commentaire en attente.</p>}
    {(pending || []).map(c => <div key={c.id} className="panel"><p className="meta">{c.profiles?.name} sur « {c.articles?.title} »</p><p>{c.body}</p>
      <div className="acts">{btn(c.id, 'approve', 'Approuver')} {btn(c.id, 'delete', 'Supprimer', 'red')}</div></div>)}
    <h2 className="sub">Signalés ({reports?.length || 0})</h2>
    {!reports?.length && <p className="meta">Aucun signalement.</p>}
    {(reports || []).map(r => <div key={r.id} className="panel"><p className="meta">{r.comments?.profiles?.name} sur « {r.comments?.articles?.title} »</p><p>{r.comments?.body}</p>
      <div className="acts">{btn(r.comments?.id, 'delete', 'Supprimer le commentaire', 'red')} {btn(r.id, 'dismiss', 'Ignorer le signalement', 'ghost')}</div></div>)}
  </>)
}
