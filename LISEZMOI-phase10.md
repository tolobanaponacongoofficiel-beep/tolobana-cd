# Phase 10 : thème sombre, audience, direct, vérification, publicité

## À faire dans l'ordre
1. Supabase > SQL Editor > New query : coller `supabase/phase10.sql`, Run (sans risque si relancé).
2. Copier ce dossier dans le dépôt GitHub (même arborescence, remplacer les fichiers). Attendre « Ready » dans Vercel.
3. `SUPABASE_SECRET_KEY` doit être présente dans Vercel (newsletter, sondages, **contact anti-spam, compteurs de publicité**).
4. Espace rédaction > Pages et réglages : remplir raison sociale, directeur de la publication, e-mail, **lien de la chaîne WhatsApp** et réseaux sociaux.

## Nouveautés
- **Thème clair / sombre** : bouton 🌙/☀️ dans l'en-tête. Le premier affichage suit le réglage du téléphone ; le choix du lecteur est mémorisé.
- **Mode léger** : bouton 📶. Les images et vidéos ne se chargent que sur demande (aussi activé automatiquement si le navigateur envoie « Économiseur de données »).
- **WhatsApp** : bouton « Envoyer sur WhatsApp » sous chaque article, bouton « Suivre notre chaîne » (si le lien est renseigné), liens réseaux dans le pied de page et données Google (sameAs).
- **Direct** : Espace rédaction > Direct. Démarrer, publier des messages (photo, « important »), terminer. Page publique `/direct`, bandeau rouge « EN DIRECT » sur tout le site pendant un direct, actualisation automatique toutes les 30 s. **Lien de diffusion vidéo** : collez un lien YouTube, Facebook, Vimeo ou MP4 à la création (ou plus tard dans « Diffusion vidéo ») ; le lecteur s'affiche au-dessus du fil de messages.
- **Vérification des faits** : dans l'éditeur d'article (éditeurs), choisir Vrai / Faux / Trompeur / Non vérifié + l'affirmation examinée. Étiquette sur l'article, page `/verification`, données Google ClaimReview.
- **Publicités** : Espace rédaction > Publicités (administrateurs). Trois emplacements (bandeau, colonne, article), dates de début/fin, pause, affichages, clics et taux de clic. Page `/annoncer` pour les annonceurs.
- **Correctifs phase 9** : nom du média lu dans les réglages, « non communiqué » à la place de « [à compléter] » + alerte pour les administrateurs, contact protégé (délai minimum, liens, 5 messages/heure/connexion).
