// admin.module.ts
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { RouterModule }  from '@angular/router'; 
import { ProfileComponent } from '../auth/profile/profile';
import { AdminRoutingModule } from './admin-routing';
import { AdminChatRoomsComponent } from './chat-romm-management/chat-romm-management';
import { AdminFilesComponent } from './files-management/files-management';
import { AdminMessagesComponent } from './messages-management/messages-management';
import { StatisticsComponent } from './statistics/statistics';
import { UserManagementComponent } from './user-management/user-management';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { AdminHomeComponent } from './admin-home/admin-home';
import { AdminSettingsComponent } from './admin-setting/admin-setting';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    // Tous standalone — importés directement
    AdminDashboardComponent,
    AdminHomeComponent,
    AdminSettingsComponent,
    UserManagementComponent,
    AdminChatRoomsComponent,
    AdminMessagesComponent,
    AdminFilesComponent,
    StatisticsComponent,
    ProfileComponent,
  ],
})
export class AdminModule {}