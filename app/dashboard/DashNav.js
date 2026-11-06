'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashNav({ items }) {
  const path = usePathname()
  return (
    <nav className="dash-nav" aria-label="Espace rédaction">
      {items.map(i => {
        const on = i.href === '/dashboard' ? path === '/dashboard' : path.startsWith(i.href)
        return <Link key={i.href} href={i.href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>{i.label}</Link>
      })}
    </nav>)
}
