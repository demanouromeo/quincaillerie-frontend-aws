import { DatePipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProduitService } from '../../../core/api/produit.service';
import { ProduitResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { BarList, BarListRow } from '../../../shared/bar-list/bar-list';
import { SearchInput } from '../../../shared/search-input/search-input';
import { StockBadge } from '../../../shared/stock-badge/stock-badge';

const PERIODE_MS = 30_000;

@Component({
  selector: 'app-dashboard-tab',
  imports: [FormsModule, DatePipe, StockBadge, BarList, SearchInput],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardTab implements OnDestroy {
  private readonly produitService = inject(ProduitService);
  private readonly toastService = inject(ToastService);
  private minuteur: ReturnType<typeof setInterval> | null = null;

  protected readonly produits = signal<ProduitResponse[]>([]);
  protected readonly actualisationAuto = signal(true);
  protected readonly derniereMaj = signal<Date | null>(null);
  protected readonly chargement = signal(false);

  protected readonly rechercheStock = signal('');

  protected readonly totalProduits = computed(() => this.produits().length);
  protected readonly sousSeuil = computed(
    () => this.produits().filter((p) => p.stockActuel <= p.seuilAlerte).length
  );

  protected readonly repartitionStatut = computed(() => {
    const produits = this.produits();
    const rupture = produits.filter((p) => p.stockActuel <= 0).length;
    const stockFaible = produits.filter((p) => p.stockActuel > 0 && p.stockActuel <= p.seuilAlerte).length;
    const enStock = produits.length - rupture - stockFaible;
    const total = Math.max(1, produits.length);
    return [
      { label: 'En stock', count: enStock, pct: (enStock / total) * 100, cssClass: 'status-ok' },
      { label: 'Stock faible', count: stockFaible, pct: (stockFaible / total) * 100, cssClass: 'status-low' },
      { label: 'Rupture', count: rupture, pct: (rupture / total) * 100, cssClass: 'status-out' }
    ];
  });

  protected readonly stockParCategorie = computed<BarListRow[]>(() => {
    const totaux = new Map<string, number>();
    for (const produit of this.produits()) {
      const cle = produit.categorieNom ?? 'Sans categorie';
      totaux.set(cle, (totaux.get(cle) ?? 0) + produit.stockActuel);
    }
    return [...totaux.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  });

  protected readonly produitsAffiches = computed(() => {
    const recherche = this.rechercheStock().trim().toLowerCase();
    if (!recherche) return this.produits();
    return this.produits().filter(
      (p) =>
        p.reference.toLowerCase().includes(recherche) ||
        p.nom.toLowerCase().includes(recherche) ||
        (p.categorieNom ?? '').toLowerCase().includes(recherche)
    );
  });

  constructor() {
    this.actualiser();
    this.demarrerActualisationAuto();
  }

  ngOnDestroy(): void {
    this.arreterActualisationAuto();
  }

  protected surChangementAuto(actif: boolean): void {
    this.actualisationAuto.set(actif);
    if (actif) {
      this.demarrerActualisationAuto();
    } else {
      this.arreterActualisationAuto();
    }
  }

  protected actualiser(): void {
    this.chargement.set(true);
    this.produitService.lister().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.derniereMaj.set(new Date());
        this.chargement.set(false);
      },
      error: (err: Error) => {
        this.chargement.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  private demarrerActualisationAuto(): void {
    this.arreterActualisationAuto();
    this.minuteur = setInterval(() => this.actualiser(), PERIODE_MS);
  }

  private arreterActualisationAuto(): void {
    if (this.minuteur !== null) {
      clearInterval(this.minuteur);
      this.minuteur = null;
    }
  }
}
