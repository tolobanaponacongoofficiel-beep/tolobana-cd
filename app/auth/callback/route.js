import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
// Retour des connexions Google/Facebook et des liens e-mail (confirmation, mot de passe oublié).
export async function GET(req) {
  const url = new URL(req.url), code = url.searchParams.get('code'), n = url.searchParams.get('next') || '/'
  const next = /^\/(?!\/)[\w\-./]*$/.test(n) ? n : '/'
  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, url.origin))
  }
  return NextResponse.redirect(new URL('/login?err=3', url.origin))
}
