// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ─────────────────────────────────────────────────────────────────────
  // 🏠 PAGE D'ACCUEIL (publique)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./component/home/home.component')
        .then(m => m.HomeComponent),
    data: {
      title: 'Accueil',
      breadcrumb: 'Accueil'
    }
  },

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

  // ─────────────────────────────────────────────────────────────────────
  // 👤 PROFIL UTILISATEUR (protégé)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./component/admin/profile/profile.module')
        .then(m => m.ProfileModule),
    data: {
      title: 'Mon Profil',
      breadcrumb: 'Profil'
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // 💬 CHAT (protégé)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'chat',
    canActivate: [AuthGuard],
    data: {
      title: 'Chat',
      breadcrumb: 'Chat'
    },
    children: [
      // Redirection par défaut vers les salons publics
      {
        path: '',
        redirectTo: 'room',
        pathMatch: 'full'
      },
      // Salons de discussion publics/privés
      {
        path: 'room',
        loadChildren: () =>
          import('./component/chat/chat-room/chat-rooms.module')
            .then(m => m.ChatRoomModule),
        data: {
          title: 'Salons de discussion',
          breadcrumb: 'Salons'
        }
      },
      {
        path: 'room/:id',
        loadChildren: () =>
          import('./component/chat/chat-room/chat-rooms.module')
            .then(m => m.ChatRoomModule),
        data: {
          title: 'Salon de discussion',
          breadcrumb: 'Salon'
        }
      },
      // Messages privés
      {
        path: 'private',
        loadChildren: () =>
          import('./component/chat/private-chat/private-chat.module')
            .then(m => m.PrivateChatModule),
        data: {
          title: 'Messages privés',
          breadcrumb: 'Messages privés'
        }
      },
      {
        path: 'private/:id',
        loadChildren: () =>
          import('./component/chat/private-chat/private-chat.module')
            .then(m => m.PrivateChatModule),
        data: {
          title: 'Conversation privée',
          breadcrumb: 'Conversation'
        }
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────
  // 📁 GESTION DE FICHIERS (protégé)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'files',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./component/admin/admin-files.component/admin-files.module')
        .then(m => m.AdminFilesModule),
    data: {
      title: 'Gestionnaire de fichiers',
      breadcrumb: 'Fichiers'
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // ⚙️ ADMINISTRATION (protégé + admin)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () =>
      import('./component/admin/admin-dashboard/admin-dashboard.module')
        .then(m => m.AdminDashboardModule),
    data: {
      title: 'Administration',
      breadcrumb: 'Admin',
      roles: ['ADMIN']
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // 📊 STATISTIQUES (protégé + admin)
  // ─────────────────────────────────────────────────────────────────────
  {
    path: 'statistics',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () =>
      import('./component/admin/statistics/statistics.module')
        .then(m => m.StatisticsModule),
    data: {
      title: 'Statistiques',
      breadcrumb: 'Statistiques',
      roles: ['ADMIN']
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