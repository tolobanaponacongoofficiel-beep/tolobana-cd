import { NextResponse } from 'next/server'
import { supabaseAnon } from '@/lib/supabase/anon'
export const dynamic = 'force-dynamic'
export async function GET(_req, { params }) {
  const sb = supabaseAnon()
  const { data: live } = await sb.from('lives').select('id,status,is_published').eq('slug', params.slug).eq('is_published', true).maybeSingle()
  if (!live) return NextResponse.json({ error: 'introuvable' }, { status: 404 })
  const { data } = await sb.from('live_entries').select('id,body,image_url,important,created_at').eq('live_id', live.id).order('created_at', { ascending: false }).limit(150)
  return NextResponse.json({ status: live.status, entries: data || [] }, { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' } })
}
