import './globals.css'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import Ticker from './components/Ticker'
import Partners from './components/Partners'
export const metadata = { title: { default: 'Tolobana Info', template: '%s | Tolobana Info' }, description: "L'information au cœur de l'actualité." }
export default async function RootLayout({ children }) {
  const sb = supabaseServer()
  const { data: cats } = await sb.from('categories').select('name,slug').eq('show_in_menu', true).is('parent_id', null).order('position')
  const { data: breaking } = await sb.from('articles').select('title,slug').eq('status', 'published').eq('is_breaking', true)
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(8)
  const { data: { user } } = await sb.auth.getUser()
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
  return (
    <html lang="fr"><body>
      <header className="top"><div className="wrap">
        <div className="bar">
          <Link href="/" className="brand"><img src="/logo.png" alt="Tolobana Info" /></Link>
          <div className="bar-right"><span className="date">{date}</span>
            <Link href={user ? '/dashboard' : '/login'} className="btn">{user ? 'Mon espace' : 'Connexion'}</Link></div>
        </div>
        <nav className="menu">{(cats || []).map(c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>)}</nav>
      </div></header>
      <Ticker items={breaking} />
      {children}
      <Partners />
      <footer><div className="wrap">© Tolobana Info : Kinshasa, RDC. Contenus de démonstration identifiés « DÉMO ».</div></footer>
    </body></html>)
}
