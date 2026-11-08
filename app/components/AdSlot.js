import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { saverOn } from '@/lib/saver'
import { isMediaUrl } from '@/lib/blocks'
// Emplacement publicitaire : choisit au hasard une annonce active pour l'emplacement demandé (banner, sidebar, article).
export default async function AdSlot({ placement }) {
  try {
    const sb = supabaseServer(), now = new Date().toISOString()
    const { data } = await sb.from('ads').select('id,title,image_url,link_url').eq('placement', placement).eq('is_active', true)
      .lte('starts_at', now).or(`ends_at.is.null,ends_at.gt.${now}`).limit(10)
    const ads = (data || []).filter(a => isMediaUrl(a.image_url))
    if (!ads.length) return null
    const ad = ads[Math.floor(Math.random() * ads.length)]
    const db = supabaseAdmin()
    if (db) { try { await db.rpc('increment_ad', { p_id: ad.id, p_kind: 'view' }) } catch {} }
    const saver = saverOn()
    const inner = saver ? <span className="btn ghost sm">{ad.title}</span> : <img src={ad.image_url} alt={ad.title} loading="lazy" />
    return (
      <aside className={`ad-slot ${placement}`} aria-label="Publicité">
        <span className="ad-tag">Publicité</span>
        {ad.link_url ? <a href={`/api/pub/${ad.id}`} target="_blank" rel="sponsored noopener noreferrer">{inner}</a> : inner}
      </aside>)
  } catch { return null }
}
