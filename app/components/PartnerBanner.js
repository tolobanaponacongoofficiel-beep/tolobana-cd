import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import BannerCarousel from './BannerCarousel'

// Bannière des partenaires, affichée au-dessus des articles.
export default async function PartnerBanner() {
  const { sb, role } = await getUserAndRole()
  const { data } = await sb.from('partners').select('id,name,banner_url,link_url').eq('is_active', true)
    .not('banner_url', 'is', null).order('position').order('id').limit(10)
  const slides = (data || []).map(p => ({ id: p.id, name: p.name, image: p.banner_url, link: /^https?:\/\//.test(p.link_url || '') ? p.link_url : '' }))
  if (!slides.length) {
    return atLeast(role, 'admin')
      ? <div className="banner-empty">Espace partenaires (visible par les administrateurs seulement) : aucune bannière. <a href="/dashboard/partenaires">Ajouter une bannière</a></div>
      : null
  }
  return <BannerCarousel slides={slides} />
}
