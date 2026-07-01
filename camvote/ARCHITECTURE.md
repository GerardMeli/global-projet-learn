# VotCam — System Architecture (Updated)
> Version: 2.0.0 | Updated with: Audit per service · Prefixed IDs · Bootstrap · Anonymous votes · Live results

---

## 1. 🌍 System Overview

```
                        ┌──────────────────────────────────────────────┐
                        │              VOTCAM PLATFORM                 │
                        │                                              │
  ┌──────────┐  HTTPS   │  ┌─────────────────────────────────────┐   │
  │ Browser  │◄────────►│  │        Angular 21 Frontend          │   │
  │ Mobile   │  WS/WSS  │  │        Port: 4200                   │   │
  └──────────┘          │  └────┬──────────┬──────────┬──────────┘   │
                        │       │          │          │               │
  ┌──────────┐  API Key │  ┌────▼───┐ ┌───▼────┐ ┌──▼─────────┐    │
  │ External │  + HMAC  │  │ auth   │ │  user  │ │    vote    │    │
  │ System   │◄────────►│  │ :8081  │ │  :8082 │ │    :8083   │    │
  └──────────┘          │  └────┬───┘ └───┬────┘ └──┬─────────┘    │
                        │       │          │         │               │
                        │  ┌────▼──────────▼─────────▼────────────┐ │
                        │  │           Eureka Server :8761         │ │
                        │  └───────────────────────────────────────┘ │
                        │                                              │
                        │  ┌─────────────────┐  ┌──────────────────┐ │
                        │  │   PostgreSQL     │  │      Redis       │ │
                        │  │   Port: 5432     │  │      Port: 6379  │ │
                        │  │   votcam_auth    │  │  JWT blacklist   │ │
                        │  │   votcam_user    │  │  OTP cache       │ │
                        │  │   votcam_vote    │  │  Permissions     │ │
                        │  └─────────────────┘  │  Live vote count │ │
                        │                        │  Rate limiting   │ │
                        │  ┌─────────────────┐  │  WS sessions     │ │
                        │  │  File Storage   │  └──────────────────┘ │
                        │  │  /uploads/      │                        │
                        │  │  avatars/       │                        │
                        │  │  logos/         │                        │
                        │  │  banners/       │                        │
                        │  │  photos/        │                        │
                        │  │  qrcodes/       │                        │
                        │  │  exports/       │                        │
                        │  └─────────────────┘                        │
                        └──────────────────────────────────────────────┘
```

---

## 2. 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Angular | 21 | SPA — Standalone Components |
| **UI Library** | Angular Material | 18+ | UI components |
| **Charts** | ApexCharts / ng-apexcharts | latest | Live results + KPI dashboards |
| **Real-time FE** | RxJS + STOMP over WebSocket | — | Live vote updates |
| **Backend** | Spring Boot | 3.2+ | Microservices framework |
| **Build** | Apache Maven | 3.9+ | Dependency management |
| **Service Registry** | Spring Cloud Netflix Eureka | — | Service discovery |
| **Inter-service** | OpenFeign | — | Sync service-to-service HTTP calls |
| **Real-time BE** | Spring WebSocket + STOMP | — | Live broadcast to Angular |
| **Security** | Spring Security + JWT (JJWT) | — | Auth + RBAC |
| **Database** | PostgreSQL | 15+ | Primary data store |
| **Cache** | Redis (Lettuce) | 7+ | Sessions · Rate limits · Permissions |
| **ORM** | Spring Data JPA + Hibernate | — | Database abstraction |
| **Migrations** | Flyway | 9+ | DB version control per service |
| **Email** | Spring Mail + Gmail SMTP | — | Transactional emails |
| **QR Code** | ZXing (Zebra Crossing) | 3.5+ | QR code generation (free) |
| **File Storage** | Local filesystem | — | avatars · logos · banners · photos |
| **PDF Export** | iText 7 Community | 7.x | PDF reports (free) |
| **CSV Export** | OpenCSV | 5.x | CSV import/export (free) |
| **API Docs** | SpringDoc OpenAPI 3 (Swagger) | 2.x | Auto API documentation |
| **Validation** | Jakarta Bean Validation | — | Input validation |
| **Mapping** | MapStruct | 1.5+ | DTO ↔ Entity |
| **Logging** | SLF4J + Logback | — | Structured application logging |
| **Hashing** | Java MessageDigest (SHA-256) + HMAC | JDK | Vote anonymity + API key signing |

---

## 3. 🆔 ID Strategy

All entities use **String IDs** generated with a prefix + UUID4.

```java
// Shared utility used in all @PrePersist hooks
public final class EntityIdGenerator {

    // Private constructor — utility class
    private EntityIdGenerator() {}

    /**
     * Generates a prefixed UUID string ID.
     * Example: generate("USR_") → "USR_a1b2c3d4-e5f6-7890-abcd-ef1234567890"
     *
     * @param prefix the entity prefix (e.g. "USR_", "ELC_")
     * @return prefixed UUID string
     */
    public static String generate(String prefix) {
        return prefix + UUID.randomUUID().toString();
    }
}

// Usage in entity:
@Entity
public class User {
    @Id
    private String id;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = EntityIdGenerator.generate("USR_");
        }
    }
}
```

---

## 4. 🔑 System Bootstrap (First Super Admin)

### Problem
The first SUPER_ADMIN cannot register through the normal flow because:
- Normal registration creates VOTER or CLIENT_ADMIN only
- No SUPER_ADMIN exists yet to create another SUPER_ADMIN

