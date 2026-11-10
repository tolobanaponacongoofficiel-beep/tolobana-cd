/**
 * Valide et transforme une URL ou un code <iframe> en URL d'intégration iframe valide.
 */
export function streamEmbed(url) {
  if (!url || typeof url !== 'string') return null
  let u = url.trim()

  // 1. Si l'utilisateur colle tout le bloc <iframe src="...">, on extrait la valeur du src
  const iframeMatch = u.match(/src=["']([^"']+)["']/i)
  if (iframeMatch) {
    u = iframeMatch[1].trim()
  }

  if (!u) return null

  // 2. Nettoyage du protocole
  if (u.startsWith('//')) {
    u = 'https:' + u
  } else if (!u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u
  }

  // 3. Support zlive.st
  if (u.includes('zlive.st')) {
    return u
  }

  // 4. Support YouTube
  const ytMatch = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  }

  // 5. Support Facebook
  if (u.includes('facebook.com') || u.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=0`
  }

  // 6. Support Vimeo
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  }

  // 7. Si c'est un lien HTTPS valide quelconque
  if (u.startsWith('https://')) {
    return u
  }

  return null
}
