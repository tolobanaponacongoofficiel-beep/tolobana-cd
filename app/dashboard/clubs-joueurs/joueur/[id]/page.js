import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import ImageUploader from '../../../../components/ImageUploader'
import ConfirmButton from '../../../../components/ConfirmButton'
import { updatePlayer, deletePlayer } from '../../actions'
import '../../../../components/phase20.css'
export const metadata = { title: 'Modifier un joueur' }
export default async function PlayerAdmin({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  if (!isUuid(params.id)) notFound()
  const [{ data: p }, { data: clubs }] = await Promise.all([sb.from('fc_players').select('*').eq('id', params.id).maybeSingle(), sb.from('fc_clubs').select('id,name').order('name').limit(400)])
  if (!p) notFound()
  return (<>
    <div className="dash-head"><h1>{p.name}</h1><p className="meta">{p.club_id ? <Link href={`/dashboard/clubs-joueurs/club/${p.club_id}`}>← Club</Link> : <Link href="/dashboard/clubs-joueurs">← Clubs</Link>} · <Link href={`/joueurs/${p.id}`}>Voir la fiche publique</Link></p></div>
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez le nom du joueur.</p>}
    <section className="panel">
      <form className="f" action={updatePlayer}><input type="hidden" name="id" value={p.id} />
        <div className="mini-grid">
          <label>Nom<input name="name" required maxLength={80} defaultValue={p.name} /></label>
          <label>Club<select name="club_id" defaultValue={p.club_id || ''}><option value="">Sans club</option>{(clubs || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Poste<select name="position" defaultValue={p.position || ''}><option value="">Non précisé</option><option value="gardien">Gardien</option><option value="defenseur">Défenseur</option><option value="milieu">Milieu</option><option value="attaquant">Attaquant</option></select></label>
          <label>Numéro<input name="shirt_number" type="number" min="0" max="99" defaultValue={p.shirt_number ?? ''} /></label>
          <label>Date de naissance<input name="birth_date" type="date" defaultValue={p.birth_date || ''} /></label>
          <label>Nationalité<input name="nationality" maxLength={60} defaultValue={p.nationality || ''} /></label>
          <label>Taille (cm)<input name="height_cm" type="number" min="100" max="230" defaultValue={p.height_cm || ''} /></label>
          <label>Pied fort<select name="foot" defaultValue={p.foot || ''}><option value="">Non précisé</option><option value="droit">Droit</option><option value="gauche">Gauche</option><option value="ambidextre">Ambidextre</option></select></label></div>
        <ImageUploader name="photo_url" value={p.photo_url || ''} folder="articles" label="Photo du joueur" />
        <label>Présentation (un paragraphe par ligne)<textarea name="bio" rows={5} maxLength={4000} defaultValue={p.bio || ''} /></label>
        <label><input type="checkbox" name="is_active" defaultChecked={p.is_active} style={{ width: 'auto' }} /> Dans l’effectif actuel</label>
        <div><button className="btn">Enregistrer</button></div></form>
      <form action={deletePlayer} style={{ marginTop: 10 }}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="club" value={p.club_id || ''} /><ConfirmButton message="Supprimer ce joueur ?">Supprimer le joueur</ConfirmButton></form></section></>)
}
