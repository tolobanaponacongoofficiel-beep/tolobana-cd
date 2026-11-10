/**
 * Valide et transforme une URL de flux vidéo en URL d'intégration iframe sécurisée.
 * Autorise YouTube, Facebook, Vimeo, fichiers MP4/WebM et les flux zlive.st.
 */
export function streamEmbed(url) {
  if (!url || typeof url !== 'string') return null
  const u = url.trim()

  // zlive.st
  if (u.includes('zlive.st/embed/')) {
    const match = u.match(/https?:\/\/zlive\.st\/embed\/[a-zA-Z0-9_-]+/)
    return match ? match[0] : (u.startsWith('http') ? u : `https://${u}`)
  }

  // YouTube
  const ytMatch = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`

  // Facebook
  if (u.includes('facebook.com') || u.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=0`
  }

  // Vimeo
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`

  // Fichiers vidéo directs (MP4, WebM) ou autres https autorisés
  if (/^https?:\/\/.+\.(mp4|webm)(\?.*)?$/i.test(u) || u.startsWith('https://')) {
    return u
  }

  return null
}
