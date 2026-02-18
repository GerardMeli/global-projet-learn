export const environment = {
  production: false,

  // Spring Boot backend base URL
  // CORS in SecurityConfig.kt allows: localhost:3000, 5173, 8080
  // Angular runs on 4200 — add it to SecurityConfig OR use the proxy below
  apiUrl: 'http://localhost:8082/api',

  // OAuth2 redirect — mirrors SecurityConfig oauth2Login failureHandler redirect
  oauth2RedirectUri: 'http://localhost:4200/oauth2/callback',
};

/**
 * ─── IMPORTANT: CORS FIX ─────────────────────────────────────────────────────
 * Angular runs on :4200, but SecurityConfig only allows :3000, :5173, :8080.
 *
 * Option A (recommended for dev): Use proxy.conf.json
 *   → Angular proxies /api → localhost:8080, so browser sees same origin.
 *   → Set apiUrl: '/api' above and run: ng serve --proxy-config proxy.conf.json
 *
 * Option B: Add "http://localhost:4200" to SecurityConfig.kt allowedOrigins list.
 *
 * proxy.conf.json is generated alongside this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */