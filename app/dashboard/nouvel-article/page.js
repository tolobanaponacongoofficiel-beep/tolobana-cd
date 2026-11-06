import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { createArticle } from '../actions'
import ArticleForm from './ArticleForm'

export const metadata = { title: 'Écrire un article' }

export default async function NewArticle() {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  const editor = atLeast(role, 'editor')
  const [{ data: me }, { data: all }, { data: authors }] = await Promise.all([
    sb.from('profiles').select('name').eq('id', user.id).single(),
    sb.from('categories').select('id,name,parent_id,position').order('position'),
    editor ? sb.from('authors').select('id,name,title').eq('is_active', true).order('name') : { data: [] },
  ])
  const tops = (all || []).filter(c => !c.parent_id)
  const cats = tops.flatMap(t => [{ id: t.id, label: t.name }, ...(all || []).filter(c => c.parent_id === t.id).map(c => ({ id: c.id, label: `${t.name} › ${c.name}` }))])
  return (<>
    <div className="dash-head"><h1>Écrire un article</h1></div>
    <ArticleForm action={createArticle} cats={cats} authors={authors || []} meName={me?.name || 'vous'} isEditor={editor} />
  </>)
}
