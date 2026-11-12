import { NextResponse } from 'next/server'
import { supabaseAnon } from '@/lib/supabase/anon'
export async function POST(req) {
  let b; try { b = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const e = String(b?.endpoint || '')
  if (!/^https:\/\//.test(e) || e.length > 1000) return NextResponse.json({ ok: false }, { status: 400 })
  const { error } = await supabaseAnon().rpc('push_unsubscribe', { p_endpoint: e })
  return NextResponse.json({ ok: !error })
}
