# Phase 30 — Taux de change dynamique, très fin
Envoyer les dossiers `app` et `lib` sur GitHub (remplacer). Aucun SQL.
- **Bandeau très fin** (30 px) tout en haut du site : 25 devises face au franc congolais (USD, EUR, GBP, CAD, CHF, CNY, JPY, AED, INR, TRY, ZAR, XAF, XOF, AOA, RWF, UGX, KES, TZS, BIF, ZMW, MAD, EGP, NGN, GHS, BRL) qui défilent en continu ; pause au survol ; lien « Tous les taux ».
- **Mise à jour automatique** toutes les 30 minutes (source : open.er-api.com, gratuite). Si vous saisissez le taux officiel du dollar (et de l'euro) dans les réglages, il prime et toutes les autres devises s'alignent dessus.
- **Page /taux** : convertisseur avec toutes les devises + tableau complet.
- Si la source est indisponible : repli sur USD/EUR ; sans aucun taux, le bandeau disparaît.
- Les variations (▼ −2,71) ne sont pas affichées : la source gratuite ne fournit pas l'historique.
Fichiers : app/layout.js, app/taux/page.js, app/components/{RatesBar.js,phase30.css}, lib/rates.js
