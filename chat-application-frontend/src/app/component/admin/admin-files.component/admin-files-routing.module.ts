// admin-files-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminFilesComponent } from './admin-files.component';

const routes: Routes = [
  {
    path: '',
    component: AdminFilesComponent,
    data: {
      title: 'Files Management',
      breadcrumb: 'Files'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminFilesRoutingModule { }