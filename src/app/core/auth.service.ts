import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, Role } from './models';

interface StoredSession {
  token: string;
  role: Role;
  login: string;
}

const STORAGE_KEY = 'mvogt.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<StoredSession | null>(this.readStoredSession());

  readonly token = computed(() => this.session()?.token ?? null);
  readonly role = computed(() => this.session()?.role ?? null);
  readonly login = computed(() => this.session()?.login ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor(private readonly http: HttpClient) {}

  authenticate(login: string, password: string, seSouvenir = false): Observable<LoginResponse> {
    const request: LoginRequest = { login, password };
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, request).pipe(
      tap((response) => this.storeSession({ token: response.token, role: response.role, login }, seSouvenir))
    );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  hasAnyRole(roles: Role[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }

  // "Se souvenir de moi" : localStorage survit a la fermeture du navigateur,
  // sessionStorage est efface avec l'onglet — utile sur un poste vendeur
  // partage entre plusieurs employes au fil des services.
  private storeSession(session: StoredSession, seSouvenir: boolean): void {
    this.session.set(session);
    const cible = seSouvenir ? localStorage : sessionStorage;
    const autre = seSouvenir ? sessionStorage : localStorage;
    cible.setItem(STORAGE_KEY, JSON.stringify(session));
    autre.removeItem(STORAGE_KEY);
  }

  private readStoredSession(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }
}
