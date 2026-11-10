'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './phase16.css'
const on = (p, href) => !href.includes('?') && (href === '/' ? p === '/' : p === href || p.startsWith(href + '/'))
// Barre courte (l'essentiel) + bouton « Plus » qui ouvre le reste du site, au clic (aussi sur téléphone).
export default function MainNav({ primary, groups }) {
  const p = usePathname() || '/', [open, setOpen] = useState(false), box = useRef(null)
  useEffect(() => { setOpen(false) }, [p])
  useEffect(() => {
    if (!open) return
    const k = e => { if (e.key === 'Escape') setOpen(false) }
    const c = e => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', k); document.addEventListener('mousedown', c); document.addEventListener('touchstart', c)
    return () => { document.removeEventListener('keydown', k); document.removeEventListener('mousedown', c); document.removeEventListener('touchstart', c) }
  }, [open])
  const L = i => <Link key={i.href} href={i.href} className={on(p, i.href) ? 'on' : undefined} aria-current={on(p, i.href) ? 'page' : undefined}>{i.label}</Link>
  return (<div className="mnav" ref={box}>
    <nav className="menu" aria-label="Rubriques">{primary.map(L)}</nav>
    <button type="button" className={`more-btn${open ? ' open' : ''}`} aria-expanded={open} aria-controls="mnav-panel" onClick={() => setOpen(o => !o)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
      <span>{open ? 'Fermer' : 'Plus'}</span></button>
    <div id="mnav-panel" className="mnav-panel" hidden={!open}>
      <div className="wrap">{groups.filter(g => g.items.length).map(g => (<section key={g.title}><h3>{g.title}</h3><div className="mnav-grid">{g.items.map(L)}</div></section>))}</div></div></div>)
}
