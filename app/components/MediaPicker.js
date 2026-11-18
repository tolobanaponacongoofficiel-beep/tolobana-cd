'use client'
import { useEffect, useState } from 'react'
import './phase27.css'
// Fenêtre de choix d'une image déjà présente dans la médiathèque.
export default function MediaPicker({ onPick, onClose }) {
  const [items, setItems] = useState(null), [q, setQ] = useState(''), [err, setErr] = useState('')
  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/mediatheque?q=${encodeURIComponent(q)}`).then(r => r.ok ? r.json() : Promise.reject()).then(j => { setItems(j.items || []); setErr('') }).catch(() => setErr('Impossible de charger la médiathèque.'))
    }, q ? 250 : 0)
    return () => clearTimeout(t)
  }, [q])
  useEffect(() => { const k = e => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onClose])
  return (<div className="mp-back" role="dialog" aria-modal="true" aria-label="Médiathèque" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="mp">
      <div className="mp-head"><b>Médiathèque</b><input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher une image" aria-label="Rechercher une image" /><button type="button" className="btn ghost sm" onClick={onClose}>Fermer</button></div>
      <div className="mp-body">
        {err && <p className="err" role="alert">{err}</p>}
        {!err && items === null && <p className="meta">Chargement…</p>}
        {items && !items.length && <p className="meta">Aucune image trouvée.</p>}
        <div className="mp-grid">{(items || []).map(x => <button type="button" key={x.url} className="mp-it" title={x.name} onClick={() => onPick(x)}><img src={x.url} alt="" loading="lazy" /><span>{x.name}</span></button>)}</div></div></div></div>)
}
