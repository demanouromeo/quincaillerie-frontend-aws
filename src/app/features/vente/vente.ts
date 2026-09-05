import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ProduitService } from '../../core/api/produit.service';
import { VenteService } from '../../core/api/vente.service';
import { ProduitResponse, VenteResponse } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ReceiptView } from '../../shared/receipt-view/receipt-view';
import { StockBadge } from '../../shared/stock-badge/stock-badge';
import { TopbarActions } from '../../shared/topbar-actions/topbar-actions';

interface LignePanier {
  produit: ProduitResponse;
  quantite: number;
}

@Component({
  selector: 'app-vente',
  imports: [FormsModule, RouterLink, TopbarActions, StockBadge, ReceiptView],
  templateUrl: './vente.html',
  styleUrl: './vente.scss'
})
export class Vente {
  private readonly produitService = inject(ProduitService);
  private readonly venteService = inject(VenteService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly produits = signal<ProduitResponse[]>([]);
  protected readonly recherche = signal('');
  protected readonly panier = signal<LignePanier[]>([]);
  protected readonly quantites = signal<Record<number, number>>({});
  protected readonly validation = signal(false);
  protected readonly derniereVente = signal<VenteResponse | null>(null);
  protected readonly nomClient = signal('');
  protected readonly clientRecu = signal('');

  protected readonly peutRevenirAuBackoffice = computed(() => this.authService.role() !== 'VENDEUR');

  protected readonly produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    if (!terme) return this.produits();
    return this.produits().filter(
      (p) => p.reference.toLowerCase().includes(terme) || p.nom.toLowerCase().includes(terme)
    );
  });

  protected readonly total = computed(() =>
    this.panier().reduce((sum, ligne) => sum + ligne.quantite * ligne.produit.prixVente, 0)
  );

  constructor() {
    this.chargerProduits();
  }

  private chargerProduits(): void {
    this.produitService.lister().subscribe({
      next: (produits) => this.produits.set(produits),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected quantitePour(produitId: number): number {
    return this.quantites()[produitId] ?? 1;
  }

  protected changerQuantite(produitId: number, valeur: number): void {
    this.quantites.update((map) => ({ ...map, [produitId]: valeur }));
  }

  protected ajouterAuPanier(produit: ProduitResponse): void {
    const quantite = Math.trunc(this.quantitePour(produit.id));
    if (!quantite || quantite <= 0) {
      this.toastService.error('Quantite invalide.');
      return;
    }

    const dejaAuPanier = this.panier()
      .filter((l) => l.produit.id === produit.id)
      .reduce((sum, l) => sum + l.quantite, 0);

    if (dejaAuPanier + quantite > produit.stockActuel) {
      this.toastService.error(`Stock insuffisant (disponible : ${produit.stockActuel}).`);
      return;
    }

    this.panier.update((lignes) => {
      const existante = lignes.find((l) => l.produit.id === produit.id);
      if (existante) {
        return lignes.map((l) => (l.produit.id === produit.id ? { ...l, quantite: l.quantite + quantite } : l));
      }
      return [...lignes, { produit, quantite }];
    });
    this.toastService.success(`Ajoute au panier : ${produit.nom}`);
  }

  protected retirerLigne(produitId: number): void {
    this.panier.update((lignes) => lignes.filter((l) => l.produit.id !== produitId));
  }

  protected validerVente(): void {
    if (this.panier().length === 0) {
      this.toastService.error('Le panier est vide.');
      return;
    }

    this.validation.set(true);
    const request = {
      lignes: this.panier().map((l) => ({ produitId: l.produit.id, quantite: l.quantite }))
    };

    this.venteService.enregistrer(request).subscribe({
      next: (vente) => {
        this.validation.set(false);
        this.toastService.success(`Vente #${vente.id} enregistree.`);
        this.clientRecu.set(this.nomClient().trim());
        this.derniereVente.set(vente);
        this.panier.set([]);
        this.nomClient.set('');
        this.chargerProduits();
      },
      error: (err: Error) => {
        this.validation.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  protected fermerRecu(): void {
    this.derniereVente.set(null);
    this.clientRecu.set('');
  }
}
