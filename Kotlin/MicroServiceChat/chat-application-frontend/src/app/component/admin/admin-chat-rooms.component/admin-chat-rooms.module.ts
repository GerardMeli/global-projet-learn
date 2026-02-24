// admin-chat-rooms.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminChatRoomsComponent } from './admin-chat-rooms.component';

@NgModule({
//   declarations: [AdminChatRoomsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
//   exports: [AdminChatRoomsComponent]
})
export class AdminChatRoomsModule { }