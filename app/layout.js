import './globals.css'
import Link from 'next/link'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { signOut } from './login/actions'
import Ticker from './components/Ticker'
import Partners from './components/Partners'
import HeaderSearch from './components/HeaderSearch'
import MainNav from './components/MainNav'
import ServicesMenu from './components/ServicesMenu'
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
import './components/credit.css'
import './components/phase25.css'
import './components/phase27.css'
import './components/phase28.css'
import RatesBar from './components/RatesBar'
import { Merriweather, Source_Sans_3 } from 'next/font/google'
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
const THEME_SCRIPT = "(function(){try{var t=localStorage.getItem('tolobana-theme');if(!t)t='light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()"
const serif = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'], variable: '--f-serif', display: 'swap' })
const sans = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--f-sans', display: 'swap' })
const WA = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm5.200 14.200c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.100-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 2c.1.2.1.300 0 .5l-.3.400-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.4.100.6-.1l.8-1c.2-.2.400-.2.600-.1l1.900.9c.3.100.5.200.5.300.1.200.1.800-.1 1.400z" /></svg>
const SOC = {
  Facebook: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 8V6.500c0-.7.200-1 1.100-1H17V2h-2.600C11.300 2 10 3.700 10 6.200V8H7.500v3.500H10V22h4V11.500h2.800L17.200 8z" /></svg>,
  X: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.800 3h3.100l-6.800 7.800L22 21h-6.200l-4.900-6.300L5.300 21H2.200l7.200-8.300L2 3h6.400l4.400 5.800zm-1.100 16.200h1.700L7.400 4.700H5.600z" /></svg>,
  YouTube: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3z" /></svg>,
  TikTok: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.600 2h-3.200v13.300a2.900 2.900 0 1 1-2.900-2.900c.3 0 .6 0 .8.100V9.300a6.100 6.100 0 1 0 5.300 6V8.800a7.300 7.300 0 0 0 4.200 1.300V6.900A4.300 4.300 0 0 1 16.600 2z" /></svg>,
  Instagram: <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.500" cy="6.500" r="1" fill="currentColor" stroke="none" /></svg>,
}
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
  const { data: subs } = await sb.from('categories').select('name,slug,parent_id').not('parent_id', 'is', null).order('position')
  const { data: parents } = await sb.from('categories').select('id,name,slug').is('parent_id', null).order('position')
  const rubriques = (parents || []).filter(c => !['videos', 'tolobana-tv'].includes(c.slug)).map(c => ({ name: c.name, slug: c.slug, children: (subs || []).filter(x => x.parent_id === c.id).map(x => ({ name: x.name, slug: x.slug })) }))
  const { data: breaking } = await sb.from('articles').select('title,slug').eq('status', 'published').eq('is_breaking', true)
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(8)
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa' })
  const list = (cats || []).filter(c => !['videos', 'tolobana-tv'].includes(c.slug))
  const link = c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head><body>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      {GA && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}</Script></>}
      <RatesBar settings={set} />
      <header className="top hdr lp">
        <div className="wrap lp-in">
          <div className="lp-l"><ServicesMenu rubriques={rubriques} /><HeaderSearch /></div>
          <Link href="/" className="brand lp-brand"><img src="/logo.png" alt={org} /></Link>
          <div className="lp-r">
            <PrefsButtons only="theme" />
            {channel && <a href={channel} target="_blank" rel="noopener noreferrer" className="lp-wa" aria-label="Suivre la chaîne WhatsApp">{WA}</a>}
            {staff ? <Link href="/dashboard" className="lp-staff">Mon espace</Link>
              : user ? <form action={signOut} className="lp-staff"><button className="lp-out">Déconnexion</button></form> : null}
          </div>
        </div>
        <div className="menu-wrap lp-nav"><div className="wrap">
          <MainNav
            primary={[{ href: '/', label: 'Accueil' }, { href: '/en-continu', label: 'En continu' }, { href: '/direct-foot', label: 'Direct Foot' }, { href: '/sport', label: 'Sport' }, ...list.map(c => ({ href: `/?rubrique=${c.slug}`, label: c.name }))]}
            groups={[]} />
        </div></div>
      </header>
      {live && <div className="live-banner"><div className="wrap"><Link href={`/direct/${live.slug}`}><span className="live-dot" aria-hidden="true" />EN DIRECT · <span className="t">{live.title}</span></Link></div></div>}
      <Ticker items={breaking} />
      <div className="wrap"><AdSlot placement="banner" /></div>
      <div id="contenu" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
      <NewsletterBox />
      <Partners />
      <footer className="lpf"><div className="wrap">
        <div className="lpf-grid">
          <div className="lpf-brand">
            <Link href="/"><img src="/logo.png" alt={org} /></Link>
            <div className="lpf-soc">
              {channel && <a href={channel} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{WA}</a>}
              {socials.map(x => <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={x.label}>{SOC[x.label] || x.label[0]}</a>)}</div>
            {set.email && <a className="lpf-mail" href={`mailto:${set.email}`}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>{set.email}</a>}
          </div>
          <nav aria-label="Informations"><h2>{org}</h2><Link href="/a-propos">À propos</Link><Link href="/contact">Nous contacter</Link><Link href="/charte-editoriale">Charte éditoriale</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><a href="/rss.xml">Flux RSS</a><Link href={staff ? '/dashboard' : '/redaction'}>Espace rédaction</Link></nav>
          <nav aria-label="Services"><h2>Services</h2><Link href="/annoncer">Publicité</Link><Link href="/services">Offres d’emploi et annonces</Link><Link href="/agenda">Agenda</Link><Link href="/taux">Taux de change</Link><Link href="/meteo">Météo</Link><Link href="/stories">Nos stories</Link><Link href="/alertes">Alertes info</Link>{channel && <a href={channel} target="_blank" rel="noopener noreferrer">Chaîne WhatsApp</a>}</nav>
          <nav aria-label="Rubriques"><h2>Rubriques</h2>{list.map(c => <Link key={c.slug} href={`/?rubrique=${c.slug}`}>{c.name}</Link>)}</nav>
        </div>
        <div className="lpf-bot">
          <p>© {new Date().getFullYear()} {org}. Tous droits réservés. {set.address || 'Kinshasa, RDC.'}</p>
          <PrefsButtons only="saver" saver={saver} />
          <p className="credit-line"><span>Conçu et maintenu par</span><a className="credit" href="https://wa.me/243818205404" target="_blank" rel="noopener noreferrer" aria-label="Contacter Ir Hilaire Tobalibi sur WhatsApp">{WA}Ir Hilaire Tobalibi</a></p>
        </div>
      </div></footer>
      <MobileBar liveSlug={live?.slug || null} latestAt={latestAt} user={!!user} staff={staff} />
      <PwaRegister /><InstallPrompt />
    </body></html>)
}
