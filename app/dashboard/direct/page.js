import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { fmtKin } from '@/lib/dates'
import { createLive } from './actions'
export const metadata = { title: 'Direct' }
export default async function DirectDash({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: lives, error } = await sb.from('lives').select('id,title,status,is_published,created_at').order('created_at', { ascending: false }).limit(50)
  return (<>
    <div className="dash-head"><h1>Direct</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase10.sql.</p>}
    {searchParams?.err === '3' ? <p className="err" role="alert">Lien de diffusion non reconnu. Utilisez un lien https YouTube, Facebook, Vimeo ou un fichier MP4.</p> : searchParams?.err && <p className="err" role="alert">Indiquez un titre.</p>}
    <section className="panel"><h2>Démarrer un direct</h2>
      <form className="f" action={createLive}>
        <label>Titre (ex. Conférence de presse du président)<input name="title" required maxLength={160} /></label>
        <label>Résumé (facultatif)<input name="summary" maxLength={300} /></label>
        <label>Lien de diffusion vidéo (facultatif : YouTube, Facebook, Vimeo ou MP4)<input name="stream_url" type="url" maxLength={500} placeholder="https://www.youtube.com/watch?v=…" /></label>
        <div><button className="btn red">Démarrer le direct</button></div></form></section>
    <section className="panel"><h2>Directs ({lives?.length || 0})</h2>
      {(lives || []).map(l => (<p key={l.id}><Link href={`/dashboard/direct/${l.id}`}><b>{l.title}</b></Link>{' '}
        <span className={`chip ${l.status === 'live' ? 'rejected' : ''}`}>{l.status === 'live' ? 'en direct' : 'terminé'}</span>{!l.is_published && <span className="chip"> masqué</span>}
        <span className="meta"> · {fmtKin(l.created_at, { dateStyle: 'medium', timeStyle: 'short' })}</span></p>))}
      {!lives?.length && <p className="meta">Aucun direct pour le moment.</p>}</section></>)
}
