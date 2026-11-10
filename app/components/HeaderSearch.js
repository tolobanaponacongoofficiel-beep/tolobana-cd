'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import './phase16.css'
export default function HeaderSearch() {
  const [open, setOpen] = useState(false), input = useRef(null), path = usePathname()
  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const k = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [open])
  return (<div className="hsearch">
    <button type="button" className="hs-btn" aria-expanded={open} aria-controls="hs-panel" onClick={() => setOpen(o => !o)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
      <span className="hs-lbl">Rechercher</span></button>
    <div id="hs-panel" className="hs-panel" hidden={!open}>
      <form action="/recherche" role="search" className="wrap">
        <input ref={input} name="q" placeholder="Rechercher sur Tolobana…" aria-label="Rechercher" autoComplete="off" />
        <button className="btn">Rechercher</button></form></div></div>)
}
