import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

console.log("Hello authentication")

const routes: Routes = [
  { path: 'login',                loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: 'register',             loadComponent: () => import('./register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password',      loadComponent: () => import('./forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password',       loadComponent: () => import('./reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'verify-email',         loadComponent: () => import('./verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: 'resend-verification',  loadComponent: () => import('./resend-verification.component').then(m => m.ResendVerificationComponent) },
  { path: '',                     redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AuthRoutingModule {}