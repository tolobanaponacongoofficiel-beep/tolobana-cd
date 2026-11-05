'use client'
import { useFormState } from 'react-dom'
import { signIn, signUp } from './actions'
export default function Login() {
  const [s1, a1] = useFormState(signIn, null)
  const [s2, a2] = useFormState(signUp, null)
  return (<main className="wrap">
    <form className="f" action={a1}><h2>Connexion</h2>{s1?.error && <p style={{ color: 'red' }}>{s1.error}</p>}
      <input name="email" type="email" placeholder="E-mail" required /><input name="password" type="password" placeholder="Mot de passe" required /><button className="btn">Se connecter</button></form>
    <form className="f" action={a2}><h2>Créer un compte</h2>{s2?.error && <p style={{ color: 'red' }}>{s2.error}</p>}
      <input name="name" placeholder="Nom" required /><input name="email" type="email" placeholder="E-mail" required /><input name="password" type="password" minLength={8} placeholder="Mot de passe (8+)" required /><button className="btn">S’inscrire</button></form>
  </main>)
}
