// admin-files.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminFilesComponent } from './admin-files.component';
import { AdminFilesRoutingModule } from './admin-files-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminFilesRoutingModule,
    AdminFilesComponent
  ]
})
export class AdminFilesModule { }