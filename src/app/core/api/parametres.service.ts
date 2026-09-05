import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ParametresRequest, ParametresResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ParametresService {
  private readonly base = `${environment.apiBaseUrl}/parametres`;

  constructor(private readonly http: HttpClient) {}

  recuperer(): Observable<ParametresResponse> {
    return this.http.get<ParametresResponse>(this.base);
  }

  modifier(request: ParametresRequest): Observable<ParametresResponse> {
    return this.http.put<ParametresResponse>(this.base, request);
  }
}
