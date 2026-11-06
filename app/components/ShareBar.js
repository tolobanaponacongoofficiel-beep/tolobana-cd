'use client'
import { useState } from 'react'

export default function ShareBar({ url, title, label = 'Partager cet article' }) {
  const [msg, setMsg] = useState('')
  const u = encodeURIComponent(url), t = encodeURIComponent(title)
  const wa = (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 8.5c0 3.5 3 6.5 6.5 6.5l1.5-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z" fill="currentColor" /></svg>)
  const nets = [
    { k: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}`, bg: '#25D366', ic: wa },
    { k: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, bg: '#1877F2', ic: 'f' },
    { k: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, bg: '#0A66C2', ic: 'in' },
    { k: 'X', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, bg: '#000', ic: 'X' },
  ]
  async function more() {
    try { if (navigator.share) { await navigator.share({ title, url }); return } } catch { return }
    try { await navigator.clipboard.writeText(url); setMsg('Lien copié ✓') } catch { window.prompt('Copiez le lien :', url) }
    setTimeout(() => setMsg(''), 2500)
  }
  return (
    <div className="share" role="group" aria-label={label}>
      {nets.map(n => (
        <a key={n.k} href={n.href} target="_blank" rel="noopener noreferrer" aria-label={`Partager sur ${n.k}`}>
          <span className="ic" style={{ background: n.bg }}>{n.ic}</span><span className="t">{n.k}</span></a>))}
      <button type="button" className="plus" onClick={more} aria-label="Plus d'options : partager ou copier le lien" title="Partager ou copier le lien">+</button>
      <span className="share-msg" role="status">{msg}</span>
    </div>)
}
