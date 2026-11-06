'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { subscribe } from '../newsletter/actions'
import './phase7.css'
function Submit() {
  const { pending } = useFormStatus()
  return <button className="btn gold" disabled={pending}>{pending ? 'Envoi…' : 'Je m’abonne'}</button>
}
export default function NewsletterBox() {
  const [s, action] = useFormState(subscribe, null)
  return (
    <section className="nl" aria-label="Newsletter"><div className="wrap nl-in">
      <div><h2>La newsletter Tolobana Info</h2><p>L’essentiel de l’actualité congolaise et africaine dans votre boîte e-mail. Gratuit, désabonnement en un clic.</p></div>
      <form action={action} className="nl-form">
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
        <input type="email" name="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail" />
        <Submit />
        {s && <p role="status" className={s.ok ? 'nl-ok' : 'nl-err'}>{s.msg}</p>}
      </form>
    </div></section>)
}
