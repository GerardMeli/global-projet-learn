// user-detail.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserDetailComponent } from './user-detail';

@NgModule({
//   declarations: [UserDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
//   exports: [UserDetailComponent]
})
export class UserDetailModule { }