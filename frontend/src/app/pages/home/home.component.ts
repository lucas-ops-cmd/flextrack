import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  identifiant: string = '';
  motDePasse: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  seConnecter() {
  console.log('Tentative de connexion :', this.identifiant, this.motDePasse);

  this.authService.login(this.identifiant, this.motDePasse).subscribe({
    next: (response) => {
      console.log('✅ Connexion réussie', response);
      this.router.navigate(['/dashboard']); // redirection vers le dashboard
    },
    error: (error) => {
      console.error('❌ Erreur de connexion', error);
      alert('Identifiant ou mot de passe incorrect');
    }
  });
}

}
