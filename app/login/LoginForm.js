'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { signIn, signUp, forgot, oauth } from './actions'
import './login.css'
const Btn = ({ children }) => { const { pending } = useFormStatus(); return <button className="lg-btn" disabled={pending}>{pending ? 'Patientez…' : children}</button> }
const Msg = ({ s }) => s?.error ? <p className="lg-err" role="alert">{s.error}</p> : s?.ok ? <p className="lg-ok" role="status">{s.ok}</p> : null
const Field = ({ icon, ...p }) => <label className="lg-field"><svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} /><input {...p} /></label>
const MAIL = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', LOCK = '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', USER = '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
export default function LoginForm({ providers, urlError }) {
  const [mode, setMode] = useState('in')
  const [s1, a1] = useFormState(signIn, null), [s2, a2] = useFormState(signUp, null), [s3, a3] = useFormState(forgot, null)
  return (<div className="lg-screen"><div className="lg-card">
    <Link href="/" className="lg-logo"><img src="/logo.png" alt="Tolobana Info" /></Link>
    <h1>{mode === 'in' ? 'Connexion' : mode === 'up' ? 'Créer un compte' : 'Mot de passe oublié'}</h1>
    {urlError && <p className="lg-err" role="alert">{urlError}</p>}
    {mode === 'in' && <form action={a1}><Msg s={s1} />
      <Field icon={MAIL} name="email" type="email" placeholder="Adresse e-mail" autoComplete="email" required />
      <Field icon={LOCK} name="password" type="password" placeholder="Mot de passe" autoComplete="current-password" required />
      <button type="button" className="lg-link" onClick={() => setMode('forgot')}>Mot de passe oublié ?</button>
      <Btn>Se connecter</Btn></form>}
    {mode === 'up' && <form action={a2}><Msg s={s2} />
      <Field icon={USER} name="name" placeholder="Votre nom" autoComplete="name" required />
      <Field icon={MAIL} name="email" type="email" placeholder="Adresse e-mail" autoComplete="email" required />
      <Field icon={LOCK} name="password" type="password" minLength={8} placeholder="Mot de passe (8 caractères minimum)" autoComplete="new-password" required />
      <Btn>S’inscrire</Btn></form>}
    {mode === 'forgot' && <form action={a3}><Msg s={s3} />
      <Field icon={MAIL} name="email" type="email" placeholder="Adresse e-mail" autoComplete="email" required />
      <Btn>Envoyer le lien</Btn></form>}
    {providers.length > 0 && mode !== 'forgot' && <><p className="lg-or"><span>ou continuer avec</span></p>
      <div className="lg-oauth">{providers.includes('google') && <form action={oauth}><input type="hidden" name="provider" value="google" /><button className="lg-o g"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.2v2.6h3.4C20.9 18 22 15.400 22 12.200z"/><path fill="#34A853" d="M12 22c2.800 0 5.100-.9 6.900-2.500l-3.400-2.600c-.9.600-2.100 1-3.500 1-2.700 0-5-1.800-5.800-4.300H2.700v2.700A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.200 13.600a6 6 0 0 1 0-3.800V7.100H2.700a10 10 0 0 0 0 9.200z"/><path fill="#EA4335" d="M12 6c1.500 0 2.900.5 4 1.600l3-3A10 10 0 0 0 2.700 7.100l3.500 2.700C7 7.800 9.300 6 12 6z"/></svg>Google</button></form>}
        {providers.includes('facebook') && <form action={oauth}><input type="hidden" name="provider" value="facebook" /><button className="lg-o f"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1877F2"/><path fill="#fff" d="M13.500 21v-7h2.300l.4-2.800h-2.700V9.500c0-.8.300-1.400 1.400-1.400h1.400V5.600c-.3 0-1.100-.1-2.100-.1-2.100 0-3.500 1.300-3.500 3.600v2.100H8.400V14h2.300v7z"/></svg>Facebook</button></form>}</div></>}
    <p className="lg-switch">{mode === 'in' ? <>Pas encore de compte ? <button type="button" className="lg-link" onClick={() => setMode('up')}>Créer un compte</button></> : <>Déjà inscrit ? <button type="button" className="lg-link" onClick={() => setMode('in')}>Se connecter</button></>}</p>
    <Link href="/" className="lg-back">← Retour au site</Link>
  </div></div>)
}
