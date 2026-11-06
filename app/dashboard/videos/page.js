import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { KINDS } from '@/lib/tv'
import { addVideo, toggleLive, deleteVideo } from './actions'

export const metadata = { title: 'Tolobana TV' }

export default async function Videos({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: vids, error } = await sb.from('videos').select('id,title,kind,is_live,published_at,youtube_id').order('published_at', { ascending: false }).limit(100)
  return (<>
    <div className="dash-head"><h1>Tolobana TV</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez le fichier supabase/phase6.sql dans Supabase (SQL Editor), puis rechargez cette page.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    {searchParams?.err && <p className="err" role="alert">Vidéo non enregistrée : vérifiez le titre et le lien YouTube (youtube.com/watch?v=…, youtu.be/…, /live/…).</p>}
    <section className="panel"><h2>Ajouter une vidéo ou un direct</h2>
      <form className="f" action={addVideo}>
        <label>Titre<input name="title" required maxLength={200} /></label>
        <label>Lien YouTube<input name="url" required inputMode="url" placeholder="https://www.youtube.com/watch?v=…" /></label>
        <label>Type<select name="kind" defaultValue="reportage">{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label>Description (facultative)<textarea name="description" rows={3} maxLength={2000} /></label>
        <label>Date et heure de publication (heure de Kinshasa ; vide = maintenant)<input type="datetime-local" name="published_at" /></label>
        <label><input type="checkbox" name="is_live" style={{ width: 'auto' }} /> C’est un direct en cours</label>
        <div><button className="btn">Publier</button></div>
      </form></section>
    <section className="panel"><h2>Vidéos ({vids?.length || 0})</h2>
      {!vids?.length && <p className="meta">Aucune vidéo pour le moment.</p>}
      {(vids || []).map(v => (
        <div key={v.id} className="qrow" style={{ flexWrap: 'wrap' }}>
          <div><b>{v.title}</b><span className="meta">{KINDS[v.kind]} · {new Date(v.published_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'medium', timeStyle: 'short' })}{v.is_live ? ' · EN DIRECT' : ''}</span></div>
          <form action={toggleLive}><input type="hidden" name="id" value={v.id} /><input type="hidden" name="live" value={v.is_live ? '0' : '1'} />
            <button className="btn sm gray">{v.is_live ? 'Terminer le direct' : 'Passer en direct'}</button></form>
          <form action={deleteVideo}><input type="hidden" name="id" value={v.id} /><ConfirmButton message={`Supprimer « ${v.title} » ?`}>Supprimer</ConfirmButton></form>
        </div>))}
    </section>
  </>)
}
