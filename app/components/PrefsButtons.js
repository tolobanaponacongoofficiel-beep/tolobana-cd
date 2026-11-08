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
        <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span><span className="lbl"> {theme === 'dark' ? 'Clair' : 'Sombre'}</span><span className="sr-only"> : thème {theme === 'dark' ? 'sombre actif' : 'clair actif'}</span>
      </button>
      <button type="button" className="pref-btn" onClick={toggleSaver} aria-pressed={!!saver} title="Mode léger : n’affiche les images que sur demande, pour économiser vos données">
        <span aria-hidden="true">📶</span><span className="lbl"> Mode léger{saver ? ' : oui' : ''}</span><span className="sr-only">{saver ? ' activé' : ' désactivé'}</span>
      </button>
    </div>)
}
