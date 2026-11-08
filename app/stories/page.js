import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { SITE_URL } from '@/lib/site'
import { isMediaUrl } from '@/lib/blocks'
import StoryCard from '../components/StoryCard'
import '../components/phase11.css'
export const metadata = { title: 'Stories', description: 'L’essentiel en cartes illustrées, faciles à partager.', alternates: { canonical: '/stories' } }
export default async function Stories() {
  const sb = supabaseServer()
  const [{ data }, set] = await Promise.all([sb.from('stories').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(60), getSettings(sb)])
  const list = (data || []).filter(s => isMediaUrl(s.image_url))
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Stories</h1></div>
    <p className="meta">L’essentiel en une carte. Touchez « Partager l’image » pour l’envoyer sur WhatsApp ou la publier sur vos réseaux.</p>
    <div className="stories-grid">{list.map(s => <StoryCard key={s.id} s={s} org={set.org_name || 'Tolobana Info'} siteUrl={SITE_URL} />)}</div>
    {!list.length && <p className="empty">Aucune story pour le moment.</p>}
  </main>)
}
