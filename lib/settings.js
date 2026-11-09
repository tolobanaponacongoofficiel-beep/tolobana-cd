export const SETTING_FIELDS = [
  ['org_name', 'Nom du média'], ['legal_name', 'Raison sociale de l’éditeur'], ['director', 'Directeur de la publication'],
  ['email', 'E-mail de contact'], ['phone', 'Téléphone'], ['whatsapp', 'WhatsApp (avec indicatif, ex. +243…)'],
  ['address', 'Adresse'], ['founded', 'Année de création'],
  ['whatsapp_channel', 'Chaîne WhatsApp (lien complet https://whatsapp.com/channel/…)'],
  ['facebook', 'Page Facebook (lien complet)'], ['x_twitter', 'Compte X / Twitter (lien complet)'], ['youtube', 'Chaîne YouTube (lien complet)'],
  ['tiktok', 'TikTok (lien complet)'], ['instagram', 'Instagram (lien complet)'],
  ['rate_usd_cdf', 'Taux officiel : combien de CDF pour 1 USD (ex. 2850) — vide = taux indicatif automatique'],
  ['rate_eur_cdf', 'Taux officiel : combien de CDF pour 1 EUR (facultatif)'],
  ['rate_date', 'Date du taux officiel (ex. 9 nov. 2026)'],
]
// Champs indispensables aux mentions légales.
export const REQUIRED_FIELDS = [['legal_name', 'Raison sociale de l’éditeur'], ['director', 'Directeur de la publication'], ['email', 'E-mail de contact']]
export const missingRequired = s => REQUIRED_FIELDS.filter(([k]) => !s?.[k]).map(([, l]) => l)
export const socialLinks = s => [['facebook', 'Facebook'], ['x_twitter', 'X'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['instagram', 'Instagram']]
  .map(([k, label]) => ({ label, url: /^https:\/\//.test(s?.[k] || '') ? s[k] : null })).filter(x => x.url)
export const channelUrl = s => (/^https:\/\/(www\.)?(whatsapp\.com|wa\.me|chat\.whatsapp\.com)\//.test(s?.whatsapp_channel || '') ? s.whatsapp_channel : null)
export async function getSettings(sb) {
  const { data } = await sb.from('site_settings').select('k,v')
  const o = { org_name: 'Tolobana Info', address: 'Kinshasa, République démocratique du Congo' }
  for (const r of data || []) if (r.v) o[r.k] = r.v
  return o
}
