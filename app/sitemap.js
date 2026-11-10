import { SITE_URL } from '@/lib/site'
import { supabaseAnon } from '@/lib/supabase/anon'
import { COMPS } from '@/lib/sport'
export const revalidate = 3600
export default async function sitemap() {
  const sb = supabaseAnon(), now = new Date().toISOString()
  const [{ data: arts }, { data: cats }, { data: vids }, { data: dos }, { data: lvs }, { data: evs }] = await Promise.all([
    sb.from('articles').select('slug,updated_at,last_update_at,published_at').eq('status', 'published').lte('published_at', now).order('published_at', { ascending: false }).limit(5000),
    sb.from('categories').select('slug').eq('show_in_menu', true).is('parent_id', null),
    sb.from('videos').select('slug,published_at').eq('is_published', true).lte('published_at', now).limit(2000),
    sb.from('dossiers').select('slug,created_at').eq('is_published', true).limit(500),
    sb.from('lives').select('slug,created_at,ended_at').eq('is_published', true).order('created_at', { ascending: false }).limit(500),
    sb.from('events').select('id,starts_at').eq('is_published', true).gte('starts_at', now).limit(500),
  ])
  const fixed = ['/tv', '/dossiers', '/sondages', '/direct', '/direct-foot', '/en-continu', '/stories', '/meteo', '/taux', '/sport', ...COMPS.map(c => `/sport/${c.code.toLowerCase()}`), '/agenda', '/services', '/services/deposer', ...['deces', 'communique', 'emploi', 'appel', 'annonce'].map(t => `/services/${t}`), '/verification', '/annoncer', '/a-propos', '/contact', '/mentions-legales', '/charte-editoriale', '/confidentialite']
  return [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    ...fixed.map(p => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly', priority: 0.4 })),
    ...(cats || []).map(c => ({ url: `${SITE_URL}/?rubrique=${c.slug}`, changeFrequency: 'daily', priority: 0.6 })),
    ...(arts || []).map(a => ({ url: `${SITE_URL}/article/${a.slug}`, lastModified: new Date(a.last_update_at || a.updated_at || a.published_at), changeFrequency: 'weekly', priority: 0.8 })),
    ...(vids || []).map(v => ({ url: `${SITE_URL}/tv/${v.slug}`, lastModified: new Date(v.published_at), priority: 0.5 })),
    ...(lvs || []).map(l => ({ url: `${SITE_URL}/direct/${l.slug}`, lastModified: new Date(l.ended_at || l.created_at), priority: 0.6 })),
    ...(evs || []).map(e => ({ url: `${SITE_URL}/agenda/${e.id}`, lastModified: new Date(e.starts_at), priority: 0.5 })),
    ...(dos || []).map(d => ({ url: `${SITE_URL}/dossiers/${d.slug}`, lastModified: new Date(d.created_at), priority: 0.6 })),
  ]
}
