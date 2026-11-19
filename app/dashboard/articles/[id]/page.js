import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { updateArticle } from '../../actions'
import ArticleForm from '../../nouvel-article/ArticleForm'
import Link from 'next/link'
import ConfirmButton from '../../../components/ConfirmButton'
import { addNote, deleteNote } from '../actions'
import '../../../components/phase32.css'

export const metadata = { title: 'Modifier un article' }
const NOTE_W = 'Notes internes : visibles seulement par la rédaction, jamais par les lecteurs.'
const ERR = { incomplet: 'Non enregistré : il manque le titre, la rubrique ou le contenu.', enregistrement: 'Non enregistré : la base de données a refusé la modification. Réessayez.' }

export default async function EditArticle({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  if (!isUuid(params.id)) notFound()
  const editor = atLeast(role, 'editor')
  const { data: a } = await sb.from('articles').select('*').eq('id', params.id).single()
  if (!a) notFound()
  if (!editor && (a.author_id !== user.id || a.status === 'published')) redirect('/dashboard/articles?err=interdit')

  const [{ data: me }, { data: all }, { data: authors }] = await Promise.all([
    sb.from('profiles').select('name').eq('id', user.id).single(),
    sb.from('categories').select('id,name,parent_id,position').order('position'),
    editor ? sb.from('authors').select('id,name,title').eq('is_active', true).order('name') : { data: [] },
  ])
  const { data: notes } = await sb.from('article_notes').select('id,body,user_id,created_at,profiles:user_id(name)').eq('article_id', a.id).order('created_at')
  const tops = (all || []).filter(c => !c.parent_id)
  const cats = tops.flatMap(t => [{ id: t.id, label: t.name }, ...(all || []).filter(c => c.parent_id === t.id).map(c => ({ id: c.id, label: `${t.name} › ${c.name}` }))])
  // Anciens articles (phase 3) : le texte est converti en paragraphes pour être modifiable par blocs.
  const blocks = Array.isArray(a.blocks) && a.blocks.length ? a.blocks : String(a.body || '').split(/\n+/).filter(Boolean).map(text => ({ type: 'p', text }))
  return (<>
    <div className="dash-head"><h1>Modifier l’article</h1><Link href={`/dashboard/articles/${a.id}/revisions`} className="btn ghost">Historique des versions</Link></div>
    {searchParams?.restaure && <p className="notice ok" role="status">Version restaurée.</p>}
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}
    <ArticleForm action={updateArticle} cats={cats} authors={authors || []} meName={me?.name || 'vous'} isEditor={editor}
      initial={{ id: a.id, status: a.status, title: a.title, subtitle: a.subtitle, category_id: a.category_id, writer_id: a.writer_id, summary: a.summary,
        image_url: a.image_url, image_caption: a.image_caption, is_demo: a.is_demo, is_breaking: a.is_breaking, fact_verdict: a.fact_verdict, fact_claim: a.fact_claim, tags: a.tags, blocks,
        updated_at: a.updated_at, published_at: a.published_at, scheduled: a.status === 'published' && !!a.published_at && new Date(a.published_at).getTime() > Date.now() }} />
    <section className="panel notes" id="notes"><h2 className="wx-h">Notes de la rédaction</h2><p className="meta">{NOTE_W}</p>
      {(notes || []).map(n => <div key={n.id} className="note"><div><b>{n.profiles?.name || 'Rédaction'}</b> <span className="meta">{new Date(n.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kinshasa' })}</span><p>{n.body}</p></div>
        {(n.user_id === user.id || atLeast(role, 'admin')) && <form action={deleteNote}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="nid" value={n.id} /><ConfirmButton className="btn ghost sm" message="Supprimer cette note ?">Supprimer</ConfirmButton></form>}</div>)}
      <form action={addNote} className="note-form"><input type="hidden" name="id" value={a.id} /><textarea name="body" rows={3} maxLength={1000} placeholder="Ex. : vérifier le chiffre du 3e paragraphe avant publication" required aria-label="Nouvelle note" /><button className="btn sm">Ajouter la note</button></form></section>
  </>)
}
