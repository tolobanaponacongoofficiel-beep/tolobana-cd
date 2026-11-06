'use client'
import { useEffect, useState } from 'react'

// Bannière défilante : change toute seule toutes les 5 secondes, s'arrête au survol.
export default function BannerCarousel({ slides }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (slides.length < 2 || paused) return
    const t = setInterval(() => setI(n => (n + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length, paused])
  return (
    <div className="banner" role="region" aria-roledescription="carousel" aria-label="Nos partenaires"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="banner-view">
        {slides.map((s, n) => {
          const img = <img src={s.image} alt={s.name} loading={n === 0 ? 'eager' : 'lazy'} />
          return (
            <div key={s.id} className={n === i ? 'banner-slide on' : 'banner-slide'} aria-hidden={n !== i}>
              {s.link ? <a href={s.link} target="_blank" rel="noopener noreferrer sponsored" tabIndex={n === i ? 0 : -1}>{img}</a> : img}
            </div>)
        })}
      </div>
      {slides.length > 1 && <div className="banner-dots">{slides.map((s, n) => (
        <button key={s.id} type="button" aria-label={`Bannière ${n + 1}`} aria-current={n === i} className={n === i ? 'on' : ''} onClick={() => setI(n)} />))}</div>}
    </div>)
}
