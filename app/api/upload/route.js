import { NextResponse } from 'next/server'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'

export const runtime = 'nodejs'
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const fail = (error, status) => NextResponse.json({ error }, { status })

// Envoi d'une image à la fois (évite la limite de taille d'un formulaire contenant plusieurs photos).
export async function POST(req) {
  const origin = req.headers.get('origin')
  if (origin && new URL(origin).host !== req.headers.get('host')) return fail('Origine refusée.', 403)
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) return fail('Accès réservé à la rédaction.', 403)
  let fd
  try { fd = await req.formData() } catch { return fail('Requête invalide.', 400) }
  const file = fd.get('file')
  const folder = fd.get('folder') === 'authors' ? 'authors' : 'articles'
  if (folder === 'authors' && !atLeast(role, 'admin')) return fail('Accès réservé aux administrateurs.', 403)
  if (!file || typeof file === 'string' || !file.size) return fail('Aucun fichier reçu.', 400)
  const ext = TYPES[file.type]
  if (!ext) return fail('Format accepté : JPG, PNG ou WebP.', 400)
  if (file.size > 4 * 1024 * 1024) return fail('Image trop lourde (4 Mo maximum).', 400)
  const path = `${folder}/${user.id}-${Date.now()}.${ext}`
  const { error } = await sb.storage.from('media').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (error) return fail("Le stockage a refusé l'image. Réessayez.", 500)
  return NextResponse.json({ url: sb.storage.from('media').getPublicUrl(path).data.publicUrl })
}
