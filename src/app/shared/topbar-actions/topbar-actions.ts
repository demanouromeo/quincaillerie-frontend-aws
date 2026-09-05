import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { UiService } from '../../core/ui.service';

// Laisse le temps a l'animation de sortie (@keyframes logout-walk, voir
// topbar-actions.scss) de jouer avant de couper la session et naviguer.
const DUREE_ANIMATION_DECONNEXION_MS = 380;

@Component({
  selector: 'app-topbar-actions',
  templateUrl: './topbar-actions.html',
  styleUrl: './topbar-actions.scss'
})
export class TopbarActions {
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  protected readonly login = this.authService.login;
  protected readonly role = this.authService.role;
  protected readonly loggingOut = signal(false);

  protected changerMotDePasse(): void {
    this.uiService.openChangerMotDePasse();
  }

  protected deconnexion(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    setTimeout(() => {
      this.authService.logout();
      this.router.navigateByUrl('/login');
    }, DUREE_ANIMATION_DECONNEXION_MS);
  }
}
