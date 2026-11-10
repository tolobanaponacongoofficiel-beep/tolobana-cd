import './globals.css'
import Link from 'next/link'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { signOut } from './login/actions'
import Ticker from './components/Ticker'
import Partners from './components/Partners'
import Clock from './components/Clock'
import HeaderSearch from './components/HeaderSearch'
import MainNav from './components/MainNav'
import Script from 'next/script'
import NewsletterBox from './components/NewsletterBox'
import PwaRegister from './components/PwaRegister'
import InstallPrompt from './components/InstallPrompt'
import { SITE_URL } from '@/lib/site'
import './components/phase8.css'
import './components/phase9.css'
import './components/phase10.css'
import './components/phase11.css'
import './components/phase12.css'
import './components/phase16.css'
import MobileBar from './components/MobileBar'
import PrefsButtons from './components/PrefsButtons'
import AdSlot from './components/AdSlot'
import { saverOn } from '@/lib/saver'
import { getSettings, socialLinks, channelUrl } from '@/lib/settings'
import { supabaseAnon } from '@/lib/supabase/anon'

const GA = /^G-[A-Z0-9]{4,}$/.test(process.env.NEXT_PUBLIC_GA_ID || '') ? process.env.NEXT_PUBLIC_GA_ID : null
export async function generateMetadata() {
  let name = 'Tolobana Info'
  try { name = (await getSettings(supabaseAnon())).org_name || name } catch {}
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description: "L'information au cœur de l'actualité.",
    applicationName: name,
    openGraph: { siteName: name, locale: 'fr_CD', type: 'website' },
    twitter: { card: 'summary_large_image' },
    alternates: { types: { 'application/rss+xml': '/rss.xml' } },
    verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
  }
}
export const viewport = { themeColor: '#031523' }
const THEME_SCRIPT = "(function(){try{var t=localStorage.getItem('tolobana-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()"
const MAIN_COUNT = 3

export default async function RootLayout({ children }) {
  const { sb, user, role } = await getUserAndRole()
  const set = await getSettings(sb)
  const org = set.org_name || 'Tolobana Info'
  const socials = socialLinks(set), channel = channelUrl(set)
  const ORG = { '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: org, url: SITE_URL, logo: `${SITE_URL}/logo.png`,
    ...(socials.length || channel ? { sameAs: [...socials.map(x => x.url), ...(channel ? [channel] : [])] } : {}),
    ...(set.email ? { email: set.email } : {}), ...(set.phone ? { telephone: set.phone } : {}) }
  const saver = saverOn()
  const { data: lives } = await sb.from('lives').select('title,slug').eq('is_published', true).eq('status', 'live').order('created_at', { ascending: false }).limit(1)
  const live = lives?.[0]
  const { data: newest } = await sb.from('articles').select('published_at').eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(1)
  const latestAt = newest?.[0]?.published_at || null
  const staff = !!user && atLeast(role, 'journalist')
  const { data: cats } = await sb.from('categories').select('name,slug').eq('show_in_menu', true).is('parent_id', null).order('position')
  const { data: breaking } = await sb.from('articles').select('title,slug').eq('status', 'published').eq('is_breaking', true)
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(8)
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
  const list = (cats || []).filter(c => !['videos', 'tolobana-tv'].includes(c.slug))
  const link = c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>
  return (
    <html lang="fr" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head><body>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      {GA && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}</Script></>}
      <header className="top hdr">
        <div className="wrap hdr-in">
          <div className="hdr-l"><HeaderSearch /></div>
          <div className="hdr-c">
            <Link href="/" className="brand"><img src="/logo.png" alt={org} /></Link>
            <Clock initialDate={date} />
          </div>
          <div className="hdr-r">
            <PrefsButtons saver={saver} />
            {staff ? <Link href="/dashboard" className="btn gold hdr-cta">Mon espace</Link>
              : user ? <form action={signOut} className="hdr-cta"><button className="btn ghost light sm">Déconnexion</button></form>
              : <Link href="/login" className="btn ghost light sm hdr-cta">Connexion</Link>}
          </div>
        </div>
      </header>
      <div className="menu-wrap"><div className="wrap">
        <MainNav
          primary={[{ href: '/', label: 'Accueil' }, { href: '/en-continu', label: 'En continu' }, { href: '/direct', label: 'Direct' }, { href: '/sport', label: 'Sport' }, ...list.slice(0, MAIN_COUNT).map(c => ({ href: `/?rubrique=${c.slug}`, label: c.name }))]}
          groups={[
            { title: 'Rubriques', items: list.slice(MAIN_COUNT).map(c => ({ href: `/?rubrique=${c.slug}`, label: c.name })) },
            { title: 'Services et outils', items: [{ href: '/tv', label: 'Tolobana TV' }, { href: '/dossiers', label: 'Dossiers' }, { href: '/verification', label: 'Vérification' }, { href: '/stories', label: 'Stories' }, { href: '/meteo', label: 'Météo' }, { href: '/taux', label: 'Taux de change' }, { href: '/services', label: 'Services' }, { href: '/agenda', label: 'Agenda' }, { href: '/sondages', label: 'Sondages' }, { href: '/favoris', label: 'Mes favoris' }] }]} />
      </div></div>
      {live && <div className="live-banner"><div className="wrap"><Link href={`/direct/${live.slug}`}><span className="live-dot" aria-hidden="true" />EN DIRECT · <span className="t">{live.title}</span></Link></div></div>}
      <Ticker items={breaking} />
      <div className="wrap"><AdSlot placement="banner" /></div>
      <div id="contenu" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
      <NewsletterBox />
      <Partners />
      <footer><div className="wrap" style={{ display: 'grid', gap: 8 }}>
        <nav className="foot-links" aria-label="Informations"><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/charte-editoriale">Charte éditoriale</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/dossiers">Dossiers</Link><Link href="/direct">Direct</Link><Link href="/sport">Sport</Link><Link href="/meteo">Météo</Link><Link href="/services">Services</Link><Link href="/agenda">Agenda</Link><Link href="/favoris">Mes favoris</Link><Link href="/verification">Vérification</Link><Link href="/en-continu">En continu</Link><Link href="/stories">Stories</Link><Link href="/taux">Taux de change</Link><Link href="/sondages">Sondages</Link><Link href="/annoncer">Annoncer</Link><a href="/rss.xml">RSS</a></nav>
        {(channel || socials.length > 0) && <div className="social-links" aria-label="Suivez-nous">
          {channel && <a href={channel} target="_blank" rel="noopener noreferrer" className="btn wa sm">Suivre sur WhatsApp</a>}
          {socials.map(x => <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer">{x.label}</a>)}</div>}
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} {org}. Tous droits réservés. {set.address || 'Kinshasa, RDC.'}</p>
        <p style={{ margin: 0 }}>Site conçu et maintenu par Ir Hilaire Tobalibi · <Link href={staff ? '/dashboard' : '/login'}>Espace rédaction</Link></p>
      </div></footer>
      <MobileBar liveSlug={live?.slug || null} latestAt={latestAt} user={!!user} staff={staff} />
      <PwaRegister /><InstallPrompt />
    </body></html>)
}
