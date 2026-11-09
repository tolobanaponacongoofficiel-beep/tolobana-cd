import { NextResponse } from 'next/server'
import { supabaseAnon } from '@/lib/supabase/anon'
export const dynamic = 'force-dynamic'
export async function GET(req) {
  const raw = new URL(req.url).searchParams.get('s') || ''
  const slugs = [...new Set(raw.split(',').map(s => s.trim()).filter(s => /^[a-z0-9][a-z0-9-]{0,199}$/.test(s)))].slice(0, 40)
  if (!slugs.length) return NextResponse.json({ items: [] })
  const { data } = await supabaseAnon().from('articles').select('slug,title,image_url,published_at,categories(name)').in('slug', slugs).eq('status', 'published').lte('published_at', new Date().toISOString())
  return NextResponse.json({ items: (data || []).map(a => ({ slug: a.slug, title: a.title, image_url: a.image_url, published_at: a.published_at, category: a.categories?.name || null })) }, { headers: { 'Cache-Control': 'private, no-store' } })
}
