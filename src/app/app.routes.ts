import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login)
  },
  {
    path: 'vente',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEUR', 'GESTIONNAIRE', 'ADMIN'] },
    loadComponent: () => import('./features/vente/vente').then((m) => m.Vente)
  },
  {
    path: 'backoffice',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['GESTIONNAIRE', 'ADMIN'] },
    loadComponent: () => import('./layout/backoffice-shell/backoffice-shell').then((m) => m.BackofficeShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/backoffice/dashboard/dashboard').then((m) => m.DashboardTab)
      },
      {
        path: 'produits',
        loadComponent: () => import('./features/backoffice/produits/produits').then((m) => m.ProduitsTab)
      },
      {
        path: 'approvisionnements',
        loadComponent: () =>
          import('./features/backoffice/approvisionnements/approvisionnements').then((m) => m.ApprovisionnementsTab)
      },
      {
        path: 'fournisseurs',
        loadComponent: () => import('./features/backoffice/fournisseurs/fournisseurs').then((m) => m.FournisseursTab)
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/backoffice/categories/categories').then((m) => m.CategoriesTab)
      },
      {
        path: 'utilisateurs',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/backoffice/utilisateurs/utilisateurs').then((m) => m.UtilisateursTab)
      },
      {
        path: 'rapports',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/backoffice/rapports/rapports').then((m) => m.RapportsTab)
      },
      {
        path: 'parametres',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/backoffice/parametres/parametres').then((m) => m.ParametresTab)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
