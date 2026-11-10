'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './phase16.css'
const on = (p, href) => !href.includes('?') && (href === '/' ? p === '/' : p === href || p.startsWith(href + '/'))
// Barre de rubriques : soulignement de la page en cours ; « Plus » regroupe le reste sur grand écran.
export default function MainNav({ items, count }) {
  const p = usePathname() || '/'
  const L = i => <Link key={i.href} href={i.href} className={on(p, i.href) ? 'on' : undefined} aria-current={on(p, i.href) ? 'page' : undefined}>{i.label}</Link>
  const first = items.slice(0, count), rest = items.slice(count)
  return (<>
    <nav className="menu menu-all" aria-label="Rubriques">{items.map(L)}</nav>
    <nav className="menu menu-split" aria-label="Rubriques">{first.map(L)}
      {rest.length > 0 && <div className="more"><button type="button" className="more-btn" aria-haspopup="true">Plus ▾</button><div className="more-pop">{rest.map(L)}</div></div>}</nav></>)
}
