'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { mailReady, sendBatch } from '@/lib/mail'
import { digestHtml } from '@/lib/newsletter'
import { SITE_URL } from '@/lib/site'

async function admin() {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  return { sb, user }
}
export async function sendCampaign(fd) {
  const { sb, user } = await admin()
  if (!mailReady()) redirect('/dashboard/newsletter?err=mail')
  const subject = String(fd.get('subject') || '').trim().slice(0, 150)
  const intro = String(fd.get('intro') || '').trim().slice(0, 1500)
  const n = [3, 5, 8].includes(Number(fd.get('count'))) ? Number(fd.get('count')) : 5
  const all = fd.get('all') === 'on'
  if (!subject) redirect('/dashboard/newsletter?err=sujet')
  // Anti-doublon : même objet déjà envoyé à tous dans les 30 dernières minutes (double clic, page rechargée…)
  if (all) {
    const since = new Date(Date.now() - 30 * 60000).toISOString()
    const { data: dup } = await sb.from('newsletter_campaigns').select('id').eq('subject', subject).gte('sent_at', since).limit(1)
    if (dup?.length) redirect('/dashboard/newsletter?err=doublon')
  }
  const { data: arts } = await sb.from('articles').select('title,slug,summary,image_url').eq('status', 'published')
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(n)
  if (!arts?.length) redirect('/dashboard/newsletter?err=articles')
  let recipients = []
  if (all) {
    for (let from = 0; ; from += 1000) {
      const { data } = await sb.from('subscribers').select('email,token').eq('status', 'confirmed').order('id').range(from, from + 999)
      if (!data?.length) break
      recipients.push(...data)
      if (data.length < 1000) break
    }
  } else recipients = [{ email: user.email, token: null }]
  if (!recipients.length) redirect('/dashboard/newsletter?err=abonnes')
  const html = digestHtml({ subject, intro, articles: arts })
  let sent = 0
  for (let i = 0; i < recipients.length; i += 50) {
    const chunk = recipients.slice(i, i + 50)
    const r = await sendBatch(chunk.map(s => {
      const u = s.token ? `${SITE_URL}/newsletter/desabonnement?token=${s.token}` : `${SITE_URL}/`
      return { to: s.email, subject, html: html.replace(/\{\{UNSUB\}\}/g, u), headers: s.token ? { 'List-Unsubscribe': `<${u}>` } : undefined }
    }))
    if (!r.ok) {
      if (all && sent > 0) await sb.from('newsletter_campaigns').insert({ subject: `${subject} (envoi interrompu)`, body: intro || null, sent_count: sent, created_by: user.id })
      redirect(`/dashboard/newsletter?err=envoi&sent=${sent}`)
    }
    sent += chunk.length
  }
  if (all) await sb.from('newsletter_campaigns').insert({ subject, body: intro || null, sent_count: sent, created_by: user.id })
  await sb.from('audit_log').insert({ user_id: user.id, action: all ? 'newsletter_send' : 'newsletter_test', target: String(sent) })
  revalidatePath('/dashboard/newsletter')
  redirect(`/dashboard/newsletter?ok=${all ? 'all' : 'test'}&sent=${sent}`)
}
export async function deleteSubscriber(fd) {
  const { sb, user } = await admin()
  const id = Number(fd.get('id'))
  if (!Number.isInteger(id)) return
  await sb.from('subscribers').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'subscriber_delete', target: String(id) })
  revalidatePath('/dashboard/newsletter')
  redirect('/dashboard/newsletter?ok=del')
}
