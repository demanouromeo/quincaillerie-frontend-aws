import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApprovisionnementService } from '../../../core/api/approvisionnement.service';
import { FournisseurService } from '../../../core/api/fournisseur.service';
import { ProduitService } from '../../../core/api/produit.service';
import { ApprovisionnementResponse, FournisseurResponse, ProduitResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { SearchInput } from '../../../shared/search-input/search-input';

interface LigneSaisie {
  produit: ProduitResponse;
  quantite: number;
  prixAchatUnitaire: number;
}

@Component({
  selector: 'app-approvisionnements-tab',
  imports: [FormsModule, DatePipe, SearchInput],
  templateUrl: './approvisionnements.html',
  styleUrl: './approvisionnements.scss'
})
export class ApprovisionnementsTab {
  private readonly approService = inject(ApprovisionnementService);
  private readonly fournisseurService = inject(FournisseurService);
  private readonly produitService = inject(ProduitService);
  private readonly toastService = inject(ToastService);

  protected readonly fournisseurs = signal<FournisseurResponse[]>([]);
  protected readonly produits = signal<ProduitResponse[]>([]);
  protected readonly historique = signal<ApprovisionnementResponse[]>([]);

  protected readonly fournisseurId = signal<number | null>(null);
  protected readonly produitId = signal<number | null>(null);
  protected readonly quantite = signal<number>(1);
  protected readonly prixAchatUnitaire = signal<number>(0);
  protected readonly lignes = signal<LigneSaisie[]>([]);
  protected readonly validation = signal(false);
  protected readonly rechercheHistorique = signal('');

  protected readonly total = computed(() =>
    this.lignes().reduce((sum, l) => sum + l.quantite * l.prixAchatUnitaire, 0)
  );

  protected readonly historiqueFiltre = computed(() => {
    const recherche = this.rechercheHistorique().trim().toLowerCase();
    if (!recherche) return this.historique();
    return this.historique().filter(
      (a) =>
        a.fournisseurNom.toLowerCase().includes(recherche) ||
        a.gestionnaireLogin.toLowerCase().includes(recherche) ||
        String(a.id).includes(recherche)
    );
  });

  constructor() {
    this.fournisseurService.lister().subscribe({
      next: (fournisseurs) => this.fournisseurs.set(fournisseurs),
      error: (err: Error) => this.toastService.error(err.message)
    });
    this.chargerProduits();
    this.chargerHistorique();
  }

  private chargerProduits(): void {
    this.produitService.lister().subscribe({
      next: (produits) => this.produits.set(produits),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  private chargerHistorique(): void {
    this.approService.lister().subscribe({
      next: (historique) => this.historique.set(historique),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected ajouterLigne(): void {
    const produit = this.produits().find((p) => p.id === this.produitId());
    if (!produit) {
      this.toastService.error('Selectionnez un produit.');
      return;
    }
    const quantite = Math.trunc(this.quantite());
    const prix = Number(this.prixAchatUnitaire());
    if (quantite <= 0 || prix <= 0) {
      this.toastService.error('La quantite et le prix doivent etre positifs.');
      return;
    }

    this.lignes.update((lignes) => [...lignes, { produit, quantite, prixAchatUnitaire: prix }]);
    this.quantite.set(1);
    this.prixAchatUnitaire.set(0);
  }

  protected retirerLigne(index: number): void {
    this.lignes.update((lignes) => lignes.filter((_, i) => i !== index));
  }

  protected valider(): void {
    const fournisseurId = this.fournisseurId();
    if (!fournisseurId) {
      this.toastService.error('Selectionnez un fournisseur.');
      return;
    }
    if (this.lignes().length === 0) {
      this.toastService.error('Ajoutez au moins une ligne.');
      return;
    }

    this.validation.set(true);
    this.approService
      .enregistrer({
        fournisseurId,
        lignes: this.lignes().map((l) => ({
          produitId: l.produit.id,
          quantite: l.quantite,
          prixAchatUnitaire: l.prixAchatUnitaire
        }))
      })
      .subscribe({
        next: (appro) => {
          this.validation.set(false);
          this.toastService.success(`Approvisionnement #${appro.id} enregistre.`);
          this.lignes.set([]);
          this.chargerProduits();
          this.chargerHistorique();
        },
        error: (err: Error) => {
          this.validation.set(false);
          this.toastService.error(err.message);
        }
      });
  }
}
