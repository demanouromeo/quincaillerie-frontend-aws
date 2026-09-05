import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FournisseurService } from '../../../core/api/fournisseur.service';
import { FournisseurRequest, FournisseurResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { SearchInput } from '../../../shared/search-input/search-input';

interface FournisseurForm {
  nom: string;
  contact: string;
  adresse: string;
}

function formVide(): FournisseurForm {
  return { nom: '', contact: '', adresse: '' };
}

@Component({
  selector: 'app-fournisseurs-tab',
  imports: [FormsModule, SearchInput],
  templateUrl: './fournisseurs.html',
  styleUrl: './fournisseurs.scss'
})
export class FournisseursTab {
  private readonly fournisseurService = inject(FournisseurService);
  private readonly toastService = inject(ToastService);

  protected readonly fournisseurs = signal<FournisseurResponse[]>([]);
  protected readonly selection = signal<FournisseurResponse | null>(null);
  protected readonly form = signal<FournisseurForm>(formVide());
  protected readonly enregistrement = signal(false);
  protected readonly recherche = signal('');

  protected readonly fournisseursFiltres = computed(() => {
    const recherche = this.recherche().trim().toLowerCase();
    if (!recherche) return this.fournisseurs();
    return this.fournisseurs().filter(
      (f) =>
        f.nom.toLowerCase().includes(recherche) ||
        (f.contact ?? '').toLowerCase().includes(recherche) ||
        (f.adresse ?? '').toLowerCase().includes(recherche)
    );
  });

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.fournisseurService.lister().subscribe({
      next: (fournisseurs) => this.fournisseurs.set(fournisseurs),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected selectionner(fournisseur: FournisseurResponse): void {
    this.selection.set(fournisseur);
    this.form.set({ nom: fournisseur.nom, contact: fournisseur.contact ?? '', adresse: fournisseur.adresse ?? '' });
  }

  protected nouveau(): void {
    this.selection.set(null);
    this.form.set(formVide());
  }

  protected majForm<K extends keyof FournisseurForm>(champ: K, valeur: FournisseurForm[K]): void {
    this.form.update((f) => ({ ...f, [champ]: valeur }));
  }

  protected enregistrer(): void {
    const f = this.form();
    if (!f.nom.trim()) {
      this.toastService.error('Le nom est obligatoire.');
      return;
    }

    const request: FournisseurRequest = { nom: f.nom.trim(), contact: f.contact.trim() || null, adresse: f.adresse.trim() || null };
    this.enregistrement.set(true);
    const selection = this.selection();
    const requete = selection
      ? this.fournisseurService.modifier(selection.id, request)
      : this.fournisseurService.creer(request);

    requete.subscribe({
      next: () => {
        this.enregistrement.set(false);
        this.toastService.success(selection ? 'Fournisseur modifie.' : 'Fournisseur cree.');
        this.nouveau();
        this.charger();
      },
      error: (err: Error) => {
        this.enregistrement.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  protected supprimer(fournisseur: FournisseurResponse): void {
    if (!confirm(`Supprimer le fournisseur "${fournisseur.nom}" ?`)) return;
    this.fournisseurService.supprimer(fournisseur.id).subscribe({
      next: () => {
        this.toastService.success('Fournisseur supprime.');
        if (this.selection()?.id === fournisseur.id) this.nouveau();
        this.charger();
      },
      error: (err: Error) => this.toastService.error(err.message)
    });
  }
}
