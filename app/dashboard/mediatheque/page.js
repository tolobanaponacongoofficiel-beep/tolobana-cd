import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import MediaUploader from './MediaUploader'
import CopyButton from './CopyButton'
import { deleteFile } from './actions'
import '../../components/phase26.css'
export const metadata = { title: 'Médiathèque' }
export const dynamic = 'force-dynamic'
const KIND = ext => /^(jpe?g|png|webp|gif|avif)$/.test(ext) ? 'image' : ext === 'pdf' ? 'pdf' : /^(mp3|m4a|wav)$/.test(ext) ? 'audio' : /^(mp4|webm|mov)$/.test(ext) ? 'video' : 'doc'
const FILTERS = [['', 'Tout'], ['image', 'Images'], ['pdf', 'PDF'], ['doc', 'Documents'], ['audio', 'Audio'], ['video', 'Vidéos']]
const ERR = { 1: 'La suppression est réservée aux administrateurs.', 2: 'Fichier invalide.', 3: 'Suppression impossible pour le moment.' }
const size = n => !n ? '' : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} Ko` : `${(n / 1048576).toFixed(1)} Mo`
const label = { articles: 'Articles', library: 'Médiathèque', profiles: 'Profils', authors: 'Rédacteurs' }
export default async function Mediatheque({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/dashboard')
  const bucket = sb.storage.from('media'), opt = { limit: 200, sortBy: { column: 'created_at', order: 'desc' } }
  const root = await bucket.list('', { limit: 100 })
  const folders = (root.data || []).filter(x => !x.id).map(x => x.name)
  const lists = await Promise.all(folders.map(async f => { const r = await bucket.list(f, opt); return (r.data || []).filter(x => x.id).map(x => ({ ...x, folder: f, path: `${f}/${x.name}` })) }))
  const files = lists.flat().map(x => { const ext = (x.name.split('.').pop() || '').toLowerCase(); return { ...x, ext, kind: KIND(ext), url: bucket.getPublicUrl(x.path).data.publicUrl, at: x.created_at || x.updated_at || '', bytes: x.metadata?.size } })
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
  const k = searchParams?.type || '', f = searchParams?.dossier || '', q = String(searchParams?.q || '').toLowerCase().trim()
  const shown = files.filter(x => (!k || x.kind === k) && (!f || x.folder === f) && (!q || x.name.toLowerCase().includes(q))).slice(0, 120)
  const qs = o => { const u = new URLSearchParams({ ...(k && { type: k }), ...(f && { dossier: f }), ...(q && { q }), ...o }); [...u].forEach(([a, b]) => { if (!b) u.delete(a) }); const s = u.toString(); return `/dashboard/mediatheque${s ? '?' + s : ''}` }
  return (<>
    <div className="dash-head"><h1>Médiathèque</h1></div>
    {ERR[searchParams?.err] && <p className="err" role="alert">{ERR[searchParams.err]}</p>}
    {searchParams?.ok && <p className="ok" role="status">Fichier supprimé.</p>}
    <MediaUploader />
    <div className="mt-bar">{FILTERS.map(([v, l]) => <Link key={v} href={qs({ type: v })} className={k === v ? 'on' : ''}>{l}</Link>)}
      <form action="/dashboard/mediatheque" style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>{k && <input type="hidden" name="type" value={k} />}{f && <input type="hidden" name="dossier" value={f} />}<input name="q" defaultValue={q} placeholder="Rechercher un fichier" aria-label="Rechercher un fichier" /><button className="btn">OK</button></form></div>
    {folders.length > 1 && <div className="mt-bar"><span className="meta">Dossier :</span><Link href={qs({ dossier: '' })} className={!f ? 'on' : ''}>Tous</Link>{folders.map(d => <Link key={d} href={qs({ dossier: d })} className={f === d ? 'on' : ''}>{label[d] || d}</Link>)}</div>}
    <p className="meta">{files.length} fichier(s) au total{shown.length !== files.length ? `, ${shown.length} affiché(s)` : ''}.</p>
    {shown.length ? <div className="mt-grid">{shown.map(x => <div key={x.path} className="mt-item">
      <a className="mt-th" href={x.url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${x.name}`}>{x.kind === 'image' ? <img src={x.url} alt="" loading="lazy" /> : <b>{x.ext.toUpperCase()}</b>}</a>
      <div className="mt-info"><span className="mt-name" title={x.name}>{x.name}</span><span className="meta">{label[x.folder] || x.folder}{x.bytes ? ` · ${size(x.bytes)}` : ''}{x.at ? ` · ${new Date(x.at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa' })}` : ''}</span>
        <div className="mt-act"><CopyButton url={x.url} /><a className="btn ghost" href={x.url} target="_blank" rel="noopener noreferrer">Ouvrir</a>
          {atLeast(role, 'admin') && <form action={deleteFile}><input type="hidden" name="path" value={x.path} /><button className="btn ghost">Supprimer</button></form>}</div></div></div>)}</div>
      : <p className="empty">Aucun fichier pour ce filtre.</p>}
  </>)
}
