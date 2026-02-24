// admin-messages.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminMessagesComponent } from './admin-messages.component';

@NgModule({
//   declarations: [AdminMessagesComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
//   exports: [AdminMessagesComponent]
})
export class AdminMessagesModule { }