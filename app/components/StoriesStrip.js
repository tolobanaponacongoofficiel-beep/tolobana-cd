import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { StoryFace } from './StoryCard'
import { saverOn } from '@/lib/saver'
import { isMediaUrl } from '@/lib/blocks'
import './phase11.css'
// Bandeau « Stories » de l'accueil : défilement horizontal au doigt.
export default async function StoriesStrip() {
  const { data } = await supabaseServer().from('stories').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(10)
  const list = (data || []).filter(s => isMediaUrl(s.image_url))
  if (!list.length) return null
  const saver = saverOn()
  return (
    <section className="stories-strip" aria-label="Stories">
      <div className="sec-head"><h2 className="sec">Stories <span className="badge">{list.length}</span></h2><Link href="/stories">Toutes les stories</Link></div>
      <div className="strip" tabIndex={0} role="list">
        {list.map(s => (<div key={s.id} role="listitem" className="strip-item">
          {s.article_slug ? <Link href={`/article/${s.article_slug}`} aria-label={s.title}><StoryFace s={s} saver={saver} /></Link> : <Link href="/stories" aria-label={s.title}><StoryFace s={s} saver={saver} /></Link>}
        </div>))}
      </div>
    </section>)
}
