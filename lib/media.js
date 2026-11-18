// Lecture de la médiathèque (bucket « media ») avec les titres modifiables (table media_meta).
export const KIND = ext => /^(jpe?g|png|webp|gif|avif)$/.test(ext) ? 'image' : ext === 'pdf' ? 'pdf' : /^(mp3|m4a|wav)$/.test(ext) ? 'audio' : /^(mp4|webm|mov)$/.test(ext) ? 'video' : 'doc'
export const FOLDER_LABEL = { articles: 'Articles', library: 'Médiathèque', profiles: 'Profils', authors: 'Rédacteurs' }
export const PATH_RE = /^[a-z0-9_-]{1,30}(\/[\w.-]{1,120}){1,2}$/i
export async function listMedia(sb, perFolder = 200) {
  const bucket = sb.storage.from('media')
  const root = await bucket.list('', { limit: 100 })
  const folders = (root.data || []).filter(x => !x.id).map(x => x.name)
  const [lists, meta] = await Promise.all([
    Promise.all(folders.map(async f => { const r = await bucket.list(f, { limit: perFolder, sortBy: { column: 'created_at', order: 'desc' } }); return (r.data || []).filter(x => x.id).map(x => ({ ...x, folder: f, path: `${f}/${x.name}` })) })),
    sb.from('media_meta').select('path,title,alt,caption').limit(2000)])
  const M = new Map((meta.data || []).map(m => [m.path, m]))
  const files = lists.flat().map(x => {
    const ext = (x.name.split('.').pop() || '').toLowerCase(), m = M.get(x.path) || {}
    return { path: x.path, name: x.name, folder: x.folder, ext, kind: KIND(ext), url: bucket.getPublicUrl(x.path).data.publicUrl, at: x.created_at || x.updated_at || '', bytes: x.metadata?.size, title: m.title || '', alt: m.alt || '', caption: m.caption || '' }
  }).sort((a, b) => String(b.at).localeCompare(String(a.at)))
  return { files, folders }
}
