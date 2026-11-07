'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { kinshasaToISO } from '@/lib/dates'
async function editor() { const c = await getUserAndRole(); if (!c.user || !atLeast(c.role, 'editor')) redirect('/dashboard'); return c }
export async function createPoll(fd) {
  const { sb, user } = await editor()
  const question = String(fd.get('question') || '').trim().slice(0, 250)
  const labels = String(fd.get('options') || '').split('\n').map(s => s.trim().slice(0, 120)).filter(Boolean).slice(0, 6)
  if (!question || labels.length < 2) redirect('/dashboard/sondages?err=1')
  const { data: p, error } = await sb.from('polls').insert({ question, ends_at: kinshasaToISO(fd.get('ends_at')), created_by: user.id }).select('id').single()
  if (error || !p) redirect('/dashboard/sondages?err=1')
  await sb.from('poll_options').insert(labels.map((label, position) => ({ poll_id: p.id, label, position })))
  await sb.from('audit_log').insert({ user_id: user.id, action: 'poll_create', target: question.slice(0, 80) })
  revalidatePath('/'); revalidatePath('/sondages'); redirect('/dashboard/sondages?ok=1')
}
export async function togglePoll(fd) {
  const { sb } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('polls').update({ is_active: fd.get('active') === '1' }).eq('id', id)
  revalidatePath('/'); revalidatePath('/sondages'); redirect('/dashboard/sondages?ok=1')
}
export async function deletePoll(fd) {
  const { sb, user } = await editor(); const id = String(fd.get('id') || ''); if (!isUuid(id)) return
  await sb.from('polls').delete().eq('id', id)
  await sb.from('audit_log').insert({ user_id: user.id, action: 'poll_delete', target: id })
  revalidatePath('/'); revalidatePath('/sondages'); redirect('/dashboard/sondages?ok=1')
}
