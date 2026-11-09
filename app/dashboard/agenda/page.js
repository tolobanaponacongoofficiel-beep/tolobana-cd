import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import ImageUploader from '../../components/ImageUploader'
import { fmtKin, isoToKinshasaInput } from '@/lib/dates'
import { CATS } from '@/lib/agenda'
import { createEvent, updateEvent, toggleEvent, deleteEvent } from './actions'
export const metadata = { title: 'Agenda' }
const Fields = ({ e }) => (<>
  <label>Titre<input name="title" required maxLength={160} defaultValue={e?.title ?? ''} /></label>
  <label>Catégorie<select name="category" defaultValue={e?.category ?? 'autre'}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
  <label>Début (heure de Kinshasa)<input type="datetime-local" name="starts_at" required defaultValue={isoToKinshasaInput(e?.starts_at)} /></label>
  <label>Fin (facultative)<input type="datetime-local" name="ends_at" defaultValue={isoToKinshasaInput(e?.ends_at)} /></label>
  <label>Lieu (salle, stade, adresse)<input name="venue" maxLength={150} defaultValue={e?.venue ?? ''} /></label>
  <label>Ville<input name="city" maxLength={80} defaultValue={e?.city ?? 'Kinshasa'} /></label>
  <label>Description<textarea name="description" rows={4} maxLength={3000} defaultValue={e?.description ?? ''} /></label>
  <label>Lien d’information (https://…, facultatif)<input name="link_url" type="url" maxLength={500} defaultValue={e?.link_url ?? ''} /></label></>)
export default async function AgendaDash({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: list, error } = await sb.from('events').select('*').order('starts_at', { ascending: false }).limit(100)
  const now = Date.now()
  return (<>
    <div className="dash-head"><h1>Agenda</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase14.sql.</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez au moins un titre (3 caractères) et une date de début.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Nouvel événement</h2>
      <form className="f" action={createEvent}><Fields />
        <div><ImageUploader name="image_url" label="Affiche ou photo (facultatif)" /></div>
        <div><button className="btn">Publier dans l’agenda</button></div></form></section>
    <section className="panel"><h2>Événements ({list?.length || 0})</h2>
      {(list || []).map(e => (<div key={e.id} style={{ borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
        <div><span className="chip">{CATS[e.category] || 'Autre'}</span> <b>{e.title}</b> {new Date(e.starts_at).getTime() < now && <span className="meta">(passé)</span>} {!e.is_published && <span className="chip">masqué</span>}</div>
        <div className="meta">{fmtKin(e.starts_at, { dateStyle: 'medium', timeStyle: 'short' })}{e.venue ? ` · ${e.venue}` : ''}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <a className="btn ghost sm" href={`/agenda/${e.id}`} target="_blank" rel="noopener noreferrer">Voir</a>
          <form action={toggleEvent}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="publish" value={e.is_published ? '0' : '1'} /><button className="btn sm gray">{e.is_published ? 'Masquer' : 'Publier'}</button></form>
          <form action={deleteEvent}><input type="hidden" name="id" value={e.id} /><ConfirmButton message="Supprimer cet événement ?">Supprimer</ConfirmButton></form></div>
        <details style={{ marginTop: 6 }}><summary>Modifier</summary>
          <form className="f" action={updateEvent}><input type="hidden" name="id" value={e.id} /><Fields e={e} /><div><button className="btn sm">Enregistrer les modifications</button></div></form></details></div>))}
      {!list?.length && <p className="meta">Aucun événement pour le moment.</p>}</section></>)
}
