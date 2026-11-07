import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import ImageUploader from '../../../components/ImageUploader'
import ConfirmButton from '../../../components/ConfirmButton'
import { updateDossier, deleteDossier, addToDossier, removeFromDossier } from '../actions'
export const metadata = { title: 'Gérer un dossier' }
export default async function Manage({ params, searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  if (!isUuid(params.id)) notFound()
  const { data: d } = await sb.from('dossiers').select('*').eq('id', params.id).maybeSingle()
  if (!d) notFound()
  const { data: links } = await sb.from('dossier_articles').select('articles(id,title,status)').eq('dossier_id', d.id)
  const inside = (links || []).map(l => l.articles).filter(Boolean)
  const q = String(searchParams?.q || '').replace(/[,()%*\\_"]/g, ' ').trim().slice(0, 60)
  let cand = sb.from('articles').select('id,title').eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(30)
  if (q) cand = cand.ilike('title', `%${q}%`)
  const { data: found } = await cand
  const have = new Set(inside.map(a => a.id)), choices = (found || []).filter(a => !have.has(a.id))
  return (<>
    <div className="dash-head"><h1>{d.title}</h1><p className="meta"><Link href="/dashboard/dossiers">← Dossiers</Link> · <Link href={`/dossiers/${d.slug}`}>Voir sur le site</Link></p></div>
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Informations</h2>
      <form className="f" action={updateDossier}><input type="hidden" name="id" value={d.id} />
        <label>Titre<input name="title" required maxLength={200} defaultValue={d.title} /></label>
        <label>Description<textarea name="description" rows={3} maxLength={1000} defaultValue={d.description || ''} /></label>
        <ImageUploader name="cover_url" value={d.cover_url || ''} folder="articles" label="Image de couverture" />
        <label><input type="checkbox" name="is_published" defaultChecked={d.is_published} style={{ width: 'auto' }} /> Publié</label>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn">Enregistrer</button></div></form>
      <form action={deleteDossier} style={{ marginTop: 10 }}><input type="hidden" name="id" value={d.id} /><ConfirmButton message="Supprimer ce dossier ? Les articles ne sont pas supprimés.">Supprimer le dossier</ConfirmButton></form></section>
    <section className="panel"><h2>Articles du dossier ({inside.length})</h2>
      {!inside.length && <p className="meta">Aucun article pour le moment.</p>}
      {inside.map(a => <form key={a.id} action={removeFromDossier} className="qrow"><input type="hidden" name="id" value={d.id} /><input type="hidden" name="article" value={a.id} />
        <span><b>{a.title}</b><span className="meta">{a.status === 'published' ? 'publié' : a.status}</span></span><button className="btn sm gray">Retirer</button></form>)}</section>
    <section className="panel"><h2>Ajouter des articles</h2>
      <form method="get" className="f" style={{ margin: 0 }}><label>Rechercher dans les articles publiés<input name="q" defaultValue={q} placeholder="Mot du titre" /></label><div><button className="btn sm gray">Rechercher</button></div></form>
      <form className="f" action={addToDossier}><input type="hidden" name="id" value={d.id} />
        {choices.map(a => <label key={a.id} style={{ display: 'flex', gap: 8 }}><input type="checkbox" name="article" value={a.id} style={{ width: 'auto' }} /> {a.title}</label>)}
        {!choices.length && <p className="meta">Aucun article à ajouter.</p>}
        {choices.length > 0 && <div><button className="btn">Ajouter la sélection</button></div>}</form></section></>)
}