### Solution: Secure Bootstrap Endpoint

```
Endpoint security layers:
  1. X-Bootstrap-Secret header (from env BOOTSTRAP_SECRET)
  2. Endpoint disabled if SystemSetup.isInitialized = true
  3. Max 3 failed attempts → IP blocked for 1 hour (Redis)
  4. Email OTP verification required
  5. Audit log for every bootstrap attempt
```

### Bootstrap Flow

```
Frontend                    Auth Service              Email
    │                           │                       │
    │─ GET /system/init/status ─►│                       │
    │◄─ { initialized: false } ──│                       │
    │                           │                       │
    │─ POST /system/init ────────►│                       │
    │  Headers:                  │                       │
    │  X-Bootstrap-Secret: xxx   │                       │
    │  Body: {                   │                       │
    │    firstName, lastName,    │                       │
    │    email, password         │                       │
    │  }                         │── Send OTP email ────►│
    │◄─ { message: "OTP sent" } ─│                       │
    │                           │                       │
    │─ POST /system/init/verify ─►│                       │
    │  Body: { email, otp }      │                       │
    │◄─ { access_token,          │                       │
    │     refresh_token }  ──────│                       │
    │                           │── SystemSetup.          │
    │                           │   isInitialized=true   │
    │                           │   (endpoint disabled)  │
    │                           │                       │

After initialization:
  - GET  /system/init/status  → { initialized: true }
  - POST /system/init         → 403 FORBIDDEN always
  - POST /system/init/verify  → 403 FORBIDDEN always
```

### SystemSetup Entity Location
```
Service: auth-service
Database: votcam_auth
Table: system_setup
Rows: always exactly 1 row (singleton)
```

---

## 5. 🔐 Vote Anonymity — Technical Implementation

### Anonymity Guarantee

```
The system can answer: "Has voter X voted?"  → YES (from ElectionVoter.hasVoted)
The system CANNOT answer: "What did voter X vote for?" → IMPOSSIBLE

Proof:
  - Vote table has NO voterId column
  - Vote.ballotToken = SHA256(voteReceiptHash)
  - ElectionVoter.voteReceiptHash = HMAC-SHA256(serverSecret, userId+electionId+ts+salt)
  - salt is a one-time secure random, discarded after use
  - Reversing SHA256 is computationally infeasible
  - Even with full DB dump, voter→vote link is unrecoverable
```

### Implementation in VoteService

```java
public VoteResponse castVote(CastVoteRequest request, String authenticatedUserId) {

    // 1. Load election and verify ACTIVE
    Election election = electionRepository.findById(request.getElectionId())
        .orElseThrow(() -> new ElectionNotFoundException(request.getElectionId()));

    if (election.getStatus() != ElectionStatus.ACTIVE) {
        throw new ElectionNotActiveException(election.getId());
    }

    // 2. Verify voter is assigned to this election
    ElectionVoter voter = electionVoterRepository
        .findByElectionIdAndUserId(election.getId(), authenticatedUserId)
        .orElseThrow(() -> new VoterNotAssignedException(authenticatedUserId, election.getId()));

    // 3. Prevent double voting
    if (voter.isHasVoted()) {
        throw new VoteAlreadyCastException(authenticatedUserId, election.getId());
    }

    // 4. Verify voter is not a candidate (extra runtime check)
    if (candidateRepository.existsByElectionIdAndLinkedUserId(election.getId(), authenticatedUserId)) {
        throw new CandidateCannotVoteException(authenticatedUserId, election.getId());
    }

    // 5. Generate anonymizing hash (two-layer)
    String salt = generateSecureRandom(32);                      // random bytes
    String receipt = hmacSha256(                                  // layer 1
        serverVoteSecret,
        authenticatedUserId + election.getId() + Instant.now().toEpochMilli() + salt
    );
    String ballotToken = sha256(receipt);                         // layer 2

    // 6. Create Vote (NO voterId stored)
    Vote vote = new Vote();
    vote.setBallotToken(ballotToken);          // SHA256(receipt)
    vote.setElectionId(election.getId());
    vote.setStatus(VoteStatus.CONFIRMED);
    vote.setCastedAt(Instant.now());
    vote.setIpAddress(request.getIpAddress());
    vote.setDeviceInfo(request.getDeviceInfo());
    voteRepository.save(vote);

    // 7. Create VoteChoices
    for (String candidateId : request.getCandidateIds()) {
        VoteChoice choice = new VoteChoice();
        choice.setVoteId(vote.getId());
        choice.setCandidateId(candidateId);
        voteChoiceRepository.save(choice);
    }

    // 8. Update ElectionVoter (voter identity side — no candidate info)
    voter.setHasVoted(true);
    voter.setVoteReceiptHash(receipt);         // voter's proof of participation
    voter.setVotedAt(Instant.now());
    voter.setStatus(ElectionVoterStatus.VOTED);
    electionVoterRepository.save(voter);

    // 9. Update live results (triggers WebSocket broadcast)
    resultService.updateLiveResults(election.getId());

    // 10. Audit (logs THAT a vote was cast, NOT what was chosen)
    auditService.log(AuditAction.VOTE_CAST, authenticatedUserId, election.getId());

    // 11. Send receipt email + in-app notification
    notificationService.sendVoteConfirmed(authenticatedUserId, receipt, election);

    // 12. Dispatch webhook VOTE_CAST
    webhookService.dispatch(WebhookEvent.VOTE_CAST, election.getClientId(), election.getId());

    // 13. Return response (receipt given to voter as proof)
    return new VoteResponse(vote.getId(), receipt, Instant.now());
}
```

