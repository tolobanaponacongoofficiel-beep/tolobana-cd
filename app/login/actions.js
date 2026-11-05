'use server'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
export async function signIn(_, fd) {
  const { error } = await supabaseServer().auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') })
  if (error) return { error: 'Identifiants invalides.' }
  redirect('/dashboard')
}
export async function signUp(_, fd) {
  const { error } = await supabaseServer().auth.signUp({ email: fd.get('email'), password: fd.get('password'), options: { data: { name: fd.get('name') } } })
  if (error) return { error: error.message }
  redirect('/dashboard')
}
export async function signOut() { await supabaseServer().auth.signOut(); redirect('/') }
