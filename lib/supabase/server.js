import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function supabaseServer() {
  const store = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return store.getAll() },
      setAll(list) { try { list.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {} },
    },
  })
}
export async function getUserAndRole() {
  const sb = supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { sb, user: null, role: null }
  const { data } = await sb.from('profiles').select('role,name').eq('id', user.id).single()
  return { sb, user, role: data?.role ?? 'reader', name: data?.name }
}
const L = { reader: 0, journalist: 1, editor: 2, admin: 3, super_admin: 4 }
export const atLeast = (role, min) => (L[role] ?? -1) >= L[min]
