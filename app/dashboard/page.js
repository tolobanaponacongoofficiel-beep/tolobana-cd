import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { createArticle, review } from './actions'
import { signOut } from '../login/actions'
export default async function Dashboard() {
  const { sb, user, role, name } = await getUserAndRole()
  if (!user) redirect('/login')
  const { data: cats } = await sb.from('categories').select('id,name').is('parent_id', null).order('position')
  const { data: mine } = await sb.from('articles').select('id,title,status').eq('author_id', user.id).order('created_at', { ascending: false })
  const { data: queue } = atLeast(role, 'editor') ? await sb.from('articles').select('id,title,profiles(name)').eq('status', 'submitted') : { data: [] }
  return (<main className="wrap sans">
    <h2>Bonjour {name} <small>({role})</small></h2>
    <form action={signOut}><button className="btn">Déconnexion</button></form>
    {!atLeast(role, 'journalist') && <p>Votre compte est « lecteur ». Un administrateur doit vous attribuer le rôle journaliste.</p>}
    {atLeast(role, 'journalist') && <form className="f" action={createArticle}>
      <h3>Nouvel article</h3><input name="title" placeholder="Titre" required /><input name="subtitle" placeholder="Sous-titre" />
      <select name="category_id" required>{(cats || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <textarea name="summary" rows={2} placeholder="Résumé" /><textarea name="body" rows={10} placeholder="Contenu" required />
      <label><input type="checkbox" name="is_demo" style={{ width: 'auto' }} /> Contenu de démonstration</label>
      <div style={{ display: 'flex', gap: 8 }}><button className="btn">Enregistrer le brouillon</button><button className="btn" name="submit" value="1">Soumettre</button></div>
    </form>}
    <h3>Mes articles</h3>{(mine || []).map(a => <p key={a.id}>{a.title} <b>[{a.status}]</b></p>)}
    {atLeast(role, 'editor') && <><h3>À valider</h3>{(queue || []).map(a => (
      <form key={a.id} action={review} style={{ marginBottom: 8 }}><input type="hidden" name="id" value={a.id} />{a.title} ({a.profiles?.name}) {' '}
        <button className="btn" name="decision" value="publish">Publier</button> <button className="btn" style={{ background: '#d0121b' }} name="decision" value="reject">Rejeter</button></form>))}</>}
  </main>)
}
