import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ErrorResponse } from './models';

function messageFor(error: HttpErrorResponse): string {
  const body = error.error as ErrorResponse | undefined;
  if (body?.message) return body.message;
  if (error.status === 0) return 'Impossible de joindre le serveur.';
  if (error.status === 401) return 'Identifiants invalides.';
  if (error.status === 403) return "Action non autorisee pour votre role.";
  return `Erreur inattendue (${error.status}).`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          authService.logout();
          router.navigateByUrl('/login');
        }
        return throwError(() => new Error(messageFor(error)));
      }
      return throwError(() => error);
    })
  );
};
