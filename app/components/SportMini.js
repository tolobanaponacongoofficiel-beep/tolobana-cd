import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getDay, today } from '@/lib/sport'
import './phase13.css'
export default async function SportMini() {
  const list0 = await getDay(supabaseServer(), today())
  if (!list0.length) return null
  const list = [...list0.filter(m => m.status === 'live'), ...list0.filter(m => m.status !== 'live')].slice(0, 4)
  return (
    <Link href="/sport" className="sp-mini" aria-label="Scores du jour">
      <b>Sport · aujourd’hui</b>
      {list.map(m => <div key={m.id}><span>{m.home} - {m.away}</span><strong>{m.hs != null && m.as != null && m.status !== 'scheduled' ? `${m.hs}-${m.as}` : m.status === 'live' ? 'direct' : '·'}</strong></div>)}
    </Link>)
}
