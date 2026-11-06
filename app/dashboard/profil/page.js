import { getUserAndRole } from '@/lib/supabase/server'
import { updateProfile } from '../actions'

export const metadata = { title: 'Mon profil' }

export default async function Profile({ searchParams }) {
  const { sb, user } = await getUserAndRole()
  const { data: me } = await sb.from('profiles').select('name,bio').eq('id', user.id).single()
  return (<>
    <div className="dash-head"><h1>Mon profil</h1></div>
    {searchParams?.ok && <p className="notice ok" role="status">Profil enregistré.</p>}
    <section className="panel"><form className="f" action={updateProfile}>
      <label>Nom affiché<input name="name" defaultValue={me?.name || ''} required /></label>
      <label>Biographie courte<textarea name="bio" rows={4} defaultValue={me?.bio || ''} placeholder="Affichée sur votre page auteur" /></label>
      <div><button className="btn">Enregistrer le profil</button></div>
    </form></section>
  </>)
}
