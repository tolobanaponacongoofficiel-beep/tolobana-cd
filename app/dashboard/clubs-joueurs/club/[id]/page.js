import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { POS_ONE } from '@/lib/clubs'
import ImageUploader from '../../../../components/ImageUploader'
import ConfirmButton from '../../../../components/ConfirmButton'
import { updateClub, deleteClub, importSquad } from '../../actions'
import '../../../../components/phase20.css'
export const metadata = { title: 'Gérer un club' }
export default async function ClubAdmin({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  if (!isUuid(params.id)) notFound()
  const { data: c } = await sb.from('fc_clubs').select('*').eq('id', params.id).maybeSingle()
  if (!c) notFound()
  const { data: players } = await sb.from('fc_players').select('id,name,position,shirt_number,is_active').eq('club_id', c.id).order('is_active', { ascending: false }).order('shirt_number', { nullsFirst: false }).order('name')
  return (<>
    <div className="dash-head"><h1>{c.name}</h1><p className="meta"><Link href="/dashboard/clubs-joueurs">← Clubs</Link> · <Link href={`/clubs/${c.slug}`}>Voir la fiche publique</Link></p></div>
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez le nom du club.</p>}
    <section className="panel"><h2>Fiche du club</h2>
      <form className="f" action={updateClub}><input type="hidden" name="id" value={c.id} />
        <div className="mini-grid">
          <label>Nom<input name="name" required maxLength={80} defaultValue={c.name} /></label>
          <label>Nom court (ex. TPM)<input name="short_name" maxLength={40} defaultValue={c.short_name || ''} /></label>
          <label>Autres noms utilisés par les flux de matchs (séparés par des virgules)<input name="aliases" defaultValue={(c.aliases || []).join(', ')} placeholder="Ex. Mazembe, TP Mazembe FC" /></label>
          <label>Pays<input name="country" maxLength={60} defaultValue={c.country || ''} /></label>
          <label>Ville<input name="city" maxLength={60} defaultValue={c.city || ''} /></label>
          <label>Année de fondation<input name="founded" type="number" min="1800" max="2100" defaultValue={c.founded || ''} /></label>
          <label>Stade<input name="stadium" maxLength={100} defaultValue={c.stadium || ''} /></label>
          <label>Couleurs<input name="colors" maxLength={80} defaultValue={c.colors || ''} placeholder="Ex. Noir et blanc" /></label>
          <label>Entraîneur<input name="coach" maxLength={80} defaultValue={c.coach || ''} /></label>
          <label>Site officiel (https://…)<input name="website" inputMode="url" maxLength={200} defaultValue={c.website || ''} /></label></div>
        <ImageUploader name="crest_url" value={c.crest_url || ''} folder="articles" label="Écusson du club" />
        <label>Histoire du club (un paragraphe par ligne)<textarea name="history" rows={8} maxLength={8000} defaultValue={c.history || ''} /></label>
        <label>Palmarès (une ligne par titre)<textarea name="honours" rows={5} maxLength={4000} defaultValue={c.honours || ''} placeholder={'Champion de RD Congo : 2023, 2024\nLigue des champions de la CAF : 2010'} /></label>
        <label><input type="checkbox" name="is_published" defaultChecked={c.is_published} style={{ width: 'auto' }} /> Fiche publiée sur le site</label>
        <div><button className="btn">Enregistrer la fiche</button></div></form>
      <form action={deleteClub} style={{ marginTop: 10 }}><input type="hidden" name="id" value={c.id} /><ConfirmButton message="Supprimer ce club ? Les joueurs sont conservés, sans club.">Supprimer le club</ConfirmButton></form></section>
    <section className="panel"><h2>Importer l’effectif</h2>
      <p className="meta">Une ligne par joueur : <b>numéro ; nom ; poste ; naissance ; nationalité</b>. Poste : G, D, M ou A. Naissance : année (1998) ou 12/03/1998. Les joueurs déjà présents sont mis à jour.</p>
      <form className="f" action={importSquad}><input type="hidden" name="id" value={c.id} />
        <textarea name="squad" rows={8} required placeholder={'1; Timothy Fayulu; G; 1999; RD Congo\n10; Meschack Elia; A; 1997/07/06; RD Congo'} />
        <div><button className="btn">Importer</button></div></form></section>
    <section className="panel"><h2>Joueurs ({players?.length || 0})</h2>
      {!players?.length && <p className="meta">Aucun joueur pour le moment.</p>}
      {(players || []).map(p => <p key={p.id} className="qrow"><span><b>{p.shirt_number != null ? `${p.shirt_number}. ` : ''}{p.name}</b><span className="meta">{[POS_ONE[p.position], p.is_active ? null : 'ancien joueur'].filter(Boolean).join(' · ')}</span></span><Link className="btn sm" href={`/dashboard/clubs-joueurs/joueur/${p.id}`}>Modifier</Link></p>)}</section></>)
}
