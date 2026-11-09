import { supabaseServer } from '@/lib/supabase/server'
import { getMatches, split, byComp } from '@/lib/sport'
import MatchList from '../components/MatchList'
import '../components/phase12.css'
export const metadata = { title: 'Sport : scores et résultats', description: 'Scores, résultats et prochains matchs du football congolais et international.', alternates: { canonical: '/sport' } }
export const revalidate = 60
export default async function Sport() {
  const { today, past, next } = split(await getMatches(supabaseServer()))
  const Block = ({ title, list, showDate }) => list.length ? (<section><h2 className="wx-h">{title}</h2>
    {byComp(list).map(([c, ms]) => <div key={c} className="sp-comp"><h2>{c}</h2><MatchList matches={ms} showDate={showDate} /></div>)}</section>) : null
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Sport</h1></div>
    <Block title="Aujourd’hui" list={today} />
    <Block title="Résultats récents" list={past.slice(0, 40)} showDate />
    <Block title="À venir" list={next.slice(0, 40)} showDate />
    {!today.length && !past.length && !next.length && <p className="empty">Aucun match à afficher pour le moment.</p>}
  </main>)
}
