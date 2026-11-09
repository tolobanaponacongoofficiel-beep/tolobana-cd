'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Recharge les données de la page toutes les N secondes tant que l'onglet est visible (matchs en direct).
export default function AutoRefresh({ every = 30 }) {
  const router = useRouter()
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) router.refresh() }, every * 1000)
    return () => clearInterval(t)
  }, [every, router])
  return null
}
