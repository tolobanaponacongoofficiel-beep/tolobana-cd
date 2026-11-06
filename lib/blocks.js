// Outils partagés pour les articles par blocs (serveur + navigateur, aucune dépendance).

export const BLOCK_TYPES = ['p', 'h2', 'h3', 'image', 'youtube', 'quote', 'list', 'link', 'hr']

export const MEDIA_URL = /^https:\/\/[a-z0-9.-]+\/storage\/v1\/object\/public\/media\/[\w./-]+$/i
export const isMediaUrl = u => typeof u === 'string' && MEDIA_URL.test(u)
export const safeUrl = u => (/^https?:\/\/[^\s]+$/i.test(String(u || '').trim()) ? String(u).trim() : '')
export const isUuid = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''))

// Accepte youtube.com/watch?v=, youtu.be/, /embed/, /shorts/, /live/
export function youtubeId(url) {
  const m = String(url || '').trim().match(
    /^https?:\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})(?![\w-])/i)
  return m ? m[1] : null
}

export const initials = name =>
  String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'

const clip = (v, n) => String(v ?? '').trim().slice(0, n)

// Nettoie les blocs reçus du formulaire : ne garde que des types connus, des URL valides, des textes bornés.
export function sanitizeBlocks(raw) {
  let arr
  try { arr = typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return [] }
  if (!Array.isArray(arr)) return []
  const out = []
  for (const b of arr.slice(0, 300)) {
    if (!b || typeof b !== 'object' || !BLOCK_TYPES.includes(b.type)) continue
    const t = b.type
    if (t === 'hr') out.push({ type: 'hr' })
    else if (t === 'p') { const text = clip(b.text, 20000); if (text) out.push({ type: t, text }) }
    else if (t === 'h2' || t === 'h3') { const text = clip(b.text, 300); if (text) out.push({ type: t, text }) }
    else if (t === 'list') { const text = clip(b.text, 6000); if (text) out.push({ type: t, text }) }
    else if (t === 'quote') { const text = clip(b.text, 1500); if (text) out.push({ type: t, text, caption: clip(b.caption, 200) }) }
    else if (t === 'image') { if (isMediaUrl(b.url)) out.push({ type: t, url: b.url, caption: clip(b.caption, 300) }) }
    else if (t === 'youtube') { const id = youtubeId(b.url); if (id) out.push({ type: t, url: `https://www.youtube.com/watch?v=${id}`, caption: clip(b.caption, 300) }) }
    else if (t === 'link') { const url = safeUrl(b.url); if (url) out.push({ type: t, url, text: clip(b.text, 150) || url }) }
  }
  return out
}

const stripInline = s => String(s)
  .replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1').replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')

// Texte brut de l'article (colonne `body`, utilisée par la recherche et comme secours).
export function blocksToText(blocks) {
  return blocks.map(b => {
    if (b.type === 'p' || b.type === 'h2' || b.type === 'h3' || b.type === 'list' || b.type === 'quote') return stripInline(b.text)
    if (b.type === 'image' || b.type === 'youtube') return b.caption || ''
    if (b.type === 'link') return b.text
    return ''
  }).filter(Boolean).join('\n\n')
}

export function firstParagraph(blocks, max = 200) {
  const p = blocks.find(b => b.type === 'p')
  if (!p) return ''
  const t = stripInline(p.text).replace(/\s+/g, ' ')
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t
}
