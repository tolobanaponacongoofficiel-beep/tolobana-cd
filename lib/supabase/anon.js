import { createClient } from '@supabase/supabase-js'
// Client sans session, pour les données publiques (plans du site, flux RSS).
export const supabaseAnon = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
