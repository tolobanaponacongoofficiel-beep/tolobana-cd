'use client'
import { useEffect, useState } from 'react'
import './phase14.css'
const KEY = 'tolobana-fav'
export const readFav = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 100) : [] } catch { return [] } }
export const writeFav = a => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 100))) } catch {} }
export default function BookmarkButton({ slug }) {
  const [on, setOn] = useState(false), [ready, setReady] = useState(false)
  useEffect(() => { setOn(readFav().includes(slug)); setReady(true) }, [slug])
  function toggle() {
    const a = readFav(), has = a.includes(slug)
    writeFav(has ? a.filter(x => x !== slug) : [slug, ...a]); setOn(!has)
  }
  return (<button type="button" className={`btn fav-btn${on ? ' on' : ''}`} aria-pressed={on} onClick={toggle} disabled={!ready}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
    {on ? 'Enregistré' : 'Lire plus tard'}</button>)
}
