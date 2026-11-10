import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getDay, today, timeOf, dateLabel } from '@/lib/sport'
import { streamEmbed } from '@/lib/stream'
import { safeUrl } from '@/lib/blocks'
import { saverOn } from '@/lib/saver'
import MatchList from '../components/MatchList'
import { SportHero } from '../components/SportHero'
import AutoRefresh from '../components/AutoRefresh'
import StreamPlayer from '../components/StreamPlayer'
import '../components/phase13.css'
import '../components/phase18.css'
export const metadata = { title: 'Direct Foot : matchs en direct et où les regarder', description: 'Scores en direct, diffusions officielles et chaînes où regarder les matchs de football.', alternates: { canonical: '/direct-foot' } }
export const revalidate = 30
export default async function DirectFoot({ searchParams }) {
  const sb = supabaseServer(), saver = saverOn()
  // Next.js versions with async searchParams expose it as a Promise.
  const params = await searchParams
  const [list, st, gd] = await Promise.all([
    getDay(sb, today()).catch(() => []),
    sb.from('foot_streams').select('id,title,embed_url,note').eq('is_active', true).order('sort').order('created_at', { ascending: false }).limit(12),
    sb.from('foot_guide').select('id,match_label,competition,kickoff,channels,link_url').eq('is_active', true).gte('kickoff', new Date(Date.now() - 3 * 3600e3).toISOString()).order('kickoff').limit(40)])
  const live = (list || []).filter(m => m.status === 'live')
  const streams = (st.data || []).filter(s => streamEmbed(s.embed_url))
  const cur = streams.find(s => s.id === params?.c) || streams[0]
  const embed = cur ? streamEmbed(cur.embed_url) : null
  const guide = gd.data || []
  return (<main className="wrap sport-page df-page">
    {live.length > 0 && <AutoRefresh every={60} />}
    <SportHero title="Direct Foot" sub="Matchs en direct, diffusions officielles et chaînes où regarder." />
    <section><h2 className="sp-h">{live.length > 0 && <span className="sp-live">● </span>}En direct maintenant</h2>
      {live.length ? <MatchList matches={live} saver={saver} /> : <p className="empty">Aucun match en cours. Voyez le programme ci-dessous ou <Link href="/sport">tous les scores</Link>.</p>}</section>
    <section><h2 className="sp-h">Vidéo en direct</h2>
      {streams.length > 0 && <nav className="df-chips" aria-label="Choisir une diffusion">{streams.map(s => <Link key={s.id} href={`/direct-foot?c=${encodeURIComponent(s.id)}`} className={s.id === cur?.id ? 'on' : ''} aria-current={s.id === cur?.id ? 'page' : undefined}>{s.title}</Link>)}</nav>}
      {embed ? <div className="stream-box df-player"><StreamPlayer key={cur.id} embed={embed} saver={saver} title={cur.title} />{cur.note && <p className="meta">{cur.note}</p>}</div>
        : <p className="empty">Aucune diffusion officielle en ce moment.</p>}</section>
    <section><h2 className="sp-h">Où regarder</h2>
      {guide.length ? <ul className="df-guide">{guide.map(g => { const u = safeUrl(g.link_url); return (<li key={g.id}>
        <div className="df-when"><b>{timeOf(g.kickoff)}</b><span>{dateLabel(g.kickoff)}</span></div>
        <div className="df-what"><b>{g.match_label}</b>{g.competition && <span className="meta">{g.competition}</span>}<span className="df-ch">{g.channels}</span>{u && <a href={u} target="_blank" rel="noopener noreferrer">Site du diffuseur</a>}</div></li>) })}</ul>
        : <p className="empty">Le programme des diffusions sera publié ici.</p>}
      <p className="meta">Heures de Kinshasa. Diffuseurs officiels uniquement.</p></section>
  </main>)
}
