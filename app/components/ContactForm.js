'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { sendMessage } from '../contact/actions'
import './phase9.css'
function Submit() { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Envoi…' : 'Envoyer le message'}</button> }
export default function ContactForm() {
  const [s, action] = useFormState(sendMessage, null)
  return (
    <form action={action} className="cform">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <input name="name" required maxLength={120} placeholder="Votre nom" aria-label="Votre nom" />
      <input name="email" type="email" required maxLength={190} placeholder="Votre e-mail" aria-label="Votre e-mail" />
      <input name="subject" maxLength={200} placeholder="Sujet" aria-label="Sujet" />
      <textarea name="message" required rows={6} maxLength={4000} placeholder="Votre message" aria-label="Votre message" />
      <div><Submit /></div>
      {s && <p role="status" className={s.ok ? 'c-ok' : 'c-err'}>{s.msg}</p>}
    </form>)
}
