// Textes par défaut des pages institutionnelles. Balisage : « ## Titre », « - puce », ligne vide = nouveau paragraphe, {{champ}} = réglage du site.
export const PAGE_SLUGS = ['a-propos', 'contact', 'mentions-legales', 'charte-editoriale', 'confidentialite', 'annoncer']
export const PAGES = {
  annoncer: { title: 'Annoncer sur {{org_name}}', body: `{{org_name}} propose à ses annonceurs un espace publicitaire sur un site d’information lu au Congo et dans la diaspora.

## Formats disponibles
- Bandeau en haut des pages.
- Encadré dans la colonne de l’accueil.
- Encadré à l’intérieur des articles.
- Contenu sponsorisé, toujours signalé comme tel.

## Ce que nous vous remettons
- Un suivi des affichages et des clics sur votre annonce.
- Un lien direct vers votre site, votre page ou votre WhatsApp.

## Règles
Toute publicité est clairement identifiée par la mention « Publicité ». Les annonceurs n’ont aucune influence sur le contenu éditorial.

## Demander un devis
Écrivez-nous par e-mail à {{email}} ou par la page Contact en précisant votre activité, la période souhaitée et votre budget.` },
  'a-propos': { title: 'À propos', body: `{{org_name}} est un média numérique généraliste basé en République démocratique du Congo. Il couvre l’actualité nationale, africaine et internationale : politique, économie, société, sécurité, justice, diplomatie, culture, sport et vie des provinces.

## Notre mission
Informer avec rigueur, vérifier avant de publier et donner à chacun les clés pour comprendre l’actualité du Congo et du monde.

## Nos engagements
- Une information vérifiée, sourcée et datée.
- Une rédaction indépendante des pouvoirs politiques, économiques et publicitaires.
- Une séparation claire entre l’information, l’analyse et l’opinion.
- La correction visible de toute erreur.

## Une rédaction à votre service
Les journalistes et contributeurs de {{org_name}} signent leurs articles. Chaque auteur dispose d’une fiche présentant son parcours et l’ensemble de ses publications.

## Nous contacter
Une information, une correction, un droit de réponse ou une proposition de partenariat : rendez-vous sur la page Contact.` },
  contact: { title: 'Contact', body: `Pour signaler une information, demander une correction, exercer un droit de réponse ou proposer un partenariat, écrivez-nous. La rédaction répond dans les meilleurs délais.` },
  'mentions-legales': { title: 'Mentions légales', body: `## Éditeur du site
{{legal_name}}, éditeur de {{org_name}}.
Adresse : {{address}}
E-mail : {{email}}
Téléphone : {{phone}}

## Directeur de la publication
{{director}}

## Hébergement
Le site est hébergé par Vercel Inc. (États-Unis). Les données et les fichiers sont conservés chez Supabase.

## Propriété intellectuelle
Les textes, photographies, vidéos, logos et éléments graphiques publiés sur {{org_name}} sont protégés. Toute reproduction ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite. De courtes citations sont permises à condition de mentionner la source et d’ajouter un lien vers l’article d’origine.

## Responsabilité
{{org_name}} s’efforce de publier des informations exactes et à jour. Les commentaires des lecteurs et les tribunes engagent leurs seuls auteurs. Tout contenu manifestement illicite peut être signalé à la rédaction, qui le retire dans les meilleurs délais.

## Liens externes
Le site peut contenir des liens vers des sites tiers dont {{org_name}} n’est pas responsable.

## Droit applicable
Le présent site est soumis au droit congolais. Tout litige relève des juridictions congolaises compétentes.` },
  'charte-editoriale': { title: 'Charte éditoriale', body: `La rédaction de {{org_name}} s’engage à respecter les principes suivants.

## Exactitude et vérification
Aucune information n’est publiée sans avoir été vérifiée. Les informations sensibles sont recoupées auprès de plusieurs sources indépendantes.

## Indépendance
La rédaction décide seule de ses contenus. Les annonceurs et partenaires n’ont aucune influence sur la ligne éditoriale.

## Information, analyse et opinion
Les faits, les analyses et les opinions sont clairement distingués. Les rubriques Opinions et Tribunes sont signées et n’engagent que leurs auteurs.

## Respect des personnes
- Présomption d’innocence respectée.
- Protection des mineurs et des victimes.
- Refus de toute incitation à la haine, à la violence ou à la discrimination.

## Sources
Les sources sont citées chaque fois que possible. Le secret des sources confidentielles est protégé.

## Corrections et droit de réponse
Toute erreur est corrigée rapidement et signalée par la mention « Mis à jour ». Toute personne mise en cause peut exercer son droit de réponse en écrivant à {{email}}.

## Publicité et contenus sponsorisés
Tout contenu sponsorisé ou publicitaire est clairement identifié comme tel.

## Photographies et droits d’auteur
Les photographies sont créditées. {{org_name}} respecte le droit d’auteur et les droits à l’image.

## Commentaires
Les commentaires sont modérés. Les propos injurieux, diffamatoires ou illicites sont supprimés.` },
  confidentialite: { title: 'Politique de confidentialité', body: `{{org_name}} respecte votre vie privée. Cette page explique quelles données sont collectées et pourquoi.

## Données collectées
- Compte : nom et adresse e-mail, lors de la création d’un compte.
- Commentaires : le texte publié et le nom du compte.
- Newsletter : votre adresse e-mail, avec confirmation de votre part.
- Messages : les informations saisies dans le formulaire de contact.
- Sondages : un identifiant technique anonyme pour éviter les votes multiples.
- Audience : statistiques de fréquentation lorsque la mesure d’audience est activée.

## Utilisation
Ces données servent à faire fonctionner le site, modérer les commentaires, envoyer la newsletter que vous avez demandée, répondre à vos messages et mesurer l’audience. Elles ne sont ni vendues ni cédées à des annonceurs.

## Prestataires techniques
Hébergement (Vercel), base de données et fichiers (Supabase), envoi d’e-mails (Resend) et mesure d’audience (Google Analytics, si activée).

## Cookies
Le site utilise des cookies techniques (connexion, sondages). Aucun cookie publicitaire n’est déposé par {{org_name}}.

## Durée de conservation
Les données sont conservées tant que votre compte ou votre abonnement existe, puis supprimées à votre demande.

## Vos droits
Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à {{email}}. Chaque e-mail de la newsletter contient un lien de désabonnement.

## Modifications
Cette politique peut évoluer. La date de dernière mise à jour figure en bas de page.` },
}
export const fill = (text, s) => String(text).replace(/\{\{(\w+)\}\}/g, (_, k) => s?.[k] || 'non communiqué')
export function parse(text, s) {
  const out = []; let list = null
  for (const raw of fill(text, s).split('\n')) {
    const line = raw.trimEnd()
    if (line.startsWith('- ')) { (list ||= []).push(line.slice(2)); continue }
    if (list) { out.push({ t: 'ul', items: list }); list = null }
    if (line.startsWith('## ')) out.push({ t: 'h2', text: line.slice(3) })
    else if (line.trim()) out.push({ t: 'p', text: line })
  }
  if (list) out.push({ t: 'ul', items: list })
  return out
}
