'use client'
import { useState } from 'react'
import './phase20.css'
const TYPES = [['goal', 'But'], ['penalty', 'But sur penalty'], ['own_goal', 'But contre son camp'], ['yellow', 'Carton jaune'], ['second_yellow', 'Deuxième jaune (rouge)'], ['red', 'Carton rouge'], ['sub', 'Remplacement']]
export default function EventsEditor({ initial, home, away }) {
  const [rows, setRows] = useState(initial || [])
  const set = (i, k, v) => setRows(r => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)))
  const add = () => setRows(r => [...r, { minute: '', extra: '', type: 'goal', side: 'home', player: '', other: '' }])
  return (
    <div className="ev-ed">
      <input type="hidden" name="events" value={JSON.stringify(rows)} />
      {rows.map((r, i) => (
        <div key={i} className="ev-row">
          <input type="number" min="0" max="130" placeholder="Min" aria-label="Minute" value={r.minute} onChange={e => set(i, 'minute', e.target.value)} />
          <input type="number" min="0" max="15" placeholder="+" aria-label="Temps additionnel" value={r.extra} onChange={e => set(i, 'extra', e.target.value)} />
          <select aria-label="Type" value={r.type} onChange={e => set(i, 'type', e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select aria-label="Équipe" value={r.side} onChange={e => set(i, 'side', e.target.value)}><option value="home">{home}</option><option value="away">{away}</option></select>
          <input placeholder={r.type === 'sub' ? 'Joueur qui sort' : 'Joueur'} aria-label="Joueur" value={r.player} onChange={e => set(i, 'player', e.target.value)} />
          {['goal', 'penalty', 'sub'].includes(r.type)
            ? <input placeholder={r.type === 'sub' ? 'Joueur qui entre' : 'Passeur (facultatif)'} aria-label="Second joueur" value={r.other} onChange={e => set(i, 'other', e.target.value)} />
            : <span />}
          <button type="button" className="btn sm gray" aria-label="Supprimer cet événement" onClick={() => setRows(rs => rs.filter((_, j) => j !== i))}>✕</button>
        </div>))}
      <div><button type="button" className="btn sm" onClick={add}>+ Ajouter un événement</button></div>
    </div>)
}
