import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { unpublish, deleteArticle } from './actions'

export const metadata = { title: 'Articles' }
const STATUS = { draft: 'Brouillon', submitted: 'À valider', published: 'Publié', rejected: 'Rejeté' }
const OK = { modifie: 'Modifications enregistrées.', soumis: 'Article envoyé pour validation.', publie: 'Article publié.', retire: 'Article retiré du site (il est redevenu brouillon).', supprime: 'Article supprimé.' }
const ERR = { introuvable: 'Article introuvable.', interdit: 'Vous ne pouvez pas modifier cet article : il est publié ou écrit par quelqu’un d’autre.' }

export default async function Articles({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const editor = atLeast(role, 'editor'), admin = atLeast(role, 'admin')
  let q = sb.from('articles').select('id,title,slug,status,created_at,author_id,profiles(name),authors(name)').order('created_at', { ascending: false }).limit(100)
  if (!editor) q = q.eq('author_id', user.id)
  const { data: list } = await q
  return (<>
    <div className="dash-head"><h1>{editor ? 'Tous les articles' : 'Mes articles'}</h1><Link href="/dashboard/nouvel-article" className="btn">Écrire un article</Link></div>
    {OK[searchParams?.ok] && <p className="notice ok" role="status">{OK[searchParams.ok]}</p>}
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}
    <section className="panel">
      {!list?.length && <p className="meta">Aucun article pour le moment.</p>}
      {(list || []).map(a => {
        const canEdit = editor || (a.author_id === user.id && a.status !== 'published')
        return (
          <div key={a.id} className="qrow">
            <div><b>{a.title}</b><span className="meta">Par {a.authors?.name || a.profiles?.name} · {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })}</span></div>
            <div className="acts"><span className={`chip ${a.status}`}>{STATUS[a.status] || a.status}</span>
              {a.status === 'published' && <Link href={`/article/${a.slug}`} className="btn ghost sm">Voir</Link>}
              {canEdit && <Link href={`/dashboard/articles/${a.id}`} className="btn sm">Modifier</Link>}
              {editor && a.status === 'published' && <form action={unpublish}><input type="hidden" name="id" value={a.id} /><ConfirmButton className="btn ghost sm" message="Retirer cet article du site ? Il redeviendra brouillon.">Retirer</ConfirmButton></form>}
              {admin && <form action={deleteArticle}><input type="hidden" name="id" value={a.id} /><ConfirmButton message={`Supprimer définitivement « ${a.title} » ?`}>Supprimer</ConfirmButton></form>}
            </div>
          </div>)
      })}
    </section>
  </>)
}
