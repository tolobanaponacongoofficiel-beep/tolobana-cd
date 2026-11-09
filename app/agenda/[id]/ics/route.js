import { supabaseAnon } from '@/lib/supabase/anon'
import { isUuid } from '@/lib/blocks'
import { ics } from '@/lib/agenda'
import { SITE_URL } from '@/lib/site'
export const dynamic = 'force-dynamic'
export async function GET(_req, { params }) {
  if (!isUuid(params.id)) return new Response('Introuvable', { status: 404 })
  const { data: e } = await supabaseAnon().from('events').select('id,title,description,venue,city,starts_at,ends_at').eq('id', params.id).eq('is_published', true).maybeSingle()
  if (!e) return new Response('Introuvable', { status: 404 })
  return new Response(ics(e, `${SITE_URL}/agenda/${e.id}`), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="evenement.ics"' } })
}
