# Phase 33 — Météo avec une image par ville
Prérequis : la Phase 32 déjà envoyée (la page « Apparence » en fait partie). Aucun SQL.
Envoyer les dossiers `app` et `lib` sur GitHub (remplacer).

- **Illustration automatique** pour les 10 villes dès maintenant : ciel selon la météo du moment (soleil, éclaircies, nuages, pluie, orage) et silhouette de ville différente pour chaque ville.
- **Vraies photos** : Tableau de bord > Apparence > « Photos des villes (météo) » : pour chaque ville, bouton « Choisir la photo » (Médiathèque ou envoi). La photo remplace l'illustration. Format paysage conseillé.
- Affichage : page Météo (grande image de la ville choisie + cartes des autres villes avec leur image) et petit bloc météo de l'accueil.
- Seules les images de votre Médiathèque sont acceptées pour les photos.
Fichiers : lib/cityart.js, app/components/{WeatherWidget.js,phase33.css}, app/meteo/page.js, app/dashboard/apparence/{page.js,actions.js}
