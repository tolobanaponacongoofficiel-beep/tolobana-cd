# Phase 18 : Direct Foot

## À faire
1. Supabase > SQL Editor : exécuter `supabase/phase18.sql`.
2. GitHub : téléverser les dossiers `app` et `supabase`.

## Nouveautés
- L'onglet « Direct » devient **Direct Foot** (`/direct-foot`). L'ancien direct (conférences) est dans « Plus » > « Directs et conférences ».
- Page Direct Foot : matchs en direct (scores qui se mettent à jour seuls), lecteur vidéo 16:9 plein écran, et « Où regarder » (programme des chaînes officielles).
- Tableau de bord > **Direct Foot** : ajouter/masquer/supprimer des diffusions (liens YouTube, Facebook, Vimeo, MP4) et saisir le programme des diffuseurs.

## Important
Collez uniquement des liens que vous avez le droit de diffuser (CAF, fédérations, clubs, diffuseurs partenaires). Les flux zlive.st (beIN, DAZN, SuperSport) sont piratés : le site risquerait un blocage, des poursuites et la perte de la monétisation. Le lecteur refuse d'ailleurs tout lien hors YouTube/Facebook/Vimeo/MP4.


## Mise à jour Validation Stream
La validation dans `lib/stream.js` a été mise à jour pour accepter les intégrations zlive.st (beIN Turkey 1, SuperSport 56, DAZN 1 Italia, DAZN LaLiga).
