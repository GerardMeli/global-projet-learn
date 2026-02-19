import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./component/auth/admin-routing.module')
        .then(m => m.AuthRoutingModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./component/admin/admin-routing.module')
        .then(m => m.AdminRoutingModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
