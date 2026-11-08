'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { followDossier } from '../suivi/actions'
import './phase11.css'
function Go() { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Envoi…' : 'Suivre ce dossier'}</button> }
export default function FollowDossier({ dossierId, title }) {
  const [s, action] = useFormState(followDossier, null)
  return (
    <section className="follow-box" aria-label="Suivre ce dossier">
      <h2>Suivre ce dossier</h2>
      <p className="meta">Recevez un e-mail quand de nouveaux articles sont ajoutés à « {title} ». Désinscription en un clic.</p>
      <form action={action}>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
        <input type="hidden" name="dossier" value={dossierId} />
        <div className="follow-row"><input name="email" type="email" required maxLength={190} placeholder="Votre adresse e-mail" aria-label="Votre adresse e-mail" /><Go /></div>
        {s && <p role="status" className={s.ok ? 'c-ok' : 'c-err'}>{s.msg}</p>}
      </form>
    </section>)
}
