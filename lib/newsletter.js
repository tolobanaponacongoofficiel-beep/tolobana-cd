import { SITE_URL } from './site'
const esc = s => String(s ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' }[c]))
const shell = (preheader, inner) => `<!doctype html><html lang="fr"><body style="margin:0;background:#f2f4f7">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7"><tr><td align="center" style="padding:16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#031523;padding:16px 24px"><a href="${esc(SITE_URL)}"><img src="${esc(SITE_URL)}/logo.png" alt="Tolobana Info" height="56" style="height:56px;display:block"></a></td></tr>
<tr><td style="padding:24px;font:16px/1.55 Arial,sans-serif;color:#101a26">${inner}</td></tr>
<tr><td style="padding:16px 24px;background:#f7f9fb;font:12px/1.5 Arial,sans-serif;color:#667">Vous recevez cet e-mail car vous êtes abonné(e) à la newsletter de Tolobana Info.<br><a href="{{UNSUB}}" style="color:#0a84d6">Se désabonner</a></td></tr>
</table></td></tr></table></body></html>`

export const confirmEmail = url => ({
  subject: 'Confirmez votre inscription à Tolobana Info',
  html: shell('Un clic pour confirmer', `<h2 style="margin:0 0 12px;font-family:Georgia,serif">Bienvenue à Tolobana Info</h2>
<p>Pour recevoir notre newsletter, confirmez votre adresse e-mail :</p>
<p style="margin:24px 0"><a href="${esc(url)}" style="background:#0a84d6;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Confirmer mon inscription</a></p>
<p style="color:#667;font-size:14px">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</p>`),
})

export function digestHtml({ subject, intro, articles }) {
  const items = articles.map(a => {
    const link = `${SITE_URL}/article/${a.slug}`
    return `<tr><td style="padding:18px 0;border-bottom:1px solid #e3e8ee">
${a.image_url ? `<a href="${esc(link)}"><img src="${esc(a.image_url)}" alt="" width="552" style="width:100%;max-width:552px;height:auto;border-radius:6px;display:block;margin-bottom:10px"></a>` : ''}
<a href="${esc(link)}" style="font:700 20px/1.3 Georgia,serif;color:#101a26;text-decoration:none">${esc(a.title)}</a>
<div style="font:14px/1.5 Arial,sans-serif;color:#556;margin-top:6px">${esc(a.summary || '')}</div></td></tr>`
  }).join('')
  const introHtml = intro ? esc(intro).split(/\n+/).map(p => `<p>${p}</p>`).join('') : ''
  return shell(subject, `${introHtml}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
<p style="margin-top:20px"><a href="${esc(SITE_URL)}" style="color:#0a84d6;font-weight:bold">Toute l'actualité sur Tolobana Info →</a></p>`)
}
