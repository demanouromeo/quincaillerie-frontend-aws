import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ParametresService } from '../../../core/api/parametres.service';
import { ParametresRequest, ParametresResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';

interface ParametresForm {
  nom: string;
  domaine: string;
  telephone: string;
  ville: string;
  email: string;
}

const PARAMETRES_VIDE: ParametresResponse = { nom: '', domaine: '', telephone: '', ville: '', email: '' };

function formVide(): ParametresForm {
  return { nom: '', domaine: '', telephone: '', ville: '', email: '' };
}

@Component({
  selector: 'app-parametres-tab',
  imports: [FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.scss'
})
export class ParametresTab {
  private readonly parametresService = inject(ParametresService);
  private readonly toastService = inject(ToastService);

  // Valeurs actuellement enregistrees, affichees en placeholder sur chaque champ
  // (voir template) : le formulaire lui-meme reste vide, un champ laisse vide
  // conserve la valeur actuelle plutot que de la remplacer par du texte vide.
  protected readonly actuel = signal<ParametresResponse>(PARAMETRES_VIDE);
  protected readonly form = signal<ParametresForm>(formVide());
  protected readonly chargement = signal(true);
  protected readonly enregistrement = signal(false);

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.chargement.set(true);
    this.parametresService.recuperer().subscribe({
      next: (parametres) => {
        this.actuel.set(parametres);
        this.form.set(formVide());
        this.chargement.set(false);
      },
      error: (err: Error) => {
        this.chargement.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  protected majForm<K extends keyof ParametresForm>(champ: K, valeur: ParametresForm[K]): void {
    this.form.update((f) => ({ ...f, [champ]: valeur }));
  }

  private valeur<K extends keyof ParametresForm>(champ: K): string {
    const saisie = this.form()[champ].trim();
    return saisie || this.actuel()[champ];
  }

  protected enregistrer(): void {
    const request: ParametresRequest = {
      nom: this.valeur('nom'),
      domaine: this.valeur('domaine'),
      telephone: this.valeur('telephone'),
      ville: this.valeur('ville'),
      email: this.valeur('email')
    };

    this.enregistrement.set(true);
    this.parametresService.modifier(request).subscribe({
      next: (parametres) => {
        this.enregistrement.set(false);
        this.actuel.set(parametres);
        this.form.set(formVide());
        this.toastService.success('Parametres du magasin enregistres.');
      },
      error: (err: Error) => {
        this.enregistrement.set(false);
        this.toastService.error(err.message);
      }
    });
  }
}
