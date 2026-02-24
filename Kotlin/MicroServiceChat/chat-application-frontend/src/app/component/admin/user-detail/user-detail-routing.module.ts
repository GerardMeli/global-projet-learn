// user-detail-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { UserDetailComponent } from '../user-detail.component';
import { AdminGuard } from '../../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: UserDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
    data: {
      title: 'Détails Utilisateur',
      breadcrumb: 'Détails Utilisateur'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDetailRoutingModule { }