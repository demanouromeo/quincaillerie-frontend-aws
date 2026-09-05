import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChangePasswordRequest, MessageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CompteService {
  private readonly base = `${environment.apiBaseUrl}/compte`;

  constructor(private readonly http: HttpClient) {}

  changerMotDePasse(request: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.base}/mot-de-passe`, request);
  }
}
