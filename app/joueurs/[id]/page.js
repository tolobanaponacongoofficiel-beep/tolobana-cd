import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { saverOn } from '@/lib/saver'
import { isUuid } from '@/lib/blocks'
import { POS_ONE, paras, ageFrom } from '@/lib/clubs'
import Crest from '../../components/Crest'
import '../../components/phase20.css'

const load = async id => isUuid(id) ? (await supabaseServer().from('fc_players').select('*,fc_clubs(slug,name,crest_url)').eq('id', id).maybeSingle()).data : null
export async function generateMetadata({ params }) {
  const p = await load(params.id)
  return p ? { title: `${p.name}${p.fc_clubs ? ` (${p.fc_clubs.name})` : ''} : fiche joueur`, description: `${p.name}${POS_ONE[p.position] ? `, ${POS_ONE[p.position].toLowerCase()}` : ''}${p.fc_clubs ? ` de ${p.fc_clubs.name}` : ''} : statistiques et matchs.`, alternates: { canonical: `/joueurs/${p.id}` } } : { title: 'Joueur' }
}
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Kinshasa' }) : ''
export default async function Player({ params }) {
  const p = await load(params.id); if (!p) notFound()
  const sb = supabaseServer(), saver = saverOn()
  const [{ data: lus }, { data: evs }, { data: ass }] = await Promise.all([
    sb.from('fc_lineups').select('is_starter,match_ref,fc_matches(home,away,kickoff,home_score,away_score,competition)').eq('player_id', p.id).limit(200),
    sb.from('fc_events').select('type').eq('player_id', p.id).limit(500),
    sb.from('fc_events').select('type').eq('other_id', p.id).in('type', ['goal', 'penalty']).limit(500),
  ])
  const apps = (lus || []).length, starts = (lus || []).filter(l => l.is_starter).length
  const n = t => (evs || []).filter(e => t.includes(e.type)).length
  const stats = [['Matchs', apps], ['Titularisations', starts], ['Buts', n(['goal', 'penalty'])], ['Passes déc.', (ass || []).length], ['Jaunes', n(['yellow', 'second_yellow'])], ['Rouges', n(['red', 'second_yellow'])]]
  const age = ageFrom(p.birth_date)
  const recent = (lus || []).filter(l => l.fc_matches).sort((a, b) => new Date(b.fc_matches.kickoff || 0) - new Date(a.fc_matches.kickoff || 0)).slice(0, 10)
  const ld = { '@context': 'https://schema.org', '@type': 'Person', name: p.name, jobTitle: 'Footballeur', ...(p.nationality ? { nationality: p.nationality } : {}), ...(p.birth_date ? { birthDate: p.birth_date } : {}), ...(p.photo_url ? { image: p.photo_url } : {}), ...(p.fc_clubs ? { memberOf: { '@type': 'SportsTeam', name: p.fc_clubs.name } } : {}) }
  return (<main className="wrap fc-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <p className="fc-crumb">{p.fc_clubs ? <Link href={`/clubs/${p.fc_clubs.slug}`}>← {p.fc_clubs.name}</Link> : <Link href="/clubs">← Clubs</Link>}</p>
    <section className="club-head">
      {p.photo_url ? <img src={p.photo_url} alt={p.name} className="pface" style={{ width: 96, height: 96 }} /> : <span className="pface" style={{ width: 96, height: 96, fontSize: '2rem' }}>{p.shirt_number ?? p.name[0]}</span>}
      <div><h1>{p.shirt_number != null ? `${p.shirt_number} · ` : ''}{p.name}</h1>
        <div className="sub">{[POS_ONE[p.position], p.nationality].filter(Boolean).join(' · ')}</div>
        {p.fc_clubs && <p style={{ margin: '8px 0 0' }}><Link href={`/clubs/${p.fc_clubs.slug}`} style={{ color: '#fff', display: 'inline-flex', gap: 8, alignItems: 'center' }}><Crest src={p.fc_clubs.crest_url} name={p.fc_clubs.name} size={24} saver={saver} /> {p.fc_clubs.name}</Link></p>}</div></section>
    <section className="fc-panel"><h2>Fiche</h2>
      <dl className="club-facts">
        {age != null && <div><dt>Âge</dt><dd>{age} ans (né en {new Date(p.birth_date).getUTCFullYear()})</dd></div>}
        {p.nationality && <div><dt>Nationalité</dt><dd>{p.nationality}</dd></div>}
        {p.position && <div><dt>Poste</dt><dd>{POS_ONE[p.position]}</dd></div>}
        {p.shirt_number != null && <div><dt>Numéro</dt><dd>{p.shirt_number}</dd></div>}
        {p.height_cm && <div><dt>Taille</dt><dd>{p.height_cm} cm</dd></div>}
        {p.foot && <div><dt>Pied</dt><dd>{p.foot}</dd></div>}
      </dl>
      {paras(p.bio).map((t, i) => <p key={i}>{t}</p>)}</section>
    <section className="fc-panel"><h2>Statistiques</h2>
      <div className="pstats">{stats.map(([l, v]) => <div key={l} className="pstat"><b>{v}</b><span>{l}</span></div>)}</div>
      <p className="meta">Statistiques calculées à partir des matchs documentés par la rédaction de Tolobana Info.</p></section>
    {recent.length > 0 && <section className="fc-panel"><h2>Derniers matchs</h2>{recent.map(l => { const x = l.fc_matches, has = x.home_score != null && x.away_score != null
      return (<Link key={l.match_ref} href={`/sport/match/${l.match_ref}`} className="mrow"><span className="d">{fmtD(x.kickoff)}</span><span><b>{x.home}</b> {has ? `${x.home_score}-${x.away_score}` : '-'} <b>{x.away}</b><br /><small className="d">{x.competition} · {l.is_starter ? 'Titulaire' : 'Remplaçant'}</small></span><span aria-hidden="true">›</span></Link>) })}</section>}
  </main>)
}
