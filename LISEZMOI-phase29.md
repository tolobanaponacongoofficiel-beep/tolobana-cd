# Phase 29 — Bloc WhatsApp à la place de la newsletter
Envoyer le dossier `app` sur GitHub (remplacer). Aucun SQL.
- Bloc « Restez informé, participez » au-dessus du pied de page : bouton **Suivre la chaîne** (lien de la chaîne WhatsApp des réglages, masqué s'il est vide) + bouton **Envoyer une info** (WhatsApp de la rédaction) + petit lien « Activer les alertes info ».
- « Envoyer une info » utilise le numéro `phone` des réglages du site ; à défaut +243 81 820 5404.
- La newsletter n'est plus affichée. La page et la base d'inscrits restent intactes (rien n'est supprimé).
Fichiers : app/layout.js, app/components/{JoinBlock.js,phase29.css}
