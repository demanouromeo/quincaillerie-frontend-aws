import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { VenteRequest, VenteResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class VenteService {
  private readonly base = `${environment.apiBaseUrl}/ventes`;

  constructor(private readonly http: HttpClient) {}

  lister(): Observable<VenteResponse[]> {
    return this.http.get<VenteResponse[]>(this.base);
  }

  enregistrer(request: VenteRequest): Observable<VenteResponse> {
    return this.http.post<VenteResponse>(this.base, request);
  }
}
