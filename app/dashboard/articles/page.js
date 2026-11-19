import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { STATUS_LABEL, TABS, stateOf, cleanQ } from '@/lib/wp'
import { isoToKinshasaInput } from '@/lib/dates'
import ConfirmButton from '../../components/ConfirmButton'
import BulkBar from './BulkBar'
import { unpublish, deleteArticle, quickEdit } from './actions'
import '../../components/phase32.css'

export const metadata = { title: 'Articles' }
const PER = 40
const OK = { modifie: 'Modifications enregistrées.', soumis: 'Article envoyé pour validation.', publie: 'Article publié.', retire: 'Article retiré du site (il est redevenu brouillon).', supprime: 'Article supprimé définitivement.' }
const ERR = { introuvable: 'Article introuvable.', interdit: 'Action non autorisée pour votre rôle ou pour cet article (publié, ou écrit par quelqu’un d’autre).', rien: 'Aucun article concerné.', rubrique: 'Choisissez une rubrique.', etiquette: 'Saisissez une étiquette.', incomplet: 'Il manque le titre ou la rubrique.', enregistrement: 'Enregistrement refusé. Réessayez.' }
const dt = iso => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Kinshasa' })

export default async function Articles({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const editor = atLeast(role, 'editor'), admin = atLeast(role, 'admin')
  const tab = TABS.some(t => t[0] === (searchParams?.status || '')) ? (searchParams?.status || '') : ''
  const q = cleanQ(searchParams?.q), cat = Number(searchParams?.cat) || 0, page = Math.max(1, Number(searchParams?.p) || 1)
  const nowISO = new Date().toISOString()
  const base = (qb) => (editor ? qb : qb.eq('author_id', user.id))
  const count = async f => { const { count: c } = await f(base(sb.from('articles').select('id', { count: 'exact', head: true }))); return c || 0 }
  const counts = {}
  await Promise.all(TABS.map(async ([k]) => {
    counts[k] = await count(b => k === '' ? b.neq('status', 'trash') : k === 'scheduled' ? b.eq('status', 'published').gt('published_at', nowISO)
      : k === 'published' ? b.eq('status', 'published').or(`published_at.is.null,published_at.lte.${nowISO}`) : b.eq('status', k))
  }))
  let qb = base(sb.from('articles').select('id,title,slug,status,created_at,published_at,author_id,category_id,tags,profiles(name),authors(name)', { count: 'exact' }))
  qb = tab === '' ? qb.neq('status', 'trash') : tab === 'scheduled' ? qb.eq('status', 'published').gt('published_at', nowISO)
    : tab === 'published' ? qb.eq('status', 'published').or(`published_at.is.null,published_at.lte.${nowISO}`) : qb.eq('status', tab)
  if (q) qb = qb.ilike('title', `%${q}%`)
  if (cat) qb = qb.eq('category_id', cat)
  const [{ data: list, count: total }, { data: all }] = await Promise.all([
    qb.order('created_at', { ascending: false }).range((page - 1) * PER, page * PER - 1),
    sb.from('categories').select('id,name,parent_id,position').order('position')])
  const tops = (all || []).filter(c => !c.parent_id)
  const cats = tops.flatMap(t => [{ id: t.id, label: t.name }, ...(all || []).filter(c => c.parent_id === t.id).map(c => ({ id: c.id, label: `${t.name} › ${c.name}` }))])
  const catName = Object.fromEntries(cats.map(c => [c.id, c.label]))
  const url = (o = {}) => { const p = new URLSearchParams(); const v = { status: tab, q, cat: cat || '', p: '', ...o }; for (const [k, x] of Object.entries(v)) if (x) p.set(k, x); const s = p.toString(); return `/dashboard/articles${s ? `?${s}` : ''}` }
  const here = url({ p: page > 1 ? page : '' })
  const ops = !editor ? ['trash'] : tab === 'trash' ? ['restore', ...(admin ? ['delete'] : [])] : ['trash', 'publish', 'draft', 'reject', 'category', 'tag']
  const pages = Math.max(1, Math.ceil((total || 0) / PER))
  return (<>
    <div className="dash-head"><h1>{editor ? 'Tous les articles' : 'Mes articles'}</h1><Link href="/dashboard/nouvel-article" className="btn">Écrire un article</Link></div>
    {OK[searchParams?.ok] && <p className="notice ok" role="status">{OK[searchParams.ok]}</p>}
    {searchParams?.ok === 'groupe' && <p className="notice ok" role="status">Action appliquée à {Number(searchParams.n) || 0} article(s).</p>}
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}
    <nav className="wp-tabs" aria-label="Filtrer par statut">{TABS.map(([k, l]) => <Link key={k || 'all'} href={url({ status: k, p: '' })} className={k === tab ? 'on' : undefined} aria-current={k === tab ? 'page' : undefined}>{l} <span>{counts[k]}</span></Link>)}</nav>
    <form className="wp-filter" action="/dashboard/articles">
      {tab && <input type="hidden" name="status" value={tab} />}
      <input type="search" name="q" defaultValue={q} placeholder="Rechercher un titre" aria-label="Rechercher" />
      <select name="cat" defaultValue={cat || ''} aria-label="Rubrique"><option value="">Toutes les rubriques</option>{cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
      <button className="btn gray sm">Filtrer</button>{(q || cat > 0) && <Link href={url({ q: '', cat: '' })} className="btn ghost sm">Effacer</Link>}
    </form>
    <section className="panel">
      {list?.length > 0 && <BulkBar ops={ops} cats={cats} back={here} />}
      {!list?.length && <p className="meta">Aucun article {tab ? `dans « ${TABS.find(t => t[0] === tab)[1]} »` : 'pour le moment'}.</p>}
      {(list || []).map(a => {
        const st = stateOf(a), own = a.author_id === user.id
        const canEdit = st !== 'trash' && (editor || (own && a.status !== 'published'))
        return (
          <div key={a.id} className="qrow wp-row">
            <input type="checkbox" name="ids" value={a.id} form="bulk" aria-label={`Sélectionner ${a.title}`} disabled={!editor && (!own || a.status === 'published')} />
            <div className="wp-main"><b>{a.title}</b><span className="meta">Par {a.authors?.name || a.profiles?.name} · {catName[a.category_id] || 'Sans rubrique'} · {st === 'scheduled' ? `programmé pour le ${new Date(a.published_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kinshasa' })}` : dt(a.published_at || a.created_at)}</span></div>
            <div className="acts"><span className={`chip ${st}`}>{STATUS_LABEL[st] || st}</span>
              {st === 'published' && <Link href={`/article/${a.slug}`} className="btn ghost sm">Voir</Link>}
              {canEdit && <Link href={`/dashboard/articles/${a.id}`} className="btn sm">Modifier</Link>}
              {st !== 'trash' && <Link href={`/dashboard/articles/${a.id}/revisions`} className="btn ghost sm">Versions</Link>}
              {editor && a.status === 'published' && <form action={unpublish}><input type="hidden" name="id" value={a.id} /><ConfirmButton className="btn ghost sm" message="Retirer cet article du site ? Il redeviendra brouillon.">Retirer</ConfirmButton></form>}
              {admin && st === 'trash' && <form action={deleteArticle}><input type="hidden" name="id" value={a.id} /><ConfirmButton message={`Supprimer définitivement « ${a.title} » ?`}>Supprimer</ConfirmButton></form>}
            </div>
            {canEdit && (
              <details className="wp-qe"><summary>Modification rapide</summary>
                <form action={quickEdit}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="back" value={here} />
                  <label>Titre<input name="title" defaultValue={a.title} maxLength={220} required /></label>
                  <label>Rubrique<select name="category_id" defaultValue={a.category_id}>{cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
                  <label>Étiquettes<input name="tags" defaultValue={(a.tags || []).join(', ')} placeholder="séparées par des virgules" /></label>
                  {editor && <><label>Statut<select name="status" defaultValue={a.status}><option value="draft">Brouillon</option><option value="submitted">À valider</option><option value="published">Publié</option><option value="rejected">Rejeté</option></select></label>
                    <label>Date de publication (heure de Kinshasa)<input type="datetime-local" name="publish_at" defaultValue={isoToKinshasaInput(a.published_at)} /></label></>}
                  <button className="btn sm">Enregistrer</button></form></details>)}
          </div>)
      })}
      {pages > 1 && <nav className="wp-pages" aria-label="Pagination">{page > 1 && <Link href={url({ p: page - 1 })} className="btn ghost sm">Précédent</Link>}<span className="meta">Page {page} sur {pages}</span>{page < pages && <Link href={url({ p: page + 1 })} className="btn ghost sm">Suivant</Link>}</nav>}
    </section>
  </>)
}
