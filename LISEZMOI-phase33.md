# Phase 33 — Météo avec de vraies photos de villes
Prérequis : la Phase 32 déjà envoyée (la page « Apparence » en fait partie). Aucun SQL.
Envoyer les dossiers `app` et `lib` sur GitHub (remplacer).

- **Vraies photos libres de droits** (Wikimedia Commons) par défaut pour Kinshasa, Lubumbashi, Goma, Kisangani, Kananga, Bukavu, Matadi et Mbandaka. Mbuji-Mayi et Kolwezi : illustration automatique (pas de photo de ville fiable trouvée).
- **Filet de sécurité** : si une photo ne se charge pas, l'illustration de la ville s'affiche à la place.
- **Vos propres photos** : Tableau de bord > Apparence > « Photos des villes (météo) » : « Choisir la photo » (Médiathèque ou envoi). Votre photo remplace celle par défaut ; paysage conseillé.
- **Mention des sources** au bas de la page Météo (obligatoire avec ces licences), avec un lien vers la page de chaque photo (auteur et licence).
- Affichage : page Météo (grande image + cartes des autres villes) et bloc météo de l'accueil.
Important : ces photos n'ont pas pu être vérifiées visuellement depuis mon poste ; regardez la page /meteo après déploiement et remplacez celles qui ne vous plaisent pas.
Fichiers : lib/cityart.js, app/components/{WeatherWidget.js,phase33.css}, app/meteo/page.js, app/dashboard/apparence/{page.js,actions.js}
