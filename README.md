# Quincaillerie Mvogt — Client web (Angular)

Client web de gestion de stock pour la **Quincaillerie Mvogt** (Yaoundé),
deuxième client de l'application après le [client desktop JavaFX](../frontend-javafx),
consommant la même API REST. C'est désormais **le client sur lequel se concentre le
développement actif** — l'objectif à terme est qu'il remplace le client JavaFX comme
client principal (voir `CLAUDE.md` à la racine du projet).

## Description

L'application couvre les mêmes fonctionnalités que le client desktop pour les trois
rôles métier (Vendeur, Gestionnaire de stock, Administrateur) : point de vente au
comptoir avec impression de reçu, et back-office de gestion du stock, des
approvisionnements, des fournisseurs, des comptes utilisateurs et des paramètres du
magasin. Le design (« console d'exploitation quincaillerie ») est délibérément
différent du rendu natif du client JavaFX — les deux clients ne partagent aucun
code, seulement le contrat d'API du backend.

## Architecture

Application Angular **standalone** (pas de `NgModule`) et **zoneless**, organisée
par couche fonctionnelle :

```
src/app/
├── core/
│   ├── models.ts                 # Tous les DTOs backend (un seul fichier)
│   ├── auth.service.ts           # Session (signal) : token/rôle/login
│   ├── auth.interceptor.ts       # Attache le Bearer JWT à chaque requête
│   ├── error.interceptor.ts      # Normalise les erreurs HTTP, déconnexion sur 401
│   ├── guards.ts                 # authGuard / roleGuard / guestGuard
│   ├── toast.service.ts / ui.service.ts
│   └── api/*.service.ts          # Un service HTTP fin par ressource métier
├── shared/                       # Composants réutilisés par plusieurs écrans
│   (badge de stock, actions barre du haut, modale changer mot de passe,
│    vue de reçu imprimable, mini-graphique en barres…)
├── layout/backoffice-shell/      # Sidebar + topbar + <router-outlet>
├── features/
│   ├── login/
│   ├── vente/                    # Point de vente
│   └── backoffice/{dashboard,produits,approvisionnements,fournisseurs,
│                    categories,utilisateurs,rapports,parametres}/
├── app.routes.ts                 # Routes en lazy-loading, gardées par rôle
└── app.config.ts                 # Providers globaux (router, HttpClient, intercepteurs)
```

- **Signals partout** : l'état des composants (session, listes, formulaires) est
  géré avec les *signals* Angular plutôt que RxJS, qui reste cantonné aux appels
  HTTP (`HttpClient` + intercepteurs fonctionnels).
- **Routing en lazy-loading** (`loadComponent`) : chaque écran/onglet du
  back-office est un chunk chargé à la demande, protégé par `data.roles` sur la
  route (`app.routes.ts`).
- **Design system maison** : pas de librairie de composants UI ni de librairie de
  graphiques — styles écrits à la main (`src/styles.scss`), mini-graphiques en
  barres CSS (`shared/bar-list`).
- **Reçu imprimable sans PDF** : `shared/receipt-view` affiche un aperçu du ticket
  puis déclenche `window.print()` avec une feuille de style `@media print` qui
  isole uniquement le reçu à l'impression — équivalent web du `ReceiptService`
  (OpenPDF) du client JavaFX, sans dépendance PDF côté navigateur.
- **Emballage mobile** : un projet Capacitor (`android/`) embarque le build web
  dans un conteneur Android natif, sans code spécifique à la plateforme.

## Fonctionnalités

- **Connexion** avec case « Se souvenir de moi » (persistance `localStorage` vs
  `sessionStorage`, voir Sécurité) et lien « Mot de passe oublié ? » (message
  invitant à contacter un administrateur — pas de flux de réinitialisation
  automatisé, aucun envoi d'email n'est branché côté backend).
- **Point de vente** (Vendeur, et Gestionnaire/Administrateur via la navigation
  croisée back-office ⇄ vente) : recherche produit, panier avec vérification du
  stock, nom client optionnel sur le reçu, validation puis impression du ticket.
- **Back-office** (Gestionnaire/Administrateur), en onglets de la sidebar :
  - Tableau de bord (indicateurs de stock).
  - Produits & alertes de stock.
  - Approvisionnements (saisie fournisseur + lignes produit/quantité/prix).
  - Fournisseurs.
  - Catégories, Utilisateurs, Rapports (ventes globales, top produits) et
    Paramètres du magasin — réservés à l'Administrateur (gardés par route).
- **Gestion de compte** : changement de mot de passe en self-service (modale
  partagée, accessible aux trois rôles).
- **Gestion des erreurs réseau** : toast générique (« Impossible de joindre le
  serveur. ») si le backend est injoignable, messages d'erreur normalisés à
  partir de la réponse du serveur.

## Technologies

| Domaine              | Choix                                                              |
|-----------------------|--------------------------------------------------------------------|
| Framework              | Angular 21.2 (composants standalone, zoneless, signals)             |
| Langage                | TypeScript 5.9 (mode strict)                                        |
| HTTP                   | `HttpClient` + intercepteurs fonctionnels (`HttpInterceptorFn`), RxJS 7.8 |
| Style                  | SCSS, design system maison (`styles.scss`) — pas de librairie UI tierce |
| Tests unitaires        | Vitest 4                                                             |
| Build                  | Angular CLI / `@angular/build` 21.2 (`esbuild`)                     |
| Mobile                 | Capacitor 8.5 (wrapper Android)                                     |
| Gestionnaire de paquets| npm                                                                   |

## Sécurité

- **Authentification par JWT** : le token obtenu via `POST /api/auth/login`
  (`AuthService.authenticate`) est attaché automatiquement à chaque requête par
  `authInterceptor` (`Authorization: Bearer <token>`), sauf sur l'appel de login
  lui-même.
- **Persistance de session côté navigateur** : `AuthService` stocke la session
  (token, rôle, login) **en clair**, soit dans `localStorage` si « Se souvenir de
  moi » est coché (survit à la fermeture du navigateur), soit dans
  `sessionStorage` sinon (effacé à la fermeture de l'onglet — utile sur un poste
  vendeur partagé entre plusieurs employés). Aucun chiffrement côté client.
- **Déconnexion automatique sur 401** : `errorInterceptor` intercepte toute
  réponse `401` (hors tentative de login) pour vider la session et rediriger vers
  `/login`, évitant qu'un token expiré reste utilisé silencieusement.
- **Gardes de route** :
  - `authGuard` — bloque l'accès aux routes protégées si non authentifié.
  - `roleGuard` — vérifie `route.data['roles']` contre le rôle courant et
    redirige vers l'écran par défaut du rôle sinon (ex. Vendeur → `/vente`).
  - `guestGuard` — empêche un utilisateur déjà connecté de revoir l'écran de
    connexion.
  - Ces gardes protègent l'**expérience utilisateur**, pas les données : comme
    côté JavaFX, l'application fait confiance au backend (`hasRole`/`hasAnyRole`
    Spring Security) pour l'autorisation réelle — un appel API direct sans le bon
    rôle est rejeté en `403` côté serveur quoi qu'il arrive côté UI.
