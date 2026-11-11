import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { today } from '@/lib/sport'
export const metadata = { title: 'Diagnostic sport' }
export const dynamic = 'force-dynamic'
async function call(url, headers) {
  try {
    const r = await fetch(url, { headers, cache: 'no-store' }), t = await r.text()
    let j = null; try { j = JSON.parse(t) } catch {}
    return { status: r.status, j, raw: j ? null : t.slice(0, 200) }
  } catch (e) { return { status: 0, raw: String(e?.message || e).slice(0, 200) } }
}
const errs = j => { const e = j?.errors; return e && (Array.isArray(e) ? e.length : Object.keys(e).length) ? JSON.stringify(e) : null }
export default async function Diag() {
  const { user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const key = process.env.APIFOOTBALL_KEY, tok = process.env.FOOTBALL_DATA_TOKEN, rows = []
  rows.push(['Variable APIFOOTBALL_KEY', key ? `présente (${key.length} caractères)` : 'ABSENTE : ajoutez-la dans Vercel puis redéployez', !!key])
  rows.push(['Variable FOOTBALL_DATA_TOKEN', tok ? 'présente' : 'absente', !!tok])
  if (key) {
    const H = { 'x-apisports-key': key }, B = 'https://v3.football.api-sports.io'
    const st = await call(`${B}/status`, H)
    const sub = st.j?.response?.subscription, rq = st.j?.response?.requests
    rows.push(['API-Football : compte', st.status !== 200 ? `HTTP ${st.status} ${st.raw || ''}` : errs(st.j) ? `Refusé : ${errs(st.j)}` : `plan ${sub?.plan || '?'}, actif : ${sub?.active ? 'oui' : 'non'}, requêtes aujourd’hui : ${rq?.current ?? '?'} / ${rq?.limit_day ?? '?'}`, st.status === 200 && !errs(st.j)])
    const fx = await call(`${B}/fixtures?date=${today()}&timezone=Africa%2FKinshasa`, H)
    rows.push(['API-Football : matchs du jour', errs(fx.j) ? `Refusé : ${errs(fx.j)}` : fx.status !== 200 ? `HTTP ${fx.status}` : `${fx.j?.response?.length ?? 0} matchs reçus`, fx.status === 200 && !errs(fx.j)])
    const lg = await call(`${B}/leagues?id=39&current=true`, H), yr = lg.j?.response?.[0]?.seasons?.find(s => s.current)?.year
    rows.push(['API-Football : saison en cours (Premier League)', errs(lg.j) ? `Refusé : ${errs(lg.j)}` : yr ? String(yr) : 'introuvable', !!yr])
    if (yr) {
      const ft = await call(`${B}/fixtures?league=39&season=${yr}&last=1&timezone=Africa%2FKinshasa`, H), f = ft.j?.response?.[0]
      rows.push(['API-Football : dernier match de Premier League', errs(ft.j) ? `Refusé : ${errs(ft.j)}` : f ? `${f.teams?.home?.name} - ${f.teams?.away?.name}` : 'aucun', !!f && !errs(ft.j)])
      if (f) { const d = await call(`${B}/fixtures?id=${f.fixture.id}`, H), x = d.j?.response?.[0]
        rows.push(['API-Football : chronologie de ce match', errs(d.j) ? `Refusé : ${errs(d.j)}` : x ? `${x.events?.length || 0} événements, ${x.lineups?.length || 0} compositions` : 'aucune donnée', !!x?.events?.length]) }
    }
  }
  return (<>
    <div className="dash-head"><h1>Diagnostic sport</h1></div>
    <p className="meta">Vérifie que les sources de données répondent. Ne montre jamais les clés.</p>
    <section className="panel"><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
      {rows.map(([k, v, ok], i) => <li key={i}><b>{ok ? 'OK' : 'À corriger'}</b> · {k} : <span className="meta">{v}</span></li>)}</ul></section>
    <p className="meta">Si « Refusé » apparaît avec un message sur la saison ou le plan, l’offre gratuite ne couvre pas cette saison : copiez-moi le message.</p></>)
}
