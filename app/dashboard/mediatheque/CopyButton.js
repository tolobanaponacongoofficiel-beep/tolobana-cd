'use client'
import { useState } from 'react'
export default function CopyButton({ url }) {
  const [ok, setOk] = useState(false)
  async function copy() { try { await navigator.clipboard.writeText(url) } catch { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove() } setOk(true); setTimeout(() => setOk(false), 1600) }
  return <button type="button" className="btn ghost" onClick={copy}>{ok ? 'Lien copié' : 'Copier le lien'}</button>
}
