import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getMatches, split } from '@/lib/sport'
import './phase12.css'
export default async function SportMini() {
  const { today } = split(await getMatches(supabaseServer()))
  if (!today.length) return null
  const list = [...today.filter(m => m.status === 'live'), ...today.filter(m => m.status !== 'live')].slice(0, 4)
  return (
    <Link href="/sport" className="sp-mini" aria-label="Scores du jour">
      <b>Sport · aujourd’hui</b>
      {list.map(m => <div key={m.id}><span>{m.home} - {m.away}</span><strong>{m.hs != null && m.as != null ? `${m.hs}-${m.as}` : m.status === 'live' ? 'direct' : '·'}</strong></div>)}
    </Link>)
}
