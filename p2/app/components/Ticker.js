import Link from 'next/link'
export default function Ticker({ items }) {
  if (!items?.length) return null
  const row = (hidden) => (
    <div className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map(a => <Link key={a.slug} href={`/article/${a.slug}`} tabIndex={hidden ? -1 : undefined}>{a.title}</Link>)}
    </div>)
  return (
    <div className="ticker" role="marquee" aria-label="Dernière minute">
      <span className="ticker-label">DERNIÈRE MINUTE</span>
      <div className="ticker-view"><div className="ticker-track">{row(false)}{row(true)}</div></div>
    </div>)
}
