'use client'
import { useEffect, useRef } from 'react'

// Fine barre de progression de lecture en haut de l'écran (articles).
export default function ReadingProgress() {
  const bar = useRef(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const art = document.querySelector('article.full')
      if (!art || !bar.current) return
      const r = art.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
      bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return <div className="read-progress" aria-hidden="true"><div ref={bar} /></div>
}
