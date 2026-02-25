// admin-messages.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminMessagesComponent } from './admin-messages.component';
import { AdminMessagesRoutingModule } from './admin-messages-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminMessagesRoutingModule,
    AdminMessagesComponent
  ]
})
export class AdminMessagesModule { }