---

## 6. 📡 Live Results — WebSocket Flow

```
After every vote → resultService.updateLiveResults(electionId):

  1. Recalculate ElectionResult for all candidates
     UPDATE election_results
     SET total_votes = (SELECT COUNT(*) FROM vote_choices WHERE candidate_id = ?)
         percentage  = total_votes * 100.0 / total_election_votes
         rank        = RANK() OVER (ORDER BY total_votes DESC)
         computed_at = NOW()

  2. Broadcast to election subscribers:
     Topic: /topic/election/{electionId}/results
     Payload: {
       type: "RESULTS_UPDATE",
       payload: {
         electionId: "ELC_xxx",
         totalVotes: 127,
         candidates: [
           { candidateId: "CND_1", name: "Alice", votes: 67, percentage: 52.76, rank: 1 },
           { candidateId: "CND_2", name: "Bob",   votes: 60, percentage: 47.24, rank: 2 }
         ]
       },
       timestamp: "2025-05-23T10:30:00Z"
     }

  3. Update ClientKpi for that client
     Broadcast to: /topic/client/{clientId}/kpi

  4. Update SystemKpi
     Broadcast to: /topic/admin/kpi  (SUPER_ADMIN dashboard)

Angular side (RxJS):
  this.wsService.subscribe('/topic/election/' + id + '/results')
    .pipe(takeUntilDestroyed())
    .subscribe(message => {
      this.chartOptions.series = message.payload.candidates.map(c => c.votes);
      // ApexCharts auto-updates — no refresh needed
    });
```

---

## 7. 🗃️ Audit System (All 3 Services)

### Design Principle
```
Each service owns its audit log (separate table, separate DB).
No cross-service audit aggregation at DB level.
SUPER_ADMIN sees all audit logs via separate API calls per service.
Export: CSV + PDF available for each service's audit log.
```

### auth-service — AuthAuditLog

| Tracked Action | When |
|---|---|
| `BOOTSTRAP_ATTEMPT` | Every call to /system/init |
| `BOOTSTRAP_SUCCESS` | Successful init |
| `BOOTSTRAP_FAILED` | Wrong secret / already init |
| `LOGIN_SUCCESS` | Successful login |
| `LOGIN_FAILED` | Wrong password / user not found |
| `LOGOUT` | Token blacklisted |
| `OTP_REQUESTED` | OTP generated |
| `OTP_VERIFIED` | OTP used successfully |
| `OTP_FAILED` | Wrong OTP code |
| `PASSWORD_RESET` | Password changed via forgot-password |
| `TOKEN_REFRESHED` | Refresh token used |
| `TOKEN_REVOKED` | Refresh token revoked |

### user-service — UserAuditLog

| Tracked Action | When |
|---|---|
| `USER_CREATE` | New user created |
| `USER_UPDATE` | User profile updated |
| `USER_DELETE` | User deleted |
| `USER_SUSPEND` | Account suspended |
| `USER_RESTORE` | Account restored |
| `AVATAR_UPDATE` | Profile picture changed |
| `CLIENT_CREATE` | New client registered |
| `CLIENT_UPDATE` | Client profile updated |
| `CLIENT_DELETE` | Client deleted |
| `CLIENT_SUSPEND` | Client account suspended |
| `LOGO_UPDATE` | Client logo changed |
| `PLAN_ASSIGN` | Plan assigned to client |
| `API_KEY_CREATE` | New API key generated |
| `API_KEY_REVOKE` | API key revoked |
| `PERMISSION_CHANGE` | Role permissions updated |
| `OVERRIDE_GRANTED` | User permission override granted |
| `OVERRIDE_REVOKED` | User permission override revoked |

### vote-service — VoteAuditLog

| Tracked Action | When |
|---|---|
| `ELECTION_CREATE` | Election created |
| `ELECTION_UPDATE` | Election updated |
| `ELECTION_DELETE` | Election deleted |
| `ELECTION_PUBLISH` | Election published |
| `ELECTION_START` | Election started |
| `ELECTION_PAUSE` | Election paused |
| `ELECTION_STOP` | Election stopped early |
| `ELECTION_CLOSE` | Election auto-closed |
| `ELECTION_ARCHIVE` | Election archived |
| `VOTE_CAST` | Vote cast (NO candidate info) |
| `VOTE_INVALIDATE` | Vote invalidated by SUPER_ADMIN |
| `CANDIDATE_CREATE` | Candidate added |
| `CANDIDATE_UPDATE` | Candidate updated |
| `CANDIDATE_DELETE` | Candidate removed |
| `VOTER_INVITE` | Voter(s) invited |
| `VOTER_DISQUALIFY` | Voter disqualified |
| `VOTER_IMPORT` | Bulk voter import |
| `QR_GENERATE` | QR codes generated |
| `RESULT_COMPUTE` | Results recomputed |
| `EXPORT_CSV` | Data exported to CSV |
| `EXPORT_PDF` | Data exported to PDF |
| `IMPORT_CSV` | Data imported from CSV |
| `WEBHOOK_TRIGGER` | Webhook dispatched |
| `API_ACCESS` | External API accessed |

---

## 8. 🖼️ File Storage

### Structure and Rules

```
Base path: /app/uploads/ (configurable via FILE_UPLOAD_DIR env)
Served at:  /files/{folder}/{filename}

/uploads/
├── avatars/       User profile pictures   → Max 2MB  → JPG/PNG/WEBP
├── logos/         Client logos            → Max 5MB  → JPG/PNG/WEBP
├── banners/       Election banners        → Max 10MB → JPG/PNG/WEBP
├── photos/        Candidate photos        → Max 3MB  → JPG/PNG/WEBP
├── qrcodes/       QR code images          → Auto     → PNG only
└── exports/       Generated CSV and PDF   → Auto     → CSV/PDF
```