- **Aucune invalidation de token** : un changement de mot de passe ne révoque pas
  les JWT déjà émis par le backend.
- **Pas de CSRF token** : inutile ici, l'authentification est **stateless** par
  Bearer token (pas de cookie de session porté automatiquement par le navigateur).
- **XSS** : aucune utilisation d'`innerHTML`/`bypassSecurityTrust*` dans le code
  applicatif — on s'appuie sur l'échappement automatique du template Angular.
- **Transport** : en développement, l'API est appelée en clair sur
  `http://localhost:8082/api` ; en production (`environment.prod.ts`), l'URL
  pointe vers le backend déployé en HTTPS (voir section Backend).

## Backend

Ce client ne fait aucun accès direct à la base de données : il consomme
exclusivement l'API REST du [backend Spring Boot](../backend) (Spring Boot 4.1,
Spring Security, MySQL), avec le même contrat d'API que le client JavaFX.

- **Configuration de l'URL** : `src/environments/environment.ts` (dev,
  `http://localhost:8082/api`) est remplacé à la build de production par
  `src/environments/environment.prod.ts` (via `fileReplacements` dans
  `angular.json`), qui pointe vers le backend déployé.
- **CORS** : en développement, le backend doit inclure l'origine du serveur Angular
  (`http://localhost:4200` par défaut) dans `CORS_ALLOWED_ORIGINS` (`.env` du
  backend), sinon le navigateur bloque les appels.

Principaux endpoints consommés (identiques au client JavaFX) :

| Domaine            | Endpoints                                                          |
|---------------------|----------------------------------------------------------------------|
| Authentification      | `POST /api/auth/login`                                              |
| Compte                | `PUT /api/compte/mot-de-passe`                                       |
| Produits               | `GET/POST/PUT/DELETE /api/produits`, `GET /api/produits/alertes`     |
| Catégories             | `GET/POST/PUT/DELETE /api/categories`                                |
| Fournisseurs           | `GET/POST/PUT/DELETE /api/fournisseurs`                              |
| Ventes                 | `GET/POST /api/ventes`                                               |
| Approvisionnements     | `GET/POST /api/approvisionnements`, `GET /api/approvisionnements/{id}`, `GET /api/approvisionnements/fournisseur/{id}` |
| Utilisateurs            | `GET/POST/PUT/DELETE /api/utilisateurs`                              |
| Paramètres du magasin  | `GET /api/parametres`, `PUT /api/parametres` (ADMIN)                 |

## Démarrage

```bash
npm install

ng serve             # serveur de développement — http://localhost:4200
ng test              # tests unitaires (Vitest)
ng build              # build de production dans dist/
```

Le backend doit être démarré au préalable (par défaut sur `http://localhost:8082`,
avec une base MySQL/MariaDB accessible — voir le README du backend), et son CORS
configuré pour accepter `http://localhost:4200` en développement.
