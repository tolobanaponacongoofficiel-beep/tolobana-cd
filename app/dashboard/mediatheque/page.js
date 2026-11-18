import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import MediaUploader from './MediaUploader'
import CopyButton from './CopyButton'
import { deleteFile, updateMeta } from './actions'
import { listMedia, FOLDER_LABEL as label } from '@/lib/media'
import '../../components/phase26.css'
import '../../components/phase27.css'
export const metadata = { title: 'Médiathèque' }
export const dynamic = 'force-dynamic'
const FILTERS = [['', 'Tout'], ['image', 'Images'], ['pdf', 'PDF'], ['doc', 'Documents'], ['audio', 'Audio'], ['video', 'Vidéos']]
const ERR = { 1: 'La suppression est réservée aux administrateurs.', 2: 'Fichier invalide.', 3: 'Suppression impossible pour le moment.', 4: 'Accès réservé à la rédaction.', 5: 'Enregistrement impossible. Avez-vous exécuté phase27.sql ?' }
const size = n => !n ? '' : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} Ko` : `${(n / 1048576).toFixed(1)} Mo`
export default async function Mediatheque({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) redirect('/dashboard')
  const { files, folders } = await listMedia(sb)
  const k = searchParams?.type || '', f = searchParams?.dossier || '', q = String(searchParams?.q || '').toLowerCase().trim()
  const shown = files.filter(x => (!k || x.kind === k) && (!f || x.folder === f) && (!q || `${x.title} ${x.name}`.toLowerCase().includes(q))).slice(0, 120)
  const qs = o => { const u = new URLSearchParams({ ...(k && { type: k }), ...(f && { dossier: f }), ...(q && { q }), ...o }); [...u].forEach(([a, b]) => { if (!b) u.delete(a) }); const s = u.toString(); return `/dashboard/mediatheque${s ? '?' + s : ''}` }
  return (<>
    <div className="dash-head"><h1>Médiathèque</h1></div>
    {ERR[searchParams?.err] && <p className="err" role="alert">{ERR[searchParams.err]}</p>}
    {searchParams?.ok && <p className="ok" role="status">Fichier supprimé.</p>}
    {searchParams?.saved && <p className="ok" role="status">Modifications enregistrées.</p>}
    <MediaUploader />
    <div className="mt-bar">{FILTERS.map(([v, l]) => <Link key={v} href={qs({ type: v })} className={k === v ? 'on' : ''}>{l}</Link>)}
      <form action="/dashboard/mediatheque" style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>{k && <input type="hidden" name="type" value={k} />}{f && <input type="hidden" name="dossier" value={f} />}<input name="q" defaultValue={q} placeholder="Rechercher un fichier" aria-label="Rechercher un fichier" /><button className="btn">OK</button></form></div>
    {folders.length > 1 && <div className="mt-bar"><span className="meta">Dossier :</span><Link href={qs({ dossier: '' })} className={!f ? 'on' : ''}>Tous</Link>{folders.map(d => <Link key={d} href={qs({ dossier: d })} className={f === d ? 'on' : ''}>{label[d] || d}</Link>)}</div>}
    <p className="meta">{files.length} fichier(s) au total{shown.length !== files.length ? `, ${shown.length} affiché(s)` : ''}.</p>
    {shown.length ? <div className="mt-grid">{shown.map(x => <div key={x.path} className="mt-item">
      <a className="mt-th" href={x.url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${x.title || x.name}`}>{x.kind === 'image' ? <img src={x.url} alt="" loading="lazy" /> : <b>{x.ext.toUpperCase()}</b>}</a>
      <div className="mt-info"><span className="mt-name" title={x.title || x.name}>{x.title || x.name}</span><span className="meta">{label[x.folder] || x.folder}{x.bytes ? ` · ${size(x.bytes)}` : ''}{x.at ? ` · ${new Date(x.at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa' })}` : ''}</span>
        <div className="mt-act"><CopyButton url={x.url} /><a className="btn ghost" href={x.url} target="_blank" rel="noopener noreferrer">Ouvrir</a>
          <details className="mt-edit"><summary className="btn ghost">Modifier</summary>
            <form action={updateMeta}><input type="hidden" name="path" value={x.path} />
              <label>Titre<input name="title" defaultValue={x.title} placeholder={x.name} maxLength={120} /></label>
              {x.kind === 'image' && <label>Texte alternatif<input name="alt" defaultValue={x.alt} maxLength={200} placeholder="Décrit l'image (accessibilité)" /></label>}
              <label>Légende<input name="caption" defaultValue={x.caption} maxLength={300} /></label>
              <p className="meta">Fichier : {x.name}. Le renommage change le titre affiché, pas l'adresse du fichier : les articles déjà publiés ne sont pas touchés.</p>
              <button className="btn">Enregistrer</button></form></details>
          {atLeast(role, 'admin') && <form action={deleteFile}><input type="hidden" name="path" value={x.path} /><button className="btn ghost" title="Les articles qui utilisent ce fichier perdront l'image">Supprimer</button></form>}</div></div></div>)}</div>
      : <p className="empty">Aucun fichier pour ce filtre.</p>}
  </>)
}
