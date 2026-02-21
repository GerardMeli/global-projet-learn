import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Page d'accueil (publique) ─────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./component/home/home.component')
        .then(m => m.HomeComponent)
  },

  // ── Authentification (publique) ───────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./component/auth/auth-routing.module')
        .then(m => m.AuthRoutingModule)
  },

  // ── Admin (protégé) ───────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./component/admin/admin-routing.module')
        .then(m => m.AdminRoutingModule)
  },

  // ── Profil (protégé) ─────────────────────────────────────────────────────
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./component/admin/profile.component')
        .then(m => m.ProfileComponent)
  },

  // ── Chat (protégé) ────────────────────────────────────────────────────────
// {
//   path: 'chat',
//   canActivate: [AuthGuard],
//   loadChildren: () =>
//     import('./component/chat/chat-routing.module')
//       .then(m => m.ChatRoutingModule)
// },
    {
      path: 'chat/room',
      canActivate: [AuthGuard],
      loadChildren: () =>
        import('./component/chat/chat-room/chat-rooms.module')
          .then(m => m.ChatRoomModule)
    },

  {
// console.log("Hello private chat"),
    
    path: 'chat/room/:id',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./component/chat/chat-room/chat-rooms.module')
        .then(m => m.ChatRoomModule)
  },

  {
    path: 'chat/private/:id',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./component/chat/private-chat/private-chat.module')
        .then(m => m.PrivateChatModule)
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];