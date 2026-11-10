import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import ConfirmButton from '../../../components/ConfirmButton'
import ImageUploader from '../../../components/ImageUploader'
import { GROUP_LABEL, GROUP_ORDER } from '@/lib/sport'
import { updateTeam, deleteTeam, addPlayer, setPlayerActive, deletePlayer } from '../actions'
export const metadata = { title: 'Équipe' }
export default async function EquipeDash({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  if (!isUuid(params.id)) notFound()
  const [{ data: t }, { data: pls }] = await Promise.all([sb.from('teams').select('*').eq('id', params.id).maybeSingle(), sb.from('players').select('*').eq('team_id', params.id).order('shirt', { ascending: true, nullsFirst: false }).limit(120)])
  if (!t) notFound()
  return (<>
    <div className="dash-head"><h1>{t.name}</h1><Link className="btn ghost sm" href={`/sport/equipe/${t.id}`} target="_blank">Voir la page publique</Link></div>
    <p className="meta"><Link href="/dashboard/equipes">← Toutes les équipes</Link></p>
    {searchParams?.err && <p className="err" role="alert">Vérifiez les champs (nom obligatoire) ou exécutez supabase/phase15.sql.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Fiche de l’équipe</h2>
      <form className="f" action={updateTeam}><input type="hidden" name="id" value={t.id} />
        <label>Nom<input name="name" required maxLength={80} defaultValue={t.name} /></label>
        <label>Ville<input name="city" maxLength={80} defaultValue={t.city ?? ''} /></label>
        <label>Pays<input name="country" maxLength={80} defaultValue={t.country ?? 'RDC'} /></label>
        <label>Année de fondation<input name="founded" inputMode="numeric" defaultValue={t.founded ?? ''} /></label>
        <label>Stade<input name="stadium" maxLength={120} defaultValue={t.stadium ?? ''} /></label>
        <label>Entraîneur<input name="coach" maxLength={100} defaultValue={t.coach ?? ''} /></label>
        <label>Site officiel (https://…)<input name="website" type="url" maxLength={300} defaultValue={t.website ?? ''} /></label>
        <label>Historique du club (palmarès, grandes dates ; un paragraphe par ligne)<textarea name="history" rows={6} maxLength={6000} defaultValue={t.history ?? ''} /></label>
        <div><ImageUploader name="logo_url" label={t.logo_url ? 'Changer le logo' : 'Logo (facultatif)'} /></div>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn">Enregistrer</button></div></form>
      <form action={deleteTeam}><input type="hidden" name="id" value={t.id} /><ConfirmButton message="Supprimer cette équipe et tous ses joueurs ?">Supprimer l’équipe</ConfirmButton></form></section>
    <section className="panel"><h2>Ajouter un joueur</h2>
      <form className="f" action={addPlayer}><input type="hidden" name="team_id" value={t.id} />
        <label>Nom complet<input name="name" required maxLength={100} /></label>
        <label>Poste<select name="position" defaultValue=""><option value="">·</option>{GROUP_ORDER.map(g => <option key={g} value={g}>{GROUP_LABEL[g].replace(/s$/, '')}</option>)}</select></label>
        <label>Numéro<input name="shirt" inputMode="numeric" /></label>
        <label>Date de naissance<input name="birth_date" type="date" /></label>
        <label>Nationalité<input name="nationality" maxLength={60} defaultValue="RDC" /></label>
        <label>Parcours (facultatif)<textarea name="bio" rows={3} maxLength={3000} /></label>
        <div><ImageUploader name="photo_url" label="Photo (facultative)" /></div>
        <div><button className="btn">Ajouter le joueur</button></div></form></section>
    <section className="panel"><h2>Effectif ({pls?.length || 0})</h2>
      {(pls || []).map(p => (<div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
        <b style={{ minWidth: 28 }}>{p.shirt ?? '·'}</b><Link href={`/sport/joueur/${p.id}`} target="_blank">{p.name}</Link><span className="meta">{p.position ? GROUP_LABEL[p.position].replace(/s$/, '') : ''}</span>{!p.is_active && <span className="chip">hors effectif</span>}
        <form action={setPlayerActive}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="team_id" value={t.id} /><input type="hidden" name="active" value={p.is_active ? '0' : '1'} /><button className="btn sm gray">{p.is_active ? 'Retirer de l’effectif' : 'Remettre'}</button></form>
        <form action={deletePlayer}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="team_id" value={t.id} /><ConfirmButton message="Supprimer ce joueur ?">Supprimer</ConfirmButton></form></div>))}
      {!pls?.length && <p className="meta">Aucun joueur pour le moment.</p>}</section></>)
}
