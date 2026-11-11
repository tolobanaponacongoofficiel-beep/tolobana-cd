import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { saverOn } from '@/lib/saver'
import { SITE_URL } from '@/lib/site'
import { POS, POS_ONE, paras, ageFrom } from '@/lib/clubs'
import Crest from '../../components/Crest'
import '../../components/phase20.css'

const load = async slug => (await supabaseServer().from('fc_clubs').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()).data
export async function generateMetadata({ params }) {
  const c = await load(params.slug)
  return c ? { title: `${c.name} : effectif, résultats et histoire`, description: `Fiche du club ${c.name}${c.city ? ` (${c.city})` : ''} : effectif actuel, résultats, historique et palmarès.`, alternates: { canonical: `/clubs/${c.slug}` } } : { title: 'Club' }
}
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Kinshasa' }) : ''
export default async function Club({ params }) {
  const c = await load(params.slug); if (!c) notFound()
  const sb = supabaseServer(), saver = saverOn()
  const [{ data: players }, { data: metas }] = await Promise.all([
    sb.from('fc_players').select('id,name,position,shirt_number,nationality,birth_date,photo_url,is_active').eq('club_id', c.id).order('shirt_number', { nullsFirst: false }).order('name'),
    sb.from('fc_matches').select('match_ref,home,away,kickoff,home_score,away_score,competition,status,home_club,away_club').or(`home_club.eq.${c.id},away_club.eq.${c.id}`).order('kickoff', { ascending: false }).limit(30),
  ])
  const squad = (players || []).filter(p => p.is_active), former = (players || []).filter(p => !p.is_active)
  const groups = Object.keys(POS).map(k => [k, squad.filter(p => p.position === k)]).filter(([, l]) => l.length)
  const others = squad.filter(p => !p.position)
  const now = Date.now()
  const upcoming = (metas || []).filter(x => x.status === 'scheduled' && x.kickoff && new Date(x.kickoff).getTime() >= now).reverse()
  const results = (metas || []).filter(x => !upcoming.includes(x))
  const ld = { '@context': 'https://schema.org', '@type': 'SportsTeam', name: c.name, sport: 'Football', url: `${SITE_URL}/clubs/${c.slug}`, ...(c.founded ? { foundingDate: String(c.founded) } : {}), ...(c.city ? { location: { '@type': 'Place', name: [c.stadium, c.city].filter(Boolean).join(', ') } } : {}), ...(c.crest_url ? { logo: c.crest_url } : {}) }
  const Card = ({ p }) => (<Link href={`/joueurs/${p.id}`} className="pcard">
    {p.photo_url ? <img src={p.photo_url} alt="" className="pface" loading="lazy" /> : <span className="pface">{p.shirt_number ?? p.name[0]}</span>}
    <span><b>{p.shirt_number != null ? `${p.shirt_number}. ` : ''}{p.name}</b><small>{[POS_ONE[p.position], p.nationality, ageFrom(p.birth_date) ? `${ageFrom(p.birth_date)} ans` : null].filter(Boolean).join(' · ')}</small></span></Link>)
  const Row = ({ x }) => { const h = x.home_club === c.id; const has = x.home_score != null && x.away_score != null
    return (<Link href={`/sport/match/${x.match_ref}`} className="mrow"><span className="d">{fmtD(x.kickoff)}</span><span><b>{x.home}</b> {has ? `${x.home_score}-${x.away_score}` : '-'} <b>{x.away}</b><br /><small className="d">{x.competition}{has ? (x.home_score === x.away_score ? ' · Nul' : (h ? x.home_score > x.away_score : x.away_score > x.home_score) ? ' · Victoire' : ' · Défaite') : ''}</small></span><span aria-hidden="true">›</span></Link>) }
  return (<main className="wrap fc-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <p className="fc-crumb"><Link href="/clubs">← Clubs</Link></p>
    <section className="club-head"><Crest src={c.crest_url} name={c.name} size={84} saver={saver} />
      <div><h1>{c.name}</h1><div className="sub">{[c.city, c.country].filter(Boolean).join(' · ')}</div></div></section>
    <section className="fc-panel"><h2>Fiche du club</h2>
      <dl className="club-facts">
        {c.founded && <div><dt>Fondation</dt><dd>{c.founded}</dd></div>}
        {c.stadium && <div><dt>Stade</dt><dd>{c.stadium}</dd></div>}
        {c.colors && <div><dt>Couleurs</dt><dd>{c.colors}</dd></div>}
        {c.coach && <div><dt>Entraîneur</dt><dd>{c.coach}</dd></div>}
        {c.website && /^https?:\/\//.test(c.website) && <div><dt>Site officiel</dt><dd><a href={c.website} target="_blank" rel="noopener noreferrer">{c.website.replace(/^https?:\/\//, '')}</a></dd></div>}
      </dl></section>
    <section className="fc-panel"><h2>Effectif actuel</h2>
      {groups.map(([k, l]) => <div key={k}><h3 className="fc-h">{POS[k]}</h3><div className="squad">{l.map(p => <Card key={p.id} p={p} />)}</div></div>)}
      {others.length > 0 && <div><h3 className="fc-h">Autres joueurs</h3><div className="squad">{others.map(p => <Card key={p.id} p={p} />)}</div></div>}
      {!squad.length && <p className="meta">L’effectif sera publié prochainement.</p>}</section>
    {upcoming.length > 0 && <section className="fc-panel"><h2>Prochains matchs</h2>{upcoming.map(x => <Row key={x.match_ref} x={x} />)}</section>}
    {results.length > 0 && <section className="fc-panel"><h2>Derniers résultats</h2>{results.map(x => <Row key={x.match_ref} x={x} />)}</section>}
    {(c.history || c.honours) && <section className="fc-panel"><h2>Histoire et palmarès</h2>
      {paras(c.history).map((p, i) => <p key={i}>{p}</p>)}
      {c.honours && <><h3 className="fc-h">Palmarès</h3><ul>{paras(c.honours).map((p, i) => <li key={i}>{p.replace(/^-\s*/, '')}</li>)}</ul></>}</section>}
    {former.length > 0 && <section className="fc-panel"><h2>Anciens joueurs</h2><p>{former.map((p, i) => <span key={p.id}>{i > 0 && ' · '}<Link href={`/joueurs/${p.id}`} className="tl">{p.name}</Link></span>)}</p></section>}
  </main>)
}
