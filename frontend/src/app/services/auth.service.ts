import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/login';

  constructor(private http: HttpClient) {}

  login(identifiant: string, motDePasse: string): Observable<any> {
    return this.http.post(this.apiUrl, { identifiant, motDePasse });
  }
}
