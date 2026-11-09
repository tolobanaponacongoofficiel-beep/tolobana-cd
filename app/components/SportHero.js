import Link from 'next/link'
import { COMPS } from '@/lib/sport'
import './phase13.css'
export function SportHero({ title, sub, crumb }) {
  return (<header className="sp-hero">
    <div className="sp-hero-in">
      {crumb && <div className="sp-crumb">{crumb}</div>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div></header>)
}
export function CompNav({ current }) {
  return (<nav className="sp-comps" aria-label="Compétitions">
    <Link href="/sport" className={!current ? 'on' : ''}>Tout le sport</Link>
    {COMPS.map(c => <Link key={c.code} href={`/sport/${c.code.toLowerCase()}`} className={current === c.code ? 'on' : ''}>{c.name}</Link>)}
  </nav>)
}
