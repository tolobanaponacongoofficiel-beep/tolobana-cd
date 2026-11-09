# Phase 14 : Agenda, favoris, revenus, direct automatique

## Nouveautés
1. **Agenda** (`/agenda`) : concerts, conférences, cérémonies, matchs… avec filtre par catégorie, page de détail, bouton « Ajouter à mon calendrier » (fichier .ics), partage WhatsApp, et un bloc « À l'agenda » dans la colonne de l'accueil. Gestion : Tableau de bord > Agenda.
2. **Favoris** : bouton « Lire plus tard » sur chaque article, page `/favoris`. Les favoris restent sur l'appareil du lecteur (aucun compte nécessaire).
3. **Revenus** (administrateurs) : Tableau de bord > Revenus. Totaux par mois, services payés par type, performance des publicités, export CSV pour la comptabilité. Pour les publicités, un champ « Montant facturé » est ajouté.
4. **Matchs en direct** : la page d'un match et la page Sport se mettent à jour toutes seules (30 à 60 secondes) tant qu'un match est en direct.

## Installation
1. Supabase > SQL Editor > New query : coller `supabase/phase14.sql`, puis Run.
2. GitHub : décompressez le zip et envoyez les dossiers `app`, `lib` et `supabase` (Add file > Upload files).
3. Vercel redéploie tout seul.

## Montants (page Revenus)
Écrivez les montants comme vous les dites : `50 USD`, `150 000 FC`, `20 €`. Sans devise, le dollar est supposé. Les devises ne sont jamais converties entre elles.
