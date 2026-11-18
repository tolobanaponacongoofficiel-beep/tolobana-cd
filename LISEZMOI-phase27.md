# Phase 27 — Médiathèque liée à l'éditeur, renommage, mobile Android, menu allégé

## À faire
1. Supabase > SQL Editor : exécuter `supabase/phase27.sql` (table `media_meta`).
2. GitHub : envoyer les dossiers `app`, `lib`, `supabase` (remplacer). Vercel redéploie.

## Ce qui change
- **Éditeur / photo principale / pubs / stories… ** : chaque sélecteur d'image a un bouton **Médiathèque** (fenêtre avec recherche) pour réutiliser une image déjà envoyée.
- **Médiathèque** : bouton **Modifier** sur chaque fichier (Titre, Texte alternatif, Légende), comme WordPress. Le titre change à l'affichage ; l'adresse du fichier reste identique, donc aucun article n'est cassé. La recherche couvre les titres.
- **Mon espace** : retrait de Dossiers, Sondages et Équipes (« Équipe et rôles » reste).
- **Mobile Android** : le bouton « Mon espace » est masqué dans l'en-tête sur petit écran (il débordait et faisait dézoomer la page) ; garde-fous contre tout débordement horizontal. Testé à 360 et 412 px : aucun défilement latéral.

## Fichiers
app/layout.js, app/components/{MediaPicker.js,ImageUploader.js,phase27.css}, app/api/mediatheque/route.js, app/dashboard/{layout.js,mediatheque/*}, lib/media.js, supabase/phase27.sql
