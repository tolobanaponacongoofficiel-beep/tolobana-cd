'use client'
import { useState } from 'react'
import './phase11.css'
const W = 1080, H = 1920
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/), lines = []; let cur = ''
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur); return lines
}
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src })
// Dessine la Story en image 1080 × 1920 (format WhatsApp / TikTok / Instagram).
async function render(s, org) {
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#031523'; ctx.fillRect(0, 0, W, H)
  try {
    const img = await loadImg(s.image_url)
    const k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
  } catch { /* image indisponible : fond bleu */ }
  const g = ctx.createLinearGradient(0, H * 0.35, 0, H)
  g.addColorStop(0, 'rgba(3,21,35,0)'); g.addColorStop(0.7, 'rgba(3,21,35,.88)'); g.addColorStop(1, 'rgba(3,21,35,.97)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  let y = H - 120
  ctx.fillStyle = '#fff'; ctx.font = '600 38px system-ui, sans-serif'; ctx.textBaseline = 'alphabetic'
  ctx.fillText(org, 70, y)
  ctx.fillStyle = '#ffd400'; ctx.fillRect(70, y + 24, 120, 8)
  y -= 90
  const stats = [[s.stat1_value, s.stat1_label], [s.stat2_value, s.stat2_label]].filter(x => x[0])
  if (stats.length) {
    stats.forEach(([v, l], i) => {
      const x = 70 + i * 480
      ctx.fillStyle = '#ffd400'; ctx.font = '800 96px Georgia, serif'; ctx.fillText(String(v).slice(0, 12), x, y)
      ctx.fillStyle = '#cfdeee'; ctx.font = '500 32px system-ui, sans-serif'; ctx.fillText(String(l || '').slice(0, 28), x, y + 46)
    })
    y -= 170
  }
  ctx.fillStyle = '#fff'; ctx.font = '800 82px Georgia, serif'
  const lines = wrap(ctx, s.title, W - 140).slice(0, 6)
  for (let i = lines.length - 1; i >= 0; i--) { ctx.fillText(lines[i], 70, y); y -= 98 }
  if (s.kicker) {
    ctx.font = '800 34px system-ui, sans-serif'
    const t = s.kicker.toUpperCase(), tw = ctx.measureText(t).width + 44
    ctx.fillStyle = '#d0121b'; ctx.fillRect(70, y - 50, tw, 66)
    ctx.fillStyle = '#fff'; ctx.fillText(t, 92, y - 4)
  }
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('blob'))), 'image/png'))
}
export default function StoryActions({ story, url, org }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  async function shareImage() {
    setBusy(true); setMsg('')
    try {
      const blob = await render(story, org)
      const file = new File([blob], `story-${story.id}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `${story.title}\n${url}` }) }
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `story-${story.id}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000) }
    } catch (e) { if (e?.name !== 'AbortError') setMsg('Image impossible à créer ici : faites une capture d’écran de la carte.') }
    finally { setBusy(false) }
  }
  return (
    <div className="story-actions">
      <button type="button" className="btn gold sm" onClick={shareImage} disabled={busy}>{busy ? 'Création…' : '📤 Partager l’image'}</button>
      <a className="btn wa sm" href={`https://wa.me/?text=${encodeURIComponent(`${story.title}\n${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      {msg && <p className="err" role="alert">{msg}</p>}
    </div>)
}
