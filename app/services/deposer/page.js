import ServiceForm from '../../components/ServiceForm'
import { isType } from '@/lib/services'
export const metadata = { title: 'Publier une annonce ou un communiqué', alternates: { canonical: '/services/deposer' } }
export default function Deposer({ searchParams }) {
  return (<main className="wrap"><div className="sec-head"><h1 className="sec">Publier sur Tolobana</h1></div>
    <ServiceForm initialType={isType(searchParams?.type) ? searchParams.type : 'communique'} /></main>)
}
