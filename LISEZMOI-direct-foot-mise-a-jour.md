# Mise à jour Direct Foot — Tolobana

Cette archive reprend le contenu de `tolobana-phase18.zip` avec une mise à jour de la page publique Direct Foot et de son CSS responsive.

## Modifications
- La page publique conserve le titre **Direct Foot** et le menu existant.
- Le choix d'une diffusion via `?c=` est compatible avec les versions récentes de Next.js où `searchParams` est asynchrone.
- Les identifiants de diffusion sont encodés dans les liens.
- Le lecteur est dimensionné en 16:9 et les boutons de chaînes passent en grille sur mobile.
- Les matchs en direct et le programme « Où regarder » sont conservés.

## Sources vidéo et validation
Les quatre URL `zlive.st` fournies dans la demande ne sont pas intégrées. Le fichier de projet d'origine identifie explicitement ces flux comme non autorisés/piratés et indique que le lecteur doit refuser les sources hors des fournisseurs approuvés. Pour éviter d'exposer Tolobana à des réclamations de droits d'auteur ou à une suspension, ajoutez uniquement des lecteurs dont vous détenez l'autorisation de diffusion.

Les diffusions autorisées continuent à être gérées depuis **Tableau de bord > Direct Foot**. La fonction `streamEmbed` existante reste la validation centrale ; elle n'a pas été remplacée car son fichier source `lib/stream` n'est pas inclus dans cette archive de phase 18.

## Déploiement
Cette archive est une archive de mise à jour/overlay de la phase 18, pas une copie complète du dépôt de production : elle ne contient pas le reste de l'application ni ses dépendances. Décompressez-la à la racine du dépôt Tolobana en conservant les chemins, vérifiez le diff Git, puis lancez votre build et redéployez comme d'habitude.
