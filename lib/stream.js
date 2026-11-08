import { youtubeId, safeUrl } from '@/lib/blocks'
// Transforme un lien de diffusion en direct en lecteur intégrable. Liens acceptés : YouTube, Facebook, Vimeo, fichier vidéo MP4/WebM.
export function streamEmbed(raw) {
  const url = safeUrl(raw)
  if (!url || !/^https:\/\//i.test(url)) return null
  const yt = youtubeId(url)
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt}`, label: 'YouTube' }
  let host = ''
  try { host = new URL(url).hostname.replace(/^(www|m|web|fb)\./, '') } catch { return null }
  if (host === 'facebook.com' || host === 'watch' || host === 'fb.watch' || host.endsWith('.facebook.com'))
    return { kind: 'iframe', src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=734`, label: 'Facebook' }
  const v = url.match(/^https:\/\/(?:www\.)?vimeo\.com\/(?:event\/)?(\d+)/i)
  if (v) return { kind: 'iframe', src: `https://player.vimeo.com/video/${v[1]}`, label: 'Vimeo' }
  if (/\.(mp4|webm)(\?[^\s]*)?$/i.test(url)) return { kind: 'video', src: url, label: 'Vidéo' }
  return null
}
