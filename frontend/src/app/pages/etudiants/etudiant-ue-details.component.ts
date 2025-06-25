import { Component, OnInit } from '@angular/core';
import { UeService } from '../../services/ue.service';
import { EtudiantService } from '../../services/etudiant.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  standalone: true,
  selector: 'app-etudiant-ue-details',    // <= ICI c'est corrigé !!!
  imports: [CommonModule, FormsModule],
  templateUrl: './etudiant-ue-details.component.html',
  styleUrls: ['./etudiant-ue-details.component.css']
})

export class EtudiantUeDetailsComponent implements OnInit {

  selectedEtudiant: number | null = null;
  etudiants: any[] = [];

  uesValidees: any[] = [];
  uesEnCours: any[] = [];
  uesDispo: any[] = [];
  message: string = '';

  constructor(
    private ueService: UeService,
    private etudiantService: EtudiantService
  ) {}

  ngOnInit() {
    this.etudiantService.getEtudiants().subscribe({
      next: data => this.etudiants = data,
      error: err => this.message = 'Erreur chargement étudiants'
    });
  }

  onEtudiantChange() {
    if (!this.selectedEtudiant) {
      this.uesValidees = [];
      this.uesEnCours = [];
      this.uesDispo = [];
      return;
    }
    this.ueService.getUeDetailsEtudiant(this.selectedEtudiant).subscribe({
      next: data => {
        this.uesValidees = data.validees;
        this.uesEnCours = data.enCours;
        this.uesDispo = data.dispo;
      },
      error: err => this.message = 'Erreur chargement données UE'
    });
  }
}
