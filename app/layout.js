import './globals.css'
import Link from 'next/link'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { signOut } from './login/actions'
import Ticker from './components/Ticker'
import Partners from './components/Partners'
import Clock from './components/Clock'
import Script from 'next/script'
import NewsletterBox from './components/NewsletterBox'
import PwaRegister from './components/PwaRegister'
import InstallPrompt from './components/InstallPrompt'
import { SITE_URL } from '@/lib/site'
import './components/phase8.css'
import './components/phase9.css'

const GA = /^G-[A-Z0-9]{4,}$/.test(process.env.NEXT_PUBLIC_GA_ID || '') ? process.env.NEXT_PUBLIC_GA_ID : null
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Tolobana Info', template: '%s | Tolobana Info' },
  description: "L'information au cœur de l'actualité.",
  applicationName: 'Tolobana Info',
  openGraph: { siteName: 'Tolobana Info', locale: 'fr_CD', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
}
export const viewport = { themeColor: '#031523' }
const ORG = { '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: 'Tolobana Info', url: SITE_URL, logo: `${SITE_URL}/logo.png` }
const MAIN_COUNT = 7

export default async function RootLayout({ children }) {
  const { sb, user, role } = await getUserAndRole()
  const staff = !!user && atLeast(role, 'journalist')
  const { data: cats } = await sb.from('categories').select('name,slug').eq('show_in_menu', true).is('parent_id', null).order('position')
  const { data: breaking } = await sb.from('articles').select('title,slug').eq('status', 'published').eq('is_breaking', true)
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(8)
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
  const list = (cats || []).filter(c => !['videos', 'tolobana-tv'].includes(c.slug))
  const link = c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>
  return (
    <html lang="fr"><body>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      {GA && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}</Script></>}
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
        <nav className="menu menu-all" aria-label="Rubriques"><Link href="/">Accueil</Link><Link href="/tv">Tolobana TV</Link><Link href="/dossiers">Dossiers</Link>{list.map(link)}</nav>
        <nav className="menu menu-split" aria-label="Rubriques"><Link href="/">Accueil</Link><Link href="/tv">Tolobana TV</Link><Link href="/dossiers">Dossiers</Link>{list.slice(0, MAIN_COUNT).map(link)}
          {list.length > MAIN_COUNT && <div className="more"><button type="button" className="more-btn" aria-haspopup="true">Plus ▾</button>
            <div className="more-pop">{list.slice(MAIN_COUNT).map(link)}</div></div>}</nav>
      </div></div>
      <Ticker items={breaking} />
      <div id="contenu" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
      <NewsletterBox />
      <Partners />
      <footer><div className="wrap" style={{ display: 'grid', gap: 8 }}>
        <nav className="foot-links" aria-label="Informations"><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/charte-editoriale">Charte éditoriale</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/dossiers">Dossiers</Link><Link href="/sondages">Sondages</Link><a href="/rss.xml">RSS</a></nav>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Tolobana Info. Tous droits réservés. Kinshasa, RDC.</p>
        <p style={{ margin: 0 }}>Site conçu et maintenu par Ir Hilaire Tobalibi · <Link href={staff ? '/dashboard' : '/login'}>Espace rédaction</Link></p>
      </div></footer>
      <PwaRegister /><InstallPrompt />
    </body></html>)
}
