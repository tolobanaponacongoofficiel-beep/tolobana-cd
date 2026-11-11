import Link from 'next/link'
import './phase20.css'
// Lien vers la fiche du club s'il existe, sinon simple texte.
export default function TeamLink({ club, name, col, children }) {
  const inner = children ?? name
  if (!club) return <>{inner}</>
  return <Link href={`/clubs/${club.slug}`} className={col ? 'tl-col' : 'tl'}>{inner}</Link>
}
