export const FACT = { true: 'Vrai', false: 'Faux', misleading: 'Trompeur', unverified: 'Non vérifié' }
export const FACT_RATING = { true: 5, misleading: 3, false: 1 }
export const isFact = v => Object.prototype.hasOwnProperty.call(FACT, v)
