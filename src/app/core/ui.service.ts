import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly changerMotDePasseOpen = signal(false);

  openChangerMotDePasse(): void {
    this.changerMotDePasseOpen.set(true);
  }

  closeChangerMotDePasse(): void {
    this.changerMotDePasseOpen.set(false);
  }
}
