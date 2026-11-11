'use client'
import Link from 'next/link'
// Filet de sécurité : si une page du sport plante, le lecteur voit un message clair et non l'écran d'erreur brut.
export default function SportError({ error, reset }) {
  return (<main className="wrap sport-page" style={{ padding: '40px 16px' }}>
    <h1>Page momentanément indisponible</h1>
    <p>Un problème est survenu en chargeant cette page du sport.</p>
    <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn" onClick={() => reset()}>Réessayer</button><Link className="btn ghost" href="/sport">Retour au sport</Link></p>
    {error?.digest && <p className="meta">Code : {error.digest}</p>}
  </main>)
}
