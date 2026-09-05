import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApprovisionnementRequest, ApprovisionnementResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ApprovisionnementService {
  private readonly base = `${environment.apiBaseUrl}/approvisionnements`;

  constructor(private readonly http: HttpClient) {}

  lister(): Observable<ApprovisionnementResponse[]> {
    return this.http.get<ApprovisionnementResponse[]>(this.base);
  }

  enregistrer(request: ApprovisionnementRequest): Observable<ApprovisionnementResponse> {
    return this.http.post<ApprovisionnementResponse>(this.base, request);
  }
}
