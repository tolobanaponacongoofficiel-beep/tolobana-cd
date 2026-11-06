import Link from 'next/link'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { review } from './actions'

const STATUS = { draft: 'Brouillon', submitted: 'À valider', published: 'Publié', rejected: 'Rejeté' }
const OK = { brouillon: 'Brouillon enregistré.', soumis: 'Article envoyé pour validation.', publie: 'Article publié.' }
const ERR = { incomplet: 'Article non enregistré : il manque le titre, la rubrique ou le contenu.', enregistrement: 'Article non enregistré : la base de données a refusé l’envoi. Réessayez.' }

export default async function Overview({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  const editor = atLeast(role, 'editor')
  const [{ data: mine }, { data: queue }] = await Promise.all([
    sb.from('articles').select('id,title,slug,status,created_at').eq('author_id', user.id).order('created_at', { ascending: false }).limit(30),
    editor ? sb.from('articles').select('id,title,profiles(name),authors(name)').eq('status', 'submitted').order('created_at') : { data: [] },
  ])
  const count = s => (mine || []).filter(a => a.status === s).length
  return (<>
    <div className="dash-head"><h1>Vue d’ensemble</h1><Link href="/dashboard/nouvel-article" className="btn">Écrire un article</Link></div>
    {OK[searchParams?.ok] && <p className="notice ok" role="status">{OK[searchParams.ok]}</p>}
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}

    <div className="stats">
      <div><b>{count('published')}</b><span>publiés</span></div>
      <div><b>{count('submitted')}</b><span>en attente de validation</span></div>
      <div><b>{count('draft')}</b><span>brouillons</span></div>
      {editor && <div className="hl"><b>{queue?.length || 0}</b><span>à valider par la rédaction</span></div>}
    </div>

    {editor && <section className="panel"><h2>À valider</h2>
      {!queue?.length && <p className="meta">Aucun article en attente.</p>}
      {(queue || []).map(a => (
        <form key={a.id} action={review} className="qrow"><input type="hidden" name="id" value={a.id} />
          <div><b>{a.title}</b><span className="meta">Par {a.authors?.name || a.profiles?.name}</span></div>
          <div className="acts">
            <button className="btn sm" name="decision" value="publish">Publier</button>
            <button className="btn red sm" name="decision" value="publish_breaking">Dernière minute</button>
            <button className="btn ghost sm" name="decision" value="reject">Rejeter</button></div>
        </form>))}
    </section>}

    <section className="panel"><h2>Mes articles</h2>
      {!mine?.length && <p className="meta">Vous n’avez pas encore écrit d’article.</p>}
      {(mine || []).map(a => (
        <div key={a.id} className="qrow"><div>{a.status === 'published' ? <Link href={`/article/${a.slug}`}><b>{a.title}</b></Link> : <b>{a.title}</b>}</div>
          <span className={`chip ${a.status}`}>{STATUS[a.status] || a.status}</span></div>))}
      {mine?.length > 0 && <p style={{ margin: '12px 0 0' }}><Link href="/dashboard/articles" className="btn ghost sm">Voir et modifier mes articles</Link></p>}
    </section>
  </>)
}
