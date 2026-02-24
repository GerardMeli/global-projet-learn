// admin-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    AdminDashboardComponent // AdminDashboard is standalone
  ],
  exports: [AdminDashboardComponent]
})
export class AdminDashboardModule { }