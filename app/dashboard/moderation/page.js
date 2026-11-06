import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { moderate } from './actions'
export default async function Moderation() {
  const { sb, user, role } = await getUserAndRole()
  if (!user) redirect('/login')
  if (!atLeast(role, 'editor')) redirect('/dashboard')
  const { data: pending } = await sb.from('comments').select('id,body,profiles(name),articles(title)').eq('status', 'pending').order('created_at')
  const { data: reports } = await sb.from('comment_reports').select('id,comments(id,body,profiles(name),articles(title))').order('created_at', { ascending: false }).limit(30)
  const btn = (id, decision, label, cls = '') => (
    <form action={moderate} style={{ display: 'inline' }}><input type="hidden" name="id" value={id} /><button className={`btn ${cls}`} name="decision" value={decision}>{label}</button></form>)
  return (<main className="wrap sans">
    <h2>Modération des commentaires</h2><p><a href="/dashboard" style={{ color: 'var(--blue)' }}>← Mon espace</a></p>
    <h3>En attente ({pending?.length || 0})</h3>
    {(pending || []).map(c => <div key={c.id} className="panel"><p className="meta">{c.profiles?.name} sur « {c.articles?.title} »</p><p>{c.body}</p>
      {btn(c.id, 'approve', 'Approuver')} {btn(c.id, 'delete', 'Supprimer', 'red')}</div>)}
    <h3>Signalés ({reports?.length || 0})</h3>
    {(reports || []).map(r => <div key={r.id} className="panel"><p className="meta">{r.comments?.profiles?.name} sur « {r.comments?.articles?.title} »</p><p>{r.comments?.body}</p>
      {btn(r.comments?.id, 'delete', 'Supprimer le commentaire', 'red')} {btn(r.id, 'dismiss', 'Ignorer le signalement', 'gray')}</div>)}
  </main>)
}
