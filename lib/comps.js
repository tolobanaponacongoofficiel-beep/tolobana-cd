// Compétitions suivies et petits utilitaires de date (heure de Kinshasa)
const TZ = 'Africa/Kinshasa'
export const dayOf = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
export const timeOf = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
export const dateLabel = iso => new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })
export const today = () => dayOf(new Date().toISOString())
export const shiftDay = (day, n) => new Date(new Date(day + 'T12:00:00Z').getTime() + n * 86400000).toISOString().slice(0, 10)
export const validDay = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) && !isNaN(new Date(d + 'T12:00:00Z'))

// `fd` : compétition de l'offre gratuite football-data.org. `ap` : identifiant de la ligue chez API-Football (variable APIFOOTBALL_KEY).
export const COMPS = [
  { code: 'PL', name: 'Premier League', country: 'Angleterre', fd: true, ap: 39 }, { code: 'PD', name: 'Liga', country: 'Espagne', fd: true, ap: 140 },
  { code: 'SA', name: 'Serie A', country: 'Italie', fd: true, ap: 135 }, { code: 'BL1', name: 'Bundesliga', country: 'Allemagne', fd: true, ap: 78 },
  { code: 'FL1', name: 'Ligue 1', country: 'France', fd: true, ap: 61 }, { code: 'CL', name: 'Ligue des champions', country: 'Europe', fd: true, ap: 2 },
  { code: 'CAN', name: 'CAN', country: 'Afrique', ap: 6 }, { code: 'CANQ', name: 'Éliminatoires CAN', country: 'Afrique', ap: 36 },
  { code: 'CMAF', name: 'Éliminatoires Mondial : Afrique', country: 'Afrique', ap: 29 },
  { code: 'WC', name: 'Coupe du monde', country: 'Monde', fd: true, ap: 1 }, { code: 'EC', name: 'Euro', country: 'Europe', fd: true, ap: 4 },
  { code: 'COPA', name: 'Copa América', country: 'Amérique du Sud', ap: 9 }, { code: 'UNL', name: 'Ligue des nations UEFA', country: 'Europe', ap: 5 },
  { code: 'ACUP', name: 'Coupe d’Asie', country: 'Asie', ap: 7 }, { code: 'ACUPQ', name: 'Éliminatoires Coupe d’Asie', country: 'Asie', ap: 35 },
  { code: 'CMAS', name: 'Éliminatoires Mondial : Asie', country: 'Asie', ap: 30 },
  { code: 'OFC', name: 'Coupe d’Océanie', country: 'Océanie', ap: 806 }, { code: 'CMOC', name: 'Éliminatoires Mondial : Océanie', country: 'Océanie', ap: 33 },
  { code: 'AMI', name: 'Matchs amicaux', country: 'International', ap: 10 },
  { code: 'ELC', name: 'Championship', country: 'Angleterre', fd: true, ap: 40 }, { code: 'DED', name: 'Eredivisie', country: 'Pays-Bas', fd: true, ap: 88 },
  { code: 'PPL', name: 'Liga Portugal', country: 'Portugal', fd: true, ap: 94 }, { code: 'BSA', name: 'Brasileirão', country: 'Brésil', fd: true, ap: 71 },
]
export const compByAp = id => COMPS.find(x => x.ap === Number(id))
export const compByCode = c => COMPS.find(x => x.code === String(c || '').toUpperCase())
