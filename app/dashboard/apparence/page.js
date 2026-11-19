import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { HOME_BLOCKS } from '@/lib/wp'
import { saveAppearance } from './actions'
import { CITIES } from '@/lib/weather'
import { adminCityPhotos } from '@/lib/cityart'
import ImageUploader from '../../components/ImageUploader'
import '../../components/phase32.css'
export const metadata = { title: 'Apparence' }
export default async function Apparence({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const s = await getSettings(sb), hidden = new Set(String(s.home_hide || '').split(',')), count = Math.min(8, Math.max(1, Number(s.menu_count) || 3))
  const photos = adminCityPhotos(s)
  return (<>
    <div className="dash-head"><h1>Apparence du site</h1></div>
    {searchParams?.ok && <p className="notice ok" role="status">Apparence enregistrée.</p>}
    <form action={saveAppearance} className="panel ap">
      <h2 className="wx-h">Menu principal</h2>
      <label>Nombre de rubriques affichées dans la barre (les autres vont dans « Rubriques »)
        <select name="menu_count" defaultValue={count}>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
      <label>Liens supplémentaires dans le menu (un par ligne : « Libellé | /chemin » ou « Libellé | https://… »)
        <textarea name="menu_links" rows={5} defaultValue={s.menu_links || ''} placeholder={'Emplois | /services\nRadio | https://exemple.cd/radio'} /></label>
      <p className="meta">8 liens au maximum. L’ordre et la visibilité des rubriques se règlent dans « Rubriques ».</p>
      <h2 className="wx-h">Colonne de droite de l’accueil</h2>
      <p className="meta">Décochez un bloc pour le masquer.</p>
      <div className="ap-checks">{HOME_BLOCKS.map(([k, l]) => <label key={k} className="ap-ck"><input type="checkbox" name="show" value={k} defaultChecked={!hidden.has(k)} /> {l}</label>)}</div>
      <h2 className="wx-h">Photos des villes (météo)</h2>
      <p className="meta">Une photo libre de droits (Wikimedia Commons) s’affiche par défaut pour la plupart des villes ; une illustration automatique sert aux autres. Pour mettre la vôtre, choisissez-la dans la Médiathèque ou envoyez une image (paysage de préférence) : elle remplace celle par défaut.</p>
      <div className="ap-cities">{CITIES.map(c => <div key={c.slug} className="ap-city"><b>{c.name}</b><ImageUploader name={`city_${c.slug}`} value={photos[c.slug] || ''} folder="library" label="Choisir la photo" /></div>)}</div>
      <button className="btn">Enregistrer</button>
    </form>
  </>)
}
