'use server'
import { revalidatePath } from 'next/cache'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
const slugify = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export async function createArticle(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) return
  const title = String(fd.get('title')).trim()
  await sb.from('articles').insert({
    title, subtitle: fd.get('subtitle') || null, summary: fd.get('summary') || null, body: String(fd.get('body')),
    slug: `${slugify(title)}-${Date.now().toString(36)}`, author_id: user.id, category_id: Number(fd.get('category_id')),
    status: fd.get('submit') ? 'submitted' : 'draft', is_demo: fd.get('is_demo') === 'on',
  })
  revalidatePath('/dashboard')
}
export async function review(fd) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) return
  const ok = fd.get('decision') === 'publish'
  await sb.from('articles').update(ok ? { status: 'published', published_at: new Date().toISOString() } : { status: 'rejected' }).eq('id', fd.get('id'))
  await sb.from('audit_log').insert({ user_id: user.id, action: ok ? 'publish' : 'reject', target: String(fd.get('id')) })
  revalidatePath('/dashboard'); revalidatePath('/')
}
