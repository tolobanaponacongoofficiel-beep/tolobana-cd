# Phase 11 : En continu, barre mobile, Stories, suivi de dossier, rumeurs à vérifier

## À faire dans l'ordre
1. Supabase > SQL Editor > New query : coller `supabase/phase11.sql`, Run (sans risque si relancé). La phase 10 doit avoir été exécutée avant.
2. GitHub > Add file > Upload files : glisser les dossiers `app`, `lib` et `supabase` de ce zip (ils remplacent les fichiers existants), puis Commit changes. Attendre « Ready » dans Vercel.
3. Pour le suivi de dossier (e-mails) : `SUPABASE_SECRET_KEY` et `RESEND_API_KEY` doivent être dans Vercel (déjà le cas pour la newsletter).

## Nouveautés
- **En continu** : fil daté (Aujourd'hui, Hier…) sur l'accueil et page `/en-continu` avec pages.
- **Barre du téléphone** (en bas de l'écran, téléphones seulement) : Accueil, En continu (point rouge s'il y a du nouveau depuis la dernière visite), Direct (s'allume en rouge pendant un direct), Stories, Compte / Mon espace.
- **Stories** : Espace rédaction > Stories (éditeurs). Photo + titre + 2 chiffres clés + article lié. Bandeau défilant sur l'accueil, page `/stories`, bouton « Partager l'image » (image 1080 × 1920 pour WhatsApp / réseaux) et bouton WhatsApp.
- **Suivre un dossier** : formulaire sur chaque page de dossier (double confirmation par e-mail). Espace rédaction > Dossiers > (un dossier) > « Abonnés au dossier » > « Envoyer les nouveautés aux abonnés ».
- **Rumeurs à vérifier** : formulaire sur la page Vérification ; les signalements arrivent dans « Messages reçus » (administrateurs) avec l'objet « À vérifier : … ».
- En-tête adapté aux petits écrans (il ne dépasse plus).
