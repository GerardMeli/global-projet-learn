// src/app/auth/token-bridge/token-bridge.component.ts
// ─────────────────────────────────────────────────────────────────────────────
// Page invisible qui lit le token dans localStorage et le renvoie
// au site agriculture via window.opener.postMessage.
// Route : /auth/token-bridge (sans guard — publique)
// ─────────────────────────────────────────────────────────────────────────────

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-bridge',
  standalone: true,
  template: '', // Page invisible
})
export class TokenBridgeComponent implements OnInit {

  // Domaines agriculture autorisés à recevoir le token
  private readonly ALLOWED_ORIGINS = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://web-agriculture.connecttechnology.io',
    'https://web-agriculture.connecttechnology.io',
  ];

  ngOnInit(): void {
    const token = localStorage.getItem('access_token') || '';

    // Vérifier que c'est bien une fenêtre fille (ouverte par le site agriculture)
    if (!window.opener) {
      window.close();
      return;
    }

    // Envoyer le token à chaque origine autorisée
    // (on ne sait pas exactement laquelle a ouvert cette fenêtre)
    this.ALLOWED_ORIGINS.forEach(origin => {
      try {
        window.opener.postMessage(
          { type: 'EMBED_TOKEN_RESPONSE', token },
          origin
        );
      } catch (_) {
        // Origine non joignable — normal si c'est pas la bonne
      }
    });

    // Fermer la fenêtre bridge immédiatement
    window.close();
  }
}