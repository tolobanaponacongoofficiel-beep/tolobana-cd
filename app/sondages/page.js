import { supabaseServer } from '@/lib/supabase/server'
import PollCard from '../components/PollCard'
import '../components/phase9.css'
export const metadata = { title: 'Sondages', description: 'Donnez votre avis : les sondages de Tolobana Info.', alternates: { canonical: '/sondages' } }
export default async function Polls({ searchParams }) {
  const { data } = await supabaseServer().from('polls').select('id,question,is_active,ends_at,created_at').order('created_at', { ascending: false }).limit(30)
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Sondages</h1></div>
    <div className="grid" style={{ paddingTop: 8 }}>{(data || []).map(p => <PollCard key={p.id} poll={p} back="/sondages" status={searchParams?.sondage} />)}</div>
    {!data?.length && <p className="empty">Aucun sondage pour le moment.</p>}
  </main>)
}
