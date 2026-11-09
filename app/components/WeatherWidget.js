import Link from 'next/link'
import { cookies } from 'next/headers'
import { getWeather, cityBySlug } from '@/lib/weather'
import WeatherIcon from './WeatherIcon'
import './phase12.css'
// Petit bloc météo de l'accueil (ville choisie par le lecteur, Kinshasa par défaut).
export default async function WeatherWidget() {
  let slug = 'kinshasa'
  try { slug = cookies().get('tl_city')?.value || slug } catch {}
  const city = cityBySlug(slug), w = await getWeather(city)
  if (!w) return null
  const today = w.days[0]
  return (
    <Link href={`/meteo?ville=${city.slug}`} className="wx-mini" aria-label={`Météo à ${city.name}`}>
      <span className="wx-ic"><WeatherIcon type={w.icon} size={38} /></span>
      <span className="wx-txt"><b>{city.name}</b><span>{w.label}{w.temp != null ? ` · ${w.temp}°` : ''}</span>
        {today && <span className="wx-sub">Min {today.min}° · Max {today.max}°{today.rain >= 1 ? ` · pluie ${today.rain} mm` : ''}</span>}</span>
    </Link>)
}
