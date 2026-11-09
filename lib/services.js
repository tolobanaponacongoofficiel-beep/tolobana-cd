export const TYPES = {
  deces: { label: 'Avis de décès', plural: 'Avis de décès', desc: 'Faire-part, hommages et annonces d’obsèques.', title: 'Nom du défunt', body: 'Détails : âge, date et lieu des obsèques, famille, veillée…', days: 45, org: false, deadline: false },
  communique: { label: 'Communiqué', plural: 'Communiqués', desc: 'Communiqués d’organisations, d’entreprises et d’institutions.', title: 'Titre du communiqué', body: 'Texte du communiqué', days: 30, org: true, deadline: false },
  emploi: { label: 'Offre d’emploi', plural: 'Offres d’emploi', desc: 'Postes à pourvoir, stages et recrutements.', title: 'Poste proposé', body: 'Missions, profil recherché, comment postuler', days: 30, org: true, deadline: true },
  appel: { label: 'Appel d’offres', plural: 'Appels d’offres', desc: 'Marchés, consultations et appels à candidatures.', title: 'Objet de l’appel d’offres', body: 'Description, conditions, dossier à fournir', days: 30, org: true, deadline: true },
  annonce: { label: 'Petite annonce', plural: 'Petites annonces', desc: 'Ventes, locations, services et rencontres professionnelles.', title: 'Titre de l’annonce', body: 'Description de l’annonce', days: 30, org: false, deadline: false },
}
export const isType = t => Object.prototype.hasOwnProperty.call(TYPES, t)
export const TYPE_KEYS = Object.keys(TYPES)
// Date d'expiration à la publication : jour limite pour un emploi ou un appel d'offres, sinon durée par défaut du type.
export function expiryFor(type, deadline) {
  if (deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline)) return new Date(`${deadline}T23:59:59+01:00`).toISOString()
  return new Date(Date.now() + (TYPES[type]?.days || 30) * 86400000).toISOString()
}
