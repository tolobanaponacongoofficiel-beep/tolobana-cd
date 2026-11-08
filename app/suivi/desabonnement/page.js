import { unfollow } from '../actions'
export const metadata = { title: 'Ne plus suivre le dossier', robots: { index: false, follow: false } }
export default function Unfollow({ searchParams }) {
  const token = String(searchParams?.token || '')
  const valid = /^[a-f0-9]{48}$/.test(token)
  return (<main className="wrap"><div className="panel" style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
    {searchParams?.done ? <><h1>C’est fait ✓</h1><p>Vous ne recevrez plus d’e-mails pour ce dossier.</p></>
      : valid ? <><h1>Ne plus suivre ce dossier ?</h1><form action={unfollow}><input type="hidden" name="token" value={token} /><button className="btn red">Me désabonner</button></form></>
      : <><h1>Lien invalide</h1><p>Ce lien est incomplet ou a expiré.</p></>}
  </div></main>)
}