### Update Logic (any file type)

```java
// FileStorageService.updateFile(folder, entityId, newFile):

  1. Get current path from entity (e.g. client.getLogoPath())
  2. If current path exists → delete old file from disk
  3. Generate new filename: entityId + "_" + timestamp + ".ext"
  4. Save new file to /uploads/{folder}/
  5. Update entity.setLogoPath(newPath)
  6. Return new URL via entity.setLogoUrl(baseUrl + "/files/logos/" + filename)
  7. Audit: log LOGO_UPDATE / AVATAR_UPDATE
```

### Endpoint Examples

```
PATCH /api/v1/clients/{id}/logo         → update client logo
PATCH /api/v1/users/{id}/avatar         → update user avatar
PATCH /api/v1/elections/{id}/banner     → update election banner
PATCH /api/v1/elections/{id}/candidates/{cid}/photo → update candidate photo
GET   /files/{folder}/{filename}        → serve any stored file
```

---

## 9. 🚫 Candidate ≠ Voter Enforcement

```
Dual enforcement: service layer + database-level validation

Service checks triggered at:
  POST /elections/{id}/candidates      → check userId not in ElectionVoter
  POST /elections/{id}/voters          → check userId not in Candidate
  POST /elections/{id}/voters/import   → check each imported email/userId

Exception responses (inline, no page refresh):
  CandidateIsVoterException  → 409 CONFLICT
    { success: false, errorCode: "CANDIDATE_IS_VOTER",
      message: "User john@example.com is already a voter in this election" }

  VoterIsCandidateException  → 409 CONFLICT
    { success: false, errorCode: "VOTER_IS_CANDIDATE",
      message: "User john@example.com is already a candidate in this election" }

Angular reactive forms:
  → Error caught by ErrorInterceptor
  → Displayed in form field error without navigation or refresh
  → Button re-enabled after error display
```

---

## 10. 📦 Complete Package Structure

### 10.1 eureka-server

```
eureka-server/
└── src/main/
    ├── java/com/votcam/eureka/
    │   ├── EurekaServerApplication.java
    │   └── config/
    │       └── SecurityConfig.java          # Disable CSRF for /eureka/** endpoints
    └── resources/
        └── application.yml
```

### 10.2 auth-service

```
auth-service/
└── src/main/
    ├── java/com/votcam/auth/
    │   ├── AuthServiceApplication.java
    │   ├── config/
    │   │   ├── SecurityConfig.java
    │   │   ├── JwtConfig.java
    │   │   └── RedisConfig.java
    │   ├── controller/
    │   │   ├── AuthController.java              # /api/v1/auth/**
    │   │   ├── OtpController.java               # /api/v1/otp/**
    │   │   ├── AddressController.java           # /api/v1/auth/address/**
    │   │   ├── SystemInitController.java        # /api/v1/system/init/**
    │   │   └── InternalAuthController.java      # /internal/**
    │   ├── service/
    │   │   ├── AuthService.java
    │   │   ├── JwtService.java                  # Embeds permissions in JWT
    │   │   ├── OtpService.java
    │   │   ├── RefreshTokenService.java
    │   │   ├── AddressService.java              # Address CRUD
    │   │   ├── SystemInitService.java
    │   │   ├── AuthAuditService.java
    │   │   └── EmailService.java
    │   ├── entity/
    │   │   ├── RefreshToken.java
    │   │   ├── OtpCode.java
    │   │   ├── BlacklistedToken.java
    │   │   ├── SystemSetup.java
    │   │   ├── Address.java                     # NEW — filled at registration
    │   │   └── AuthAuditLog.java
    │   ├── enums/
    │   │   └── OtpType.java
    │   ├── repository/
    │   │   ├── RefreshTokenRepository.java
    │   │   ├── OtpCodeRepository.java
    │   │   ├── BlacklistedTokenRepository.java
    │   │   ├── SystemSetupRepository.java
    │   │   ├── AddressRepository.java           # NEW
    │   │   └── AuthAuditLogRepository.java
    │   ├── dto/
    │   │   ├── request/
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── RegisterRequest.java         # Includes AddressRequest nested DTO
    │   │   │   ├── AddressRequest.java          # NEW — street/city/region/postal/country
    │   │   │   ├── OtpVerifyRequest.java
    │   │   │   ├── RefreshTokenRequest.java
    │   │   │   ├── ForgotPasswordRequest.java
    │   │   │   └── BootstrapRequest.java
    │   │   └── response/
    │   │       ├── AuthResponse.java            # Includes permissions[] in JWT claims
    │   │       ├── AddressResponse.java         # NEW
    │   │       └── SystemStatusResponse.java
    │   ├── exception/
    │   │   ├── AuthException.java
    │   │   ├── TokenExpiredException.java
    │   │   ├── InvalidOtpException.java
    │   │   ├── AddressNotFoundException.java    # NEW
    │   │   ├── SystemAlreadyInitializedException.java
    │   │   └── GlobalExceptionHandler.java
    │   ├── client/
    │   │   └── UserServiceClient.java           # GET /internal/users/{id}/permissions
    │   ├── filter/
    │   │   └── JwtAuthenticationFilter.java
    │   └── util/
    │       ├── HmacUtil.java
    │       ├── Sha256Util.java
    │       └── EntityIdGenerator.java
    └── resources/
        ├── application.yml
        ├── db/migration/
        │   ├── V1__init_auth_schema.sql         # refresh_tokens, otp_codes, blacklisted_tokens
        │   │                                    # system_setup, auth_audit_logs
        │   └── V2__init_address_schema.sql      # addresses table
        └── templates/
            ├── en/
            │   ├── email-verification.html
            │   ├── password-reset.html
            │   └── otp-code.html
            └── fr/
                ├── email-verification.html
                ├── password-reset.html
                └── otp-code.html
```

