import Link from 'next/link'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { getWeather, cityBySlug } from '@/lib/weather'
import { cityPhotos, cityBg } from '@/lib/cityart'
import WeatherIcon from './WeatherIcon'
import './phase12.css'
import './phase33.css'
// Petit bloc météo de l'accueil : photo de la ville (ou illustration) en fond, ville choisie par le lecteur, Kinshasa par défaut.
export default async function WeatherWidget() {
  let slug = 'kinshasa'
  try { slug = cookies().get('tl_city')?.value || slug } catch {}
  const city = cityBySlug(slug), [w, set] = await Promise.all([getWeather(city), getSettings(supabaseServer())])
  if (!w) return null
  const today = w.days[0]
  return (
    <Link href={`/meteo?ville=${city.slug}`} className="wx-mini wx-photo" style={cityBg(city.slug, w.icon, cityPhotos(set))} aria-label={`Météo à ${city.name}`}>
      <span className="wx-ic"><WeatherIcon type={w.icon} size={40} /></span>
      <span className="wx-txt"><b>{city.name}</b><span>{w.label}{w.temp != null ? ` · ${w.temp}°` : ''}</span>
        {today && <span className="wx-sub">Min {today.min}° · Max {today.max}°{today.rain >= 1 ? ` · pluie ${today.rain} mm` : ''}</span>}</span>
    </Link>)
}
