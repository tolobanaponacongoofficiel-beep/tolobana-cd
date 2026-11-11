# Phase 19 : page de connexion plein écran

## À faire
Téléverser le dossier `app` sur GitHub (remplace `app/login/*`, ajoute `app/auth/callback/route.js`). Aucun SQL.

## Nouveautés
- `/login` : page plein écran (sans en-tête du site), carte centrale, e-mail + mot de passe, « Mot de passe oublié ? », « Créer un compte », « Retour au site ».
- Mot de passe oublié : lien par e-mail puis page `/login/reinitialiser`.
- Inscription : si Supabase exige la confirmation e-mail, un message l'indique (plus de boucle de redirection).
- Boutons Google et Facebook : masqués tant que vous ne les activez pas (voir ci-dessous).

## Activer Google / Facebook
1. Vercel > Settings > Environment Variables : `OAUTH_PROVIDERS` = `google,facebook` (ou un seul). Redéployer.
2. Supabase > Authentication > URL Configuration : Site URL = l'adresse du site ; Redirect URLs : ajouter `https://VOTRE-DOMAINE/auth/callback`.
3. Supabase > Authentication > Providers > Google : coller Client ID et Secret créés dans Google Cloud Console (OAuth, type « Application Web »). Dans Google, ajouter comme URI de redirection celle affichée par Supabase (`https://xxxx.supabase.co/auth/v1/callback`).
4. Idem pour Facebook : App ID et Secret depuis Facebook Developers (produit « Facebook Login »), même URI de redirection.

## Sécurité
Une connexion Google/Facebook crée un compte « lecteur » : l'accès à l'espace rédaction reste réservé aux rôles que vous attribuez dans Équipe et rôles.
