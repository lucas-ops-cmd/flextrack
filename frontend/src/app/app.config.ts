import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // ✅ Ajouté ici

// Importation des composants
import { HomeComponent } from './pages/home/home.component';
import { EtudiantsComponent } from './pages/etudiants/etudiants.component';
import { UeComponent } from './pages/ue/ue.component';
import { InscriptionsComponent } from './pages/inscriptions/inscriptions.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: HomeComponent },
      { path: 'etudiants', component: EtudiantsComponent },
      { path: 'ue', component: UeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inscriptions', component: InscriptionsComponent }
    ]),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(FormsModule) // ✅ Nécessaire pour ngModel
  ]
};
