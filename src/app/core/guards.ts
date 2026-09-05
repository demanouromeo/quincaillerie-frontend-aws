import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { Role } from './models';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) return true;
  return router.parseUrl('/login');
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowed = route.data['roles'] as Role[] | undefined;
  if (!allowed || authService.hasAnyRole(allowed)) return true;

  return router.parseUrl(authService.role() === 'VENDEUR' ? '/vente' : '/backoffice');
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return true;
  return router.parseUrl(authService.role() === 'VENDEUR' ? '/vente' : '/backoffice');
};
