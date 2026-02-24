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
  },
  {
    path: ':id',
    loadChildren: () => import('./admin-files.module').then(m => m.AdminFilesModule),
    data: {
      title: 'File Details',
      breadcrumb: 'File Details'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminFilesRoutingModule { }