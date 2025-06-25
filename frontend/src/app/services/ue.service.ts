import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UeService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ues`);
  }

  inscrireEtudiant(inscription: {
    id_etudiant: number,
    ue_code: string,
    id_semestre: number
}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscriptions`, inscription);
}

getPrerequis() {
  return this.http.get<any[]>(`${this.apiUrl}/prerequis`);
}

getUesDisponibles(id_etudiant: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/ues-dispo/${id_etudiant}`);
}

getUeDetailsEtudiant(id_etudiant: number) {
  return this.http.get<any>(`${this.apiUrl}/etudiants/${id_etudiant}/ue-details`);
}


}
