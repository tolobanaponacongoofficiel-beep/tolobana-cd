import { initials } from '@/lib/blocks'

// Photo ronde à côté d'un nom ; initiales si pas de photo. size : 'sm' | '' | 'xl'
export default function Avatar({ name, url, size = '' }) {
  const cls = `avatar${size ? ' ' + size : ''}`
  return url ? <img className={cls} src={url} alt="" /> : <span className={cls} aria-hidden="true">{initials(name)}</span>
}
