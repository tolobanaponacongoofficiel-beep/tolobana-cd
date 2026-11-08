import Link from 'next/link'
import InfoPage from '../components/InfoPage'
export const metadata = { title: 'Annoncer chez nous', alternates: { canonical: '/annoncer' } }
export default function Page() {
  return <InfoPage slug="annoncer"><p><Link href="/contact" className="btn">Demander un devis</Link></p></InfoPage>
}
