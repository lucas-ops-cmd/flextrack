import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Mettre à jour la validation d'une UE
  updateInscription(id: number, valide: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/inscriptions/${id}`, { valide });
  }

  // Statut validation semestre
  checkSemestre(id_etudiant: number, semestre: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/etudiants/${id_etudiant}/semestre/${semestre}/validation`);
  }

  // Statut validation année
  checkAnnee(id_etudiant: number, annee: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/etudiants/${id_etudiant}/annee/${annee}/validation`);
  }

  // Statut validation diplôme
  checkDiplome(id_etudiant: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/etudiants/${id_etudiant}/diplome/validation`);
  }

  validerInscription(id_inscription: number) {
  return this.http.put(`${this.apiUrl}/inscriptions/${id_inscription}/valider`, {});
}
echouerInscription(id_inscription: number) {
  return this.http.put(`${this.apiUrl}/inscriptions/${id_inscription}/echouer`, {});
}

getUes() {
  return this.http.get<any[]>('http://localhost:3000/api/ues');
}

getInscriptions() {
  // Remplace l’URL si nécessaire !
  return this.http.get<any[]>(`${this.apiUrl}/inscriptions`);
}


}
