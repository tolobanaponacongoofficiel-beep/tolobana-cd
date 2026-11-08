'use client'
import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitClaim } from '../verification/actions'
import './phase11.css'
function Go() { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Envoi…' : 'Envoyer à la rédaction'}</button> }
export default function ClaimForm() {
  const [s, action] = useFormState(submitClaim, null)
  const [ts, setTs] = useState('')
  useEffect(() => setTs(String(Date.now())), [])
  return (
    <section className="claim-box" aria-label="Soumettre une affirmation à vérifier">
      <h2>Vous avez reçu une rumeur ? Faites-la vérifier</h2>
      <p className="meta">Un message qui circule sur WhatsApp, une vidéo suspecte, une déclaration choquante : décrivez-la et nous l’examinons.</p>
      <form action={action}>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
        <input type="hidden" name="ts" value={ts} />
        <textarea name="claim" required rows={3} minLength={10} maxLength={600} placeholder="Ce qui circule (ex. « Le pont de … s’est effondré »)" aria-label="L’affirmation à vérifier" />
        <input name="source" maxLength={300} placeholder="Où l’avez-vous vue ? (groupe WhatsApp, lien, page Facebook…)" aria-label="Où l’avez-vous vue ?" />
        <input name="name" maxLength={120} placeholder="Votre nom (facultatif)" aria-label="Votre nom (facultatif)" />
        <input name="email" type="email" maxLength={190} placeholder="Votre e-mail pour être prévenu(e) (facultatif)" aria-label="Votre e-mail (facultatif)" />
        <div><Go /></div>
        {s && <p role="status" className={s.ok ? 'c-ok' : 'c-err'}>{s.msg}</p>}
      </form>
    </section>)
}
