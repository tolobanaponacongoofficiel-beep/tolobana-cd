import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid, blocksToText } from '@/lib/blocks'
import { lineDiff } from '@/lib/wp'
import ConfirmButton from '../../../../components/ConfirmButton'
import { restoreRevision } from '../../actions'
import '../../../../components/phase32.css'
export const metadata = { title: 'Versions de l’article' }
const when = iso => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kinshasa' })
export default async function Revisions({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/')
  if (!isUuid(params.id)) notFound()
  const editor = atLeast(role, 'editor')
  const { data: a } = await sb.from('articles').select('id,title,status,author_id,blocks,body').eq('id', params.id).single()
  if (!a) notFound()
  if (!editor && a.author_id !== user.id) redirect('/dashboard/articles?err=interdit')
  const canRestore = editor || (a.author_id === user.id && a.status !== 'published')
  const { data: revs, error } = await sb.from('article_revisions').select('id,title,note,created_at,saved_by,profiles:saved_by(name)').eq('article_id', a.id).order('created_at', { ascending: false }).limit(40)
  const sel = isUuid(searchParams?.v) ? (await sb.from('article_revisions').select('*').eq('id', searchParams.v).eq('article_id', a.id).single()).data : null
  const cur = `${a.title}\n${blocksToText(Array.isArray(a.blocks) && a.blocks.length ? a.blocks : [{ type: 'p', text: a.body || '' }])}`
  const diff = sel ? lineDiff(`${sel.title}\n${blocksToText(sel.blocks || [])}`, cur) : null
  const changed = diff ? diff.filter(d => d.t !== 'same').length : 0
  return (<>
    <div className="dash-head"><h1>Versions de l’article</h1><Link href={`/dashboard/articles/${a.id}`} className="btn ghost">Retour à l’article</Link></div>
    <p className="meta">{a.title}. Chaque enregistrement garde la version précédente (40 versions conservées).</p>
    {error && <p className="notice bad" role="alert">L’historique n’est pas encore activé : exécutez phase32.sql dans Supabase.</p>}
    <div className="rev-grid">
      <section className="panel"><h2 className="wx-h">Historique</h2>
        {!revs?.length && !error && <p className="meta">Aucune ancienne version pour le moment : elles apparaissent à chaque modification.</p>}
        <ul className="rev-list">{(revs || []).map(r => <li key={r.id} className={sel?.id === r.id ? 'on' : undefined}><Link href={`/dashboard/articles/${a.id}/revisions?v=${r.id}`}><b>{when(r.created_at)}</b><span className="meta">{r.profiles?.name || 'Rédaction'}{r.note ? ` · ${r.note}` : ''}</span></Link></li>)}</ul></section>
      <section className="panel"><h2 className="wx-h">Comparaison</h2>
        {!sel && <p className="meta">Choisissez une version à gauche pour voir ce qui a changé depuis.</p>}
        {sel && <>
          <p className="meta">Version du {when(sel.created_at)} comparée à la version actuelle : {changed ? `${changed} ligne(s) différente(s).` : 'aucune différence.'}</p>
          <div className="diff" role="region" aria-label="Différences">{diff.map((d, i) => <p key={i} className={d.t}>{d.t === 'add' ? '+ ' : d.t === 'del' ? '− ' : ''}{d.s || ' '}</p>)}</div>
          <p className="meta">Rouge (−) : présent dans cette ancienne version, absent aujourd’hui. Vert (+) : ajouté depuis.</p>
          {canRestore && <form action={restoreRevision}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="rev" value={sel.id} /><ConfirmButton className="btn" message="Restaurer cette version ? La version actuelle sera gardée dans l’historique.">Restaurer cette version</ConfirmButton></form>}</>}
      </section>
    </div>
  </>)
}
