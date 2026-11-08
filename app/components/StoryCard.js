import Link from 'next/link'
import { saverOn } from '@/lib/saver'
import StoryActions from './StoryActions'
import './phase11.css'
export function StoryFace({ s, saver }) {
  const bg = saver ? undefined : { backgroundImage: `url("${s.image_url}")` }
  return (
    <div className="story" style={bg}>
      <div className="story-shade" />
      <div className="story-in">
        {s.kicker && <span className="story-kick">{s.kicker}</span>}
        <strong className="story-title">{s.title}</strong>
        {(s.stat1_value || s.stat2_value) && <div className="story-stats">
          {s.stat1_value && <div><b>{s.stat1_value}</b><span>{s.stat1_label}</span></div>}
          {s.stat2_value && <div><b>{s.stat2_value}</b><span>{s.stat2_label}</span></div>}</div>}
      </div>
    </div>)
}
// Carte Story : cliquable vers l'article (si lié), avec boutons de partage.
export default function StoryCard({ s, org, siteUrl, actions = true }) {
  const saver = saverOn()
  const href = s.article_slug ? `/article/${s.article_slug}` : null
  const face = <StoryFace s={s} saver={saver} />
  return (
    <div className="story-wrap">
      {href ? <Link href={href} aria-label={s.title}>{face}</Link> : face}
      {actions && <StoryActions story={{ id: s.id, title: s.title, kicker: s.kicker, image_url: s.image_url, stat1_value: s.stat1_value, stat1_label: s.stat1_label, stat2_value: s.stat2_value, stat2_label: s.stat2_label }}
        url={href ? `${siteUrl}${href}` : `${siteUrl}/stories`} org={org} />}
    </div>)
}
