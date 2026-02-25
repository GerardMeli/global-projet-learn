// user-list.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserListComponent } from './user-list';
import { UserListRoutingModule } from './user-list-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    UserListRoutingModule,
    UserListComponent
  ]
})
export class UserListModule { }