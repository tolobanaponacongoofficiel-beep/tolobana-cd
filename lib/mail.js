// Envoi d'e-mails via Resend (https://resend.com). Variables : RESEND_API_KEY, NEWSLETTER_FROM.
const FROM = process.env.NEWSLETTER_FROM || 'Tolobana Info <onboarding@resend.dev>'
export const mailReady = () => !!process.env.RESEND_API_KEY
export async function sendBatch(list) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, error: 'RESEND_API_KEY manquante' }
  try {
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(list.map(m => ({ from: FROM, to: [m.to], subject: m.subject, html: m.html, headers: m.headers }))),
    })
    if (!res.ok) return { ok: false, error: (await res.text()).slice(0, 200) }
    return { ok: true }
  } catch (e) { return { ok: false, error: String(e).slice(0, 200) } }
}