### 10.3 user-service

```
user-service/
└── src/main/
    ├── java/com/votcam/user/
    │   ├── UserServiceApplication.java
    │   ├── config/
    │   │   ├── SecurityConfig.java
    │   │   ├── JwtConfig.java
    │   │   ├── RedisConfig.java
    │   │   └── FileStorageConfig.java
    │   ├── controller/
    │   │   ├── UserController.java
    │   │   ├── ClientController.java
    │   │   ├── PlanController.java
    │   │   ├── ApiKeyController.java
    │   │   ├── PermissionController.java
    │   │   ├── KpiController.java
    │   │   ├── AuditController.java
    │   │   └── InternalUserController.java
    │   ├── service/
    │   │   ├── UserService.java
    │   │   ├── ClientService.java
    │   │   ├── PlanService.java
    │   │   ├── ClientPlanService.java
    │   │   ├── ApiKeyService.java
    │   │   ├── PermissionService.java
    │   │   ├── UserPermissionOverrideService.java
    │   │   ├── UserAuditService.java
    │   │   ├── EmailService.java
    │   │   ├── FileStorageService.java
    │   │   └── KpiService.java
    │   ├── entity/
    │   │   ├── User.java
    │   │   ├── Client.java
    │   │   ├── Plan.java
    │   │   ├── ClientPlan.java
    │   │   ├── ApiKey.java
    │   │   ├── Permission.java
    │   │   ├── RolePermission.java
    │   │   ├── UserPermissionOverride.java
    │   │   └── UserAuditLog.java
    │   ├── enums/
    │   │   ├── Role.java
    │   │   ├── UserStatus.java
    │   │   ├── Language.java
    │   │   ├── ClientStatus.java
    │   │   ├── PlanType.java
    │   │   ├── ApiKeyStatus.java
    │   │   ├── ApiPermission.java
    │   │   └── PermissionCategory.java
    │   ├── repository/
    │   │   ├── UserRepository.java
    │   │   ├── ClientRepository.java
    │   │   ├── PlanRepository.java
    │   │   ├── ClientPlanRepository.java
    │   │   ├── ApiKeyRepository.java
    │   │   ├── PermissionRepository.java
    │   │   ├── RolePermissionRepository.java
    │   │   ├── UserPermissionOverrideRepository.java
    │   │   └── UserAuditLogRepository.java
    │   ├── dto/request/ + response/  (see class diagram)
    │   ├── exception/
    │   │   ├── UserNotFoundException.java
    │   │   ├── ClientNotFoundException.java
    │   │   ├── PlanLimitExceededException.java
    │   │   ├── DuplicateEmailException.java
    │   │   └── GlobalExceptionHandler.java
    │   ├── client/
    │   │   └── AuthServiceClient.java
    │   ├── security/
    │   │   ├── JwtAuthenticationFilter.java
    │   │   └── PermissionEvaluator.java
    │   ├── mapper/
    │   │   ├── UserMapper.java
    │   │   └── ClientMapper.java
    │   └── util/
    │       ├── ApiKeyGenerator.java
    │       ├── FileUtil.java
    │       └── EntityIdGenerator.java
    └── resources/
        ├── application.yml
        ├── db/migration/
        │   ├── V1__init_user_schema.sql
        │   └── V2__seed_permissions_and_roles.sql
        └── templates/
            ├── en/ + fr/  (see audit table above)
```

### 10.4 vote-service

```
vote-service/
└── src/main/
    ├── java/com/votcam/vote/
    │   ├── VoteServiceApplication.java
    │   ├── config/
    │   │   ├── SecurityConfig.java
    │   │   ├── WebSocketConfig.java
    │   │   ├── RedisConfig.java
    │   │   └── FileStorageConfig.java
    │   ├── controller/
    │   │   ├── ElectionController.java
    │   │   ├── CandidateController.java
    │   │   ├── VoteController.java
    │   │   ├── ElectionVoterController.java
    │   │   ├── ElectionManagerController.java
    │   │   ├── QRCodeController.java
    │   │   ├── ResultController.java
    │   │   ├── WebhookController.java
    │   │   ├── AuditController.java
    │   │   ├── NotificationController.java
    │   │   ├── KpiController.java
    │   │   ├── ImportExportController.java
    │   │   └── ExternalApiController.java
    │   ├── service/
    │   │   ├── ElectionService.java
    │   │   ├── CandidateService.java
    │   │   ├── VoteService.java              # Main voting logic + anonymity
    │   │   ├── ElectionVoterService.java
    │   │   ├── ElectionManagerService.java
    │   │   ├── QRCodeService.java
    │   │   ├── ElectionResultService.java    # Live result computation
    │   │   ├── WebhookService.java
    │   │   ├── WebhookDeliveryService.java
    │   │   ├── VoteAuditService.java
    │   │   ├── NotificationService.java
    │   │   ├── EmailService.java
    │   │   ├── KpiService.java
    │   │   ├── ImportService.java
    │   │   ├── ExportService.java
    │   │   └── PlanLimitGuard.java
    │   ├── entity/  (see class diagram — 15 entities)
    │   ├── enums/   (10 enums)
    │   ├── repository/  (15 repositories)
    │   ├── dto/
    │   ├── websocket/
    │   │   ├── VoteWebSocketController.java
    │   │   └── WebSocketEventPublisher.java  # Broadcasts after every vote
    │   ├── exception/
    │   │   ├── ElectionNotFoundException.java
    │   │   ├── VoteAlreadyCastException.java
    │   │   ├── ElectionNotActiveException.java
    │   │   ├── VoterNotAssignedException.java
    │   │   ├── CandidateCannotVoteException.java
    │   │   ├── CandidateIsVoterException.java
    │   │   ├── VoterIsCandidateException.java
    │   │   └── GlobalExceptionHandler.java
    │   ├── client/
    │   │   ├── UserServiceClient.java
    │   │   └── AuthServiceClient.java
    │   ├── security/
    │   │   ├── JwtAuthenticationFilter.java
    │   │   └── ApiKeyAuthFilter.java
    │   └── util/
    │       ├── QRCodeGenerator.java
    │       ├── HmacUtil.java
    │       ├── Sha256Util.java
    │       └── EntityIdGenerator.java
    └── resources/
        ├── application.yml
        ├── db/migration/
        │   ├── V1__init_vote_schema.sql
        │   └── V2__seed_email_templates.sql
        └── templates/
            ├── en/ + fr/  (vote confirmation, election events)
```

