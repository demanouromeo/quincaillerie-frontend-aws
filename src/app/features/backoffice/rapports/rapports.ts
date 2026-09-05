import { Component, computed, inject, signal } from '@angular/core';

import { ProduitService } from '../../../core/api/produit.service';
import { VenteService } from '../../../core/api/vente.service';
import { VenteResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { BarList, BarListRow } from '../../../shared/bar-list/bar-list';

interface JourTendance {
  date: Date;
  label: string;
  total: number;
}

const NB_JOURS_TENDANCE = 14;

function debutSemaine(date: Date): Date {
  const jour = date.getDay();
  const decalage = jour === 0 ? 6 : jour - 1;
  const debut = new Date(date);
  debut.setDate(date.getDate() - decalage);
  debut.setHours(0, 0, 0, 0);
  return debut;
}

function debutJour(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

@Component({
  selector: 'app-rapports-tab',
  imports: [BarList],
  templateUrl: './rapports.html',
  styleUrl: './rapports.scss'
})
export class RapportsTab {
  private readonly venteService = inject(VenteService);
  private readonly produitService = inject(ProduitService);
  private readonly toastService = inject(ToastService);

  protected readonly ventes = signal<VenteResponse[]>([]);
  protected readonly nbAlertes = signal(0);
  protected readonly chargement = signal(false);

  protected readonly totaux = computed(() => {
    const maintenant = new Date();
    const jour0 = debutJour(maintenant);
    const semaine0 = debutSemaine(maintenant);
    const mois0 = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    let jour = { nb: 0, total: 0 };
    let semaine = { nb: 0, total: 0 };
    let mois = { nb: 0, total: 0 };

    for (const vente of this.ventes()) {
      const date = new Date(vente.dateVente);
      if (date >= mois0) {
        mois = { nb: mois.nb + 1, total: mois.total + vente.montantTotal };
      }
      if (date >= semaine0) {
        semaine = { nb: semaine.nb + 1, total: semaine.total + vente.montantTotal };
      }
      if (date >= jour0) {
        jour = { nb: jour.nb + 1, total: jour.total + vente.montantTotal };
      }
    }
    return { jour, semaine, mois };
  });

  protected readonly tendance = computed<JourTendance[]>(() => {
    const jours: JourTendance[] = [];
    const aujourdHui = debutJour(new Date());
    for (let i = NB_JOURS_TENDANCE - 1; i >= 0; i--) {
      const date = new Date(aujourdHui);
      date.setDate(aujourdHui.getDate() - i);
      jours.push({ date, label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), total: 0 });
    }
    for (const vente of this.ventes()) {
      const date = debutJour(new Date(vente.dateVente));
      const entree = jours.find((j) => j.date.getTime() === date.getTime());
      if (entree) entree.total += vente.montantTotal;
    }
    return jours;
  });

  protected readonly maxTendance = computed(() => Math.max(1, ...this.tendance().map((j) => j.total)));

  protected readonly topProduits = computed<BarListRow[]>(() => {
    const quantites = new Map<string, number>();
    for (const vente of this.ventes()) {
      for (const ligne of vente.lignes) {
        quantites.set(ligne.produitNom, (quantites.get(ligne.produitNom) ?? 0) + ligne.quantite);
      }
    }
    return [...quantites.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  });

  constructor() {
    this.charger();
  }

  protected charger(): void {
    this.chargement.set(true);
    this.venteService.lister().subscribe({
      next: (ventes) => {
        this.ventes.set(ventes);
        this.chargement.set(false);
      },
      error: (err: Error) => {
        this.chargement.set(false);
        this.toastService.error(err.message);
      }
    });
    this.produitService.alertes().subscribe({
      next: (alertes) => this.nbAlertes.set(alertes.length),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected hauteurBarre(total: number): number {
    return Math.max(2, Math.round((total / this.maxTendance()) * 100));
  }
}
