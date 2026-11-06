# Tolobana Info — Phase 4

## À faire dans l'ordre
1. **Supabase > SQL Editor** : exécuter `supabase/phase4.sql` (une seule fois, AVANT le déploiement).
2. Copier le contenu de ce dossier par-dessus votre projet (mêmes chemins que la phase 3). Nouveaux fichiers : `lib/blocks.js`, `app/api/upload/`, `app/components/*`, `app/dashboard/*`.
3. Polices : celles de la phase 3 (Georgia + police système), aucune police à télécharger.
4. Déployer.

## Ce qui change
- Date + heure:minute:seconde en direct (heure de Kinshasa) dans l'en-tête.
- « Mon espace » visible uniquement pour l'équipe (journaliste et plus). Les lecteurs n'ont plus ce bouton, et /dashboard les renvoie à l'accueil.
- Éditeur à blocs : paragraphe (gras, italique, lien), titre, sous-titre, image, vidéo YouTube, citation, liste, lien, séparateur. Aperçu intégré.
- Images envoyées une par une et réduites automatiquement (plus de limite de 4 Mo par formulaire).
- Photos : chaque compte de l’équipe met sa photo dans Mon profil ; chaque rédacteur a la sienne dans Rédacteurs. Elles s’affichent près du nom (articles, accueil, page auteur). Relancer phase4.sql (sans risque) pour la colonne photo.
- Rédacteurs : /dashboard/auteurs (admin et plus). Un rédacteur n'a pas besoin de compte. Choix du rédacteur à l'écriture de l'article (éditeur et plus).
- Design de la phase 3 conservé (Georgia, bleu marine). Menu avec « Plus », espace rédaction en 7 pages.
- Modifier un article : /dashboard/articles (liste), bouton Modifier, Retirer du site (éditeur), Supprimer (admin).
- Les articles de la phase 3 s'affichent toujours (ils n'ont pas de blocs, le texte est découpé en paragraphes).
