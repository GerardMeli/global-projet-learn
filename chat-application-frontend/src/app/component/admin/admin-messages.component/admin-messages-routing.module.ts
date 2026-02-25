// admin-messages-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminMessagesComponent } from './admin-messages.component';

const routes: Routes = [
  {
    path: '',
    component: AdminMessagesComponent,
    data: {
      title: 'Messages Management',
      breadcrumb: 'Messages'
    }
  },
  {
    path: 'room/:roomId',
    component: AdminMessagesComponent,
    data: {
      title: 'Room Messages',
      breadcrumb: 'Room Messages'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminMessagesRoutingModule { }