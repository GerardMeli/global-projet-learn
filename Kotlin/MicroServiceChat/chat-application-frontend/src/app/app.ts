// src/app/app.ts
import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('manage-users-frontend');

  ngOnInit(): void {
    // Note : embed_token est déjà traité par embedTokenInitializer (APP_INITIALIZER)
    // AVANT que le router démarre — ce bloc est un filet de sécurité seulement.
    const params     = new URLSearchParams(window.location.search);
    const embedToken = params.get('embed_token');

    if (embedToken) {
      localStorage.setItem('access_token', embedToken);
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Détecter le mode iframe
    if (window.self !== window.top) {
      document.documentElement.classList.add('iframe-mode');
    }
  }
}