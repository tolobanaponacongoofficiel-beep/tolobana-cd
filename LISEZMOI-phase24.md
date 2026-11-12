# Phase 24 : alertes push (informations urgentes)

## À faire (dans cet ordre)
1. Supabase > SQL Editor : exécuter `supabase/phase24.sql`.
2. GitHub : téléverser les dossiers `app`, `lib`, `supabase` **et `public`** (il contient `sw.js`, qui reçoit les notifications).
3. Attendre la fin du déploiement, puis ouvrir Tableau de bord > **Alertes push** > « Générer mes clés ».
4. Copier les deux valeurs dans Vercel (Settings > Environment Variables) : `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` (type Secret). Redéployer.
5. Sur un téléphone : ouvrir `/alertes`, appuyer sur « Activer les alertes », puis envoyer une alerte test depuis le tableau de bord.

## Ce que ça apporte
- Page publique `/alertes` (lien « Alertes info » dans le menu Plus) : le lecteur active ou désactive les notifications sur son appareil, sans compte.
- Tableau de bord > Alertes push : nombre d'abonnés, envoi d'une alerte (titre, message, lien), historique des 10 derniers envois. Les abonnements expirés sont supprimés automatiquement.
- Aucune dépendance ajoutée : le chiffrement des messages (norme Web Push, clés VAPID) est dans `lib/push.js`.

## À savoir
- Envoi limité à 600 abonnés par alerte (limite de durée de la fonction Vercel gratuite). Au-delà, il faudra un envoi par lots.
- iPhone : les alertes ne marchent que si le site est ajouté à l'écran d'accueil (iOS 16.4 ou plus).
- Alertes automatiques de buts : non incluses. Elles demandent un suivi des scores toutes les minutes, ce que le quota gratuit d'API-Football (100 requêtes par jour) ne permet pas. Possible avec une offre payante.
- Je baisse aussi la mise à jour des matchs du jour d'API-Football à 15 minutes, pour rester sous les 100 requêtes par jour.
