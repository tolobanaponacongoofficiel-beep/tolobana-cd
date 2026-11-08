'use client'
import { useState } from 'react'
// Mode léger : l'image ou la vidéo n'est chargée que si le lecteur le demande.
export default function LazyMedia({ src, alt, caption, label = 'Afficher l’image', yt }) {
  const [on, setOn] = useState(false)
  if (on && yt) return <div className="video"><iframe src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`} title={alt || 'Vidéo YouTube'} allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
  if (on) return <img src={src} alt={alt || ''} loading="lazy" />
  return <button type="button" className="saver-ph" onClick={() => setOn(true)}><span aria-hidden="true">{yt ? '▶️' : '🖼️'}</span><span>{label}</span>{caption && <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{caption}</span>}</button>
}
