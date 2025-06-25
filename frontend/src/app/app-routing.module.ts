// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EtudiantsComponent } from './pages/etudiants/etudiants.component';
import { UeComponent } from './pages/ue/ue.component';
import { InscriptionsComponent } from './pages/inscriptions/inscriptions.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'etudiants', component: EtudiantsComponent },
  { path: 'ue', component: UeComponent },
  { path: 'inscriptions', component: InscriptionsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
