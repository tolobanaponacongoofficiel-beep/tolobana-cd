import { confirmSubscription } from '../actions'
export const metadata = { title: 'Confirmer mon inscription', robots: { index: false, follow: false } }
export default function Confirm({ searchParams }) {
  const token = String(searchParams?.token || '')
  const valid = /^[a-f0-9]{48}$/.test(token)
  return (<main className="wrap"><div className="panel" style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
    {searchParams?.done ? <><h1>Inscription confirmée ✓</h1><p>Merci ! Vous recevrez bientôt l’essentiel de l’actualité de Tolobana Info.</p></>
      : valid ? <><h1>Confirmer votre inscription</h1><form action={confirmSubscription}><input type="hidden" name="token" value={token} /><button className="btn">Confirmer mon inscription</button></form></>
      : <><h1>Lien invalide</h1><p>Ce lien est incomplet ou a expiré. Inscrivez-vous de nouveau depuis le bas de la page d’accueil.</p></>}
  </div></main>)
}
