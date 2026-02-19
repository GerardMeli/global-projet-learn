/**
 * Email flows documentation derived from EmailServiceImpl.kt
 *
 * The backend sends these emails. Angular needs to know what to expect
 * so it can handle the resulting redirects/links correctly.
 *
 * BASE URL from EmailServiceImpl: ${app.base-url} = http://localhost:8082
 * (Note: different port from API server :8080 — likely a config value)
 */

export interface EmailFlow {
  trigger: string;           // What action triggers this email
  template: string;          // Thymeleaf template used
  subject: string;           // Email subject
  linkPattern: string;       // URL pattern in the email
  angularRoute: string;      // Recommended Angular route to intercept the link
  tokenType: string;         // JWT tokenType claim in the link token
}

export const EMAIL_FLOWS: EmailFlow[] = [
  {
    trigger: 'POST /api/auth/register',
    template: 'email/email-verification.html',
    subject: 'Email Verification',
    linkPattern: '{baseUrl}/api/auth/verify-email?token={token}',
    angularRoute: '/auth/verify-email?token=',
    tokenType: 'email_verification'
  },
  {
    trigger: 'POST /api/auth/resend-verification',
    template: 'email/email-verification.html',
    subject: 'Email Verification',
    linkPattern: '{baseUrl}/api/auth/verify-email?token={token}',
    angularRoute: '/auth/verify-email?token=',
    tokenType: 'email_verification'
  },
  {
    trigger: 'POST /api/auth/forgot-password',
    template: 'email/password-reset.html',
    subject: 'Password Reset Request',
    linkPattern: '{baseUrl}/api/auth/reset-password?token={token}',
    angularRoute: '/auth/reset-password?token=',
    tokenType: 'password_reset'
  },
  {
    trigger: 'POST /api/profile/{userId}/email-change-request',
    template: 'email/email-change-confirmation.html',
    subject: 'Confirm Your Email Change',
    linkPattern: '{baseUrl}/api/profile/email-change-confirm?token={token}',
    angularRoute: '/profile/email-change-confirm?token=',
    tokenType: 'email_change'
  },
  {
    trigger: 'Admin: updateUserStatus()',
    template: 'email/status-change.html',
    subject: 'Your Account Status Has Been Updated',
    linkPattern: 'no link — informational only',
    angularRoute: 'n/a',
    tokenType: 'none'
  },
  {
    trigger: 'Admin: updateUserRole()',
    template: 'email/role-change.html',
    subject: 'Your Account Role Has Been Updated',
    linkPattern: 'no link — informational only',
    angularRoute: 'n/a',
    tokenType: 'none'
  },
  {
    trigger: 'Auth: verifyEmail() success',
    template: 'email/welcome.html',
    subject: 'Welcome to Our Platform',
    linkPattern: '{baseUrl}/login',
    angularRoute: '/auth/login',
    tokenType: 'none'
  },
  {
    trigger: 'Admin: account blocked (5 failed attempts)',
    template: 'email/account-locked.html',
    subject: 'Your Account Has Been Locked',
    linkPattern: 'no link — contact support@example.com',
    angularRoute: 'n/a',
    tokenType: 'none'
  },
  {
    trigger: 'Profile: confirmEmailChange()',
    template: 'email/email-changed.html + email/email-changed-old.html',
    subject: 'Email Change Confirmation / Email Address Has Been Changed',
    linkPattern: 'no link — informational only',
    angularRoute: 'n/a',
    tokenType: 'none'
  }
];

/**
 * ⚠️  IMPORTANT ACTION REQUIRED — Email Link Routing
 *
 * EmailServiceImpl sends links pointing to: http://localhost:8082/api/auth/...
 * These open Spring Boot Thymeleaf pages (EmailController), NOT Angular.
 *
 * To give Angular full control of all email flows, change these values in
 * your application.yaml:
 *
 *   app:
 *     base-url: http://localhost:4200   ← point to Angular, not Spring Boot
 *
 * Angular routes to create:
 *   /auth/verify-email          → reads ?token, calls AuthService.verifyEmail()
 *   /auth/reset-password        → reads ?token, shows reset form
 *   /profile/email-change-confirm → reads ?token, calls ProfileService.confirmEmailChange()
 *
 * Angular components for these routes are generated in the next step.
 */