import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { TYPES, TYPE_KEYS } from '@/lib/services'
import { fmtKin } from '@/lib/dates'
import ConfirmButton from '../../components/ConfirmButton'
import ImageUploader from '../../components/ImageUploader'
import { publishPost, setPostStatus, deletePost, createPost } from './actions'
export const metadata = { title: 'Services' }
const Row = ({ p, children }) => (<div style={{ borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
  <span className="chip">{TYPES[p.type]?.label}</span> <b>{p.title}</b>
  <div className="meta">{[p.org, p.location].filter(Boolean).join(' · ')}{p.deadline ? ` · limite ${p.deadline}` : ''} · contact : {p.contact}</div>
  <div className="meta">{p.submitter_name ? `Demandeur : ${p.submitter_name}${p.submitter_email ? ` (${p.submitter_email})` : ''} · ` : ''}reçu le {fmtKin(p.created_at, { dateStyle: 'medium', timeStyle: 'short' })}</div>
  <div style={{ whiteSpace: 'pre-line', margin: '6px 0' }}>{p.body}</div>{children}</div>)
export default async function ServicesDash({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: all, error } = await sb.from('service_posts').select('*').order('created_at', { ascending: false }).limit(150)
  const pending = (all || []).filter(p => p.status === 'pending'), published = (all || []).filter(p => p.status === 'published'), rejected = (all || []).filter(p => p.status === 'rejected')
  const now = Date.now()
  return (<>
    <div className="dash-head"><h1>Services</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase12.sql.</p>}
    {searchParams?.err && <p className="err" role="alert">Type, titre, texte et contact sont obligatoires.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>À valider ({pending.length})</h2>
      <p className="meta">Contactez le demandeur pour les conditions (publication payante ou non) avant de publier. Cochez « Payé » une fois le paiement reçu.</p>
      {pending.map(p => (<Row key={p.id} p={p}>
        <form action={publishPost} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><input type="hidden" name="id" value={p.id} />
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}><input type="checkbox" name="paid" style={{ width: 'auto' }} /> Payé</label>
          <input name="amount" placeholder="Montant / note (ex. 50 USD)" maxLength={80} style={{ width: 200 }} />
          <button className="btn sm">Publier</button></form>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <form action={setPostStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="rejected" /><button className="btn sm gray">Refuser</button></form>
          <form action={deletePost}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Supprimer cette demande ?">Supprimer</ConfirmButton></form></div></Row>))}
      {!pending.length && <p className="meta">Aucune demande en attente.</p>}</section>
    <section className="panel"><h2>Publier directement</h2>
      <form className="f" action={createPost}>
        <label>Type<select name="type" defaultValue="communique">{TYPE_KEYS.map(k => <option key={k} value={k}>{TYPES[k].label}</option>)}</select></label>
        <label>Titre<input name="title" required maxLength={160} /></label>
        <label>Texte<textarea name="body" rows={6} required maxLength={4000} /></label>
        <label>Organisation (facultatif)<input name="org" maxLength={150} /></label>
        <label>Lieu (facultatif)<input name="location" maxLength={120} /></label>
        <label>Date limite (emploi, appel d’offres)<input type="date" name="deadline" /></label>
        <label>Contact affiché<input name="contact" required maxLength={200} /></label>
        <ImageUploader name="image_url" label="Image (facultatif)" />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" name="paid" style={{ width: 'auto' }} /> Payé</label>
        <label>Montant / note interne<input name="amount" maxLength={80} /></label>
        <div><button className="btn">Publier maintenant</button></div></form></section>
    <section className="panel"><h2>En ligne ({published.length})</h2>
      {published.map(p => (<Row key={p.id} p={p}>
        <div className="meta">{p.is_paid ? `✔ Payé${p.amount_note ? ` : ${p.amount_note}` : ''}` : 'Non payé / gratuit'} · {p.expires_at && new Date(p.expires_at).getTime() < now ? 'expiré' : `expire le ${p.expires_at ? fmtKin(p.expires_at, { dateStyle: 'medium' }) : '—'}`}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <form action={setPostStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="pending" /><button className="btn sm gray">Retirer du site</button></form>
          <form action={deletePost}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Supprimer cette publication ?">Supprimer</ConfirmButton></form></div></Row>))}
      {!published.length && <p className="meta">Rien en ligne.</p>}</section>
    {rejected.length > 0 && <section className="panel"><h2>Refusées ({rejected.length})</h2>
      {rejected.map(p => (<Row key={p.id} p={p}><form action={deletePost}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Supprimer ?">Supprimer</ConfirmButton></form></Row>))}</section>}
  </>)
}
