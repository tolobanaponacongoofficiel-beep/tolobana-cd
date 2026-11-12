'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { pushReady, sendMany, generateVapid } from '@/lib/push'
const B = '/dashboard/alertes'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
const t = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n)
export async function sendAlert(fd) {
  const { sb, user } = await editor()
  if (!pushReady()) redirect(`${B}?err=1`)
  const title = t(fd, 'title', 70), body = t(fd, 'body', 160), url = t(fd, 'url', 300) || '/'
  if (title.length < 3) redirect(`${B}?err=2`)
  if (!(/^\/(?!\/)/.test(url) || /^https:\/\//.test(url))) redirect(`${B}?err=3`)
  const { data: subs, error } = await sb.from('push_subscriptions').select('endpoint,p256dh,auth').limit(600)
  if (error) redirect(`${B}?err=4`)
  const r = await sendMany(subs || [], { title, body, url, tag: 'tolobana-alert' })
  if (r.gone.length) await sb.from('push_subscriptions').delete().in('endpoint', r.gone)
  await sb.from('push_log').insert({ title, body: body || null, url, sent: r.ok, failed: r.fail + r.gone.length, created_by: user.id })
  await sb.from('audit_log').insert({ user_id: user.id, action: 'push_send', target: title.slice(0, 80) })
  revalidatePath(B); redirect(`${B}?ok=${r.ok}`)
}
// Génère une paire de clés VAPID à copier dans Vercel (affichée une fois, jamais enregistrée).
export async function makeKeys() {
  const { role } = await getUserAndRole(); if (!atLeast(role, 'admin')) redirect('/dashboard')
  const k = generateVapid()
  redirect(`${B}?pub=${encodeURIComponent(k.publicKey)}&priv=${encodeURIComponent(k.privateKey)}`)
}
