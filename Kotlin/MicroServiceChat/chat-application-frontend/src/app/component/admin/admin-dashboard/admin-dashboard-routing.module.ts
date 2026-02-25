// admin-dashboard-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AdminGuard } from '../../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: {
          title: 'Tableau de bord',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../user-list/user-list.module')
            .then(m => m.UserListModule),
        data: {
          title: 'Gestion des utilisateurs',
          breadcrumb: 'Utilisateurs'
        }
      },
      {
        path: 'chat-rooms',
        loadChildren: () =>
          import('../admin-chat-rooms.component/admin-chat-rooms.module')
            .then(m => m.AdminChatRoomsModule),
        data: {
          title: 'Gestion des salons',
          breadcrumb: 'Salons'
        }
      },
      {
        path: 'messages',
        loadChildren: () =>
          import('../admin-messages.component/admin-messages.module')
            .then(m => m.AdminMessagesModule),
        data: {
          title: 'Gestion des messages',
          breadcrumb: 'Messages'
        }
      },
      {
        path: 'files',
        loadChildren: () =>
          import('../admin-files.component/admin-files.module')
            .then(m => m.AdminFilesModule),
        data: {
          title: 'Gestion des fichiers',
          breadcrumb: 'Fichiers'
        }
      },
      {
        path: 'statistics',
        loadChildren: () =>
          import('../statistics/statistics.module')
            .then(m => m.StatisticsModule),
        data: {
          title: 'Statistiques',
          breadcrumb: 'Statistiques'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule { }
