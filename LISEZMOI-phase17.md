# Phase 17 : menu allégé (inclut la phase 16)

Ce zip contient l'en-tête de la phase 16 (logo centré, date et heure dessous, bandeau) et le nouveau menu. Envoyez-le à la place du zip de la phase 16.

## Ce qui change
- **Barre de menu courte** : Accueil, En continu, Direct, Sport et **3 rubriques** (les 3 premières du menu).
- **Bouton « Plus »** : ouvre au clic (ordinateur et téléphone) un panneau avec les autres rubriques, puis « Services et outils » (Tolobana TV, Dossiers, Vérification, Stories, Météo, Taux de change, Services, Agenda, Sondages, Mes favoris).
- **Tableau de bord > Rubriques** (administrateurs) : pour chaque rubrique, changer le nom, l'ordre et décocher « Afficher dans le menu ». Une rubrique décochée disparaît du menu mais reste disponible pour classer les articles.

- **Barre du bas sur téléphone** : l'onglet « Direct » devient « Tolobana TV » (icône de télévision). Un point rouge s'y allume pendant un direct ; le bandeau « EN DIRECT » reste cliquable en haut de chaque page.

## Installation
1. Supabase > SQL Editor > New query : coller `supabase/phase17.sql`, puis Run.
2. GitHub : envoyez les dossiers `app` et `supabase` (Add file > Upload files). Vercel redéploie tout seul.
