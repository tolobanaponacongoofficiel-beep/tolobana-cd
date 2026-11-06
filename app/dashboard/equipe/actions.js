'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/blocks'

export const STAFF = ['journalist', 'editor', 'admin']
const TOP = ['journalist', 'editor', 'admin', 'super_admin']

// Seul le super-administrateur change les rôles. Il ne peut ni se modifier lui-même ni toucher un autre super-admin.
export async function changeRole(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || role !== 'super_admin') redirect('/dashboard')
  const id = String(fd.get('id') || ''), next = String(fd.get('role') || '')
  if (!isUuid(id) || id === user.id) redirect('/dashboard/equipe?err=invalide')
  const db = supabaseAdmin() || sb
  const { data: all } = await db.from('profiles').select('id,name,role').limit(2000)
  const target = (all || []).find(p => p.id === id)
  if (!target || target.role === 'super_admin') redirect('/dashboard/equipe?err=invalide')
  // Rôle « lecteur » : on reprend celui qui existe déjà dans la base (son nom exact n'est pas connu d'avance).
  const reader = (all || []).map(p => p.role).find(r => !TOP.includes(r))
  if (!STAFF.includes(next) && next !== reader) redirect('/dashboard/equipe?err=invalide')
  const { error } = await db.from('profiles').update({ role: next }).eq('id', id)
  if (error) redirect('/dashboard/equipe?err=refuse')
  await sb.from('audit_log').insert({ user_id: user.id, action: 'role_change', target: `${target.name || id} → ${next}` })
  revalidatePath('/dashboard/equipe')
  redirect('/dashboard/equipe?ok=1')
}
