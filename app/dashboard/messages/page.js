import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { messageAction } from './actions'
export const metadata = { title: 'Messages reçus' }
export default async function Messages() {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data, error } = await sb.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(100)
  return (<>
    <div className="dash-head"><h1>Messages reçus</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase9.sql.</p>}
    {!data?.length && <p className="meta">Aucun message pour le moment.</p>}
    {(data || []).map(m => (
      <section key={m.id} className="panel" style={m.is_read ? { opacity: .75 } : { borderLeft: '4px solid var(--red)' }}>
        <p className="meta"><b>{m.name}</b> · <a href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.created_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'medium', timeStyle: 'short' })}</p>
        {m.subject && <h3 style={{ margin: '4px 0' }}>{m.subject}</h3>}
        <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
        <form action={messageAction} style={{ display: 'flex', gap: 8 }}><input type="hidden" name="id" value={m.id} />
          {!m.is_read && <button className="btn sm" name="op" value="read">Marquer comme lu</button>}
          <ConfirmButton message="Supprimer ce message ?" name="op" value="delete">Supprimer</ConfirmButton></form>
      </section>))}
  </>)
}
