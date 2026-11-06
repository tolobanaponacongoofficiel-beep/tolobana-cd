import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { initials } from '@/lib/blocks'
import ImageUploader from '../../components/ImageUploader'
import ConfirmButton from '../../components/ConfirmButton'
import { addAuthor, updateAuthor, deleteAuthor } from './actions'

export const metadata = { title: 'Rédacteurs' }
const OK = { ajoute: 'Rédacteur ajouté.', modifie: 'Rédacteur modifié.', supprime: 'Rédacteur supprimé.' }
const ERR = { nom: 'Le nom du rédacteur est obligatoire.', enregistrement: 'Enregistrement refusé. Vérifiez que le fichier phase4.sql a bien été exécuté dans Supabase.' }

const Avatar = ({ a }) => a.photo_url ? <img className="avatar" src={a.photo_url} alt="" /> : <span className="avatar">{initials(a.name)}</span>

export default async function Authors({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data: list } = await sb.from('authors').select('id,name,title,bio,photo_url').order('name')
  return (<>
    <div className="dash-head"><h1>Rédacteurs</h1></div>
    <p className="lead">Les rédacteurs signent les articles et ont leur page publique. Ils n’ont pas besoin de compte pour apparaître sur le site.</p>
    {OK[searchParams?.ok] && <p className="notice ok" role="status">{OK[searchParams.ok]}</p>}
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}

    <section className="panel"><h2>Ajouter un rédacteur</h2>
      <form action={addAuthor} className="f">
        <label>Nom affiché<input name="name" required maxLength={120} placeholder="Prénom Nom" /></label>
        <label>Fonction<input name="title" maxLength={120} placeholder="Ex. Journaliste politique" /></label>
        <label>Biographie courte<textarea name="bio" rows={3} maxLength={1000} placeholder="Affichée sur sa page rédacteur" /></label>
        <ImageUploader name="photo_url" folder="authors" label="Choisir une photo" round />
        <div><button className="btn">Ajouter le rédacteur</button></div>
      </form>
    </section>

    <section className="panel"><h2>Équipe ({list?.length || 0})</h2>
      {!list?.length && <p className="meta">Aucun rédacteur pour le moment. Ajoutez le premier ci-dessus.</p>}
      {(list || []).map(a => (
        <details key={a.id} className="arow">
          <summary><Avatar a={a} /><span><b>{a.name}</b><span className="meta">{a.title || 'Rédacteur'}</span></span></summary>
          <form action={updateAuthor} className="f">
            <input type="hidden" name="id" value={a.id} />
            <label>Nom affiché<input name="name" defaultValue={a.name} required maxLength={120} /></label>
            <label>Fonction<input name="title" defaultValue={a.title || ''} maxLength={120} /></label>
            <label>Biographie courte<textarea name="bio" rows={3} defaultValue={a.bio || ''} maxLength={1000} /></label>
            <ImageUploader name="photo_url" value={a.photo_url || ''} folder="authors" label="Choisir une photo" round />
            <div className="actions"><button className="btn">Enregistrer</button></div>
          </form>
          <form action={deleteAuthor} className="del-row"><input type="hidden" name="id" value={a.id} />
            <ConfirmButton message={`Supprimer ${a.name} ? Ses articles resteront en ligne, signés par le compte qui les a saisis.`}>Supprimer ce rédacteur</ConfirmButton></form>
        </details>))}
    </section>
  </>)
}
