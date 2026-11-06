# Phase 8 : outils de rédaction pro, équipe, statistiques

## À faire dans l'ordre
1. Supabase > SQL Editor > New query : coller `supabase/phase8.sql` et **Run** (sans risque si relancé).
2. Copier ce dossier dans le dépôt GitHub (même arborescence, remplacer les fichiers). Attendre « Ready » dans Vercel.

## Nouveautés
- **Publication programmée** : dans l'éditeur, champ « Programmer la publication » (heure de Kinshasa). L'article apparaît seul à l'heure dite.
- **Brouillon automatique** : le texte en cours est gardé sur l'appareil toutes les 1,5 s. Si la page se ferme ou si la connexion coupe, un bandeau propose « Reprendre ».
- **Check-list avant publication** (titre, photo, légende, longueur, intertitres, résumé, mots-clés) et compteur de mots.
- **« Mis à jour le … »** sur un article publié : case à cocher dans l'éditeur lors d'une correction.
- **Statistiques** (éditeurs et plus) : lectures, top articles, rubriques, signatures, 30 jours, articles programmés.
- **Équipe et rôles** (administrateurs) : liste de l'équipe avec e-mails ; le super-administrateur change les rôles sans passer par Supabase. Nécessite SUPABASE_SECRET_KEY pour afficher les e-mails.
- **Journal d'activité** (administrateurs) : qui a publié, modifié, supprimé, envoyé quoi.
- **Article** : barre de progression de lecture, articles liés par mots-clés, image de partage par défaut (logo).
- **Newsletter** : anti-doublon (même objet sous 30 min), anti-abus des inscriptions, envoi interrompu enregistré.
- **Accessibilité** : lien « Aller au contenu ».

## À savoir
- Les fichiers de ce dossier remplacent ceux de la phase 7 portant le même nom : article/[slug]/page.js, layout.js, dashboard/{layout,actions}.js, ArticleForm.js, articles/[id]/page.js, newsletter (2 fichiers + page).
- Une page non fournie ici (flux RSS, sitemap) doit aussi ignorer les articles dont published_at est dans le futur : vérifier `published_at <= maintenant`.
