# Phase 28 — Style inspiré de lepoint.cd

## À faire
Envoyer le dossier `app` sur GitHub (remplacer). Aucun SQL. Vercel redéploie.

## Ce qui change
- **Bandeau des taux** tout en haut : USD/CDF et EUR/CDF + « Voir tous les indicateurs » (page Taux).
- **En-tête** : bouton grille et recherche à gauche, logo à gauche, interrupteur clair/sombre et bouton WhatsApp rond noir à droite. « Mon espace » reste visible sur ordinateur (réservé à la rédaction), masqué sur téléphone.
- **Bouton grille** : ouvre toutes les rubriques avec leurs sous-rubriques, puis les services.
- **Rubriques** : simple texte qui défile, filet fin dessous (plus de bouton « Rubriques »).
- **Polices** : Merriweather (titres et textes) et Source Sans 3 (menus, interface), chargées automatiquement par Next.js.
- **Article** : catégorie en majuscules espacées, grand titre et chapeau centrés, bloc gris « À lire aussi » en liste avec flèches.
- **Pied de page** : logo, pastilles rondes noires des réseaux, e-mail, colonnes Tolobana Info / Services / Rubriques ; « Mode léger » et signature WhatsApp en bas.
- Mode sombre conservé.

## Fichiers
app/layout.js, app/article/[slug]/page.js, app/components/{RatesBar.js,ServicesMenu.js,PrefsButtons.js,phase28.css}
