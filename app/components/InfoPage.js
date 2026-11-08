import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { PAGES, parse, fill } from '@/lib/pages'
import './phase9.css'
export default async function InfoPage({ slug, children }) {
  const sb = supabaseServer()
  const [s, { data: row }] = await Promise.all([getSettings(sb), sb.from('pages').select('body,updated_at').eq('slug', slug).maybeSingle()])
  const def = PAGES[slug]
  const blocks = parse(row?.body || def.body, s)
  return (
    <main className="wrap"><article className="info-page">
      <h1>{fill(def.title, s)}</h1>
      {blocks.map((b, i) => b.t === 'h2' ? <h2 key={i}>{b.text}</h2> : b.t === 'ul' ? <ul key={i}>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul> : <p key={i}>{b.text}</p>)}
      {children}
      {row?.updated_at && <p className="meta">Dernière mise à jour : {new Date(row.updated_at).toLocaleDateString('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Kinshasa' })}</p>}
    </article></main>)
}
