# Security Architecture

**Version:** 1.0  
**Status:** Draft  
**Owner:** Security Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the security architecture, policies, and implementation requirements for Widget Platform.

Security is a foundational product feature, not an afterthought. Every layer — frontend, backend, runtime, and infrastructure — must implement the controls defined here.

Related documents: [Backend Architecture](./07_BACKEND_ARCHITECTURE.md), [API Specification](./09_API_SPECIFICATION.md), [Widget Runtime Specification](./10_WIDGET_RUNTIME_SPECIFICATION.md), [Database Design](./08_DATABASE_DESIGN.md).

---

# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
│                                                             │
│  Edge (CDN/WAF) → Application (Auth/AuthZ) → Data (Encrypt) │
│       → Runtime (CSP/Sandbox) → Monitoring (Audit/Alert)  │
└─────────────────────────────────────────────────────────────┘
```

Defense in depth: multiple independent security layers protect against different threat categories.

---

# Responsibilities

- Authenticate users and validate API access
- Authorize actions based on workspace roles
- Protect against common web vulnerabilities (OWASP Top 10)
- Secure widget embed and submission pipeline
- Encrypt sensitive data at rest and in transit
- Rate limit and protect against abuse
- Maintain audit trail for compliance
- Manage secrets and credentials securely

---

# Principles

1. **Defense in Depth** — Multiple independent security layers
2. **Least Privilege** — Minimum permissions required for every action
3. **Secure by Default** — Security enabled without configuration
4. **Zero Trust** — Validate every request regardless of source
5. **Privacy by Design** — Minimize PII collection and storage
6. **Transparency** — Audit logs for all sensitive operations

---

# Authentication

## User Authentication

JWT-based authentication with access and refresh tokens.

| Token | Lifetime | Storage | Purpose |
|---|---|---|---|
| Access Token | 15 minutes | Memory / Authorization header | API request authentication |
| Refresh Token | 7 days | httpOnly secure cookie | Access token renewal |

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Hashed with bcrypt (cost factor 12)
- Never stored or logged in plaintext

## Token Security

- Access tokens signed with RS256 (asymmetric)
- Refresh tokens rotated on use (one-time use)
- Token revocation on logout and password change
- Invalid tokens return 401 immediately

## Embed Token Authentication

Widget Runtime uses embed tokens (not user JWT):

- Format: `wt_{random_32_chars}`
- Scoped to single widget
- Read-only access to public config
- Write access to submission and analytics endpoints only
- No access to workspace data or other widgets

## API Key Authentication

Programmatic access via API keys:

- Format: `wp_live_{random_32_chars}` / `wp_test_{random_32_chars}`
- Stored as SHA-256 hash (never plaintext after creation)
- Scoped permissions per key
- Prefix displayed for identification (`wp_live_abc1...`)
- Revocable without affecting other keys

---

# Authorization

## Role-Based Access Control

Four workspace roles with hierarchical permissions (see Database Design permission matrix).

Enforcement points:

- API middleware: `requireRole('editor')` on mutation endpoints
- Service layer: verify ownership and permissions before operations
- Frontend: UI elements hidden/disabled based on role (UX only, not security)

## Resource Ownership

- Widgets belong to workspaces
- Every query scoped to workspaceId
- Cross-workspace access impossible at any layer
- Embed tokens scoped to single widget

## Permission Checks

```typescript
// Middleware level
router.post('/widgets', authenticate, requireWorkspace, requireRole('editor'), ...)

