import { SITE_URL } from '@/lib/site'
import { supabaseAnon } from '@/lib/supabase/anon'
export const revalidate = 600
const esc = s => String(s ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
// Plan Google News : uniquement les articles des 2 derniers jours.
export async function GET() {
  const now = new Date(), since = new Date(now.getTime() - 2 * 86400000).toISOString()
  const { data } = await supabaseAnon().from('articles').select('title,slug,published_at').eq('status', 'published')
    .gte('published_at', since).lte('published_at', now.toISOString()).order('published_at', { ascending: false }).limit(1000)
  const items = (data || []).map(a => `<url><loc>${esc(`${SITE_URL}/article/${a.slug}`)}</loc><news:news><news:publication><news:name>Tolobana Info</news:name><news:language>fr</news:language></news:publication><news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date><news:title>${esc(a.title)}</news:title></news:news></url>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items}</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } })
}
