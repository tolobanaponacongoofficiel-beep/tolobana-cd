import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { fmtKin } from '@/lib/dates'
import '../../components/phase8.css'

export const metadata = { title: 'Statistiques' }
const day = d => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Africa/Kinshasa' })   // AAAA-MM-JJ à l'heure de Kinshasa
const nf = n => Number(n || 0).toLocaleString('fr-FR')

function Bars({ items, unit = '' }) {
  const max = Math.max(1, ...items.map(i => i.value))
  return (
    <ul className="bars">{items.map(i => (
      <li key={i.key}>
        <span className="name" title={i.label}>{i.href ? <Link href={i.href}>{i.label}</Link> : i.label}</span>
        <span className="val">{nf(i.value)}{unit}</span>
        <span className="track"><span className="fill" style={{ width: `${(i.value / max) * 100}%` }} /></span>
      </li>))}</ul>)
}
const agg = (rows, keyOf) => {
  const m = new Map()
  for (const r of rows) { const k = keyOf(r) || 'Sans rubrique'; const o = m.get(k) || { key: k, label: k, n: 0, views: 0 }; o.n++; o.views += r.views || 0; m.set(k, o) }
  return [...m.values()].sort((a, b) => b.views - a.views || b.n - a.n)
}

export default async function Stats({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const admin = atLeast(role, 'admin')
  const now = Date.now()

  const rows = []
  for (let from = 0; from < 5000; from += 1000) {
    const { data } = await sb.from('articles').select('id,title,slug,views,published_at,categories(name),profiles(name),authors(name)')
      .eq('status', 'published').order('published_at', { ascending: false }).range(from, from + 999)
    if (!data?.length) break
    rows.push(...data)
    if (data.length < 1000) break
  }
  const live = rows.filter(r => new Date(r.published_at).getTime() <= now)
  const upcoming = rows.filter(r => new Date(r.published_at).getTime() > now).sort((a, b) => new Date(a.published_at) - new Date(b.published_at))
  const cnt = async s => (await sb.from('articles').select('id', { count: 'exact', head: true }).eq('status', s)).count || 0
  const [nDraft, nSub] = await Promise.all([cnt('draft'), cnt('submitted')])
  const nConf = admin ? (await sb.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', 'confirmed')).count || 0 : null

  const totalViews = live.reduce((n, r) => n + (r.views || 0), 0)
  const last = d => live.filter(r => now - new Date(r.published_at).getTime() < d * 864e5).length
  const top = [...live].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).filter(r => r.views > 0)
  const byCat = agg(live, r => r.categories?.name).slice(0, 8)
  const byAuthor = agg(live, r => r.authors?.name || r.profiles?.name).slice(0, 8)

  // Publications par jour, 30 derniers jours (heure de Kinshasa)
  const keys = Array.from({ length: 30 }, (_, i) => day(now - (29 - i) * 864e5))
  const perDay = Object.fromEntries(keys.map(k => [k, 0]))
  for (const r of live) { const k = day(r.published_at); if (k in perDay) perDay[k]++ }
  const maxDay = Math.max(1, ...Object.values(perDay))

  return (<>
    <div className="dash-head"><h1>Statistiques</h1></div>
    {searchParams?.ok === 'programme' && <p className="notice ok" role="status">Publication programmée ✓ L’article apparaîtra tout seul à l’heure choisie (liste « Programmés » ci-dessous).</p>}

    <div className="kpis">
      <div><b>{nf(live.length)}</b><span>articles en ligne</span></div>
      <div><b>{nf(last(7))}</b><span>publiés ces 7 jours</span></div>
      <div><b>{nf(last(30))}</b><span>publiés ces 30 jours</span></div>
      <div><b>{nf(totalViews)}</b><span>lectures au total</span></div>
      <div><b>{nf(nSub)}</b><span>en attente de validation</span></div>
      <div><b>{nf(nDraft)}</b><span>brouillons</span></div>
      {nConf !== null && <div><b>{nf(nConf)}</b><span>abonnés newsletter</span></div>}
    </div>

    {upcoming.length > 0 && <section className="panel"><h2>Programmés ({upcoming.length})</h2>
      {upcoming.map(a => (
        <div key={a.id} className="qrow"><div><b>{a.title}</b><span className="meta">Sera publié le {fmtKin(a.published_at)}</span></div>
          <Link href={`/dashboard/articles/${a.id}`} className="btn sm">Modifier</Link></div>))}
    </section>}

    <section className="panel"><h2>Articles les plus lus</h2>
      {top.length ? <Bars items={top.map(a => ({ key: a.id, label: a.title, value: a.views, href: `/article/${a.slug}` }))} /> : <p className="meta">Pas encore de lectures enregistrées.</p>}
      <p className="meta" style={{ marginTop: 12 }}>Une lecture = une ouverture de la page article (les robots des moteurs de recherche sont inclus). Pour l’audience précise, consultez Google Analytics.</p>
    </section>

    <div className="two-col">
      <section className="panel"><h2>Lectures par rubrique</h2>
        {byCat.length ? <Bars items={byCat.map(c => ({ key: c.key, label: `${c.label} (${c.n} art.)`, value: c.views }))} /> : <p className="meta">Aucune donnée.</p>}</section>
      <section className="panel"><h2>Lectures par signature</h2>
        {byAuthor.length ? <Bars items={byAuthor.map(c => ({ key: c.key, label: `${c.label} (${c.n} art.)`, value: c.views }))} /> : <p className="meta">Aucune donnée.</p>}</section>
    </div>

    <section className="panel"><h2>Publications des 30 derniers jours</h2>
      <div className="cols30" role="img" aria-label={`${last(30)} articles publiés ces 30 derniers jours, jour par jour. Le détail est dans le tableau ci-dessous.`}>
        {keys.map(k => <span key={k} className={perDay[k] ? '' : 'zero'} style={{ height: `${Math.max(2, (perDay[k] / maxDay) * 100)}%` }} title={`${k} : ${perDay[k]} article(s)`} />)}
      </div>
      <div className="axis30"><span>{keys[0].split('-').reverse().join('/')}</span><span>Aujourd’hui</span></div>
      <details className="table-view"><summary>Voir le tableau</summary>
        <table className="tv"><thead><tr><th>Jour</th><th className="n">Articles</th></tr></thead>
          <tbody>{[...keys].reverse().map(k => <tr key={k}><td>{k.split('-').reverse().join('/')}</td><td className="n">{perDay[k]}</td></tr>)}</tbody></table></details>
    </section>
  </>)
}
