'use client'
import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitPost } from '../services/actions'
import { TYPES, TYPE_KEYS } from '@/lib/services'
import './phase12.css'
function Go() { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Envoi…' : 'Envoyer à la rédaction'}</button> }
export default function ServiceForm({ initialType = 'communique' }) {
  const [s, action] = useFormState(submitPost, null)
  const [type, setType] = useState(initialType)
  const [ts, setTs] = useState('')
  useEffect(() => setTs(String(Date.now())), [])
  const T = TYPES[type]
  return (
    <form action={action} className="svc-form">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <input type="hidden" name="ts" value={ts} />
      <label>Type de publication<select name="type" value={type} onChange={e => setType(e.target.value)}>{TYPE_KEYS.map(k => <option key={k} value={k}>{TYPES[k].label}</option>)}</select></label>
      <label>{T.title}<input name="title" required maxLength={160} /></label>
      <label>{T.body}<textarea name="body" required rows={7} maxLength={4000} /></label>
      {T.org && <label>Organisation ou entreprise<input name="org" maxLength={150} /></label>}
      <label>Lieu (ville, quartier)<input name="location" maxLength={120} /></label>
      {T.deadline && <label>Date limite (facultatif)<input type="date" name="deadline" /></label>}
      <label>Contact affiché avec la publication (téléphone, WhatsApp ou e-mail)<input name="contact" required maxLength={200} /></label>
      <label>Votre nom<input name="name" required maxLength={120} /></label>
      <label>Votre e-mail (non affiché : sert à vous répondre)<input name="email" type="email" required maxLength={190} /></label>
      <p className="svc-note">La rédaction vérifie chaque demande avant publication. Certaines publications peuvent être payantes : nous vous contactons pour en convenir avant toute mise en ligne.</p>
      <div><Go /></div>
      {s && <p role="status" className={s.ok ? 'c-ok' : 'c-err'}>{s.msg}</p>}
    </form>)
}
