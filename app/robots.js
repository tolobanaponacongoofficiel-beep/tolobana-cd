import { SITE_URL } from '@/lib/site'
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/api', '/login'] }],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
    host: SITE_URL,
  }
}
