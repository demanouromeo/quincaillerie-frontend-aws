import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FournisseurRequest, FournisseurResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class FournisseurService {
  private readonly base = `${environment.apiBaseUrl}/fournisseurs`;

  constructor(private readonly http: HttpClient) {}

  lister(): Observable<FournisseurResponse[]> {
    return this.http.get<FournisseurResponse[]>(this.base);
  }

  creer(request: FournisseurRequest): Observable<FournisseurResponse> {
    return this.http.post<FournisseurResponse>(this.base, request);
  }

  modifier(id: number, request: FournisseurRequest): Observable<FournisseurResponse> {
    return this.http.put<FournisseurResponse>(`${this.base}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
