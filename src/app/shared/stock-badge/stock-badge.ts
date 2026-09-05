import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stock-badge',
  template: `<span class="status-badge" [class]="statusClass()">{{ label() }}</span>`
})
export class StockBadge {
  readonly stockActuel = input.required<number>();
  readonly seuilAlerte = input.required<number>();

  protected readonly statusClass = computed(() => {
    if (this.stockActuel() <= 0) return 'status-out';
    if (this.stockActuel() <= this.seuilAlerte()) return 'status-low';
    return 'status-ok';
  });

  protected readonly label = computed(() => {
    if (this.stockActuel() <= 0) return 'Rupture';
    if (this.stockActuel() <= this.seuilAlerte()) return 'Stock faible';
    return 'En stock';
  });
}