### 10.5 Angular Frontend

```
angular-frontend/
└── src/app/
    ├── core/
    │   ├── guards/
    │   │   ├── auth.guard.ts
    │   │   ├── role.guard.ts
    │   │   └── permission.guard.ts
    │   ├── interceptors/
    │   │   ├── jwt.interceptor.ts
    │   │   ├── error.interceptor.ts       # Inline error display (no refresh)
    │   │   └── loading.interceptor.ts
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   ├── user.service.ts
    │   │   ├── client.service.ts
    │   │   ├── election.service.ts
    │   │   ├── vote.service.ts
    │   │   ├── websocket.service.ts       # STOMP + RxJS Observables
    │   │   ├── notification.service.ts
    │   │   ├── audit.service.ts
    │   │   ├── kpi.service.ts
    │   │   └── export.service.ts
    │   └── models/ (all TypeScript interfaces)
    ├── shared/
    │   ├── components/
    │   │   ├── pagination/
    │   │   ├── confirm-dialog/
    │   │   ├── inline-error/             # Show API errors inline
    │   │   ├── loading-spinner/
    │   │   ├── qr-code-display/
    │   │   └── file-upload/
    │   └── pipes/
    ├── features/
    │   ├── bootstrap/                    # First-time system setup page
    │   ├── auth/
    │   ├── super-admin/
    │   │   ├── dashboard/                # SystemKpi + ApexCharts
    │   │   ├── clients/
    │   │   ├── users/
    │   │   ├── plans/
    │   │   ├── permissions/
    │   │   └── audit-logs/
    │   ├── client-admin/
    │   │   ├── dashboard/                # ClientKpi + ApexCharts
    │   │   ├── elections/
    │   │   ├── users/
    │   │   ├── api-keys/
    │   │   ├── webhooks/
    │   │   └── audit-logs/
    │   ├── election-manager/
    │   │   ├── elections/
    │   │   ├── candidates/
    │   │   ├── voters/
    │   │   └── results/                  # Live ApexCharts (WebSocket)
    │   ├── scrutineer/
    │   │   └── live-results/             # Read-only live results
    │   └── voter/
    │       ├── my-elections/
    │       ├── vote/                     # Voting page (OTP if required)
    │       └── my-receipt/               # Vote receipt verification
    └── layout/
```

---

## 11. 🌐 API Endpoint Overview

### 11.0 JWT Payload — Permissions Embedded

```json
{
  "sub":               "USR_a1b2c3d4-...",
  "email":             "user@example.com",
  "role":              "CLIENT_ADMIN",
  "clientId":          "CLT_xxx",
  "clientSlug":        "acme-corp",
  "preferredLanguage": "EN",
  "permissions": [
    "ELECTION_CREATE", "ELECTION_READ", "ELECTION_UPDATE",
    "ELECTION_PUBLISH", "ELECTION_START", "ELECTION_PAUSE",
    "VOTER_INVITE", "VOTER_READ", "RESULTS_READ", "RESULTS_EXPORT",
    "API_KEY_CREATE", "DASHBOARD_READ", "KPI_READ_CLIENT"
  ],
  "iat": 1716490000,
  "exp": 1716490900
}
```

> Permissions loaded from user-service **at login** and **at every token refresh**.  
> Each service reads them **locally from the JWT** — zero extra network calls per request.  
> Override changes take effect at the next token refresh (max 15 min delay).

### RegisterRequest Fields (auth-service)

```json
{
  "firstName":   "Jean",
  "lastName":    "Dupont",
  "email":       "jean@example.com",
  "password":    "Str0ng!Pass",
  "phoneNumber": "+237612345678",
  "role":        "VOTER",
  "clientId":    "CLT_xxx",
  "language":    "FR",
  "address": {
    "street":     "123 Rue de la Paix",
    "city":       "Yaoundé",
    "region":     "Centre",
    "postalCode": "BP 1234",
    "country":    "Cameroon",
    "countryCode":"CM",
    "isPrimary":  true
  }
}
```

### auth-service (:8081)

