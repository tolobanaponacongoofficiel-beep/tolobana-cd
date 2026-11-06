import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { createArticle, review, updateProfile, addPartner, deletePartner } from './actions'
import { signOut } from '../login/actions'
export default async function Dashboard() {
  const { sb, user, role } = await getUserAndRole()
  if (!user) redirect('/login')
  const { data: me } = await sb.from('profiles').select('name,bio').eq('id', user.id).single()
  const { data: cats } = await sb.from('categories').select('id,name').is('parent_id', null).order('position')
  const { data: mine } = await sb.from('articles').select('id,title,status').eq('author_id', user.id).order('created_at', { ascending: false })
  const { data: queue } = atLeast(role, 'editor') ? await sb.from('articles').select('id,title,profiles(name)').eq('status', 'submitted') : { data: [] }
  const { data: partners } = atLeast(role, 'admin') ? await sb.from('partners').select('id,name').order('position').order('id') : { data: [] }
  return (<main className="wrap sans">
    <h2>Bonjour {me?.name} <small>({role})</small></h2>
    <form action={signOut}><button className="btn gray">Déconnexion</button></form>
    <div className="panel"><form className="f" action={updateProfile} style={{ margin: 0 }}><h3>Mon profil</h3>
      <input name="name" defaultValue={me?.name || ''} placeholder="Nom affiché" required />
      <textarea name="bio" rows={3} defaultValue={me?.bio || ''} placeholder="Courte biographie (affichée sur votre page auteur)" />
      <button className="btn">Enregistrer le profil</button></form></div>
    {!atLeast(role, 'journalist') && <p>Votre compte est « lecteur ». Un administrateur doit vous attribuer le rôle journaliste.</p>}
    {atLeast(role, 'journalist') && <div className="panel"><form className="f" action={createArticle} style={{ margin: 0 }}>
      <h3>Nouvel article</h3><input name="title" placeholder="Titre" required /><input name="subtitle" placeholder="Sous-titre" />
      <select name="category_id" required>{(cats || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <textarea name="summary" rows={2} placeholder="Résumé" /><textarea name="body" rows={10} placeholder="Contenu" required />
      <label>Photo principale (JPG, PNG ou WebP, 4 Mo max)<input type="file" name="image" accept="image/jpeg,image/png,image/webp" /></label>
      <input name="image_caption" placeholder="Légende et crédit photo" />
      <label><input type="checkbox" name="is_demo" style={{ width: 'auto' }} /> Contenu de démonstration</label>
      {atLeast(role, 'editor') && <label><input type="checkbox" name="is_breaking" style={{ width: 'auto' }} /> Dernière minute (bandeau défilant)</label>}
      <div style={{ display: 'flex', gap: 8 }}><button className="btn">Enregistrer le brouillon</button><button className="btn" name="submit" value="1">Soumettre</button></div>
    </form></div>}
    <h3>Mes articles</h3>{(mine || []).map(a => <p key={a.id}>{a.title} <b>[{a.status}]</b></p>)}
    {atLeast(role, 'editor') && <><h3>À valider</h3>{(queue || []).map(a => (
      <form key={a.id} action={review} style={{ marginBottom: 10 }}><input type="hidden" name="id" value={a.id} />{a.title} ({a.profiles?.name}){' '}
        <button className="btn" name="decision" value="publish">Publier</button>{' '}
        <button className="btn red" name="decision" value="publish_breaking">Publier en dernière minute</button>{' '}
        <button className="btn gray" name="decision" value="reject">Rejeter</button></form>))}</>}
    {atLeast(role, 'admin') && <div className="panel"><h3>Partenaires</h3>
      <form className="f" action={addPartner} style={{ margin: 0 }}><input name="name" placeholder="Nom du partenaire" required />
        <input name="link_url" placeholder="Site web (https://...)" />
        <label>Logo (JPG, PNG ou WebP, 4 Mo max)<input type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></label>
        <button className="btn">Ajouter</button></form>
      {(partners || []).map(p => <form key={p.id} action={deletePartner} style={{ marginTop: 8 }}><input type="hidden" name="id" value={p.id} />{p.name}{' '}<button className="btn red">Supprimer</button></form>)}
    </div>}
  </main>)
}
