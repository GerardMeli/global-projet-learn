import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { StatisticsComponent } from './statistics.component';
import { UserDetailComponent } from './user-detail.component';
import { UserListComponent } from './user-list.component'; 
import { AuthGuard } from '../../core/guards/auth.guard';
import { ProfileComponent } from './profile.component';
import { SettingsComponent } from './settings.component';
// admin-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserListComponent },
      { path: 'users/:id', component: UserDetailComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
