import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

console.log("🔐 Authentication module loaded");

const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./login.component/login.component').then(m => m.LoginComponent),
    data: { animation: 'login' }
  },
  { 
    path: 'register', 
    loadComponent: () => import('./register.component/register.component').then(m => m.RegisterComponent),
    data: { animation: 'register' }
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./forgot-password.component/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: { animation: 'forgot' }
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./reset-password.component/reset-password.component').then(m => m.ResetPasswordComponent),
    data: { animation: 'reset' }
  },
   {
    // ── NOUVEAU — Invitation admin : le user crée son mot de passe ──────────
    // URL reçue par email : /auth/set-password?token=<jwt>
    path: 'set-password',
    loadComponent: () => import('./set-password.component/set-password.component').then(m => m.SetPasswordComponent),
    data: { animation: 'set-password' }
  },
  { 
    path: 'verify-email', 
    loadComponent: () => import('./verify-email.component/verify-email.component').then(m => m.VerifyEmailComponent),
    data: { animation: 'verify' }
  },
  { 
    path: 'resend-verification', 
    loadComponent: () => import('./resend-verification.component/resend-verification.component').then(m => m.ResendVerificationComponent),
    data: { animation: 'resend' }
  },
  { 
    path: 'email-change-confirm', 
    loadComponent: () => import('./email-change-confirm.component/email-change-confirm.component').then(m => m.EmailChangeConfirmComponent),
    data: { animation: 'email-change' }
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  }
];

@NgModule({ 
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule] 
})
export class AuthRoutingModule {}