// Service level (defense in depth)
async publish(widgetId: string, workspaceId: string, userId: string) {
  const widget = await this.repo.findById(widgetId, workspaceId)
  if (!widget) throw new NotFoundError()
  // Proceed with publish
}
```

---

# Rate Limiting

## Rate Limit Tiers

| Endpoint Category | Limit | Window | Key |
|---|---|---|---|
| Auth (login/register) | 5 requests | 15 minutes | IP |
| Authenticated API | 100 requests | 1 minute | User ID |
| Public config fetch | 60 requests | 1 minute | Embed token |
| Submission | 10 requests | 1 minute | IP + embed token |
| Analytics events | 100 requests | 1 minute | Session ID |
| AI generation | 20 requests | 1 minute | User ID |

## Implementation

Redis-based sliding window counter:

```typescript
async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const current = await redis.incr(key)
  if (current === 1) await redis.expire(key, windowSeconds)
  if (current > limit) throw new RateLimitError()
}
```

## Response

Rate limited requests return `429 Too Many Requests` with headers:

```
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1691078400
```

---

# Spam Protection

## Submission Protection

| Method | Description |
|---|---|
| Honeypot field | Hidden form field; bots fill it, humans don't |
| Rate limiting | 10 submissions/minute/IP per widget |
| Timestamp validation | Reject submissions <2 seconds after widget open |
| Domain validation | Submissions only from allowed domains |

## Honeypot Implementation

Runtime renders an invisible field:

```html
<input
  type="text"
  name="_hp_email"
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
  style="position:absolute;left:-9999px"
/>
```

Backend rejects submissions where honeypot field has a value.

## Future Spam Protection

- reCAPTCHA v3 integration (invisible)
- Machine learning spam classification
- IP reputation checking
- Submission content analysis

---

# CORS

## Platform API

```
Access-Control-Allow-Origin: https://app.widgetplatform.com
Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Workspace-Id
Access-Control-Allow-Credentials: true
```

## Public/Runtime API

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Public endpoints accept requests from any origin (widget embedded on customer websites). Authenticated via embed token, not CORS.

## Preflight

All non-simple requests trigger OPTIONS preflight. Server responds with appropriate CORS headers before processing.

---

# CSP

## Platform Application

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.widgetplatform.com;
  frame-ancestors 'none';
```

## Widget Runtime

Runtime compatible with strict host page CSP:

- No `eval()` or `Function()` constructor
- No dynamic script injection
- Styles injected via Shadow DOM (scoped)
- External connections limited to `api.widgetplatform.com`
- No iframe creation (except iframe rendering mode)

## Host Page Impact

Runtime script loaded from CDN domain. Host page CSP must allow:

```
script-src: cdn.widgetplatform.com
connect-src: api.widgetplatform.com
```

Documented in embed installation instructions.

---

# Webhook Security

## Webhook Configuration

Widgets can configure webhooks (Developer Mode) to notify external services on submission.

## Security Measures

| Measure | Implementation |
|---|---|
| HTTPS only | Reject HTTP webhook URLs |
| Signature | HMAC-SHA256 signature in `X-Widget-Signature` header |
| Timestamp | `X-Widget-Timestamp` header; reject if >5 minutes old |
| Retry | Exponential backoff (3 attempts) |
| Timeout | 10-second request timeout |

## Signature Verification

```typescript
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(`${timestamp}.${JSON.stringify(payload)}`)
  .digest('hex')
```

Webhook secret generated per widget, rotatable by workspace admin.

---

# Encryption

## In Transit

- TLS 1.2+ for all connections
- HTTPS enforced (HSTS header)
- Certificate managed by CDN/load balancer
- Internal service communication over TLS (future)

## At Rest

| Data | Encryption |
|---|---|
| Passwords | bcrypt hash (not encryption) |
| API keys | SHA-256 hash |
| Database | PostgreSQL encryption at rest (cloud provider) |
| Submission PII | Plaintext in MVP; column-level encryption (Phase 2) |
| Backups | Encrypted backup storage |

## Future: Column-Level Encryption

Submission field values encrypted with AES-256-GCM:

- Encryption key managed by external secrets manager (AWS KMS, Vault)
- Key rotation without data re-encryption (envelope encryption)
- Decryption only on authorized access (submission detail view)

---

# Secrets

## Management

| Secret | Storage | Rotation |
|---|---|---|
| JWT signing keys | Environment variable / secrets manager | 90 days |
| Database credentials | Environment variable / secrets manager | 90 days |
| Redis password | Environment variable / secrets manager | 90 days |
| API key hashes | Database (SHA-256) | User-initiated |
| Webhook secrets | Database (encrypted) | User-initiated |
| LLM API keys | Environment variable / secrets manager | 90 days |

