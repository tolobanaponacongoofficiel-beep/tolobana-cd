# Tolobana Info (Next.js + Supabase), phase 1
1. Créez un projet gratuit sur supabase.com. SQL Editor : collez et exécutez `supabase/schema.sql`.
2. Authentication > Providers > Email : pour tester, désactivez « Confirm email ».
3. Settings > API : copiez l'URL et la clé `anon` dans `.env.local` (voir `.env.example`).
4. Local : `npm install && npm run dev`. Déploiement : poussez sur GitHub, importez dans Vercel/Netlify, ajoutez les 2 variables d'environnement.
5. Inscrivez-vous sur /login, puis exécutez dans Supabase la ligne SQL en bas de schema.sql pour devenir super_admin.
