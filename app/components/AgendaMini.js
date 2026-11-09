import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { startOfTodayISO, hm } from '@/lib/agenda'
import './phase14.css'
export default async function AgendaMini() {
  const { data } = await supabaseServer().from('events').select('id,title,starts_at').eq('is_published', true).gte('starts_at', startOfTodayISO()).order('starts_at', { ascending: true }).limit(3)
  if (!data?.length) return null
  return (<div className="ag-mini"><h2>À l’agenda</h2>
    <ul>{data.map(e => <li key={e.id}><Link href={`/agenda/${e.id}`}><time dateTime={e.starts_at}>{new Date(e.starts_at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa', day: 'numeric', month: 'short' })} · {hm(e.starts_at)}</time>{e.title}</Link></li>)}</ul>
    <Link href="/agenda" className="more">Tout l’agenda →</Link></div>)
}
