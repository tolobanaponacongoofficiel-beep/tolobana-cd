# Phase 32 — Gestion des articles à la WordPress

## À faire (dans cet ordre)
1. Supabase > SQL Editor : exécuter `supabase/phase32.sql` (corbeille, versions, notes).
2. GitHub : envoyer les dossiers `app`, `lib`, `supabase` (remplacer). Vercel redéploie.

## Ce qui change
- **Articles > liste** : onglets par statut avec compteurs (Tous, Brouillons, À valider, Programmés, Publiés, Rejetés, Corbeille), recherche par titre, filtre par rubrique, pagination (40 par page).
- **Corbeille** : « Mettre à la corbeille » ne supprime rien ; l'article disparaît du site, on peut le restaurer (il revient en brouillon). La suppression définitive est réservée à l'administrateur, depuis la corbeille.
- **Actions groupées** : cocher plusieurs articles puis Corbeille, Publier maintenant, Remettre en brouillon, Rejeter, Changer la rubrique, Ajouter une étiquette. Un journaliste ne peut mettre à la corbeille que ses propres articles non publiés.
- **Modification rapide** : sous chaque article (titre, rubrique, étiquettes, statut, date de publication à l'heure de Kinshasa). Une date future = article programmé.
- **Statuts** : le circuit existant (brouillon, à valider, publié, rejeté) est conservé ; « Programmé » apparaît quand la date de publication est dans le futur.
- **Versions** : bouton « Versions » (liste) et « Historique des versions » (édition). Chaque enregistrement garde la version précédente (40 conservées), comparaison ligne à ligne (rouge = supprimé, vert = ajouté) et bouton « Restaurer » (la version actuelle est elle-même gardée).
- **Notes de la rédaction** : en bas de la page d'édition, visibles seulement par l'équipe.
- **Apparence** (administrateur, menu « Apparence ») : nombre de rubriques dans la barre, jusqu'à 8 liens supplémentaires dans le menu, et choix des blocs de la colonne de droite de l'accueil (météo, taux, sport, agenda, sondage, plus lus).

## Fichiers
supabase/phase32.sql, lib/wp.js, app/layout.js, app/page.js, app/components/phase32.css,
app/dashboard/{actions.js,layout.js}, app/dashboard/articles/{page.js,actions.js,BulkBar.js,[id]/page.js,[id]/revisions/page.js}, app/dashboard/apparence/{page.js,actions.js}