```
# Authentication
POST   /api/v1/auth/register                      # Register with address (CLIENT_ADMIN or VOTER)
POST   /api/v1/auth/login                         # Login → JWT (with permissions[])
POST   /api/v1/auth/refresh                       # Refresh access token (reloads permissions)
POST   /api/v1/auth/logout                        # Blacklist token + revoke refresh token
POST   /api/v1/auth/forgot-password               # Send password reset OTP
POST   /api/v1/auth/reset-password                # Reset password with OTP

# Address (filled at registration, updatable after)
GET    /api/v1/auth/address                       # Get my addresses (paginated)
GET    /api/v1/auth/address/{id}                  # Get specific address
POST   /api/v1/auth/address                       # Add new address
PUT    /api/v1/auth/address/{id}                  # Update address
DELETE /api/v1/auth/address/{id}                  # Delete address
PATCH  /api/v1/auth/address/{id}/set-primary      # Set as primary address

# System Bootstrap (one-time)
GET    /api/v1/system/init/status                 # Check if system is initialized
POST   /api/v1/system/init                        # Bootstrap first SUPER_ADMIN
POST   /api/v1/system/init/verify                 # Verify OTP → activate SUPER_ADMIN

# Audit
GET    /api/v1/audit?page=0&size=20               # Auth audit logs (paginated)
GET    /api/v1/audit/export/csv                   # Export audit logs to CSV

# Internal (service-to-service, not exposed to frontend)
GET    /internal/users/{id}/permissions           # Called by auth at login/refresh
POST   /internal/invalidate-tokens/{userId}       # Called by user-service on suspend
```

### user-service (:8082)

```
# Users
GET    /api/v1/users?page=0&size=20               # List users (scoped by role)
POST   /api/v1/users                              # Create user
GET    /api/v1/users/{id}                         # Get user
PUT    /api/v1/users/{id}                         # Update user
DELETE /api/v1/users/{id}                         # Delete user
PATCH  /api/v1/users/{id}/suspend                 # Suspend user
PATCH  /api/v1/users/{id}/restore                 # Restore user
PATCH  /api/v1/users/{id}/avatar                  # Update avatar (multipart)

# Clients
GET    /api/v1/clients?page=0&size=20             # List clients
POST   /api/v1/clients                            # Create client
GET    /api/v1/clients/{id}                       # Get client
PUT    /api/v1/clients/{id}                       # Update client
DELETE /api/v1/clients/{id}                       # Delete client
PATCH  /api/v1/clients/{id}/logo                  # Update logo (multipart)
PATCH  /api/v1/clients/{id}/suspend               # Suspend client
PATCH  /api/v1/clients/{id}/restore               # Restore client

# Plans
GET    /api/v1/plans                              # List plans
POST   /api/v1/plans                              # Create plan (SUPER_ADMIN)
PUT    /api/v1/plans/{id}                         # Update plan
POST   /api/v1/clients/{id}/plan                  # Assign plan to client

# API Keys
GET    /api/v1/api-keys?page=0&size=20            # List client's keys
POST   /api/v1/api-keys                           # Create API key
DELETE /api/v1/api-keys/{id}                      # Revoke API key

# Permissions
GET    /api/v1/permissions                        # List all permissions
GET    /api/v1/permissions/roles/{role}           # Get role permissions
PUT    /api/v1/permissions/roles/{role}           # Update role permissions
POST   /api/v1/permissions/overrides              # Grant user override
DELETE /api/v1/permissions/overrides/{id}         # Revoke override

# KPI & Audit
GET    /api/v1/kpi/system                         # System KPIs
GET    /api/v1/kpi/client/{id}                    # Client KPIs
GET    /api/v1/audit?page=0&size=20               # User audit logs
GET    /api/v1/audit/export/csv                   # Export audit CSV
GET    /files/{folder}/{filename}                 # Serve uploaded files
```

### vote-service (:8083)

