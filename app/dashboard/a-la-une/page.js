import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { setFeatured, clearFeatured } from './actions'
export const metadata = { title: 'À la une' }
export default async function ALaUne({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const s = await getSettings(sb)
  let cur = null; try { cur = JSON.parse(s.featured || 'null') } catch {}
  const { data: arts } = await sb.from('articles').select('id,title,published_at').eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(40)
  return (<>
    <div className="dash-head"><h1>À la une</h1></div>
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <p className="meta">{cur?.id ? 'Un article est épinglé en grande Une sur l’accueil.' : 'Mode automatique : la Une est le dernier article publié.'}</p>
    <section className="panel"><h2>Choisir l’article de la Une</h2>
      <form className="f" action={setFeatured}>
        <label>Article<select name="id" required defaultValue={cur?.id || ''}><option value="" disabled>Choisir un article publié…</option>
          {(arts || []).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></label>
        <label>Titre accrocheur (facultatif, remplace le titre sur l’accueil)<input name="title" maxLength={200} defaultValue={cur?.title || ''} /></label>
        <label>Résumé (facultatif)<textarea name="summary" rows={3} maxLength={400} defaultValue={cur?.summary || ''} /></label>
        <div><button className="btn">Mettre à la une</button></div></form>
      {cur?.id && <form action={clearFeatured} style={{ marginTop: 10 }}><button className="btn sm gray">Revenir au mode automatique</button></form>}
    </section></>)
}
