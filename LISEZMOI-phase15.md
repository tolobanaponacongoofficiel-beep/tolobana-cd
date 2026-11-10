# Phase 15 : détails complets du match, équipes et joueurs

## Ce qui change
- **Page d'un match** : chronologie complète (buts avec passeur, penalties, buts contre son camp, cartons jaunes et rouges, remplacements avec le joueur qui entre et celui qui sort), compositions (titulaires, remplaçants, formation, entraîneur).
- **Page d'une équipe** (clic sur le nom ou le logo) : fiche du club, historique, prochains matchs, derniers résultats, effectif actuel par poste.
- **Page d'un joueur** (clic sur son nom) : poste, numéro, âge, nationalité, club, parcours, statistiques (buts, cartons, entrées en jeu).
- **Tableau de bord** : nouveaux menus **Équipes** (créer les clubs et leurs joueurs) et, dans **Sport**, le bouton « Détails » de chaque match (équipes, compositions, événements).

## Installation
1. Supabase > SQL Editor > New query : coller `supabase/phase15.sql`, puis Run.
2. GitHub : décompressez le zip et envoyez les dossiers `app`, `lib` et `supabase` (Add file > Upload files).
3. Vercel redéploie tout seul.

## Comment remplir un match (football congolais, Léopards…)
1. Menu **Équipes** : créez TP Mazembe, AS Vita Club… puis ajoutez leurs joueurs.
2. Menu **Sport** : sur le match, cliquez « Détails », choisissez les deux équipes, collez les compositions (un joueur par ligne, numéro devant : `10 Mputu`).
3. Pendant le match, ajoutez les événements : type (but, carton jaune, carton rouge, remplacement…), équipe, minute, joueur. Les noms identiques à l'effectif deviennent des liens vers la fiche du joueur.

## Grands championnats (Premier League, Liga…)
L'offre **gratuite** de football-data.org donne les scores, calendriers, classements et buteurs du championnat, mais pas les remplacements, cartons, compositions, effectifs ni fiches joueurs (réservés à leur formule payante « Deep Data »). Ces rubriques n'apparaissent donc pas pour ces matchs tant que vous restez en gratuit.
Si vous prenez la formule payante, ajoutez dans Vercel la variable `FOOTBALL_DATA_DEEP` avec la valeur `1` puis redéployez : les noms d'équipes et de joueurs deviennent cliquables et les pages se remplissent automatiquement.
