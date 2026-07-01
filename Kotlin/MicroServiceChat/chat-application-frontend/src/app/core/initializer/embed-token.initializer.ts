// src/app/core/initializers/embed-token.initializer.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lit embed_token depuis l'URL AVANT que les guards s'exécutent.
// Utilisé quand l'app Angular est chargée dans un iframe depuis un autre domaine.
// ─────────────────────────────────────────────────────────────────────────────

export function embedTokenInitializer(): () => void {
  return () => {
    const params = new URLSearchParams(window.location.search);
    const embedToken = params.get('embed_token');

    if (embedToken) {
      // Injecter le token dans localStorage AVANT le premier guard
      localStorage.setItem('access_token', embedToken);

      // Nettoyer l'URL (supprimer le token visible dans la barre)
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }

    // Marquer le mode iframe pour masquer navbar/topbar via CSS
    if (window.self !== window.top) {
      document.documentElement.classList.add('iframe-mode');
    }
  };
}