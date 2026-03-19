// src/app/core/initializer/embed-token.initializer.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lit embed_token depuis l'URL et l'injecte dans localStorage
// AVANT que le Router démarre et évalue les guards.
//
// IMPORTANT : retourne une Promise — Angular attend sa résolution
// avant d'initialiser le router et d'exécuter les guards.
// ─────────────────────────────────────────────────────────────────────────────

export function embedTokenInitializer(): () => Promise<void> {
  return (): Promise<void> => {
    return new Promise<void>((resolve) => {

      // 1. Lire embed_token dans l'URL
      const params     = new URLSearchParams(window.location.search);
      const embedToken = params.get('embed_token');

      if (embedToken) {
        // Stocker avec la même clé qu'utilise TokenService
        localStorage.setItem('access_token', embedToken);

        // Nettoyer l'URL — supprimer le token visible dans la barre d'adresse
        const cleanUrl = window.location.pathname +
                         (window.location.hash || '');
        window.history.replaceState({}, '', cleanUrl);

        console.log('[EmbedToken] Token injecté depuis URL embed_token');
      }

      // 2. Marquer le mode iframe (pour masquer navbar/topbar via CSS)
      if (window.self !== window.top) {
        document.documentElement.classList.add('iframe-mode');
        console.log('[EmbedToken] Mode iframe détecté');
      }

      resolve();
    });
  };
}