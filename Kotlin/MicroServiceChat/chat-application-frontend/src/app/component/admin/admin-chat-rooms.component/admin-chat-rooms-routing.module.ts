// admin-chat-rooms-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminChatRoomsComponent } from './admin-chat-rooms.component';

const routes: Routes = [
  {
    path: '',
    component: AdminChatRoomsComponent,
    data: {
      title: 'Chat Rooms Management',
      breadcrumb: 'Chat Rooms'
    }
  },
  {
    path: ':id',
    loadChildren: () => import('./admin-chat-rooms.module').then(m => m.AdminChatRoomsModule),
    data: {
      title: 'Chat Room Details',
      breadcrumb: 'Room Details'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminChatRoomsRoutingModule { }