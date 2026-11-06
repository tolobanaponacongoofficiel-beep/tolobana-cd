'use client'
import { useEffect, useState } from 'react'

const TZ = 'Africa/Kinshasa'

// Date + heure:minute:seconde en direct (heure de Kinshasa).
// Le serveur envoie la date et « --:--:-- » ; le navigateur prend le relais, donc pas d'écart d'hydratation.
export default function Clock({ initialDate }) {
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const date = now
    ? now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
    : initialDate
  const time = now
    ? now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: TZ })
    : '--:--:--'
  return (
    <div className="clock" title="Heure de Kinshasa">
      <span className="clock-date">{date}</span>
      <span className="clock-time" aria-hidden={!now || undefined}>{time}</span>
    </div>)
}
