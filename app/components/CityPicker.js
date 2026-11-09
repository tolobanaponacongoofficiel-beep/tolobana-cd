'use client'
import { useRouter } from 'next/navigation'
import { CITIES } from '@/lib/weather'
// Choix de la ville : mémorisé (cookie) pour l'accueil.
export default function CityPicker({ current }) {
  const router = useRouter()
  function pick(slug) { document.cookie = `tl_city=${slug}; path=/; max-age=31536000; samesite=lax`; router.push(`/meteo?ville=${slug}`) }
  return (
    <div className="wx-cities" role="tablist" aria-label="Choisir une ville">
      {CITIES.map(c => <button key={c.slug} type="button" role="tab" aria-selected={c.slug === current} className={c.slug === current ? 'on' : ''} onClick={() => pick(c.slug)}>{c.name}</button>)}
    </div>)
}
