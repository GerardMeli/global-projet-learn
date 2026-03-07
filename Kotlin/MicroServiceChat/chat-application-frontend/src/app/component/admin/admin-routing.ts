// admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from '../auth/profile/profile';
import { AdminChatRoomsComponent } from './chat-romm-management/chat-romm-management';
import { AdminFilesComponent } from './files-management/files-management';
import { AdminMessagesComponent } from './messages-management/messages-management';
import { StatisticsComponent } from './statistics/statistics';
import { UserManagementComponent } from './user-management/user-management';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { AdminSettingsComponent } from './admin-setting/admin-setting';
import { AdminHomeComponent } from './admin-home/admin-home';
import { AdminGuard } from '../../core/guards/admin.guard';

// import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '',           redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',       component: AdminHomeComponent      },
      { path: 'users',      component: UserManagementComponent },
      { path: 'rooms',      component: AdminChatRoomsComponent },
      { path: 'messages',   component: AdminMessagesComponent  },
      { path: 'files',      component: AdminFilesComponent     },
      { path: 'statistics', component: StatisticsComponent     },
      { path: 'settings',   component: AdminSettingsComponent  },
      { path: 'profile',    component: ProfileComponent        },
      { path: '**',         redirectTo: 'home'                 },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}