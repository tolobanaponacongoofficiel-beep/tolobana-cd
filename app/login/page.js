import LoginForm from './LoginForm'
export const metadata = { title: 'Connexion', robots: { index: false } }
export default function Login({ searchParams }) {
  const list = String(process.env.OAUTH_PROVIDERS || '').split(',').map(s => s.trim().toLowerCase()).filter(p => p === 'google' || p === 'facebook')
  const err = { 1: 'Fournisseur inconnu.', 2: 'Connexion impossible pour le moment.', 3: 'Lien invalide ou expiré. Réessayez.' }[searchParams?.err]
  return <LoginForm providers={list} urlError={err} />
}
