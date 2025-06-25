import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StatistiquesService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStatsUE() {
    return this.http.get<any[]>(`${this.apiUrl}/statistiques/ue`);
  }
}
