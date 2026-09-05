import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CategorieRequest, CategorieResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private readonly base = `${environment.apiBaseUrl}/categories`;

  constructor(private readonly http: HttpClient) {}

  lister(): Observable<CategorieResponse[]> {
    return this.http.get<CategorieResponse[]>(this.base);
  }

  creer(request: CategorieRequest): Observable<CategorieResponse> {
    return this.http.post<CategorieResponse>(this.base, request);
  }

  modifier(id: number, request: CategorieRequest): Observable<CategorieResponse> {
    return this.http.put<CategorieResponse>(`${this.base}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
