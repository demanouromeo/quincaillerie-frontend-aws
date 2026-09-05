import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CompteService } from '../../core/api/compte.service';
import { ToastService } from '../../core/toast.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-changer-mot-de-passe-modal',
  imports: [FormsModule],
  templateUrl: './changer-mot-de-passe-modal.html',
  styleUrl: './changer-mot-de-passe-modal.scss'
})
export class ChangerMotDePasseModal {
  private readonly compteService = inject(CompteService);
  private readonly toastService = inject(ToastService);
  protected readonly uiService = inject(UiService);

  protected readonly ancien = signal('');
  protected readonly nouveau = signal('');
  protected readonly confirmation = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected fermer(): void {
    this.uiService.closeChangerMotDePasse();
    this.ancien.set('');
    this.nouveau.set('');
    this.confirmation.set('');
    this.errorMessage.set(null);
  }

  protected valider(): void {
    this.errorMessage.set(null);

    if (!this.ancien() || !this.nouveau() || !this.confirmation()) {
      this.errorMessage.set('Tous les champs sont obligatoires.');
      return;
    }
    if (this.nouveau().length < 6) {
      this.errorMessage.set('Le nouveau mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    if (this.nouveau() !== this.confirmation()) {
      this.errorMessage.set('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    this.submitting.set(true);
    this.compteService
      .changerMotDePasse({ ancienMotDePasse: this.ancien(), nouveauMotDePasse: this.nouveau() })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toastService.success('Mot de passe modifie avec succes.');
          this.fermer();
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.errorMessage.set(err.message);
        }
      });
  }
}
