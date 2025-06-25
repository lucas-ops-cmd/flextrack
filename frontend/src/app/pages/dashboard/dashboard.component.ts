import { Component } from '@angular/core';
import { EtudiantService } from '../../services/etudiant.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EtudiantsComponent } from '../etudiants/etudiants.component';
import { InscriptionsComponent } from '../inscriptions/inscriptions.component';
import { EtudiantUeDetailsComponent } from '../etudiants/etudiant-ue-details.component'; 
import { ValidationsComponent } from '../validations/validations.component';
import { StatistiquesComponent } from '../statistiques/statistiques.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EtudiantsComponent,
    InscriptionsComponent,
    EtudiantUeDetailsComponent,
    ValidationsComponent,
    StatistiquesComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  selectedTab: string = 'etudiants';

  // Champs du formulaire
  etudiants: any[] = [];
  formData = {
    id: null,
    numero_etudiant: '',
    nom: '',
    prenom: '',
    email: '',
    id_parcours: ''
  };

  constructor(private etudiantService: EtudiantService) {
    this.chargerEtudiants();
  }

  // 🔄 Charger la liste
  chargerEtudiants() {
    this.etudiantService.getEtudiants().subscribe({
      next: (data) => {
        console.log('✔ Étudiants chargés :', data);
        this.etudiants = data;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement', err);
        alert('Erreur de chargement');
      }
    });
  }

  // 💾 Ajouter ou modifier
  enregistrerEtudiant() {
    if (this.formData.id) {
      this.etudiantService.modifierEtudiant(this.formData.id, this.formData).subscribe({
        next: () => {
          alert('✔ Étudiant modifié');
          this.chargerEtudiants();
          this.annuler();
        },
        error: (err) => {
          console.error('❌ Erreur modification :', err);
          alert('Erreur lors de la modification');
        }
      });
    } else {
      this.etudiantService.ajouterEtudiant(this.formData).subscribe({
        next: () => {
          alert('✔ Étudiant ajouté');
          this.chargerEtudiants();
          this.annuler();
        },
        error: (err) => {
          console.error('❌ Erreur ajout :', err);
          alert('Erreur lors de l\'ajout');
        }
      });
    }
  }

  // ✏️ Remplir le formulaire pour modification
  modifierEtudiant(etudiant: any) {
    this.formData = { ...etudiant };
  }

  // 🗑 Supprimer un étudiant
  supprimerEtudiant(id: number) {
    if (confirm('Supprimer cet étudiant ?')) {
      this.etudiantService.supprimerEtudiant(id).subscribe({
        next: () => {
          alert('🗑️ Étudiant supprimé');
          this.chargerEtudiants();
        },
        error: (err) => {
          console.error('❌ Erreur suppression :', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  // ❌ Réinitialiser le formulaire
  annuler() {
    this.formData = {
      id: null,
      numero_etudiant: '',
      nom: '',
      prenom: '',
      email: '',
      id_parcours: ''
    };
  }
}
