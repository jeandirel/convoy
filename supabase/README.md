# Supabase + Vercel setup

## 1. Creer la base Supabase

1. Ouvrir Supabase > SQL Editor.
2. Copier/coller le contenu de `supabase/migrations/202606121_admin_workspace.sql`.
3. Executer le script.

## 2. Creer l'utilisateur admin

Dans Supabase > Authentication > Users, creer un utilisateur admin avec email + mot de passe.
Cet utilisateur pourra se connecter sur `/admin`.

## 3. Configurer Vercel

Dans Vercel > Project Settings > Environment Variables, ajouter :

```text
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

Puis redeployer le projet.

## 4. Fonctionnalites disponibles

- Connexion admin via Supabase Auth
- Creation de dossiers pro
- Gestion reservations, devis, contrats, factures, documents, missions
- Statuts: brouillon, nouveau, en cours, envoye, signe, paye, termine, annule
- Liens documents et signatures
- Suivi basique des evenements visiteurs dans `visitor_events`

## Notes

La premiere version donne acces aux tables a tout utilisateur Supabase authentifie.
Pour une equipe plus large, ajouter ensuite une table `profiles` avec un role admin et resserrer les policies RLS.