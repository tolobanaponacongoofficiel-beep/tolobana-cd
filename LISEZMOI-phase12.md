# Phase 12 : Météo, taux de change, Services, Sport

## À faire dans l'ordre
1. Supabase > SQL Editor > New query : coller `supabase/phase12.sql`, Run (sans risque si relancé). Les phases 10 et 11 doivent avoir été exécutées avant.
2. GitHub > Add file > Upload files : glisser les dossiers `app`, `lib` et `supabase`, puis Commit changes. Attendre « Ready » dans Vercel.
3. Espace rédaction > Pages et réglages : renseigner (facultatif) le **taux officiel** (1 USD = ? CDF), sa date, et le taux de l'euro. Vide = taux indicatif automatique.
4. (Facultatif) Résultats automatiques des grands championnats : créer une clé gratuite sur football-data.org, l'ajouter dans Vercel > Settings > Environment Variables sous le nom `FOOTBALL_DATA_TOKEN`, puis redéployer. Le football congolais et africain se saisit à la main dans Espace rédaction > Sport.

## Nouveautés
- **Météo** `/meteo` : 10 villes (Kinshasa, Lubumbashi, Goma, Kisangani, Mbuji-Mayi, Kananga, Bukavu, Matadi, Mbandaka, Kolwezi), prévisions sur plusieurs jours, ville mémorisée. Bloc météo sur l'accueil. Source : MET Norway (mention affichée, obligatoire).
- **Taux de change** `/taux` : taux officiel saisi par vous, sinon taux indicatif automatique ; convertisseur CDF / USD / EUR. Bloc sur l'accueil.
- **Services** `/services` : avis de décès, communiqués, offres d'emploi, appels d'offres, petites annonces. Le public dépose une demande (`/services/deposer`), elle reste en attente ; vous la validez dans Espace rédaction > Services (avec case « Payé » et montant pour suivre vos revenus). Expiration automatique (date limite pour un emploi ou un appel d'offres, 30 à 45 jours sinon). Vous pouvez aussi publier directement.
- **Sport** `/sport` : scores d'aujourd'hui, résultats récents, matchs à venir ; bloc « Sport » sur l'accueil quand il y a des matchs du jour. Saisie dans Espace rédaction > Sport.
- Menu et pied de page : Sport, Météo, Services, Taux de change.
