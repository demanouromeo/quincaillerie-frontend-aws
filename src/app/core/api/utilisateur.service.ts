import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UtilisateurRequest, UtilisateurResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly base = `${environment.apiBaseUrl}/utilisateurs`;

  constructor(private readonly http: HttpClient) {}

  lister(): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(this.base);
  }

  creer(request: UtilisateurRequest): Observable<UtilisateurResponse> {
    return this.http.post<UtilisateurResponse>(this.base, request);
  }

  modifier(id: number, request: UtilisateurRequest): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.base}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
