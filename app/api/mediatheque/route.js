import { NextResponse } from 'next/server'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { listMedia } from '@/lib/media'
export const runtime = 'nodejs'
// Envoi d'un fichier à la fois vers la médiathèque (4 Mo maximum : limite d'envoi de l'hébergeur).
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf', 'text/plain': 'txt', 'text/csv': 'csv',
  'application/msword': 'doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx', 'application/vnd.ms-excel': 'xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt', 'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a' }
const fail = (error, status) => NextResponse.json({ error }, { status })
const slug = t => String(t || 'fichier').replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'fichier'
export async function POST(req) {
  const origin = req.headers.get('origin')
  if (origin && new URL(origin).host !== req.headers.get('host')) return fail('Origine refusée.', 403)
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) return fail('Accès réservé à la rédaction.', 403)
  let fd; try { fd = await req.formData() } catch { return fail('Requête invalide.', 400) }
  const file = fd.get('file')
  if (!file || typeof file === 'string' || !file.size) return fail('Aucun fichier reçu.', 400)
  const ext = TYPES[file.type]
  if (!ext) return fail('Format non accepté (images, PDF, Word, Excel, PowerPoint, texte, MP3).', 400)
  if (file.size > 4 * 1024 * 1024) return fail('Fichier trop lourd (4 Mo maximum). Pour une vidéo, utilisez un lien YouTube dans Tolobana TV.', 400)
  const path = `library/${Date.now()}-${slug(file.name)}.${ext}`
  const { error } = await sb.storage.from('media').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (error) return fail('Le stockage a refusé le fichier. Réessayez.', 500)
  return NextResponse.json({ url: sb.storage.from('media').getPublicUrl(path).data.publicUrl, path })
}

// Liste des images pour le sélecteur de l'éditeur (recherche par titre ou nom).
export async function GET(req) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'journalist')) return fail('Accès réservé à la rédaction.', 403)
  const q = String(new URL(req.url).searchParams.get('q') || '').toLowerCase().trim().slice(0, 60)
  const { files } = await listMedia(sb, 100)
  const items = files.filter(x => x.kind === 'image' && (!q || `${x.title} ${x.name}`.toLowerCase().includes(q))).slice(0, 60).map(x => ({ url: x.url, name: x.title || x.name, alt: x.alt || '' }))
  return NextResponse.json({ items })
}
