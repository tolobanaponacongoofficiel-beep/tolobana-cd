import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compByCode, getCompetition, getCompMatches, getStandings, getScorers, byComp, dateLabel } from '@/lib/sport'
import { saverOn } from '@/lib/saver'
import MatchList from '../../components/MatchList'
import Crest from '../../components/Crest'
import { SportHero, CompNav } from '../../components/SportHero'
import '../../components/phase13.css'
export const revalidate = 120
export async function generateMetadata({ params }) {
  const c = compByCode(params.code)
  return c ? { title: `${c.name} : calendrier, classement et buteurs`, description: `Résultats, calendrier, classement et meilleurs buteurs de ${c.name} (${c.country}).`, alternates: { canonical: `/sport/${params.code.toLowerCase()}` } } : {}
}
const TABS = [['matchs', 'Matchs'], ['classement', 'Classement'], ['buteurs', 'Buteurs']]
export default async function Competition({ params, searchParams }) {
  const comp = compByCode(params.code); if (!comp) notFound()
  const code = comp.code, tab = TABS.some(t => t[0] === searchParams?.t) ? searchParams.t : 'matchs', saver = saverOn()
  const info = await getCompetition(code)
  const base = `/sport/${code.toLowerCase()}`
  let body
  if (!info) body = <p className="empty">Les données de cette compétition ne sont pas disponibles pour le moment.</p>
  else if (tab === 'classement') {
    const groups = await getStandings(code)
    body = groups.length ? groups.map((g, i) => (<div key={i} className="sp-comp">{g.group && <h3>{g.group}</h3>}
      <div className="sp-tablewrap"><table className="sp-table"><thead><tr><th>#</th><th className="l">Équipe</th><th title="Joués">J</th><th className="hm" title="Gagnés">G</th><th className="hm" title="Nuls">N</th><th className="hm" title="Perdus">P</th><th className="hm" title="Buts pour / contre">Buts</th><th title="Différence">Diff</th><th title="Points">Pts</th><th className="hm">Forme</th></tr></thead>
        <tbody>{g.table.map(r => (<tr key={r.pos}><td>{r.pos}</td><td className="l"><span className="sp-team"><Crest src={r.crest} name={r.team} size={20} saver={saver} />{r.team}</span></td><td>{r.p}</td><td className="hm">{r.w}</td><td className="hm">{r.d}</td><td className="hm">{r.l}</td><td className="hm">{r.gf}:{r.ga}</td><td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td><td><b>{r.pts}</b></td>
          <td className="hm"><span className="sp-form">{r.form.map((f, k) => <i key={k} className={f === 'W' ? 'w' : f === 'L' ? 'l' : 'd'} title={f === 'W' ? 'Victoire' : f === 'L' ? 'Défaite' : 'Nul'} />)}</span></td></tr>))}</tbody></table></div></div>)) : <p className="empty">Classement indisponible pour le moment.</p>
  } else if (tab === 'buteurs') {
    const sc = await getScorers(code)
    body = sc.length ? (<div className="sp-tablewrap"><table className="sp-table"><thead><tr><th>#</th><th className="l">Joueur</th><th className="l hm">Équipe</th><th title="Matchs joués">J</th><th title="Passes décisives">Pd</th><th title="Buts">Buts</th></tr></thead>
      <tbody>{sc.map((s, i) => <tr key={i}><td>{i + 1}</td><td className="l"><span className="sp-team"><Crest src={s.crest} name={s.team} size={20} saver={saver} /><span>{s.name}<small className="sm">{s.team}</small></span></span></td><td className="l hm">{s.team}</td><td>{s.played ?? '·'}</td><td>{s.assists ?? '·'}</td><td><b>{s.goals}</b></td></tr>)}</tbody></table></div>) : <p className="empty">Classement des buteurs indisponible pour le moment.</p>
  } else {
    const j = parseInt(searchParams?.j, 10), md = Number.isInteger(j) && j > 0 && j < 80 ? j : info.matchday
    const ms = await getCompMatches(code, md)
    body = (<>
      {md ? <nav className="sp-md" aria-label="Choisir la journée">
        {md > 1 ? <Link href={`${base}?j=${md - 1}`}>← Journée {md - 1}</Link> : <span />}
        <b>Journée {md}</b>
        <Link href={`${base}?j=${md + 1}`}>Journée {md + 1} →</Link></nav> : <p className="meta">Matchs récents et à venir</p>}
      {ms.length ? <MatchList matches={ms} showDate saver={saver} /> : <p className="empty">Aucun match pour cette période.</p>}</>)
  }
  return (<main className="wrap sport-page">
    <SportHero crumb={<Link href="/sport">← Sport</Link>} logo={info?.emblem} title={comp.name} sub={`${comp.country}${info?.season ? ` · saison ${info.season}` : ''}`} />
    <CompNav current={code} />
    <div className="sp-tabs" role="tablist">{TABS.map(([k, l]) => <Link key={k} href={k === 'matchs' ? base : `${base}?t=${k}`} className={tab === k ? 'on' : ''} role="tab" aria-selected={tab === k}>{l}</Link>)}</div>
    {body}
  </main>)
}
