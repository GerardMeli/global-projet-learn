import { Routes } from '@angular/router';

export const routes: Routes = [

    // Public landing page
  { path: '',
    loadComponent: () => import('./component/home/home.component').then(m => m.HomeComponent) },


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
    { path: 'chat',
    loadChildren: () => import('./component/chat/chat-routing.module').then(m => m.ChatRoutingModule) },

      { path: 'files',  
    loadChildren: () => import('./component/file/file.routin-.module').then(m => m.FileRoutingModule) },

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

