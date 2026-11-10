'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import './phase10.css'
const read = k => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch {} }
// Thème : « clair », « sombre » ; sans choix, on suit le réglage de l'appareil.
export default function PrefsButtons({ saver }) {
  const router = useRouter()
  const [theme, setTheme] = useState('light')
  useEffect(() => { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light') }, [])
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next); write('tolobana-theme', next); setTheme(next)
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', next === 'dark' ? '#0a121b' : '#031523')
  }
  function toggleSaver() {
    const on = !saver
    document.cookie = `tl_saver=${on ? 1 : 0}; path=/; max-age=31536000; samesite=lax`
    write('tolobana-saver', on ? '1' : '0'); router.refresh()
  }
  return (
    <div className="prefs">
      <button type="button" className="pref-btn" onClick={toggleTheme} aria-pressed={theme === 'dark'} title="Basculer entre le thème clair et le thème sombre">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{theme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />}</svg><span className="lbl"> {theme === 'dark' ? 'Clair' : 'Sombre'}</span><span className="sr-only"> : thème {theme === 'dark' ? 'sombre actif' : 'clair actif'}</span>
      </button>
      <button type="button" className="pref-btn" onClick={toggleSaver} aria-pressed={!!saver} title="Mode léger : n’affiche les images que sur demande, pour économiser vos données">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10.5 10.5 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" /></svg><span className="lbl"> Mode léger{saver ? ' : oui' : ''}</span><span className="sr-only">{saver ? ' activé' : ' désactivé'}</span>
      </button>
    </div>)
}
