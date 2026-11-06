export const metadata = { title: 'Hors connexion', robots: { index: false, follow: false } }
export default function Offline() {
  return (<main className="wrap"><div className="panel" style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
    <h1>Vous êtes hors connexion</h1><p>Reconnectez-vous à Internet pour lire les dernières actualités de Tolobana Info.</p>
  </div></main>)
}
