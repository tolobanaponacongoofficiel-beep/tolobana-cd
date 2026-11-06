import { unsubscribe } from '../actions'
export const metadata = { title: 'Se désabonner', robots: { index: false, follow: false } }
export default function Unsub({ searchParams }) {
  const token = String(searchParams?.token || '')
  const valid = /^[a-f0-9]{48}$/.test(token)
  return (<main className="wrap"><div className="panel" style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
    {searchParams?.done ? <><h1>Vous êtes désabonné(e)</h1><p>Vous ne recevrez plus notre newsletter. Vous pouvez vous réinscrire à tout moment.</p></>
      : valid ? <><h1>Se désabonner</h1><p>Confirmez-vous ne plus vouloir recevoir la newsletter ?</p><form action={unsubscribe}><input type="hidden" name="token" value={token} /><button className="btn red">Me désabonner</button></form></>
      : <><h1>Lien invalide</h1><p>Ce lien de désabonnement est incomplet.</p></>}
  </div></main>)
}
