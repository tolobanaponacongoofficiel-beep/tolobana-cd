import { NextResponse } from 'next/server'
import { supabaseAnon } from '@/lib/supabase/anon'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/blocks'
export const dynamic = 'force-dynamic'
// Compte le clic puis envoie le lecteur vers le site de l'annonceur.
export async function GET(req, { params }) {
  const home = new URL('/', req.url)
  if (!isUuid(params.id)) return NextResponse.redirect(home)
  const { data: ad } = await supabaseAnon().from('ads').select('id,link_url').eq('id', params.id).eq('is_active', true).maybeSingle()
  if (!ad || !/^https?:\/\/[^\s]+$/i.test(ad.link_url || '')) return NextResponse.redirect(home)
  const db = supabaseAdmin()
  if (db) { try { await db.rpc('increment_ad', { p_id: ad.id, p_kind: 'click' }) } catch {} }
  return NextResponse.redirect(ad.link_url, 302)
}
