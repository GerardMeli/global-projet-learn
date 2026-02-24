// admin-files.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminFilesComponent } from './admin-files.component';

@NgModule({
//   declarations: [AdminFilesComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
//   exports: [AdminFilesComponent]
})
export class AdminFilesModule { }