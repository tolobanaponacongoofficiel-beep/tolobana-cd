'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './phase11.css'
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  home: <svg viewBox="0 0 24 24" width="24" height="24" {...P}><path d="M3.5 10.8 12 3.8l8.5 7v9.1a1 1 0 0 1-1 1h-4.6v-6.2H9.1v6.2H4.5a1 1 0 0 1-1-1z" /></svg>,
  clock: <svg viewBox="0 0 24 24" width="24" height="24" {...P}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.2V12l3.3 2" /></svg>,
  tv: <svg viewBox="0 0 24 24" width="24" height="24" {...P}><rect x="3" y="6.5" width="18" height="12.5" rx="2.5" /><path d="m8 3 4 3.5L16 3" /><path d="m10.8 10.2 3.4 2.3-3.4 2.3z" fill="currentColor" /></svg>,
  live: <svg viewBox="0 0 24 24" width="24" height="24" {...P}><circle cx="12" cy="12" r="2.2" fill="currentColor" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" /></svg>,
  stories: <svg viewBox="0 0 24 24" width="24" height="24" {...P}><rect x="6.5" y="3.5" width="11" height="17" rx="2.5" /><path d="M3.5 7.5v9M20.5 7.5v9" /><path d="m10.8 9.6 3.4 2.4-3.4 2.4z" fill="currentColor" /></svg>,
  user: <svg viewBox="0 0 24 24" width="24" height="24" {...P}><circle cx="12" cy="8.2" r="3.7" /><path d="M4.8 20c.6-3.6 3.5-5.6 7.2-5.6s6.6 2 7.2 5.6" /></svg>,
}
const get = k => { try { return localStorage.getItem(k) } catch { return null } }
const set = (k, v) => { try { localStorage.setItem(k, v) } catch {} }
// Barre de navigation du téléphone : Accueil, En continu (point rouge s'il y a du neuf), Tolobana TV (point rouge pendant un direct), Stories, Compte.
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
  const account = staff ? { href: '/dashboard', label: 'Mon espace', icon: 'user' } : user ? { href: '/', label: 'Compte', icon: 'user' } : { href: '/login', label: 'Compte', icon: 'user' }
  const items = [
    { href: '/', label: 'Accueil', icon: 'home' },
    { href: '/en-continu', label: 'En continu', icon: 'clock', dot: fresh },
    { href: '/tv', label: 'Tolobana TV', icon: 'tv', dot: !!liveSlug, dotText: ' : direct en cours' },
    { href: '/stories', label: 'Stories', icon: 'stories' },
    account,
  ]
  return (
    <nav className="mbar" aria-label="Navigation rapide">
      {items.map(i => (
        <Link key={i.label} href={i.href} aria-current={on(i.match || i.href)} className={i.live ? 'is-live' : ''}>
          <span className="ic" aria-hidden="true">{ICONS[i.icon]}{i.dot && <i className="dot" />}</span>
          <span className="lb">{i.label}{i.dot ? <span className="sr-only">{i.dotText || ' : du nouveau'}</span> : null}</span>
        </Link>))}
    </nav>)
}
