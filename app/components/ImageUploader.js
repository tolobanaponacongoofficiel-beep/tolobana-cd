'use client'
import { useRef, useState } from 'react'

const MAX_BYTES = 3.8 * 1024 * 1024
const KEEP_AS_IS = 1.5 * 1024 * 1024

// Réduit les grosses photos (téléphone) avant l'envoi : 2000 px max, JPEG. Les petits fichiers partent tels quels.
async function prepare(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Format accepté : JPG, PNG ou WebP.')
  if (file.size <= KEEP_AS_IS) return file
  const bmp = await createImageBitmap(file)
  let scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
  let quality = 0.88
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality))
    if (blob && blob.size <= MAX_BYTES) return blob
    scale *= 0.8; quality = Math.max(0.6, quality - 0.08)
  }
  throw new Error('Image trop lourde. Choisissez une image plus petite.')
}

// Envoie l'image tout de suite vers /api/upload et garde l'adresse reçue.
// `name` : si fourni, l'adresse part aussi avec le formulaire (champ caché).
export default function ImageUploader({ name, value = '', onChange, folder = 'articles', label = 'Choisir une image', round = false }) {
  const [url, setUrl] = useState(value || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const input = useRef(null)

  async function pick(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setErr(''); setBusy(true)
    try {
      const blob = await prepare(f)
      const fd = new FormData()
      fd.append('file', blob, 'image')
      fd.append('folder', folder)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.url) throw new Error(j.error || "L'envoi a échoué. Réessayez.")
      setUrl(j.url); onChange?.(j.url)
    } catch (ex) { setErr(ex.message || "L'envoi a échoué. Réessayez.") }
    finally { setBusy(false); if (input.current) input.current.value = '' }
  }

  return (
    <div className="up">
      {name && <input type="hidden" name={name} value={url} />}
      {url && <div className={round ? 'up-prev round' : 'up-prev'}><img src={url} alt="" /></div>}
      <div className="up-row">
        <button type="button" className="btn gray sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? 'Envoi en cours…' : url ? "Changer l'image" : label}
        </button>
        {url && !busy && <button type="button" className="btn ghost sm" onClick={() => { setUrl(''); onChange?.('') }}>Retirer</button>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
      {err && <p className="err" role="alert">{err}</p>}
    </div>)
}
