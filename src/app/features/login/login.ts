import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly identifiant = signal('');
  protected readonly motDePasse = signal('');
  protected readonly motDePasseVisible = signal(false);
  protected readonly seSouvenir = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((visible) => !visible);
  }

  protected motDePasseOublie(): void {
    this.toastService.info('Contactez votre administrateur pour reinitialiser votre mot de passe.');
  }

  protected connecter(): void {
    if (!this.identifiant() || !this.motDePasse()) {
      this.errorMessage.set('Identifiant et mot de passe sont obligatoires.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);
    this.authService.authenticate(this.identifiant().trim(), this.motDePasse(), this.seSouvenir()).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.router.navigateByUrl(response.role === 'VENDEUR' ? '/vente' : '/backoffice');
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      }
    });
  }
}
