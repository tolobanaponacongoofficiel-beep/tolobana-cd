'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './phase26.css'
const I = {
  tv: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m9 3 3 3 3-3M10 10l5 3-5 3z"/>',
  live: '<circle cx="12" cy="12" r="2"/><path d="M7.800 7.800a6 6 0 0 0 0 8.400M16.200 7.800a6 6 0 0 1 0 8.400M4.900 4.900a10 10 0 0 0 0 14.200M19.100 4.900a10 10 0 0 1 0 14.200"/>',
  story: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="m11 9 3 2-3 2zM3 8v8M21 8v8"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  shield: '<path d="M12 3 5 6v5c0 4.500 3 8 7 10 4-2 7-5.500 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  sun: '<circle cx="9" cy="9" r="3"/><path d="M9 2v2M2 9h2M4 4l1.500 1.500M14 4l-1.500 1.500"/><path d="M8 20h9a4 4 0 0 0 .5-8A5.500 5.500 0 0 0 7 13a3.500 3.500 0 0 0 1 7z"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15 9.500A6 6 0 1 1 9.500 15M7 9h4M9 7v4"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  poll: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  star: '<path d="m12 3 2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  mega: '<path d="M3 11v3a1 1 0 0 0 1 1h2l8 4V6L6 10H4a1 1 0 0 0-1 1zM18 9a4 4 0 0 1 0 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="m12 8 3.500 2.500-1.300 4h-4.400l-1.300-4zM12 3v5M20.500 9.500 15.500 10.500M3.500 9.500l5 1M17 19.500l-2.800-5M7 19.500l2.800-5"/>',
  grid: '<circle cx="5" cy="5" r="1.600"/><circle cx="12" cy="5" r="1.600"/><circle cx="19" cy="5" r="1.600"/><circle cx="5" cy="12" r="1.600"/><circle cx="12" cy="12" r="1.600"/><circle cx="19" cy="12" r="1.600"/><circle cx="5" cy="19" r="1.600"/><circle cx="12" cy="19" r="1.600"/><circle cx="19" cy="19" r="1.600"/>',
}
const Ic = ({ k }) => <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: I[k] }} />
// Tous les services du site derrière un seul bouton : un clic, la liste complète, regroupée.
const GROUPS = [
  [{ href: '/tv', label: 'Tolobana TV', i: 'tv' }, { href: '/direct-foot', label: 'Direct Foot', i: 'ball' }, { href: '/direct', label: 'Directs et conférences', i: 'live' }, { href: '/stories', label: 'Stories', i: 'story' }, { href: '/dossiers', label: 'Dossiers', i: 'folder' }, { href: '/verification', label: 'Vérification', i: 'shield' }],
  [{ href: '/meteo', label: 'Météo', i: 'sun' }, { href: '/taux', label: 'Taux de change', i: 'coins' }, { href: '/agenda', label: 'Agenda', i: 'cal' }, { href: '/sondages', label: 'Sondages', i: 'poll' }, { href: '/services', label: 'Services pratiques', i: 'grid' }],
  [{ href: '/favoris', label: 'Mes favoris', i: 'star' }, { href: '/alertes', label: 'Alertes info', i: 'bell' }, { href: '/annoncer', label: 'Annoncer chez nous', i: 'mega' }, { href: '/contact', label: 'Contact', i: 'mail' }],
]
export default function ServicesMenu({ rubriques = [] }) {
  const p = usePathname() || '/', [open, setOpen] = useState(false), box = useRef(null)
  useEffect(() => { setOpen(false) }, [p])
  useEffect(() => {
    if (!open) return
    const k = e => { if (e.key === 'Escape') setOpen(false) }
    const c = e => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', k); document.addEventListener('mousedown', c); document.addEventListener('touchstart', c)
    return () => { document.removeEventListener('keydown', k); document.removeEventListener('mousedown', c); document.removeEventListener('touchstart', c) }
  }, [open])
  return (<div className="svc" ref={box}>
    <button type="button" className={`svc-btn${open ? ' open' : ''}`} aria-expanded={open} aria-haspopup="true" aria-label="Rubriques et services" aria-controls="svc-panel" onClick={() => setOpen(o => !o)}><Ic k="grid" /><span className="sr-only">Rubriques et services</span></button>
    <div id="svc-panel" className="svc-panel" hidden={!open}>
      {rubriques.length > 0 && <div className="svc-grp svc-rub">{rubriques.map(r => <div key={r.slug} className="svc-r"><Link href={`/?rubrique=${r.slug}`} className="svc-rh">{r.name}</Link>{r.children.map(c => <Link key={c.slug} href={`/?rubrique=${c.slug}`} className="svc-rc">{c.name}</Link>)}</div>)}</div>}
      {GROUPS.map((g, n) => <div key={n} className="svc-grp">{g.map(x => <Link key={x.href} href={x.href} className={p === x.href || p.startsWith(x.href + '/') ? 'on' : undefined}><Ic k={x.i} />{x.label}</Link>)}</div>)}</div></div>)
}
