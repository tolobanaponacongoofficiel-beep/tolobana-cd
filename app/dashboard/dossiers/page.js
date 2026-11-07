import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ImageUploader from '../../components/ImageUploader'
import { createDossier } from './actions'
export const metadata = { title: 'Dossiers' }
export default async function Dossiers({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data, error } = await sb.from('dossiers').select('id,title,is_published,created_at').order('created_at', { ascending: false })
  return (<>
    <div className="dash-head"><h1>Dossiers thématiques</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase9.sql.</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez un titre.</p>}
    <section className="panel"><h2>Nouveau dossier</h2>
      <form className="f" action={createDossier}>
        <label>Titre (ex. CAN 2027, Élections en RDC)<input name="title" required maxLength={200} /></label>
        <label>Description<textarea name="description" rows={3} maxLength={1000} /></label>
        <div><span className="meta">Image de couverture (format paysage conseillé)</span><ImageUploader name="cover_url" folder="articles" label="Choisir l’image de couverture" /></div>
        <label><input type="checkbox" name="is_published" defaultChecked style={{ width: 'auto' }} /> Publier le dossier</label>
        <div><button className="btn">Créer et ajouter des articles</button></div></form></section>
    <section className="panel"><h2>Dossiers ({data?.length || 0})</h2>
      {(data || []).map(d => <p key={d.id} className="qrow"><span><b>{d.title}</b><span className="meta">{d.is_published ? 'Publié' : 'Brouillon'}</span></span><Link className="btn sm" href={`/dashboard/dossiers/${d.id}`}>Gérer</Link></p>)}</section></>)
}
