import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtudiantService } from '../../services/etudiant.service';

@Component({
  selector: 'app-etudiants',
  standalone: true,
  templateUrl: './etudiants.component.html',
  styleUrls: ['./etudiants.component.css'],
  imports: [CommonModule, FormsModule] // Nécessaire pour ngModel & ngFor
})
export class EtudiantsComponent {
  etudiant = {
  numero_etudiant: '',
  nom: '',
  prenom: '',
  email: '',
  id_parcours: 1
};

  etudiants: any[] = [];

  constructor(private etuService: EtudiantService) {}

  ngOnInit() {
  console.log('🟢 ngOnInit exécuté');
  this.chargerEtudiants();
}


  chargerEtudiants() {
  this.etuService.getEtudiants().subscribe({
    next: (data) => {
      this.etudiants = data;
      console.log('✅ Étudiants chargés:', this.etudiants);
    },
    error: (err) => {
      console.error('❌ Erreur chargement étudiants', err);
    }
  });
}




  ajouter() {
  if (!this.etudiant.numero_etudiant || !this.etudiant.nom || !this.etudiant.prenom || !this.etudiant.email) {
    alert('❌ Tous les champs sont requis');
    return;
  }

  this.etuService.ajouterEtudiant(this.etudiant).subscribe({
    next: () => {
      alert('✅ Étudiant ajouté');
      this.resetForm();
      this.chargerEtudiants();
    },
    error: (err) => {
      console.error('Erreur HTTP :', err);
      if (err.error.includes('Duplicate entry')) {
        alert('❌ Ce numéro étudiant existe déjà');
      } else {
        alert('❌ Erreur lors de l\'ajout');
      }
    }
  });
}



  supprimer(id: number) {
  if (confirm('❓ Supprimer cet étudiant ?')) {
    this.etuService.supprimerEtudiant(id).subscribe({
      next: (res) => {
        console.log('✔️ Supprimé :', res);
        this.chargerEtudiants();
      },
      complete: () => {
        this.chargerEtudiants(); // ✅ Toujours exécuté
      }
    });
  }
}



  resetForm() {
  this.etudiant = {
    numero_etudiant: '',
    nom: '',
    prenom: '',
    email: '',
    id_parcours: 1
  };
}

  annuler() {
    this.resetForm();
  }
}
