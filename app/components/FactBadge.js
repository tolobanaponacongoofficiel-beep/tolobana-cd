import { FACT, isFact } from '@/lib/fact'
export default function FactBadge({ verdict }) {
  return isFact(verdict) ? <span className={`fact ${verdict}`}>Vérification : {FACT[verdict]}</span> : null
}
