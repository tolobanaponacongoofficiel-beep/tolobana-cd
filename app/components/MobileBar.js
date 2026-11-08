'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './phase11.css'
const get = k => { try { return localStorage.getItem(k) } catch { return null } }
const set = (k, v) => { try { localStorage.setItem(k, v) } catch {} }
// Barre de navigation du téléphone : Accueil, En continu (point rouge s'il y a du neuf), Direct (s'allume pendant un direct), Stories, Compte.
export default function MobileBar({ liveSlug, latestAt, user, staff }) {
  const path = usePathname() || '/'
  const [fresh, setFresh] = useState(false)
  useEffect(() => {
    if (!latestAt) return
    const seen = get('tolobana-seen')
    if (path === '/en-continu' || !seen) { set('tolobana-seen', latestAt); setFresh(false) }
    else setFresh(new Date(latestAt) > new Date(seen))
  }, [path, latestAt])
  if (path.startsWith('/dashboard') || path.startsWith('/login')) return null
  const on = p => (p === '/' ? path === '/' : path.startsWith(p)) ? 'page' : undefined
  const account = staff ? { href: '/dashboard', label: 'Mon espace', icon: '👤' } : user ? { href: '/', label: 'Compte', icon: '👤' } : { href: '/login', label: 'Compte', icon: '👤' }
  const items = [
    { href: '/', label: 'Accueil', icon: '🏠' },
    { href: '/en-continu', label: 'En continu', icon: '🕒', dot: fresh },
    { href: liveSlug ? `/direct/${liveSlug}` : '/direct', label: 'Direct', icon: '🔴', live: !!liveSlug, match: '/direct' },
    { href: '/stories', label: 'Stories', icon: '🎞️' },
    account,
  ]
  return (
    <nav className="mbar" aria-label="Navigation rapide">
      {items.map(i => (
        <Link key={i.label} href={i.href} aria-current={on(i.match || i.href)} className={i.live ? 'is-live' : ''}>
          <span className="ic" aria-hidden="true">{i.icon}{i.dot && <i className="dot" />}</span>
          <span className="lb">{i.label}{i.dot ? <span className="sr-only"> : du nouveau</span> : null}</span>
        </Link>))}
    </nav>)
}
