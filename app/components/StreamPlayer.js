'use client'
import { useState } from 'react'
import './phase10.css'
// Lecteur du direct. En mode léger, la vidéo ne démarre qu'à la demande du lecteur.
export default function StreamPlayer({ embed, saver, title }) {
  const [on, setOn] = useState(!saver)
  if (!on) return <button type="button" className="saver-ph" onClick={() => setOn(true)}><span aria-hidden="true">▶️</span><span>Regarder le direct (consomme des données)</span></button>
  return embed.kind === 'video'
    ? <video className="stream" src={embed.src} controls playsInline preload="metadata" aria-label={title} />
    : <div className="video"><iframe src={embed.src} title={`Direct : ${title}`} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
}
