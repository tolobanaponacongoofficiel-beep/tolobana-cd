import { redirect } from 'next/navigation'
import { getUserAndRole } from '@/lib/supabase/server'
import ResetForm from './ResetForm'
export const metadata = { title: 'Nouveau mot de passe', robots: { index: false } }
export default async function Reset() {
  const { user } = await getUserAndRole()
  if (!user) redirect('/login?err=3')
  return <ResetForm />
}