```
# Elections
GET    /api/v1/elections?page=0&size=20           # List elections (scoped)
POST   /api/v1/elections                          # Create election
GET    /api/v1/elections/{id}                     # Get election
PUT    /api/v1/elections/{id}                     # Update election
DELETE /api/v1/elections/{id}                     # Delete (DRAFT only)
PATCH  /api/v1/elections/{id}/banner              # Update banner (multipart)
PATCH  /api/v1/elections/{id}/publish             # Publish
PATCH  /api/v1/elections/{id}/start               # Start
PATCH  /api/v1/elections/{id}/pause               # Pause (notifies all voters)
PATCH  /api/v1/elections/{id}/stop                # Stop early (notifies all voters)
PATCH  /api/v1/elections/{id}/close               # Close
PATCH  /api/v1/elections/{id}/archive             # Archive

# Candidates
GET    /api/v1/elections/{id}/candidates          # List candidates (paginated)
POST   /api/v1/elections/{id}/candidates          # Add candidate
PUT    /api/v1/elections/{id}/candidates/{cid}    # Update candidate
DELETE /api/v1/elections/{id}/candidates/{cid}    # Remove candidate
PATCH  /api/v1/elections/{id}/candidates/{cid}/photo  # Update photo

# Voting
POST   /api/v1/elections/{id}/vote                # Cast vote (VOTER only)

# Voters
GET    /api/v1/elections/{id}/voters?page=0&size=20  # List voters
POST   /api/v1/elections/{id}/voters              # Add voter(s)
DELETE /api/v1/elections/{id}/voters/{vid}        # Remove voter
PATCH  /api/v1/elections/{id}/voters/{vid}/disqualify # Disqualify
POST   /api/v1/elections/{id}/voters/import       # Import CSV
GET    /api/v1/elections/{id}/voters/export/csv   # Export voters CSV

# Managers
GET    /api/v1/elections/{id}/managers            # List managers
POST   /api/v1/elections/{id}/managers            # Assign manager
DELETE /api/v1/elections/{id}/managers/{mid}      # Remove manager

# QR Codes
POST   /api/v1/elections/{id}/qrcodes             # Generate QR codes
GET    /api/v1/elections/{id}/qrcodes             # List QR codes
GET    /api/v1/elections/{id}/qrcodes/{qid}/download # Download QR image

# Results
GET    /api/v1/elections/{id}/results             # Get results
GET    /api/v1/elections/{id}/results/export/csv  # Export results CSV
GET    /api/v1/elections/{id}/results/export/pdf  # Export results PDF
GET    /api/v1/elections/{id}/results/chart       # Chart data (role-based)

# Webhooks
GET    /api/v1/webhooks?page=0&size=20            # List webhooks
POST   /api/v1/webhooks                           # Create webhook
PUT    /api/v1/webhooks/{id}                      # Update webhook
DELETE /api/v1/webhooks/{id}                      # Delete webhook
GET    /api/v1/webhooks/{id}/deliveries           # Delivery history

# Notifications
GET    /api/v1/notifications?page=0&size=20       # My notifications
PATCH  /api/v1/notifications/{id}/read            # Mark as read
PATCH  /api/v1/notifications/read-all             # Mark all as read

# KPI & Audit
GET    /api/v1/kpi/system                         # System KPIs (SUPER_ADMIN)
GET    /api/v1/kpi/client/{id}                    # Client KPIs
GET    /api/v1/audit?page=0&size=20               # Vote audit logs
GET    /api/v1/audit/export/csv                   # Export audit CSV

# External API (API Key + HMAC auth)
GET    /api/v1/external/elections
POST   /api/v1/external/elections
PUT    /api/v1/external/elections/{id}/start
PUT    /api/v1/external/elections/{id}/stop
POST   /api/v1/external/elections/{id}/voters
POST   /api/v1/external/elections/{id}/voters/import
POST   /api/v1/external/elections/{id}/vote
GET    /api/v1/external/elections/{id}/results
GET    /api/v1/external/kpi
```

---

## 12. ⚡ Redis Keys Reference

| Key | TTL | Service | Purpose |
|-----|-----|---------|---------|
| `votcam:jwt:blacklist:{sha256(token)}` | Token expiry | auth | Blacklisted tokens |
| `votcam:otp:{userId}:{type}` | 10 min | auth | OTP codes |
| `votcam:refresh:{userId}` | 7 days | auth | Refresh token ref |
| `votcam:bootstrap:attempts:{ip}` | 1 hour | auth | Bootstrap rate limit |
| `votcam:permissions:role:{role}` | 1 hour | user | Role permissions cache |
| `votcam:permissions:user:{userId}` | 30 min | user | User overrides cache |
| `votcam:plan:limits:{clientId}` | 15 min | user | Plan limits cache |
| `votcam:election:votes:{electionId}` | Until closed | vote | Live vote counter |
| `votcam:rate:api:{apiKeyPrefix}` | 1 min | vote | API rate limiting |
| `votcam:ws:sessions:{clientId}` | Session | vote | Active WS connections |

---

## 13. 🌱 Environment Variables

```yaml
# === COMMON ===
SPRING_PROFILES_ACTIVE: dev
EUREKA_SERVER_URL: http://localhost:8761/eureka
JWT_SECRET: <256-bit-minimum-secret-key>
JWT_ACCESS_EXPIRY_MS: 900000           # 15 minutes
JWT_REFRESH_EXPIRY_MS: 604800000       # 7 days
BOOTSTRAP_SECRET: <strong-random-secret>  # Used only once for init

# === DATABASES ===
AUTH_DB_URL: jdbc:postgresql://localhost:5432/votcam_auth
USER_DB_URL: jdbc:postgresql://localhost:5432/votcam_user
VOTE_DB_URL: jdbc:postgresql://localhost:5432/votcam_vote
DB_USERNAME: votcam
DB_PASSWORD: <db-password>

# === REDIS ===
REDIS_HOST: localhost
REDIS_PORT: 6379
REDIS_PASSWORD:                        # empty for local dev

# === GMAIL SMTP ===
MAIL_HOST: smtp.gmail.com
MAIL_PORT: 587
MAIL_USERNAME: noreply@votcam.cm
MAIL_PASSWORD: <gmail-app-password>    # Gmail App Password (not account password)
MAIL_FROM_NAME: VotCam
MAIL_FROM_ADDRESS: noreply@votcam.cm

# === FILE STORAGE ===
FILE_UPLOAD_DIR: /app/uploads
FILE_BASE_URL: http://localhost:8082

# === OTP ===
OTP_EXPIRY_MINUTES: 10
OTP_LENGTH: 6
OTP_MAX_ATTEMPTS: 3

# === VOTE SECURITY ===
VOTE_HMAC_SECRET: <strong-random-secret-for-vote-anonymity>
HMAC_TIMESTAMP_TOLERANCE_SECONDS: 300  # ±5 min for API key requests

# === FRONTEND ===
AUTH_SERVICE_URL: http://localhost:8081
USER_SERVICE_URL: http://localhost:8082
VOTE_SERVICE_URL: http://localhost:8083
WS_ENDPOINT: ws://localhost:8083/ws
```

---

*VotCam — com.votcam — Version 2.0.0 — 2025*
