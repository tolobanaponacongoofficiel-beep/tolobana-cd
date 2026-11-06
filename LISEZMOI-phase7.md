# Phase 7 : newsletter, appli installable, mots-clés, temps de lecture
1. Supabase > SQL Editor : exécuter supabase/phase7.sql.
2. Copier ce dossier dans le dépôt GitHub (même arborescence). Attendre « Ready » dans Vercel.
3. Newsletter : Vercel > Settings > Environment Variables, puis Redeploy.
   - SUPABASE_SECRET_KEY = la clé « Secret » de Supabase (Project Settings > API Keys). Type : Secret. SANS « NEXT_PUBLIC_ » : elle ne doit jamais être publique.
   - RESEND_API_KEY = clé créée sur resend.com (type Secret).
   - NEWSLETTER_FROM = Tolobana Info <newsletter@votre-domaine.info>  (le domaine doit être vérifié dans Resend)
   Tant que le domaine n'est pas vérifié, Resend n'envoie en général qu'à votre propre adresse : suffisant pour tester.
4. L'appli installable (PWA) est automatique : sur Chrome Android, un bandeau « Installer » apparaît.
