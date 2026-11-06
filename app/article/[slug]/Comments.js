import { supabaseServer } from '@/lib/supabase/server'
import { addComment, reportComment } from './actions'
export default async function Comments({ articleId, slug }) {
  const sb = supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  const { data } = await sb.from('comments').select('id,parent_id,body,status,user_id,created_at,profiles(name)').eq('article_id', articleId).order('created_at')
  const list = (data || []).filter(c => c.status === 'approved' || c.user_id === user?.id)
  const when = d => new Date(d).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'medium', timeStyle: 'short' })
  const form = parentId => (
    <form action={addComment} className="cm-form">
      <input type="hidden" name="article_id" value={articleId} /><input type="hidden" name="slug" value={slug} /><input type="hidden" name="parent_id" value={parentId || ''} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <textarea name="body" rows={3} required minLength={2} maxLength={1500} placeholder="Votre commentaire (restez respectueux)" />
      <button className="btn">Publier</button></form>)
  const item = (c, child) => (
    <div key={c.id} className={child ? 'cm child' : 'cm'}>
      <div className="meta"><b>{c.profiles?.name}</b> · {when(c.created_at)}{c.status === 'pending' ? ' · en attente de modération' : ''}</div>
      <p>{c.body}</p>
      {user && c.status === 'approved' && <div className="cm-actions">
        {!child && <details><summary>Répondre</summary>{form(c.id)}</details>}
        <form action={reportComment}><input type="hidden" name="comment_id" value={c.id} /><button className="link">Signaler</button></form></div>}
      {!child && list.filter(r => r.parent_id === c.id).map(r => item(r, true))}
    </div>)
  const top = list.filter(c => !c.parent_id)
  return (
    <section className="comments"><h2>Commentaires</h2>
      {user ? form(null) : <p>Connectez-vous pour commenter. <a href="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Connexion</a></p>}
      {top.map(c => item(c, false))}
      {!top.length && <p className="meta">Aucun commentaire pour le moment.</p>}
    </section>)
}
