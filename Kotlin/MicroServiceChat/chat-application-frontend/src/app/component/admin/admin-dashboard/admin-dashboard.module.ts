// admin-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard';
import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    AdminDashboardRoutingModule,
    AdminDashboardComponent // AdminDashboard is standalone
  ],
  exports: [AdminDashboardComponent]
})
export class AdminDashboardModule { }