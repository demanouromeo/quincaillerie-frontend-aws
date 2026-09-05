import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CategorieService } from '../../../core/api/categorie.service';
import { CategorieResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { SearchInput } from '../../../shared/search-input/search-input';

@Component({
  selector: 'app-categories-tab',
  imports: [FormsModule, SearchInput],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class CategoriesTab {
  private readonly categorieService = inject(CategorieService);
  private readonly toastService = inject(ToastService);

  protected readonly categories = signal<CategorieResponse[]>([]);
  protected readonly selection = signal<CategorieResponse | null>(null);
  protected readonly nom = signal('');
  protected readonly enregistrement = signal(false);
  protected readonly recherche = signal('');

  protected readonly categoriesFiltrees = computed(() => {
    const recherche = this.recherche().trim().toLowerCase();
    if (!recherche) return this.categories();
    return this.categories().filter((c) => c.nom.toLowerCase().includes(recherche));
  });

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.categorieService.lister().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected selectionner(categorie: CategorieResponse): void {
    this.selection.set(categorie);
    this.nom.set(categorie.nom);
  }

  protected nouveau(): void {
    this.selection.set(null);
    this.nom.set('');
  }

  protected enregistrer(): void {
    if (!this.nom().trim()) {
      this.toastService.error('Le nom est obligatoire.');
      return;
    }

    this.enregistrement.set(true);
    const selection = this.selection();
    const requete = selection
      ? this.categorieService.modifier(selection.id, { nom: this.nom().trim() })
      : this.categorieService.creer({ nom: this.nom().trim() });

    requete.subscribe({
      next: () => {
        this.enregistrement.set(false);
        this.toastService.success(selection ? 'Categorie modifiee.' : 'Categorie creee.');
        this.nouveau();
        this.charger();
      },
      error: (err: Error) => {
        this.enregistrement.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  protected supprimer(categorie: CategorieResponse): void {
    if (!confirm(`Supprimer la categorie "${categorie.nom}" ?`)) return;
    this.categorieService.supprimer(categorie.id).subscribe({
      next: () => {
        this.toastService.success('Categorie supprimee.');
        if (this.selection()?.id === categorie.id) this.nouveau();
        this.charger();
      },
      error: (err: Error) => this.toastService.error(err.message)
    });
  }
}
