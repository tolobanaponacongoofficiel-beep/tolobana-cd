import { getUserAndRole, atLeast } from '@/lib/supabase/server'
const cell = v => { const s = String(v ?? ''); return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"` }
export async function GET() {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) return new Response('Accès refusé', { status: 403 })
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from('subscribers').select('email,status,created_at,confirmed_at').order('id').range(from, from + 999)
    if (!data?.length) break
    rows.push(...data)
    if (data.length < 1000) break
  }
  const csv = ['email,statut,inscription,confirmation', ...rows.map(r => [r.email, r.status, r.created_at, r.confirmed_at].map(cell).join(','))].join('\n')
  return new Response('\uFEFF' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="abonnes-tolobana.csv"', 'Cache-Control': 'no-store' } })
}
