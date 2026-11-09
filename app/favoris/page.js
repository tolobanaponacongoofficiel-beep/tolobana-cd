import FavList from '../components/FavList'
import '../components/phase14.css'
export const metadata = { title: 'Mes favoris', description: 'Les articles que vous avez enregistrés pour plus tard.', robots: { index: false } }
export default function Favoris() {
  return (<main className="wrap" style={{ maxWidth: 820 }}>
    <div className="sec-head"><h1 className="sec">Mes favoris</h1></div>
    <p className="meta">Enregistrés sur cet appareil uniquement : aucun compte n’est nécessaire.</p>
    <FavList /></main>)
}
