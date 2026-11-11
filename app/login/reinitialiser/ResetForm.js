'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { setPassword } from '../actions'
import '../login.css'
const Btn = () => { const { pending } = useFormStatus(); return <button className="lg-btn" disabled={pending}>{pending ? 'Patientez…' : 'Enregistrer'}</button> }
export default function ResetForm() {
  const [s, a] = useFormState(setPassword, null)
  return (<div className="lg-screen"><div className="lg-card"><h1>Nouveau mot de passe</h1>
    <form action={a}>{s?.error && <p className="lg-err" role="alert">{s.error}</p>}
      <label className="lg-field"><input name="password" type="password" minLength={8} placeholder="Nouveau mot de passe (8+)" autoComplete="new-password" required /></label>
      <label className="lg-field"><input name="confirm" type="password" minLength={8} placeholder="Confirmer le mot de passe" autoComplete="new-password" required /></label>
      <Btn /></form></div></div>)
}
