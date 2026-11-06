import { createClient } from '@supabase/supabase-js'
// Client « serveur » avec la clé secrète : à n'utiliser QUE dans des actions/routes serveur, jamais dans un composant client.
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
