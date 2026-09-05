import { Component, HostListener, signal } from '@angular/core';

const SEUIL_AFFICHAGE_PX = 280;

@Component({
  selector: 'app-scroll-top-button',
  template: `
    <button
      type="button"
      class="scroll-top-btn"
      [class.is-visible]="visible()"
      [tabIndex]="visible() ? 0 : -1"
      (click)="remonter()"
      aria-label="Remonter en haut de la page"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 15.5V4.5M10 4.5L4.5 10M10 4.5l5.5 5.5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  `
})
export class ScrollTopButton {
  protected readonly visible = signal(false);

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.visible.set(window.scrollY > SEUIL_AFFICHAGE_PX);
  }

  protected remonter(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
