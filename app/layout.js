import './globals.css'
import Link from 'next/link'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { signOut } from './login/actions'
import Ticker from './components/Ticker'
import Partners from './components/Partners'
import Clock from './components/Clock'

export const metadata = { title: { default: 'Tolobana Info', template: '%s | Tolobana Info' }, description: "L'information au cœur de l'actualité." }
const MAIN_COUNT = 7

export default async function RootLayout({ children }) {
  const { sb, user, role } = await getUserAndRole()
  const staff = !!user && atLeast(role, 'journalist')
  const { data: cats } = await sb.from('categories').select('name,slug').eq('show_in_menu', true).is('parent_id', null).order('position')
  const { data: breaking } = await sb.from('articles').select('title,slug').eq('status', 'published').eq('is_breaking', true)
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(8)
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
  const list = cats || []
  const link = c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>
  return (
    <html lang="fr"><body>
      <header className="top">
        <div className="wrap bar">
          <Link href="/" className="brand"><img src="/logo.png" alt="Tolobana Info" /></Link>
          <div className="bar-right">
            <Clock initialDate={date} />
            <form action="/recherche" className="search" role="search"><input name="q" placeholder="Rechercher…" aria-label="Rechercher" /><button className="btn">OK</button></form>
            {staff && <Link href="/dashboard" className="btn gold">Mon espace</Link>}
            {user && !staff && <form action={signOut}><button className="btn ghost light sm">Déconnexion</button></form>}
          </div>
        </div>
      </header>
      <div className="menu-wrap"><div className="wrap">
        <nav className="menu menu-all" aria-label="Rubriques"><Link href="/">Accueil</Link>{list.map(link)}</nav>
        <nav className="menu menu-split" aria-label="Rubriques"><Link href="/">Accueil</Link>{list.slice(0, MAIN_COUNT).map(link)}
          {list.length > MAIN_COUNT && <div className="more"><button type="button" className="more-btn" aria-haspopup="true">Plus ▾</button>
            <div className="more-pop">{list.slice(MAIN_COUNT).map(link)}</div></div>}</nav>
      </div></div>
      <Ticker items={breaking} />
      {children}
      <Partners />
      <footer><div className="wrap">© Tolobana Info : Kinshasa, RDC. Contenus de démonstration identifiés « DÉMO ». · <Link href={staff ? '/dashboard' : '/login'}>Espace rédaction</Link></div></footer>
    </body></html>)
}
