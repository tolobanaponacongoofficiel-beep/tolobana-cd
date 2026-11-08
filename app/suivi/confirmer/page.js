import { confirmFollow } from '../actions'
export const metadata = { title: 'Confirmer le suivi', robots: { index: false, follow: false } }
export default function Confirm({ searchParams }) {
  const token = String(searchParams?.token || '')
  const valid = /^[a-f0-9]{48}$/.test(token)
  return (<main className="wrap"><div className="panel" style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
    {searchParams?.done ? <><h1>Suivi confirmé ✓</h1><p>Merci ! Vous recevrez un e-mail quand ce dossier sera enrichi.</p></>
      : valid ? <><h1>Confirmer le suivi du dossier</h1><form action={confirmFollow}><input type="hidden" name="token" value={token} /><button className="btn">Confirmer</button></form></>
      : <><h1>Lien invalide</h1><p>Ce lien est incomplet ou a expiré. Recommencez depuis la page du dossier.</p></>}
  </div></main>)
}
