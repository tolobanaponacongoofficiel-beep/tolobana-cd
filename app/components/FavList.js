'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readFav, writeFav } from './BookmarkButton'
import './phase14.css'
export default function FavList() {
  const [slugs, setSlugs] = useState(null), [items, setItems] = useState([]), [saver, setSaver] = useState(false)
  useEffect(() => {
    setSaver(/(?:^|; )tl_saver=1/.test(document.cookie))
    const a = readFav(); setSlugs(a)
    if (!a.length) return
    fetch(`/api/favoris?s=${encodeURIComponent(a.slice(0, 40).join(','))}`).then(r => r.ok ? r.json() : { items: [] }).then(j => setItems(j.items || [])).catch(() => {})
  }, [])
  function remove(slug) { const a = readFav().filter(x => x !== slug); writeFav(a); setSlugs(a); setItems(i => i.filter(x => x.slug !== slug)) }
  if (slugs === null) return <p className="meta">Chargement…</p>
  if (!slugs.length) return <p className="empty">Vous n’avez encore rien enregistré. Sur un article, touchez « Lire plus tard » pour le retrouver ici.</p>
  const ordered = slugs.map(s => items.find(i => i.slug === s)).filter(Boolean)
  return (<ul className="fav-list">
    {ordered.map(a => (<li key={a.slug}>
      {a.image_url && !saver && <img src={a.image_url} alt="" loading="lazy" />}
      <div><Link href={`/article/${a.slug}`}>{a.title}</Link>
        <div className="meta">{a.category ? `${a.category} · ` : ''}{new Date(a.published_at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
      <button type="button" className="fav-x" onClick={() => remove(a.slug)} aria-label={`Retirer « ${a.title} » des favoris`}>×</button></li>))}
    {slugs.length > 0 && !ordered.length && <li className="meta">Ces articles ne sont plus disponibles.</li>}
  </ul>)
}
