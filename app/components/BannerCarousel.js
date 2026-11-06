'use client'
import { useEffect, useRef, useState } from 'react'

// Slideshow de bannières : défilement automatique (5 s), flèches, points, balayage au doigt, flèches du clavier.
export default function BannerCarousel({ slides }) {
  const n = slides.length
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef(null)
  const go = d => setI(x => (x + d + n) % n)
  useEffect(() => {
    if (n < 2 || paused) return
    const t = setInterval(() => setI(x => (x + 1) % n), 5000)
    return () => clearInterval(t)
  }, [n, paused])
  return (
    <div className="banner" role="region" aria-roledescription="carousel" aria-label="Nos partenaires" tabIndex={0}
      onKeyDown={e => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1) }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={e => { startX.current = e.touches[0].clientX; setPaused(true) }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - (startX.current ?? 0)
        if (n > 1 && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        setPaused(false)
      }}>
      <div className="banner-view">
        <div className="banner-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {slides.map((s, k) => {
            const img = <img src={s.image} alt={s.name} loading={k === 0 ? 'eager' : 'lazy'} draggable={false} />
            return (
              <div key={s.id} className="banner-slide" aria-hidden={k !== i}>
                {s.link ? <a href={s.link} target="_blank" rel="noopener noreferrer sponsored" tabIndex={k === i ? 0 : -1}>{img}</a> : img}
              </div>)
          })}
        </div>
        {n > 1 && <>
          <button type="button" className="banner-nav prev" aria-label="Bannière précédente" onClick={() => go(-1)}>‹</button>
          <button type="button" className="banner-nav next" aria-label="Bannière suivante" onClick={() => go(1)}>›</button></>}
      </div>
      {n > 1 && <div className="banner-dots">{slides.map((s, k) => (
        <button key={s.id} type="button" aria-label={`Bannière ${k + 1} sur ${n}`} aria-current={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)} />))}</div>}
    </div>)
}
