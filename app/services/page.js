import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { TYPES, TYPE_KEYS } from '@/lib/services'
import '../components/phase12.css'
export const metadata = { title: 'Services', description: 'Avis de décès, communiqués, offres d’emploi, appels d’offres et petites annonces.', alternates: { canonical: '/services' } }
export default async function Services() {
  const now = new Date().toISOString()
  const { data } = await supabaseServer().from('service_posts').select('type').eq('status', 'published').or(`expires_at.is.null,expires_at.gt.${now}`).limit(1000)
  const count = {}; for (const r of data || []) count[r.type] = (count[r.type] || 0) + 1
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Services</h1></div>
    <div className="svc-hub">{TYPE_KEYS.map(k => (<Link key={k} href={`/services/${k}`} className="svc-tile"><b>{TYPES[k].plural}</b><span>{TYPES[k].desc}</span><span>{count[k] || 0} en ligne</span></Link>))}</div>
    <p><Link className="btn" href="/services/deposer">Publier une annonce ou un communiqué</Link> <Link className="btn gray" href="/annoncer">Annoncer chez nous</Link></p>
  </main>)
}
