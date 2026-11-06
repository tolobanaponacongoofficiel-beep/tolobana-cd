import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { updateArticle } from '../../actions'
import ArticleForm from '../../nouvel-article/ArticleForm'

export const metadata = { title: 'Modifier un article' }
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
  const tops = (all || []).filter(c => !c.parent_id)
  const cats = tops.flatMap(t => [{ id: t.id, label: t.name }, ...(all || []).filter(c => c.parent_id === t.id).map(c => ({ id: c.id, label: `${t.name} › ${c.name}` }))])
  // Anciens articles (phase 3) : le texte est converti en paragraphes pour être modifiable par blocs.
  const blocks = Array.isArray(a.blocks) && a.blocks.length ? a.blocks : String(a.body || '').split(/\n+/).filter(Boolean).map(text => ({ type: 'p', text }))
  return (<>
    <div className="dash-head"><h1>Modifier l’article</h1></div>
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}
    <ArticleForm action={updateArticle} cats={cats} authors={authors || []} meName={me?.name || 'vous'} isEditor={editor}
      initial={{ id: a.id, status: a.status, title: a.title, subtitle: a.subtitle, category_id: a.category_id, writer_id: a.writer_id, summary: a.summary,
        image_url: a.image_url, image_caption: a.image_caption, is_demo: a.is_demo, is_breaking: a.is_breaking, tags: a.tags, blocks,
        updated_at: a.updated_at, published_at: a.published_at, scheduled: a.status === 'published' && !!a.published_at && new Date(a.published_at).getTime() > Date.now() }} />
  </>)
}
