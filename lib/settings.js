export const SETTING_FIELDS = [
  ['org_name', 'Nom du média'], ['legal_name', 'Raison sociale de l’éditeur'], ['director', 'Directeur de la publication'],
  ['email', 'E-mail de contact'], ['phone', 'Téléphone'], ['whatsapp', 'WhatsApp (avec indicatif, ex. +243…)'],
  ['address', 'Adresse'], ['founded', 'Année de création'],
]
export async function getSettings(sb) {
  const { data } = await sb.from('site_settings').select('k,v')
  const o = { org_name: 'Tolobana Info', address: 'Kinshasa, République démocratique du Congo' }
  for (const r of data || []) if (r.v) o[r.k] = r.v
  return o
}
