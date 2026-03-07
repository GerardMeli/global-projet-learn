// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [

  // ─────────────────────────────────────────────────────────────────────
  // 🔐 AUTHENTIFICATION (publique)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./component/auth/auth-routing.module')
        .then(m => m.AuthRoutingModule),
    data: {
      title: 'Authentification',
      breadcrumb: 'Auth'
    }
  },
  {
    path: 'chat',
    loadComponent: () => import('./component/chat-room/chat-room').then(m => m.ChatComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Chat Room',
      breadcrumb: 'Chat'
    }
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./component/chat-room/chat-room').then(m => m.ChatComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Chat Room',
      breadcrumb: 'Chat'
    }
  },
  {
    path: 'private',
    loadComponent: () => import('./component/private-chat/private-chat').then(m => m.PrivateChatComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Private Chat',
      breadcrumb: 'Private Chat'
    }
  },
  {
    path: 'private/:id',
    loadComponent: () => import('./component/private-chat/private-chat').then(m => m.PrivateChatComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Private Chat',
      breadcrumb: 'Private Chat'
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // 👑 ADMIN (protégé)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadChildren: () => import('./component/admin/admin-routing').then(m => m.AdminRoutingModule),
    canActivate: [AuthGuard, AdminGuard],
    data: {
      title: 'Administration',
      breadcrumb: 'Admin'
    }
  },

  {
    path: 'forbidden',
    loadComponent: () => import('./component/auth/forbidden.component/forbidden.component').then(m => m.ForbiddenComponent),
    data: {
      title: 'Access Denied',
      breadcrumb: 'Forbidden'
    }
  },
  {
    path: 'profile',
    loadComponent: () => import('./component/auth/profile/profile').then(m => m.ProfileComponent),
    data: {
      title: 'Profile',
      breadcrumb: 'Profile'
    }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./component/auth/unauthorized/unauthorized').then(m => m.UnauthorizedComponent),
    data: {
      title: 'Access Denied',
      breadcrumb: 'Unauthorized'
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // 🔄 REDIRECTION PAR DÉFAUT
  // ─────────────────────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },

  // ─────────────────────────────────────────────────────────────────────
  // ❌ FALLBACK - PAGE NON TROUVÉE
  // ─────────────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];