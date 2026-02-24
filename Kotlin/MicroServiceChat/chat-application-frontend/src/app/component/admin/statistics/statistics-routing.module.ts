// statistics-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 
import { AuthGuard } from '../../../core/guards/auth.guard';
import { StatisticsComponent } from './statistics';

const routes: Routes = [
  {
    path: '',
    component: StatisticsComponent,
    canActivate: [AuthGuard, AuthGuard], // Protéger la route (admin uniquement)
    data: { 
      title: 'System Statistics',
      breadcrumb: 'Statistics'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }