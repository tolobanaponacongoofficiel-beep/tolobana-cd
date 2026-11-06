'use client'
// Bouton de formulaire qui demande confirmation avant d'envoyer.
export default function ConfirmButton({ message, className = 'btn red sm', children, ...rest }) {
  return <button {...rest} className={className} onClick={e => { if (!window.confirm(message)) e.preventDefault() }}>{children}</button>
}
