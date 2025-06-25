import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EtudiantService } from '../../services/etudiant.service';
import { UeService } from '../../services/ue.service';

@Component({
  standalone: true,
  selector: 'app-inscriptions',
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.css']
})
export class InscriptionsComponent {

  selectedEtudiant: number | null = null;
  etudiants: any[] = [];
  uesDisponibles: any[] = [];
  message: string = '';
  messageType: 'success' | 'danger' | 'warning' = 'success';

  semestre: number = 1;

  constructor(
    private etudiantService: EtudiantService,
    private ueService: UeService
  ) {}

  ngOnInit() {
    this.chargerEtudiants();
  }

  chargerEtudiants() {
    this.etudiantService.getEtudiants().subscribe({
      next: (data) => { this.etudiants = data; },
      error: (err) => console.error('Erreur chargement étudiants :', err)
    });
  }

  // 👉 Appelé à chaque changement d’étudiant
  onEtudiantChange() {
  this.message = '';
  if (!this.selectedEtudiant) {
    this.uesDisponibles = [];
    return;
  }
  this.chargerUesDisponibles();
}

  inscrire(ueCode: string, ueSemestre: number) {
  if (!this.selectedEtudiant) {
    this.afficherMessage("Aucun étudiant sélectionné.", 'danger');
    return;
  }

  this.ueService.inscrireEtudiant({
    id_etudiant: this.selectedEtudiant,
    ue_code: ueCode,
    id_semestre: ueSemestre      // ← On prend le semestre réel de la UE !
  }).subscribe({
      next: (res: any) => {
        this.afficherMessage(res, 'success');
        // On recharge la liste après inscription :
        this.onEtudiantChange();
      },
      error: (err) => {
        if (err.status === 400) {
          this.afficherMessage(err.error, 'danger');
        } else if (err.error && typeof err.error === 'string') {
          this.afficherMessage(err.error, 'danger');
        } else {
          this.afficherMessage("❌ Erreur lors de l'inscription !", 'danger');
        }
        // Recharge même en cas d’erreur (précaution)
        this.onEtudiantChange();
        console.error(err);
      }
    });
  }

  afficherMessage(msg: string, type: 'success' | 'danger' | 'warning') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3500);
  }

  chargerUesDisponibles() {
  this.ueService.getUesDisponibles(this.selectedEtudiant!).subscribe({
    next: (ues: any[]) => {
      this.uesDisponibles = ues;
    },
    error: (err) => {
      this.uesDisponibles = [];
      this.afficherMessage("Erreur chargement UE dispo", 'danger');
      console.error(err);
    }
  });
}


}


