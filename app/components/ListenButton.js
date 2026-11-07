'use client'
import { useEffect, useRef, useState } from 'react'
import './phase9.css'
// Découpe en phrases de ~220 caractères : les longs textes sont coupés par certains navigateurs.
function chunks(text) {
  const parts = text.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]*\s*/g) || [text]
  const out = []; let cur = ''
  for (const p of parts) { if ((cur + p).length > 220) { if (cur) out.push(cur.trim()); cur = p } else cur += p }
  if (cur.trim()) out.push(cur.trim())
  return out
}
export default function ListenButton({ text }) {
  const [ok, setOk] = useState(false)
  const [state, setState] = useState('idle')
  const [pos, setPos] = useState(0)
  const parts = useRef([]), voice = useRef(null), active = useRef(false)
  const mins = Math.max(1, Math.round(text.split(/\s+/).length / 150))
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    setOk(true)
    const pick = () => { const vs = speechSynthesis.getVoices(); voice.current = vs.find(v => /^fr[-_]/i.test(v.lang)) || vs.find(v => v.lang?.toLowerCase().startsWith('fr')) || null }
    pick(); speechSynthesis.onvoiceschanged = pick
    return () => { try { speechSynthesis.cancel() } catch {} }
  }, [])
  function speak(i) {
    if (!active.current) return
    if (i >= parts.current.length) { stop(); return }
    setPos(Math.round((i / parts.current.length) * 100))
    const u = new SpeechSynthesisUtterance(parts.current[i])
    u.lang = 'fr-FR'; if (voice.current) u.voice = voice.current
    u.onend = () => speak(i + 1)
    u.onerror = e => { if (e.error !== 'canceled' && e.error !== 'interrupted') stop() }
    speechSynthesis.speak(u)
  }
  function start() { speechSynthesis.cancel(); parts.current = chunks(text); active.current = true; setState('play'); speak(0) }
  function pause() { try { speechSynthesis.pause(); setState('pause') } catch { stop() } }
  function resume() { try { speechSynthesis.resume(); setState('play') } catch { start() } }
  function stop() { active.current = false; try { speechSynthesis.cancel() } catch {} setState('idle'); setPos(0) }
  if (!ok) return null
  return (
    <div className="listen" role="group" aria-label="Écouter cet article">
      {state === 'idle' && <button type="button" className="btn gold sm" onClick={start}>🎧 Écouter cet article</button>}
      {state === 'play' && <button type="button" className="btn sm" onClick={pause}>⏸ Pause</button>}
      {state === 'pause' && <button type="button" className="btn sm" onClick={resume}>▶ Reprendre</button>}
      {state !== 'idle' && <button type="button" className="btn sm gray" onClick={stop}>⏹ Arrêter</button>}
      {state !== 'idle' && <span className="lbar" aria-hidden="true"><span style={{ width: `${pos}%` }} /></span>}
      <span className="st" role="status">{state === 'idle' ? `Durée : environ ${mins} min` : state === 'play' ? 'Lecture en cours…' : 'En pause'}</span>
    </div>)
}
