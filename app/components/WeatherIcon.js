const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const CLOUD = 'M7 18.5h9.5a3.5 3.5 0 0 0 .4-6.97A5 5 0 0 0 7.2 11 3.8 3.8 0 0 0 7 18.5z'
export default function WeatherIcon({ type, size = 40 }) {
  const sun = <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></>
  const body = type === 'sun' ? sun
    : type === 'partly' ? <><circle cx="8.5" cy="8.5" r="3" /><path d="M8.5 2.5v1.4M2.5 8.5h1.4M4.3 4.3l1 1M12.7 4.3l-1 1" /><path d="M9.5 20h8.2a3.2 3.2 0 0 0 .3-6.4 4.4 4.4 0 0 0-8.3.6A3.3 3.3 0 0 0 9.5 20z" /></>
    : type === 'cloud' ? <path d={CLOUD} />
    : type === 'rain' ? <><path d="M7 15h9.5a3.5 3.5 0 0 0 .4-6.97A5 5 0 0 0 7.2 7.5 3.8 3.8 0 0 0 7 15z" /><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" /></>
    : <><path d="M7 14.5h9.5a3.5 3.5 0 0 0 .4-6.97A5 5 0 0 0 7.2 7 3.8 3.8 0 0 0 7 14.5z" /><path d="m12.5 14.5-2.3 3.6h3.2l-2 3.4" /></>
  return <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-hidden="true" {...P}>{body}</svg>
}
