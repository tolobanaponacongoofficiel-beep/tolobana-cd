export default function manifest() {
  return {
    name: 'Tolobana Info', short_name: 'Tolobana', description: "L'information au cœur de l'actualité.",
    start_url: '/', display: 'standalone', background_color: '#031523', theme_color: '#031523', lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [{ name: 'Tolobana TV', url: '/tv' }, { name: 'Rechercher', url: '/recherche' }],
  }
}
