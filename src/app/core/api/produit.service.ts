import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProduitRequest, ProduitResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly base = `${environment.apiBaseUrl}/produits`;

  constructor(private readonly http: HttpClient) {}

  lister(): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(this.base);
  }

  alertes(): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.base}/alertes`);
  }

  creer(request: ProduitRequest): Observable<ProduitResponse> {
    return this.http.post<ProduitResponse>(this.base, request);
  }

  modifier(id: number, request: ProduitRequest): Observable<ProduitResponse> {
    return this.http.put<ProduitResponse>(`${this.base}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
