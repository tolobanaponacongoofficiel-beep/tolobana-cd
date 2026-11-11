import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { safe } from '@/lib/safe'
import { getTeam } from '@/lib/teams'
import { GROUP_LABEL, GROUP_ORDER, canLink, dateLabel, timeOf } from '@/lib/sport'
import { saverOn } from '@/lib/saver'
import Crest from '../../../components/Crest'
import MatchList from '../../../components/MatchList'
import { SportHero } from '../../../components/SportHero'
import '../../../components/phase13.css'
import '../../../components/phase15.css'
function Fail({ msg }) {
  return (<main className="wrap sport-page"><p className="empty">Cette fiche est momentanément indisponible. <Link href="/sport">Retour au sport</Link></p><details className="meta"><summary>Détail technique</summary>{msg}</details></main>)
}
export const revalidate = 300
export async function generateMetadata({ params }) {
  const t = (await safe(() => getTeam(supabaseServer(), params.id), 'sport/equipe/meta')).v
  return t ? { title: `${t.name} : effectif, résultats et historique`, description: `${t.name} : effectif actuel, derniers résultats, prochains matchs et historique du club.`, alternates: { canonical: `/sport/equipe/${params.id}` } } : { title: 'Équipe' }
}
export default async function Team({ params }) {
  const r = await safe(() => getTeam(supabaseServer(), params.id), 'sport/equipe'); if (r.err) return <Fail msg={r.err} />
  const t = r.v; if (!t) notFound()
  const saver = saverOn()
  const groups = GROUP_ORDER.map(g => [g, t.squad.filter(p => p.group === g)]).filter(([, l]) => l.length), other = t.squad.filter(p => !GROUP_ORDER.includes(p.group))
  const facts = [['Pays', t.country], ['Ville', t.city], ['Fondé en', t.founded], ['Stade', t.stadium], ['Entraîneur', t.coach], ['Couleurs', t.colors], ['Compétitions', t.comps?.length ? t.comps.join(', ') : null]].filter(([, v]) => v)
  const Squad = ({ title, list }) => (<div className="sq-group"><h3>{title}</h3><ul>{list.map(p => (<li key={p.id}><span className="num">{p.num ?? '·'}</span>{canLink(p.id) ? <Link href={`/sport/joueur/${p.id}`}>{p.name}</Link> : p.name}<small>{[p.age ? `${p.age} ans` : null, p.nationality].filter(Boolean).join(' · ')}</small></li>))}</ul></div>)
  const ld = { '@context': 'https://schema.org', '@type': 'SportsTeam', name: t.full, sport: 'Football', ...(t.stadium ? { location: t.stadium } : {}), ...(t.website ? { url: t.website } : {}) }
  return (<main className="wrap sport-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <SportHero crumb={<Link href="/sport">← Sport</Link>} title={t.name} sub={[t.country, t.city].filter(Boolean).join(' · ') || undefined} />
    <section className="tm-head"><Crest src={t.crest} name={t.name} size={88} saver={saver} />
      {facts.length > 0 && <dl className="tm-facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}</section>
    {t.history && <section className="sp-panel"><h2>Historique</h2>{t.history.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</section>}
    {t.next.length > 0 && <section><h2 className="sp-h">Prochains matchs</h2><MatchList matches={t.next} showDate saver={saver} /></section>}
    <section><h2 className="sp-h">Derniers résultats</h2>{t.results.length ? <MatchList matches={t.results} showDate saver={saver} /> : <p className="empty">Aucun résultat enregistré pour le moment.</p>}</section>
    <section><h2 className="sp-h">Effectif actuel</h2>
      {t.squad.length ? <div className="sq">{groups.map(([g, l]) => <Squad key={g} title={GROUP_LABEL[g]} list={l} />)}{other.length > 0 && <Squad title="Autres" list={other} />}</div> : <p className="empty">L’effectif n’est pas encore renseigné.</p>}</section>
    {t.website && <p className="meta"><a href={t.website} target="_blank" rel="noopener noreferrer nofollow">Site officiel</a></p>}
  </main>)
}
