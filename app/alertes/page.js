import PushButton from '../components/PushButton'
export const metadata = { title: 'Alertes info', description: 'Recevez une notification sur votre téléphone pour les informations urgentes de Tolobana Info.', alternates: { canonical: '/alertes' } }
export const dynamic = 'force-dynamic'
export default function Alertes() {
  const key = process.env.VAPID_PUBLIC_KEY
  return (<main className="wrap" style={{ maxWidth: 640, padding: '24px 16px' }}>
    <h1>Alertes info</h1>
    <p>Recevez une notification sur votre téléphone ou votre ordinateur quand Tolobana Info publie une information urgente. Pas de compte à créer, et vous pouvez désactiver à tout moment.</p>
    {key ? <PushButton publicKey={key} /> : <p className="meta">Les alertes seront bientôt disponibles.</p>}
  </main>)
}
