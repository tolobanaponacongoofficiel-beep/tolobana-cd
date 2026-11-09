import { getWeather, cityBySlug, CITIES, dayName } from '@/lib/weather'
import WeatherIcon from '../components/WeatherIcon'
import CityPicker from '../components/CityPicker'
import '../components/phase12.css'
export const metadata = { title: 'Météo en RDC', description: 'Prévisions météo à Kinshasa, Lubumbashi, Goma, Kisangani et dans les grandes villes de la RDC.', alternates: { canonical: '/meteo' } }
export default async function Meteo({ searchParams }) {
  const city = cityBySlug(String(searchParams?.ville || ''))
  const [w, others] = await Promise.all([getWeather(city), Promise.all(CITIES.filter(c => c.slug !== city.slug).map(async c => ({ c, w: await getWeather(c) })))])
  return (<main className="wrap">
    <div className="sec-head"><h1 className="sec">Météo</h1></div>
    <CityPicker current={city.slug} />
    {!w ? <p className="empty">La météo est momentanément indisponible. Réessayez dans quelques minutes.</p> : (<>
      <section className="wx-now" aria-label={`Météo actuelle à ${city.name}`}>
        <div className="wx-big"><WeatherIcon type={w.icon} size={84} /></div>
        <div><h2>{city.name}</h2><div className="wx-temp">{w.temp != null ? `${w.temp}°C` : '—'}</div><p>{w.label}</p>
          <p className="wx-sub">{w.humidity != null && `Humidité ${Math.round(w.humidity)} %`}{w.wind != null && ` · Vent ${w.wind} km/h`}</p></div>
      </section>
      <section aria-label="Prévisions"><h2 className="wx-h">Les prochains jours</h2>
        <ol className="wx-days">{w.days.map((d, i) => (<li key={d.key}><span className="wx-d">{dayName(d.key, i)}</span><span className="wx-ic"><WeatherIcon type={d.icon} size={32} /></span>
          <span className="wx-l">{d.label}</span><span className="wx-t"><b>{d.max}°</b> <span>{d.min}°</span></span><span className="wx-r">{d.rain >= 0.5 ? `${d.rain} mm` : '—'}</span></li>))}</ol>
        <p className="meta">Maximum, minimum et pluie cumulée prévue pour la journée (heure locale). Le premier jour peut être partiel.</p></section></>)}
    <h2 className="wx-h">Autres villes</h2>
    <div className="wx-grid">{others.filter(o => o.w).map(({ c, w: x }) => (<a key={c.slug} className="wx-card" href={`/meteo?ville=${c.slug}`}>
      <b>{c.name}</b><span className="wx-ic"><WeatherIcon type={x.icon} size={30} /></span><span>{x.temp != null ? `${x.temp}°` : '—'}</span><span className="wx-sub">{x.label}</span></a>))}</div>
    <p className="meta" style={{ marginTop: 18 }}>Prévisions : <a href="https://www.met.no/en" target="_blank" rel="noopener noreferrer">MET Norway</a> (licence CC BY 4.0). Indicatives : les orages locaux peuvent différer.</p>
  </main>)
}
