# Phase 20 : détail des matchs, fiches des clubs et des joueurs

## À faire dans l'ordre
1. Supabase > SQL Editor > New query : coller `supabase/phase20.sql`, Run. Les tables sont préfixées `fc_` : aucun risque de conflit avec vos tables existantes.
2. GitHub : téléverser le contenu de ce dossier (`app`, `lib`, `supabase`).
3. Vercel : attendre « Ready », puis Ctrl + F5.

## Ce que voient les lecteurs
- Page match : chronologie minute par minute (buts avec passeur, penalties, contre son camp, cartons jaunes et rouges, deuxième jaune, remplacements : joueur qui sort et joueur qui entre), compositions avec système de jeu, titulaires, remplaçants, capitaine, et pastilles (but, carton, sortie, entrée) sur chaque joueur.
- Clic sur le nom ou l'écusson d'un club : fiche du club (fondation, stade, couleurs, entraîneur, site), effectif actuel par poste, prochains matchs, derniers résultats, histoire et palmarès. Répertoire : `/clubs`.
- Clic sur un joueur : fiche (photo, poste, numéro, âge, nationalité, taille, pied), présentation, statistiques (matchs, titularisations, buts, passes décisives, jaunes, rouges) et derniers matchs. Adresse : `/joueurs/<identifiant>`.

## Ce que fait la rédaction (éditeurs et administrateurs)
- Sur la page d'un match : lien « Saisir ou modifier les détails du match ». On tape les compositions (une ligne par joueur : « 10 Meschack Elia (C) ») et on ajoute les événements. Les clubs et les joueurs inconnus sont créés automatiquement.
- Espace rédaction > Clubs et joueurs : créer un club, compléter sa fiche, importer l'effectif en une fois, modifier un joueur (photo, poste, biographie).

## Important
- Le flux gratuit ne fournit ni compositions ni remplacements : ces détails sont saisis par la rédaction. Quand le détail d'un match est saisi, il remplace les anciennes listes « Buteurs » et « Cartons » du flux.
- Les statistiques d'un joueur sont calculées à partir des matchs documentés sur Tolobana Info.
- Ce zip remplace `app/sport/match/[id]/page.js` (basé sur votre phase 14), `app/dashboard/layout.js` et `app/sitemap.js` (basés sur votre phase 18). Si vous avez modifié la page match depuis la phase 14, ne la remplacez pas : envoyez-la-moi et je fusionne.
