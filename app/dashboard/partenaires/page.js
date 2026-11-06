import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { addPartner, deletePartner } from '../actions'

export const metadata = { title: 'Partenaires' }

export default async function Partners() {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data: partners } = await sb.from('partners').select('id,name,logo_url').order('position').order('id')
  return (<>
    <div className="dash-head"><h1>Partenaires</h1></div>
    <section className="panel"><h2>Ajouter un partenaire</h2>
      <form className="f" action={addPartner}>
        <label>Nom du partenaire<input name="name" required /></label>
        <label>Site web<input name="link_url" placeholder="https://…" inputMode="url" /></label>
        <label>Logo (JPG, PNG ou WebP, 4 Mo maximum)<input type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></label>
        <div><button className="btn">Ajouter</button></div>
      </form></section>
    <section className="panel"><h2>Partenaires affichés ({partners?.length || 0})</h2>
      {!partners?.length && <p className="meta">Aucun partenaire pour le moment.</p>}
      {(partners || []).map(p => (
        <form key={p.id} action={deletePartner} className="qrow"><input type="hidden" name="id" value={p.id} />
          <div><b>{p.name}</b></div><ConfirmButton message={`Retirer ${p.name} du site ?`}>Supprimer</ConfirmButton></form>))}
    </section>
  </>)
}
