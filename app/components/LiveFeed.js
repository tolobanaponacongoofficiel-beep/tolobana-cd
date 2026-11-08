'use client'
import { useEffect, useState } from 'react'
import LazyMedia from './LazyMedia'
import './phase10.css'
const hm = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Kinshasa', hour: '2-digit', minute: '2-digit' })
const day = iso => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa', day: 'numeric', month: 'long' })
// Fil du direct : se met à jour toutes les 30 secondes tant que le direct est en cours et que l'onglet est visible.
export default function LiveFeed({ slug, initial, initialStatus, saver }) {
  const [entries, setEntries] = useState(initial)
  const [status, setStatus] = useState(initialStatus)
  const [when, setWhen] = useState(null)
  useEffect(() => {
    if (status !== 'live') return
    let stop = false
    async function tick() {
      if (document.hidden) return
      try {
        const r = await fetch(`/api/direct/${slug}`, { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        if (stop) return
        setEntries(j.entries || []); setStatus(j.status || 'live'); setWhen(new Date())
      } catch {}
    }
    const t = setInterval(tick, 30000)
    const vis = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', vis)
    return () => { stop = true; clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [slug, status])
  return (<>
    <p className="live-status" role="status">{status === 'live' ? `Mise à jour automatique toutes les 30 secondes${when ? ` · dernière vérification à ${hm(when.toISOString())}` : ''}` : 'Ce direct est terminé.'}</p>
    <ol className="live-feed">
      {entries.map(e => (
        <li key={e.id} className={`live-entry${e.important ? ' important' : ''}`}>
          <time dateTime={e.created_at}>{e.important ? '⚡ Important · ' : ''}{hm(e.created_at)} · {day(e.created_at)}</time>
          <p>{e.body}</p>
          {e.image_url && (saver ? <LazyMedia src={e.image_url} alt="" /> : <img src={e.image_url} alt="" loading="lazy" />)}
        </li>))}
      {!entries.length && <li className="live-entry"><p>Le direct démarre. Les premières informations arrivent.</p></li>}
    </ol></>)
}
