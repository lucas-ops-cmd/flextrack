import { Component, OnInit } from '@angular/core';
import { ValidationService } from '../../services/validation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StatistiquesComponent implements OnInit {
  ues: any[] = [];
  stats: any[] = [];

  constructor(private validationService: ValidationService) {}

  ngOnInit() {
    // Récupère toutes les UE et inscriptions au lancement
    this.validationService.getUes().subscribe(ues => {
      this.ues = ues;
      this.chargerStats();
    });
  }

  chargerStats() {
    this.validationService.getInscriptions().subscribe(inscriptions => {
        console.log('Inscriptions récupérées:', inscriptions);
      this.stats = this.ues.map(ue => {
        const inscrits = inscriptions.filter((i: any) => i.ue_code === ue.code);
        const valides = inscrits.filter((i: any) => i.valide === 1);
        const taux = inscrits.length ? Math.round((valides.length / inscrits.length) * 100) : 0;
        return {
          code: ue.code,
          nom: ue.nom,
          inscrits: inscrits.length,
          valides: valides.length,
          taux
        }
      });
    });
  }
}
