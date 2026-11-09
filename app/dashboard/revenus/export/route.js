import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { parseAmount } from '@/lib/money'
export const dynamic = 'force-dynamic'
const csv = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"` }   // protège contre l'injection de formules dans Excel
export async function GET(req) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) return new Response('Accès refusé', { status: 403 })
  const p = new URL(req.url).searchParams.get('p'), days = ['30', '90', '365'].includes(p) ? Number(p) : null
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : '1970-01-01T00:00:00Z'
  const [{ data: svc }, { data: ads }] = await Promise.all([
    sb.from('service_posts').select('type,title,amount_note,published_at').eq('is_paid', true).gte('published_at', since).order('published_at', { ascending: false }).limit(5000),
    sb.from('ads').select('title,advertiser,amount_note,starts_at').gte('starts_at', since).order('starts_at', { ascending: false }).limit(2000)])
  const rows = [['Source', 'Date', 'Libellé', 'Détail', 'Montant saisi', 'Montant lu', 'Devise'],
    ...(svc || []).map(s => { const a = parseAmount(s.amount_note); return ['Service', String(s.published_at || '').slice(0, 10), s.title, s.type, s.amount_note || '', a ? a.value : '', a ? a.cur : ''] }),
    ...(ads || []).map(s => { const a = parseAmount(s.amount_note); return ['Publicité', String(s.starts_at || '').slice(0, 10), s.title, s.advertiser || '', s.amount_note || '', a ? a.value : '', a ? a.cur : ''] })]
  return new Response('﻿' + rows.map(r => r.map(csv).join(';')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="revenus-tolobana.csv"' } })
}
