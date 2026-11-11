'use server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
const PROVIDERS = ['google', 'facebook']
const mail = v => String(v || '').trim().toLowerCase().slice(0, 200)
function origin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/$/, '')
  const h = headers(); const host = h.get('x-forwarded-host') || h.get('host')
  return `${h.get('x-forwarded-proto') || 'https'}://${host}`
}
export async function signIn(_, fd) {
  const { error } = await supabaseServer().auth.signInWithPassword({ email: mail(fd.get('email')), password: String(fd.get('password') || '') })
  if (error) return { error: 'E-mail ou mot de passe incorrect.' }
  redirect('/dashboard')
}
export async function signUp(_, fd) {
  const password = String(fd.get('password') || '')
  if (password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  const { data, error } = await supabaseServer().auth.signUp({ email: mail(fd.get('email')), password, options: { data: { name: String(fd.get('name') || '').trim().slice(0, 80) }, emailRedirectTo: `${origin()}/auth/callback?next=/` } })
  if (error) return { error: error.message }
  if (!data?.session) return { ok: 'Compte créé. Ouvrez le message que nous vous avons envoyé pour confirmer votre e-mail.' }
  redirect('/dashboard')
}
export async function signOut() { await supabaseServer().auth.signOut(); redirect('/') }
export async function oauth(fd) {
  const provider = String(fd.get('provider') || '')
  if (!PROVIDERS.includes(provider)) redirect('/login?err=1')
  const { data, error } = await supabaseServer().auth.signInWithOAuth({ provider, options: { redirectTo: `${origin()}/auth/callback?next=/dashboard` } })
  if (error || !data?.url) redirect('/login?err=2')
  redirect(data.url)
}
export async function forgot(_, fd) {
  const email = mail(fd.get('email'))
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Saisissez une adresse e-mail valide.' }
  await supabaseServer().auth.resetPasswordForEmail(email, { redirectTo: `${origin()}/auth/callback?next=/login/reinitialiser` })
  return { ok: 'Si cette adresse existe, un lien de réinitialisation vient de lui être envoyé.' }
}
export async function setPassword(_, fd) {
  const p = String(fd.get('password') || '')
  if (p.length < 8) return { error: 'Au moins 8 caractères.' }
  if (p !== String(fd.get('confirm') || '')) return { error: 'Les deux mots de passe sont différents.' }
  const { error } = await supabaseServer().auth.updateUser({ password: p })
  if (error) return { error: 'Lien expiré. Demandez un nouveau lien.' }
  redirect('/dashboard')
}
