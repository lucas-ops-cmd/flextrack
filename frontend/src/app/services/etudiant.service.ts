// src/app/services/etudiant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EtudiantService {
  private apiUrl = 'http://localhost:3000/api/etudiants'; // ton backend

  constructor(private http: HttpClient) {}

  getEtudiants(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  ajouterEtudiant(etudiant: any): Observable<any> {
  return this.http.post<any>(this.apiUrl, etudiant);
}


  modifierEtudiant(id: number, etudiant: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, etudiant);
  }

  supprimerEtudiant(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/${id}`);
}

getInscriptionsEtudiant(id_etudiant: number) {
  return this.http.get<any[]>(`${this.apiUrl}/etudiants/${id_etudiant}/inscriptions`);
}
}


