import { SITE_URL } from '@/lib/site'
import { supabaseAnon } from '@/lib/supabase/anon'
export const revalidate = 600
const esc = s => String(s ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
export async function GET() {
  const { data } = await supabaseAnon().from('articles').select('title,slug,summary,published_at,categories(name)').eq('status', 'published')
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(30)
  const items = (data || []).map(a => `<item><title>${esc(a.title)}</title><link>${esc(`${SITE_URL}/article/${a.slug}`)}</link><guid isPermaLink="true">${esc(`${SITE_URL}/article/${a.slug}`)}</guid><pubDate>${new Date(a.published_at).toUTCString()}</pubDate>${a.categories?.name ? `<category>${esc(a.categories.name)}</category>` : ''}<description>${esc(a.summary || '')}</description></item>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Tolobana Info</title><link>${esc(SITE_URL)}</link><description>L'information au cœur de l'actualité.</description><language>fr</language><atom:link href="${esc(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' } })
}
