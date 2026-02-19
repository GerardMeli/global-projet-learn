import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./user-detail.component').then(m => m.UserDetailComponent)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./statistics.component').then(m => m.StatisticsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile.component').then(m => m.ProfileComponent)
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AdminRoutingModule {}