## Rules

- Never commit secrets to version control
- Never log secrets or tokens
- Use `.env` files for local development (gitignored)
- Production secrets managed by cloud secrets manager
- Secrets rotated on schedule and on team member departure

---

# OWASP Practices

## OWASP Top 10 Coverage

| Risk | Mitigation |
|---|---|
| A01: Broken Access Control | RBAC, workspace scoping, middleware + service checks |
| A02: Cryptographic Failures | TLS, bcrypt, SHA-256, encrypted backups |
| A03: Injection | Prisma parameterized queries, Zod input validation, output encoding |
| A04: Insecure Design | Threat modeling, security reviews, least privilege |
| A05: Security Misconfiguration | Secure defaults, environment validation, CSP headers |
| A06: Vulnerable Components | Dependabot, npm audit in CI, regular updates |
| A07: Authentication Failures | JWT with short expiry, refresh rotation, rate limiting |
| A08: Data Integrity Failures | Webhook signatures, schema validation, audit logs |
| A09: Logging Failures | Structured logging, audit trail, no sensitive data in logs |
| A10: SSRF | Webhook URL validation, no internal network access from webhooks |

## Input Validation

All inputs validated with Zod schemas at the API layer:

- Type checking
- Length limits
- Format validation (email, URL, UUID)
- Enum validation
- Nested object validation

## Output Encoding

- API responses are JSON (auto-encoded)
- Runtime renders via textContent (no innerHTML for user content)
- No user input reflected in error messages

---

# Audit Logging

All sensitive operations create audit log entries (see Database Design).

## Logged Actions

- Authentication events (login, logout, failed login)
- Widget lifecycle (create, publish, archive, delete)
- Team management (invite, remove, role change)
- Settings changes (domain, API key, webhook)
- Data export (submission export)
- Permission changes

## Audit Log Format

```json
{
  "id": "uuid",
  "workspaceId": "uuid",
  "userId": "uuid",
  "action": "widget.published",
  "entityType": "widget",
  "entityId": "uuid",
  "metadata": { "widgetName": "Contact Form" },
  "ipAddress": "hashed",
  "createdAt": "2026-08-03T10:00:00Z"
}
```

Audit logs are append-only, never modified or deleted (except GDPR workspace deletion).

---

# Best Practices

## Do

- Validate and sanitize all inputs
- Scope every query to workspace
- Use parameterized queries (Prisma)
- Hash passwords and API keys
- Rate limit all public endpoints
- Log security events
- Keep dependencies updated
- Run security scans in CI

## Do Not

- Store plaintext passwords or API keys
- Trust client-side authorization checks
- Log sensitive data (PII, tokens, passwords)
- Allow HTTP in production
- Skip input validation on any endpoint
- Expose internal error details to clients
- Use `eval()` or dynamic code execution

---

# Acceptance Criteria

Security architecture is production-ready when:

- [ ] JWT authentication with refresh token rotation
- [ ] RBAC enforced on all protected endpoints
- [ ] Multi-tenant isolation verified with penetration testing
- [ ] Rate limiting active on all endpoint categories
- [ ] CORS configured correctly for platform and public APIs
- [ ] CSP headers set on all responses
- [ ] Honeypot and timestamp spam protection active
- [ ] Webhook signatures implemented
- [ ] All secrets managed via environment/secrets manager
- [ ] Audit logs capture all sensitive operations
- [ ] Dependency vulnerability scanning in CI
- [ ] No OWASP Top 10 vulnerabilities in security review

---

# Future Evolution

## Phase 2

- Two-factor authentication (TOTP)
- SSO/SAML for enterprise (Okta, Azure AD)
- Column-level encryption for submission PII
- Security headers middleware (HSTS, X-Frame-Options, etc.)

## Phase 3

- SOC 2 Type II compliance
- Penetration testing program
- Bug bounty program
- Data residency controls for enterprise

## Phase 4

- Zero-trust network architecture
- Hardware security module (HSM) for key management
- Automated threat detection and response

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Security Engineering | Initial security architecture specification |
