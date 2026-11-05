import './globals.css'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
export const metadata = { title: { default: 'Tolobana Info', template: '%s | Tolobana Info' }, description: "L'information au cœur de l'actualité." }
export default async function RootLayout({ children }) {
  const sb = supabaseServer()
  const { data: cats } = await sb.from('categories').select('name,slug').eq('show_in_menu', true).is('parent_id', null).order('position')
  const { data: { user } } = await sb.auth.getUser()
  return (
    <html lang="fr"><body>
      <header className="top"><div className="wrap">
        <div className="bar">
          <Link href="/" className="logo">TOLOBANA INFO<small>L’information au cœur de l’actualité.</small></Link>
          <Link href={user ? '/dashboard' : '/login'} className="btn">{user ? 'Mon espace' : 'Connexion'}</Link>
        </div>
        <nav className="menu">{(cats || []).map(c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>)}</nav>
      </div></header>
      {children}
      <footer><div className="wrap">© Tolobana Info : Kinshasa, RDC. Contenus de démonstration identifiés « DÉMO ».</div></footer>
    </body></html>
  )
}
