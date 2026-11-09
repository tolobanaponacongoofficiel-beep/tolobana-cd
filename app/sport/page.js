import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getDay, byComp, today, shiftDay, validDay, hasFeed } from '@/lib/sport'
import { saverOn } from '@/lib/saver'
import MatchList from '../components/MatchList'
import { SportHero, CompNav } from '../components/SportHero'
import '../components/phase13.css'
export const metadata = { title: 'Sport : scores, résultats et calendrier', description: 'Scores en direct, résultats, calendrier, classements et buteurs : Premier League, Liga, Serie A, Ligue 1, Ligue des champions et football congolais.', alternates: { canonical: '/sport' } }
export const revalidate = 60
const WD = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' }), DM = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
export default async function Sport({ searchParams }) {
  const t0 = today(), day = validDay(searchParams?.d) ? searchParams.d : t0
  const saver = saverOn(), list = await getDay(supabaseServer(), day)
  const strip = Array.from({ length: 9 }, (_, i) => shiftDay(day === t0 ? t0 : day, i - 4)).map(d => d)
  const label = d => d === t0 ? 'Aujourd’hui' : d === shiftDay(t0, -1) ? 'Hier' : d === shiftDay(t0, 1) ? 'Demain' : WD.format(new Date(d + 'T12:00:00Z'))
  const live = list.filter(m => m.status === 'live')
  const title = day === t0 ? 'Aujourd’hui' : new Date(day + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  return (<main className="wrap sport-page">
    <SportHero title="Sport" sub="Scores, résultats, calendriers, classements et buteurs." />
    <CompNav />
    <nav className="sp-days" aria-label="Choisir un jour">
      {strip.map(d => <Link key={d} href={d === t0 ? '/sport' : `/sport?d=${d}`} className={d === day ? 'on' : ''}><b>{label(d)}</b><span>{DM.format(new Date(d + 'T12:00:00Z'))}</span></Link>)}
    </nav>
    {live.length > 0 && <section><h2 className="sp-h"><span className="sp-live">●</span> En direct</h2><MatchList matches={live} saver={saver} /></section>}
    <h2 className="sp-h cap">{title}</h2>
    {byComp(list.filter(m => m.status !== 'live')).map(([c, ms]) => <div key={c} className="sp-comp"><h3>{c}</h3><MatchList matches={ms} saver={saver} /></div>)}
    {!list.length && <p className="empty">Aucun match ce jour-là. Utilisez les jours ci-dessus ou ouvrez une compétition pour voir tout son calendrier.</p>}
    {!hasFeed() && <p className="meta">Seuls les matchs saisis par la rédaction sont affichés.</p>}
  </main>)
}
