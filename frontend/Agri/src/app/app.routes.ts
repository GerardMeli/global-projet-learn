import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'agriculture', pathMatch: 'full' },
    {
  path: '',
  loadComponent: () =>
    import('./agriculture-component/agriculture-component')
      .then(m => m.AgricultureComponent),
}
];
