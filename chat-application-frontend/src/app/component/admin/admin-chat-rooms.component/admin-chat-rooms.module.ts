// admin-chat-rooms.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminChatRoomsComponent } from './admin-chat-rooms.component';
import { AdminChatRoomsRoutingModule } from './admin-chat-rooms-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminChatRoomsRoutingModule,
    AdminChatRoomsComponent
  ]
})
export class AdminChatRoomsModule { }