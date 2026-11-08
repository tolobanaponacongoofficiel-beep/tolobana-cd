import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { fmtKin } from '@/lib/dates'
import ImageUploader from '../../../components/ImageUploader'
import ConfirmButton from '../../../components/ConfirmButton'
import { addEntry, deleteEntry, setLiveState, deleteLive, setStream } from '../actions'
import { streamEmbed } from '@/lib/stream'
export const metadata = { title: 'Gérer le direct' }
const Op = ({ id, op, children, cls = 'btn sm gray' }) => <form action={setLiveState}><input type="hidden" name="live" value={id} /><input type="hidden" name="op" value={op} /><button className={cls}>{children}</button></form>
export default async function LiveManage({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  if (!isUuid(params.id)) notFound()
  const { data: live } = await sb.from('lives').select('*').eq('id', params.id).maybeSingle()
  if (!live) notFound()
  const { data: entries } = await sb.from('live_entries').select('id,body,image_url,important,created_at').eq('live_id', live.id).order('created_at', { ascending: false }).limit(200)
  const on = live.status === 'live'
  return (<>
    <div className="dash-head"><h1>{live.title}</h1></div>
    <p><span className={`chip ${on ? 'rejected' : ''}`}>{on ? 'en direct' : 'terminé'}</span> {!live.is_published && <span className="chip">masqué</span>} <Link href={`/direct/${live.slug}`} target="_blank">Voir la page publique ↗</Link></p>
    {searchParams?.err === '1' && <p className="err" role="alert">Écrivez le message à publier.</p>}
    {searchParams?.err === '3' && <p className="err" role="alert">Lien de diffusion non reconnu. Utilisez un lien https YouTube, Facebook, Vimeo ou un fichier MP4.</p>}
    {searchParams?.err === '2' && <p className="err" role="alert">Ce direct est terminé : reprenez-le pour publier.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Publié ✓</p>}
    <section className="panel"><h2>Diffusion vidéo</h2>
      <form className="f" action={setStream}><input type="hidden" name="live" value={live.id} />
        <label>Lien du direct (YouTube, Facebook, Vimeo ou MP4). Laissez vide pour retirer la vidéo.<input name="stream_url" type="url" maxLength={500} defaultValue={live.stream_url || ''} placeholder="https://www.youtube.com/live/…" /></label>
        <p className="meta">{live.stream_url ? (streamEmbed(live.stream_url) ? `Lecteur actif : ${streamEmbed(live.stream_url).label}` : 'Lien non reconnu') : 'Aucune vidéo liée : seul le fil de messages est affiché.'}</p>
        <div><button className="btn sm">Enregistrer le lien</button></div></form></section>
    {on && <section className="panel"><h2>Publier une mise à jour</h2>
      <form className="f" action={addEntry}><input type="hidden" name="live" value={live.id} />
        <label>Message<textarea name="body" rows={4} required maxLength={3000} placeholder="Ce qui vient de se passer…" /></label>
        <ImageUploader name="image_url" label="Ajouter une photo (facultatif)" />
        <label className="check"><input type="checkbox" name="important" /> Information importante (mise en avant en rouge)</label>
        <div><button className="btn">Publier maintenant</button></div></form></section>}
    <section className="panel"><h2>Gestion</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {on ? <Op id={live.id} op="end" cls="btn sm red">Terminer le direct</Op> : <Op id={live.id} op="resume">Reprendre le direct</Op>}
        {live.is_published ? <Op id={live.id} op="hide">Masquer du site</Op> : <Op id={live.id} op="show">Remettre sur le site</Op>}
        <form action={deleteLive}><input type="hidden" name="live" value={live.id} /><ConfirmButton message="Supprimer ce direct et tous ses messages ?">Supprimer</ConfirmButton></form></div></section>
    <section className="panel"><h2>Messages publiés ({entries?.length || 0})</h2>
      {(entries || []).map(e => (<div key={e.id} style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
        <div className="meta">{fmtKin(e.created_at, { timeStyle: 'short', dateStyle: 'short' })}{e.important ? ' · ⚡ important' : ''}</div>
        <div style={{ whiteSpace: 'pre-line' }}>{e.body}</div>
        {e.image_url && <img src={e.image_url} alt="" style={{ maxWidth: 160, borderRadius: 4, marginTop: 4 }} />}
        <form action={deleteEntry}><input type="hidden" name="live" value={live.id} /><input type="hidden" name="entry" value={e.id} /><ConfirmButton message="Supprimer ce message ?">Supprimer</ConfirmButton></form></div>))}
      {!entries?.length && <p className="meta">Aucun message pour le moment.</p>}</section></>)
}
