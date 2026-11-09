# Phase 13 : Sport complet

## Nouveautés
- **Matchs cliquables** : chaque match ouvre une page avec le score, la mi-temps, le stade, l’arbitre, les buteurs (minute, penalty, csc, passeur) et les cartons.
- **Calendrier complet** : sur /sport, choisissez un jour (9 jours affichés). Sur la page d’une compétition, naviguez de journée en journée.
- **Pages compétition** (Premier League, Liga, Serie A, Bundesliga, Ligue 1, Ligue des champions, Coupe du monde, Euro, Championship, Eredivisie, Liga Portugal, Brasileirão) avec onglets **Matchs / Classement / Buteurs**.
- **Nouveau fond sport** : bandeau « terrain de foot », dégradé vert, mode sombre assorti, logos des clubs (remplacés par des initiales en mode léger).
- **Football congolais** : dans Tableau de bord > Sport, chaque match a maintenant les champs Stade et Buteurs (un par ligne, par exemple `Mputu 12'`).

## Installation
1. Supabase > SQL Editor > New query : coller `supabase/phase13.sql`, puis Run.
2. GitHub : décompressez le zip et envoyez les dossiers `app`, `lib` et `supabase` (Add file > Upload files).
3. Vercel redéploie tout seul. Aucun nouveau réglage : la clé FOOTBALL_DATA_TOKEN existante suffit.

## À savoir
- Les buteurs des grands championnats dépendent de l’offre gratuite de football-data.org : si elle ne les fournit pas pour un match, la page l’indique au lieu d’afficher une erreur. Les scores gratuits sont légèrement différés.
- La limite gratuite est de 10 requêtes par minute. Les pages sont mises en cache (1 à 10 minutes), ce qui suffit pour un trafic normal.
