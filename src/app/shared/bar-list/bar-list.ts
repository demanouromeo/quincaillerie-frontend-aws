import { Component, computed, input } from '@angular/core';

export interface BarListRow {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-list',
  templateUrl: './bar-list.html',
  styleUrl: './bar-list.scss'
})
export class BarList {
  readonly rows = input.required<BarListRow[]>();
  readonly unite = input('');

  protected readonly maxValue = computed(() => Math.max(1, ...this.rows().map((r) => r.value)));

  protected pourcentage(value: number): number {
    return Math.round((value / this.maxValue()) * 100);
  }
}
