# Phase 20 : fiches sport plus robustes + diagnostic

Téléverser `app` et `lib` sur GitHub (aucun SQL).

- Les pages match, équipe et joueur ne plantent plus : en cas de problème, un message clair s'affiche avec un « Détail technique ».
- `app/sport/error.js` : filet de sécurité pour tout le sport.
- Les erreurs sont écrites dans Vercel > Logs (étiquettes `[sport/match]`, `[sport/equipe]`, `[sport/joueur]`).

Si le message revient, envoyez-moi le « Détail technique » affiché, l'adresse de la page, ou la ligne du journal Vercel.
