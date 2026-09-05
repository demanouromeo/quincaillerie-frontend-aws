import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ScrollTopButton } from '../../shared/scroll-top-button/scroll-top-button';
import { TopbarActions } from '../../shared/topbar-actions/topbar-actions';

interface NavItem {
  index: string;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { index: '01', label: 'Tableau de bord', path: 'dashboard' },
  { index: '02', label: 'Point de vente', path: '/vente' },
  { index: '03', label: 'Produits', path: 'produits' },
  { index: '04', label: 'Approvisionnements', path: 'approvisionnements' },
  { index: '05', label: 'Fournisseurs', path: 'fournisseurs' },
  { index: '06', label: 'Categories', path: 'categories', adminOnly: true },
  { index: '07', label: 'Utilisateurs', path: 'utilisateurs', adminOnly: true },
  { index: '08', label: 'Rapports', path: 'rapports', adminOnly: true },
  { index: '09', label: 'Parametres', path: 'parametres', adminOnly: true }
];

@Component({
  selector: 'app-backoffice-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TopbarActions, ScrollTopButton],
  templateUrl: './backoffice-shell.html',
  styleUrl: './backoffice-shell.scss'
})
export class BackofficeShell {
  private readonly authService = inject(AuthService);

  protected readonly navItems = computed(() => {
    const isAdmin = this.authService.role() === 'ADMIN';
    return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  });

  // Menu tiroir (< 860px, voir backoffice-shell.scss) : replie par defaut, la
  // sidebar devient un panneau qui glisse par-dessus le contenu plutot que de
  // rester affichee en permanence (auparavant repliee en barre horizontale,
  // peu lisible sur petit ecran - voir capture Android).
  protected readonly drawerOuvert = signal(false);

  protected ouvrirDrawer(): void {
    this.drawerOuvert.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected fermerDrawer(): void {
    this.drawerOuvert.set(false);
    document.body.style.overflow = '';
  }

  protected basculerDrawer(): void {
    if (this.drawerOuvert()) {
      this.fermerDrawer();
    } else {
      this.ouvrirDrawer();
    }
  }
}
