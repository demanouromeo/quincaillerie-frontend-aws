import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UtilisateurService } from '../../../core/api/utilisateur.service';
import { Role, UtilisateurRequest, UtilisateurResponse } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { SearchInput } from '../../../shared/search-input/search-input';

interface UtilisateurForm {
  nom: string;
  login: string;
  email: string;
  motDePasse: string;
  role: Role;
  actif: boolean;
}

function formVide(): UtilisateurForm {
  return { nom: '', login: '', email: '', motDePasse: '', role: 'VENDEUR', actif: true };
}

@Component({
  selector: 'app-utilisateurs-tab',
  imports: [FormsModule, SearchInput],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.scss'
})
export class UtilisateursTab {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastService);

  protected readonly roles: Role[] = ['VENDEUR', 'GESTIONNAIRE', 'ADMIN'];
  protected readonly utilisateurs = signal<UtilisateurResponse[]>([]);
  protected readonly selection = signal<UtilisateurResponse | null>(null);
  protected readonly form = signal<UtilisateurForm>(formVide());
  protected readonly enregistrement = signal(false);
  protected readonly recherche = signal('');

  protected readonly utilisateursFiltres = computed(() => {
    const recherche = this.recherche().trim().toLowerCase();
    if (!recherche) return this.utilisateurs();
    return this.utilisateurs().filter(
      (u) =>
        u.nom.toLowerCase().includes(recherche) ||
        u.login.toLowerCase().includes(recherche) ||
        u.email.toLowerCase().includes(recherche) ||
        u.role.toLowerCase().includes(recherche)
    );
  });

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.utilisateurService.lister().subscribe({
      next: (utilisateurs) => this.utilisateurs.set(utilisateurs),
      error: (err: Error) => this.toastService.error(err.message)
    });
  }

  protected selectionner(utilisateur: UtilisateurResponse): void {
    this.selection.set(utilisateur);
    this.form.set({
      nom: utilisateur.nom,
      login: utilisateur.login,
      email: utilisateur.email,
      motDePasse: '',
      role: utilisateur.role,
      actif: utilisateur.actif
    });
  }

  protected nouveau(): void {
    this.selection.set(null);
    this.form.set(formVide());
  }

  protected majForm<K extends keyof UtilisateurForm>(champ: K, valeur: UtilisateurForm[K]): void {
    this.form.update((f) => ({ ...f, [champ]: valeur }));
  }

  protected enregistrer(): void {
    const f = this.form();
    if (!f.nom.trim() || !f.login.trim() || !f.email.trim()) {
      this.toastService.error('Nom, identifiant et email sont obligatoires.');
      return;
    }
    if (!this.selection() && !f.motDePasse) {
      this.toastService.error('Le mot de passe est obligatoire a la creation.');
      return;
    }

    const request: UtilisateurRequest = {
      nom: f.nom.trim(),
      login: f.login.trim(),
      email: f.email.trim(),
      motDePasse: f.motDePasse || null,
      role: f.role,
      actif: f.actif
    };

    this.enregistrement.set(true);
    const selection = this.selection();
    const requete = selection
      ? this.utilisateurService.modifier(selection.id, request)
      : this.utilisateurService.creer(request);

    requete.subscribe({
      next: () => {
        this.enregistrement.set(false);
        this.toastService.success(selection ? 'Utilisateur modifie.' : 'Utilisateur cree.');
        this.nouveau();
        this.charger();
      },
      error: (err: Error) => {
        this.enregistrement.set(false);
        this.toastService.error(err.message);
      }
    });
  }

  protected supprimer(utilisateur: UtilisateurResponse): void {
    if (!confirm(`Desactiver le compte de "${utilisateur.login}" ?`)) return;
    this.utilisateurService.supprimer(utilisateur.id).subscribe({
      next: () => {
        this.toastService.success('Utilisateur desactive.');
        if (this.selection()?.id === utilisateur.id) this.nouveau();
        this.charger();
      },
      error: (err: Error) => this.toastService.error(err.message)
    });
  }
}
