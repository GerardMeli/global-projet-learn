// export const environment = {
//   production: false,

//   // manage-users — port 8082 (from manage-users application.yaml: server.port: 8082)
//   apiUrl: 'http://localhost:8082/api',

//   // web-application-chat — port 8081 (from chat application.yaml: server.port: 8081)
//   chatApiUrl: 'http://localhost:8081',
//   chatWsUrl:  'http://localhost:8081',

//   // system-manager-file — no server.port in application.yaml → Spring default = 8080
//   fileApiUrl: 'http://localhost:8080',

//   oauth2RedirectUri: 'http://localhost:4200/oauth2/callback',
// };


export const environment = {
  production: false,
  apiUrl: '/api',           // manage-users via proxy
  chatApiUrl: '/chat-api',  // chat via proxy
  chatWsUrl: '',            // SockJS utilise le host courant (localhost:4200)
  fileApiUrl: '/files-api' // files via proxy
//  oauth2RedirectUri: import.meta.env['NG_APP_OAUTH2_REDIRECT_URI'] ?? 'http://localhost:4200/oauth2/callback',
};
/**
 * ─── PROXY SETUP (recommended for dev to avoid CORS) ─────────────────────────
 *
 * proxy.conf.json at project root:
 * {
 *   "/api":      { "target": "http://localhost:8082", "changeOrigin": true },
 *   "/chat-api": { "target": "http://localhost:8081", "changeOrigin": true },
 *   "/ws-chat":  { "target": "http://localhost:8081", "changeOrigin": true, "ws": true },
 *   "/files-api":{ "target": "http://localhost:8080", "changeOrigin": true }
 * }
 *
 * When using proxy, change to:
 *   apiUrl:     '/api'
 *   chatApiUrl: '/chat-api'
 *   chatWsUrl:  ''         ← SockJS uses current host
 *   fileApiUrl: '/files-api'
 *
 * Run: ng serve --proxy-config proxy.conf.json
 *
 * ─── CORS — add to each Spring service ───────────────────────────────────────
 *   manage-users SecurityConfig.kt:      allowedOrigins("http://localhost:4200")
 *   web-application-chat:                @CrossOrigin / WebMvcConfigurer
 *   system-manager-file WebController:   @CrossOrigin("http://localhost:4200")
 *
 * ─── FILE UPLOAD LIMITS ───────────────────────────────────────────────────────
 *   system-manager-file application.yaml:
 *     spring.servlet.multipart.max-file-size: 10MB   ← already configured
 *     spring.servlet.multipart.max-request-size: 10MB
 */
