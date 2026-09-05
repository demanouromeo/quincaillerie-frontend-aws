import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/auth.service';
import { CategorieService } from '../../../core/api/categorie.service';
import { ProduitService } from '../../../core/api/produit.service';
import { CategorieResponse, ProduitRequest, ProduitResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { SearchInput } from '../../../shared/search-input/search-input';
import { StockBadge } from '../../../shared/stock-badge/stock-badge';

interface ProduitForm {
  reference: string;
  nom: string;
  categorieId: number | null;
  unite: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  stockActuel: number;
}

function formVide(): ProduitForm {
  return {
    reference: '',
    nom: '',
    categorieId: null,
    unite: '',
    prixAchat: 0,
    prixVente: 0,
    seuilAlerte: 0,
    stockActuel: 0
  };
}

@Component({
  selector: 'app-produits-tab',
  imports: [FormsModule, StockBadge, SearchInput],
  templateUrl: './produits.html',
  styleUrl: './produits.scss'
})
export class ProduitsTab {
  private readonly produitService = inject(ProduitService);
  private readonly categorieService = inject(CategorieService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly produits = signal<ProduitResponse[]>([]);
  protected readonly categories = signal<CategorieResponse[]>([]);
  protected readonly alertesSeulement = signal(false);
  protected readonly selection = signal<ProduitResponse | null>(null);
  protected readonly form = signal<ProduitForm>(formVide());
  protected readonly enregistrement = signal(false);
  protected readonly recherche = signal('');

  protected readonly estAdmin = computed(() => this.authService.role() === 'ADMIN');

  protected readonly produitsFiltres = computed(() => {
    const recherche = this.recherche().trim().toLowerCase();
    const produits = recherche
      ? this.produits().filter(
          (p) =>
            p.reference.toLowerCase().includes(recherche) ||
            p.nom.toLowerCase().includes(recherche) ||
            (p.categorieNom ?? '').toLowerCase().includes(recherche)
        )
      : this.produits();
    return [...produits].sort((a, b) => a.nom.localeCompare(b.nom));
  });

  constructor() {
    this.chargerProduits();
    this.categorieService.lister().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  private chargerProduits(): void {
    const source = this.alertesSeulement() ? this.produitService.alertes() : this.produitService.lister();
    source.subscribe({
      next: (produits) => this.produits.set(produits),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected basculerAlertes(actif: boolean): void {
    this.alertesSeulement.set(actif);
    this.chargerProduits();
  }

  protected selectionner(produit: ProduitResponse): void {
    this.selection.set(produit);
    this.form.set({
      reference: produit.reference,
      nom: produit.nom,
      categorieId: produit.categorieId,
      unite: produit.unite,
      prixAchat: produit.prixAchat,
      prixVente: produit.prixVente,
      seuilAlerte: produit.seuilAlerte,
      stockActuel: produit.stockActuel
    });
  }

  protected nouveau(): void {
    this.selection.set(null);
    this.form.set(formVide());
  }

  protected majForm<K extends keyof ProduitForm>(champ: K, valeur: ProduitForm[K]): void {
    this.form.update((f) => ({ ...f, [champ]: valeur }));
  }

  protected enregistrer(): void {
    const f = this.form();
    if (!f.reference.trim() || !f.nom.trim() || !f.unite.trim()) {
      this.toastService.error('Reference, nom et unite sont obligatoires.');
      return;
    }

    const request: ProduitRequest = {
      reference: f.reference.trim(),
      nom: f.nom.trim(),
      categorieId: f.categorieId,
      unite: f.unite.trim(),
      prixAchat: Number(f.prixAchat),
      prixVente: Number(f.prixVente),
      seuilAlerte: Number(f.seuilAlerte),
      stockActuel: Number(f.stockActuel)
    };

    this.enregistrement.set(true);
    const selection = this.selection();
    const requete = selection
      ? this.produitService.modifier(selection.id, request)
      : this.produitService.creer(request);

    requete.subscribe({
      next: () => {
        this.enregistrement.set(false);
        this.toastService.success(selection ? 'Produit modifie.' : 'Produit cree.');
        this.nouveau();
        this.chargerProduits();
      },
      error: (err: Error) => {
        this.enregistrement.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  protected supprimer(produit: ProduitResponse): void {
    if (!this.estAdmin()) return;
    if (!confirm(`Supprimer le produit "${produit.nom}" ?`)) return;

    this.produitService.supprimer(produit.id).subscribe({
      next: () => {
        this.toastService.success('Produit supprime.');
        if (this.selection()?.id === produit.id) this.nouveau();
        this.chargerProduits();
      },
      error: (err: Error) => this.toastService.error(err.message)
    });
  }
}
