import { getUserAndRole } from '@/lib/supabase/server'
import ImageUploader from '../../components/ImageUploader'
import { updateProfile } from '../actions'

export const metadata = { title: 'Mon profil' }

export default async function Profile({ searchParams }) {
  const { sb, user } = await getUserAndRole()
  const { data: me } = await sb.from('profiles').select('name,bio,photo_url').eq('id', user.id).single()
  return (<>
    <div className="dash-head"><h1>Mon profil</h1></div>
    {searchParams?.ok && <p className="notice ok" role="status">Profil enregistré.</p>}
    <section className="panel"><form className="f" action={updateProfile}>
      <div><b style={{ fontFamily: 'var(--sans)', fontSize: '.88rem' }}>Ma photo</b><p className="meta" style={{ margin: '2px 0 8px' }}>Elle s’affiche à côté de votre nom sur vos articles et sur votre page auteur.</p>
        <ImageUploader name="photo_url" value={me?.photo_url || ''} folder="profiles" label="Choisir ma photo" round /></div>
      <label>Nom affiché<input name="name" defaultValue={me?.name || ''} required /></label>
      <label>Biographie courte<textarea name="bio" rows={4} defaultValue={me?.bio || ''} placeholder="Affichée sur votre page auteur" /></label>
      <div><button className="btn">Enregistrer le profil</button></div>
    </form></section>
  </>)
}
