'use client'
import { useEffect, useState } from 'react'
import './phase7.css'
export default function InstallPrompt() {
  const [ev, setEv] = useState(null)
  useEffect(() => {
    try { if (localStorage.getItem('pwa-dismissed')) return } catch {}
    const h = e => { e.preventDefault(); setEv(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  if (!ev) return null
  const later = () => { try { localStorage.setItem('pwa-dismissed', '1') } catch {} setEv(null) }
  return (
    <div className="pwa-bar" role="dialog" aria-label="Installer l’application">
      <span>Installez Tolobana Info sur votre téléphone.</span>
      <button className="btn gold sm" onClick={async () => { ev.prompt(); try { await ev.userChoice } catch {} setEv(null) }}>Installer</button>
      <button className="btn ghost light sm" onClick={later}>Plus tard</button>
    </div>)
}
