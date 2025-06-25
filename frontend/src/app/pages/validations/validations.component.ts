import { Component, OnInit } from '@angular/core';
import { ValidationService } from '../../services/validation.service';
import { EtudiantService } from '../../services/etudiant.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validations',
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ValidationsComponent implements OnInit {
  etudiants: any[] = [];
  selectedEtudiant: any = null;
  inscriptions: any[] = [];
  semestres = [1, 2, 3, 4, 5, 6];
  validationSemestres: { [key: number]: any } = {};
  validationAnnees: { [key: number]: any } = {};
  validationDiplome: any = null;
  ues: any[] = [];


  constructor(
    private validationService: ValidationService,
    private etudiantService: EtudiantService
  ) {}

  ngOnInit() {
  this.etudiantService.getEtudiants().subscribe({
    next: (data) => { this.etudiants = data; },
    error: () => { alert("Erreur chargement étudiants !"); }
  });

  // Récupère les UE au lancement
  this.validationService.getUes().subscribe({
    next: (data) => { 
      this.ues = data; 
      // Optionnel : si un étudiant déjà sélectionné au reload
      if (this.selectedEtudiant) this.chargerInscriptions();
    },
    error: () => { alert("Erreur chargement UE !"); }
  });
}

  onSelectEtudiant(event: any) {
  const index = event.target.value;
  if (index !== null && index !== "") {
    this.selectedEtudiant = this.etudiants[index];
    this.chargerInscriptions();
    this.chargerValidations();
  }
}

  chargerInscriptions() {
  fetch(`http://localhost:3000/api/etudiants/${this.selectedEtudiant.id}/inscriptions`)
    .then(res => res.json())
    .then(data => {
      this.inscriptions = data;
      this.calculerStatuts(); // Ici !
    });
}

  chargerValidations() {
    this.semestres.forEach(s => {
      this.validationService.checkSemestre(this.selectedEtudiant.id, s)
        .subscribe(v => this.validationSemestres[s] = v);
    });
    [1, 2, 3].forEach(a => {
      this.validationService.checkAnnee(this.selectedEtudiant.id, a)
        .subscribe(v => this.validationAnnees[a] = v);
    });
    this.validationService.checkDiplome(this.selectedEtudiant.id)
      .subscribe(v => this.validationDiplome = v);
  }

  validerUE(insc: any) {
  this.validationService.validerInscription(insc.id).subscribe(() => {
    // Recharge toutes les inscriptions après modification côté serveur
    this.chargerInscriptions();
    this.calculerStatuts(); // <-- Recharge la liste
  });
}

echouerUE(insc: any) {
  this.validationService.echouerInscription(insc.id).subscribe(() => {
    this.chargerInscriptions();
    this.calculerStatuts(); // <-- Recharge la liste
  });
}


calculerStatuts() {
  // Calcul du statut de chaque semestre
  this.validationSemestres = {};
  for (const semestre of this.semestres) {
    // UE du semestre
    const ueSemestre = this.inscriptions.filter(
      (insc: any) => insc.id_semestre === semestre
    );

    // UE obligatoires de ce semestre
    const ueObligSemestre = this.ues.filter(
      (ue: any) => ue.semestre === semestre && ue.obligatoire
    );

    // UE obligatoires validées
    const ueObligValidees = ueObligSemestre.filter(
      (ue: any) =>
        ueSemestre.find(
          (insc: any) => insc.ue_code === ue.code && insc.valide === 1
        )
    );

    // Total crédits validés dans le semestre
    const credits = ueSemestre
      .filter((insc: any) => insc.valide === 1)
      .reduce((sum: number, insc: any) => {
        const ue = this.ues.find((u: any) => u.code === insc.ue_code);
        return sum + (ue ? ue.credits : 0);
      }, 0);

    // UE obligatoires non validées
    const ueObligNonValidees = ueObligSemestre
      .filter(
        (ue: any) => !ueObligValidees.find((v: any) => v.code === ue.code)
      )
      .map((ue: any) => ue.code);

    // 🟡 LOGS DEBUG IMPORTANT
    console.log(`Semestre ${semestre} | credits=${credits} | oblig non validées=`, ueObligNonValidees);

    // Statut du semestre
    this.validationSemestres[semestre] = {
      valide: ueObligNonValidees.length === 0 && credits >= 30,
      credits,
      ueObligNonValidees,
    };
    
  }

  // ---- Calcul des années ----
  this.validationAnnees = {};
  for (const annee of [1, 2, 3]) {
    const semestresAnnee = [(annee - 1) * 2 + 1, (annee - 1) * 2 + 2];
    const valide = semestresAnnee.every(
      (s: number) => this.validationSemestres[s]?.valide
    );
    this.validationAnnees[annee] = { valide };
  }

  // ---- Calcul du diplôme ----
  const totalCredits = Object.values(this.validationSemestres).reduce(
    (sum: number, s: any) => sum + (s.credits || 0),
    0
  );
  const allObligatoires = this.ues.filter((ue: any) => ue.obligatoire);
  const allObligValidees = allObligatoires.filter((ue: any) =>
    this.inscriptions.find(
      (insc: any) => insc.ue_code === ue.code && insc.valide === 1
    )
  );
  const obligNonValidees = allObligatoires
    .filter((ue: any) => !allObligValidees.find((v: any) => v.code === ue.code))
    .map((ue: any) => ue.code);

  this.validationDiplome = {
    valide:
      Object.values(this.validationAnnees).every((a: any) => a.valide) &&
      totalCredits >= 180 &&
      obligNonValidees.length === 0,
    credits: totalCredits,
    ueObligNonValidees: obligNonValidees,
  };
}


  // Même logique pour les années (semestres 1+2 = année 1, etc.)
  // ... et pour le diplôme, cf plus haut

}





