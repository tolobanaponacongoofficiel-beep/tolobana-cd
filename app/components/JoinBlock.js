import Link from 'next/link'
const WA = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm5.200 14.200c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.100-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 2c.1.2.1.300 0 .5l-.3.400-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.4.100.6-.1l.8-1c.2-.2.400-.2.600-.1l1.900.9c.3.100.5.200.5.300.1.200.1.800-.1 1.400z" /></svg>
// Bloc « WhatsApp » : suivre la chaîne + envoyer une info à la rédaction + lien vers les alertes.
export default function JoinBlock({ channel, phone, org }) {
  const num = String(phone || '').replace(/\D/g, '')
  const tip = `https://wa.me/${num.length >= 9 ? num : '243818205404'}?text=${encodeURIComponent(`Bonjour ${org}, je vous envoie une information : `)}`
  return (<section className="join" aria-labelledby="join-t"><div className="wrap"><div className="join-box">
    <div className="join-ic">{WA}</div>
    <div className="join-tx"><h2 id="join-t">Restez informé, participez</h2><p>Recevez l’actualité sur WhatsApp, ou envoyez-nous une photo, une vidéo ou un témoignage.</p></div>
    <div className="join-act">
      {channel && <a className="join-b main" href={channel} target="_blank" rel="noopener noreferrer">{WA}Suivre la chaîne</a>}
      <a className="join-b" href={tip} target="_blank" rel="noopener noreferrer">Envoyer une info</a></div>
    <p className="join-sub"><Link href="/alertes">Activer les alertes info sur ce téléphone</Link></p>
  </div></div></section>)
}
