import { NextResponse } from 'next/server'
import { supabaseAnon } from '@/lib/supabase/anon'
export async function POST(req) {
  let b; try { b = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const e = String(b?.endpoint || ''), k = b?.keys || {}
  if (!/^https:\/\//.test(e) || e.length > 1000 || !k.p256dh || !k.auth || String(k.p256dh).length > 200 || String(k.auth).length > 100) return NextResponse.json({ ok: false }, { status: 400 })
  const { error } = await supabaseAnon().rpc('push_subscribe', { p_endpoint: e, p_p256dh: k.p256dh, p_auth: k.auth })
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 })
}
