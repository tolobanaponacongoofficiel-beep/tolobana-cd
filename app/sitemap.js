import { SITE_URL } from '@/lib/site'
import { supabaseAnon } from '@/lib/supabase/anon'
export const revalidate = 3600
export default async function sitemap() {
  const sb = supabaseAnon(), now = new Date().toISOString()
  const [{ data: arts }, { data: cats }, { data: vids }] = await Promise.all([
    sb.from('articles').select('slug,updated_at,published_at').eq('status', 'published').lte('published_at', now).order('published_at', { ascending: false }).limit(5000),
    sb.from('categories').select('slug').eq('show_in_menu', true).is('parent_id', null),
    sb.from('videos').select('slug,published_at').eq('is_published', true).lte('published_at', now).limit(2000),
  ])
  return [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/tv`, changeFrequency: 'daily', priority: 0.7 },
    ...(cats || []).map(c => ({ url: `${SITE_URL}/?rubrique=${c.slug}`, changeFrequency: 'daily', priority: 0.6 })),
    ...(arts || []).map(a => ({ url: `${SITE_URL}/article/${a.slug}`, lastModified: new Date(a.updated_at || a.published_at), changeFrequency: 'weekly', priority: 0.8 })),
    ...(vids || []).map(v => ({ url: `${SITE_URL}/tv/${v.slug}`, lastModified: new Date(v.published_at), priority: 0.5 })),
  ]
}
