import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { updateCategory } from './actions'
export const metadata = { title: 'Rubriques' }
export default async function Rubriques({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data: cats, error } = await sb.from('categories').select('name,slug,position,show_in_menu,parent_id').order('position', { ascending: true })
  const shown = (cats || []).filter(c => c.show_in_menu && !c.parent_id && !['videos', 'tolobana-tv'].includes(c.slug))
  return (<>
    <div className="dash-head"><h1>Rubriques</h1></div>
    {error && <p className="err" role="alert">Impossible de lire les rubriques.</p>}
    {searchParams?.err === '1' && <p className="err" role="alert">Le nom doit avoir au moins 2 caractères.</p>}
    {searchParams?.err === '2' && <p className="err" role="alert">Enregistrement impossible : exécutez supabase/phase17.sql dans Supabase.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <p className="meta">Le menu du site affiche Accueil, En continu, Direct, Sport et les <b>3 premières rubriques</b> cochées ci-dessous (selon l’ordre, du plus petit numéro au plus grand). Les autres rubriques cochées sont rangées dans le bouton « Plus ». Une rubrique décochée disparaît du menu mais reste utilisable pour classer vos articles.</p>
    <p className="meta">Dans le menu actuellement : {shown.length ? shown.map((c, i) => `${c.name}${i < 3 ? '' : ' (dans « Plus »)'}`).join(', ') : 'aucune rubrique'}.</p>
    <section className="panel"><h2>Toutes les rubriques ({cats?.length || 0})</h2>
      {(cats || []).map(c => (<form key={c.slug} action={updateCategory} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
        <input type="hidden" name="slug" value={c.slug} />
        <input name="name" defaultValue={c.name} maxLength={40} required aria-label={`Nom de la rubrique ${c.name}`} style={{ width: 200, maxWidth: '100%' }} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Ordre <input name="position" type="number" min="0" max="999" defaultValue={c.position ?? 0} style={{ width: 70 }} /></label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><input type="checkbox" name="show_in_menu" defaultChecked={!!c.show_in_menu} /> Afficher dans le menu</label>
        {c.parent_id && <span className="chip">sous-rubrique</span>}
        <button className="btn sm">Enregistrer</button></form>))}
      {!cats?.length && <p className="meta">Aucune rubrique.</p>}</section></>)
}
