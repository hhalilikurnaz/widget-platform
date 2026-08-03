# Backend Architecture

**Version:** 1.0  
**Status:** Draft  
**Owner:** Backend Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the complete backend architecture of Widget Platform.

It serves as the authoritative reference for the Express server, layered architecture, request lifecycle, authentication, authorization, data access, and service design.

Every backend implementation must comply with this document, the [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), the [Database Design](./08_DATABASE_DESIGN.md), the [API Specification](./09_API_SPECIFICATION.md), and [Security Architecture](./15_SECURITY_ARCHITECTURE.md).

---

# Architecture

Widget Platform backend is a Node.js Express application following a layered architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  Routes · Controllers · Middleware · Validation · Auth       │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│  Business Logic · Orchestration · Domain Rules               │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                          │
│  Prisma ORM · Query Logic · Data Mapping                     │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  PostgreSQL · Redis Cache · Object Storage                   │
└─────────────────────────────────────────────────────────────┘
```

The backend serves three consumers:

1. **Next.js Frontend** — Authenticated REST API for platform management
2. **Widget Runtime** — Public configuration and submission endpoints
3. **External Integrations** — Webhooks, API keys, third-party services (future)

---

# Responsibilities

## API Layer

- HTTP request routing and method handling
- Request validation and sanitization
- Authentication and authorization enforcement
- Response formatting and status codes
- Rate limiting and CORS
- Error normalization

## Service Layer

- Business logic and domain rules
- Transaction orchestration across repositories
- Widget schema validation and transformation
- Publish pipeline execution
- Analytics event ingestion
- AI request orchestration
- Webhook dispatch

## Repository Layer

- Database query construction via Prisma
- Data mapping between database models and domain types
- Soft delete enforcement
- Audit log creation
- Cache read/write operations

## Data Layer

- PostgreSQL for persistent storage
- Redis for caching, rate limiting, and session data
- Object storage for assets (future)

---

# Principles

## 1. Layered Separation

Each layer communicates only with the layer directly below it.

```
Controller → Service → Repository → Database
```

Controllers never call repositories directly. Services never handle HTTP concerns.

## 2. Thin Controllers

Controllers parse requests, call services, and format responses. Maximum 30 lines per handler method. No business logic in controllers.

## 3. Domain-Driven Services

Services encapsulate business rules. One service per domain entity (WidgetService, SubmissionService, AnalyticsService).

## 4. Repository Abstraction

Repositories abstract Prisma queries. Services depend on repository interfaces, not Prisma directly. Enables testing with mock repositories.

## 5. Fail Explicitly

Every error is typed, logged, and returned with appropriate HTTP status. Never swallow errors silently.

## 6. Multi-Tenant by Default

Every query is scoped to a workspace. No cross-tenant data access is possible at any layer.

## 7. Schema as Contract

The Widget Schema JSON structure is the contract between Builder, Backend, and Runtime. Backend validates, persists, and serves schemas without transformation that alters rendering output.

---

# Express Architecture

## Application Structure

```
server/
├── src/
│   ├── index.ts                  # Application entry point
│   ├── app.ts                    # Express app configuration
│   ├── config/
│   │   ├── env.ts                # Environment variable validation
│   │   ├── database.ts           # Prisma client initialization
│   │   └── redis.ts              # Redis client initialization
│   ├── routes/
│   │   ├── index.ts              # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── widget.routes.ts
│   │   ├── submission.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── theme.routes.ts
│   │   ├── template.routes.ts
│   │   ├── workspace.routes.ts
│   │   ├── ai.routes.ts
│   │   └── public.routes.ts      # Runtime-facing endpoints
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── widget.controller.ts
│   │   ├── submission.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── theme.controller.ts
│   │   ├── template.controller.ts
│   │   ├── workspace.controller.ts
│   │   ├── ai.controller.ts
│   │   └── public.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── widget.service.ts
│   │   ├── submission.service.ts
│   │   ├── analytics.service.ts
│   │   ├── theme.service.ts
│   │   ├── template.service.ts
│   │   ├── workspace.service.ts
│   │   ├── ai.service.ts
│   │   ├── publish.service.ts
│   │   ├── webhook.service.ts
│   │   └── email.service.ts
│   ├── repositories/
│   │   ├── widget.repository.ts
│   │   ├── submission.repository.ts
│   │   ├── analytics.repository.ts
│   │   ├── theme.repository.ts
│   │   ├── template.repository.ts
│   │   ├── workspace.repository.ts
│   │   ├── user.repository.ts
│   │   └── audit.repository.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── workspace.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── validators/
│   │   ├── widget.validator.ts
│   │   ├── submission.validator.ts
│   │   └── ...
│   ├── types/
│   │   ├── widget-schema.ts
│   │   ├── api.types.ts
│   │   └── domain.types.ts
│   ├── utils/
│   │   ├── api-error.ts
│   │   ├── pagination.ts
│   │   └── slug.ts
│   └── di/
│       └── container.ts          # Dependency injection container
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
├── package.json
└── tsconfig.json
```

---

# Layered Architecture

## Controller Layer

Controllers handle HTTP semantics only.

```typescript
// controllers/widget.controller.ts
export class WidgetController {
  constructor(private widgetService: WidgetService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.widgetService.list({
        workspaceId: req.workspace.id,
        ...req.query,
      })
      res.json({ data: result.items, meta: result.meta })
    } catch (error) {
      next(error)
    }
  }

  publish = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.widgetService.publish(
        req.params.id,
        req.workspace.id,
        req.user.id,
      )
      res.json({ data: result })
    } catch (error) {
      next(error)
    }
  }
}
```

Responsibilities:

- Extract route parameters, query strings, and body
- Delegate to service layer
- Format success responses
- Pass errors to error middleware via `next(error)`

---

## Service Layer

Services contain all business logic.

```typescript
// services/widget.service.ts
export class WidgetService {
  constructor(
    private widgetRepo: WidgetRepository,
    private publishService: PublishService,
    private auditRepo: AuditRepository,
  ) {}

  async publish(widgetId: string, workspaceId: string, userId: string) {
    const widget = await this.widgetRepo.findById(widgetId, workspaceId)
    if (!widget) throw new NotFoundError('Widget not found')

    this.validateForPublish(widget.schema)

    const published = await this.publishService.execute(widget)

    await this.auditRepo.log({
      action: 'widget.published',
      entityId: widgetId,
      userId,
      workspaceId,
    })

    return published
  }
}
```

Responsibilities:

- Enforce business rules and domain validation
- Orchestrate operations across multiple repositories
- Manage transactions
- Trigger side effects (webhooks, emails, analytics)
- Create audit log entries

---

## Repository Layer

Repositories abstract data access.

```typescript
// repositories/widget.repository.ts
export class WidgetRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, workspaceId: string) {
    return this.prisma.widget.findFirst({
      where: { id, workspaceId, deletedAt: null },
    })
  }

  async updateSchema(id: string, workspaceId: string, schema: WidgetSchema) {
    return this.prisma.widget.update({
      where: { id, workspaceId },
      data: {
        schema: schema as Prisma.JsonObject,
        updatedAt: new Date(),
      },
    })
  }

  async list(params: WidgetListParams) {
    const { workspaceId, status, search, page, limit } = params
    const where = {
      workspaceId,
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    }

    const [items, total] = await Promise.all([
      this.prisma.widget.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.widget.count({ where }),
    ])

    return { items, total }
  }
}
```

Responsibilities:

- Construct Prisma queries
- Enforce soft delete filters
- Scope all queries to workspace
- Map database records to domain types
- Handle pagination and sorting

---

# Prisma

## Configuration

Prisma serves as the ORM for PostgreSQL.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Usage Rules

- All database access goes through Prisma Client
- Raw SQL only for complex analytics aggregations (with repository abstraction)
- Migrations managed via `prisma migrate`
- Seed data for development via `prisma db seed`
- Connection pooling via PgBouncer in production

## Transaction Pattern

Multi-step operations use Prisma transactions:

```typescript
await this.prisma.$transaction(async (tx) => {
  const widget = await tx.widget.update({ ... })
  await tx.auditLog.create({ ... })
  await tx.analyticsEvent.create({ ... })
})
```

---

# Validation

Request validation uses Zod schemas applied via middleware.

```typescript
// validators/widget.validator.ts
export const createWidgetSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(WIDGET_TYPES),
  templateId: z.string().uuid().optional(),
})

// middleware/validate.middleware.ts
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      throw new ValidationError(result.error.flatten())
    }
    req.body = result.data
    next()
  }
}
```

Validation occurs at the API layer before reaching services. Services perform additional domain validation (publish readiness, schema integrity).

---

# Authentication

## Strategy

JWT-based authentication with refresh tokens.

```
Login
  ↓
Generate Access Token (15min) + Refresh Token (7d)
  ↓
Client stores tokens (httpOnly cookies)
  ↓
Access Token sent with every request (Authorization header)
  ↓
Token expired → Refresh Token → New Access Token
```

## Auth Middleware

```typescript
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req)
  if (!token) throw new UnauthorizedError()

  const payload = verifyAccessToken(token)
  const user = await userRepository.findById(payload.sub)
  if (!user) throw new UnauthorizedError()

  req.user = user
  next()
}
```

Public endpoints (Runtime config, submission ingestion) use embed token authentication instead of user JWT.

---

# Authorization

Role-based access control scoped to workspaces.

## Roles

| Role | Permissions |
|---|---|
| Owner | Full workspace access, billing, delete workspace |
| Admin | Manage widgets, team, settings, API keys |
| Editor | Create, edit, publish widgets, view analytics |
| Viewer | Read-only access to widgets, analytics, submissions |

## Authorization Middleware

```typescript
export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const membership = await workspaceRepository.getMembership(
      req.user.id,
      req.workspace.id,
    )
    if (!membership || !roles.includes(membership.role)) {
      throw new ForbiddenError()
    }
    next()
  }
}
```

Every authenticated endpoint checks both authentication (who) and authorization (what they can do).

---

# Caching

Redis serves as the caching layer.

## Cache Strategy

| Data | TTL | Invalidation |
|---|---|---|
| Published widget config | 5 minutes | On publish/unpublish |
| Theme definitions | 15 minutes | On theme update |
| Template catalog | 30 minutes | On template publish |
| Analytics aggregates (hourly) | 1 hour | On new events |
| User session | 15 minutes | On logout |
| Rate limit counters | 1 minute | Automatic expiry |

## Cache Pattern

```typescript
async getPublishedConfig(embedToken: string): Promise<PublicWidgetConfig> {
  const cacheKey = `widget:config:${embedToken}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const config = await this.widgetRepo.findByEmbedToken(embedToken)
  if (config) {
    await redis.setex(cacheKey, 300, JSON.stringify(config))
  }
  return config
}
```

Cache invalidation occurs in services after mutations. Never rely on TTL alone for critical data consistency.

---

# Logging

Structured JSON logging via Pino.

## Log Levels

| Level | Usage |
|---|---|
| error | Unhandled exceptions, failed operations |
| warn | Deprecated API usage, rate limit approaching |
| info | Request completed, publish succeeded, user login |
| debug | Query details, cache hits/misses (development only) |

## Request Logging

Every request logs:

```json
{
  "level": "info",
  "method": "POST",
  "path": "/api/v1/widgets/:id/publish",
  "status": 200,
  "duration_ms": 145,
  "userId": "uuid",
  "workspaceId": "uuid",
  "requestId": "uuid"
}
```

Sensitive data (passwords, tokens, submission PII) is never logged.

---

# Error Handling

Centralized error middleware normalizes all errors.

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ValidationError extends ApiError {
  constructor(details: Record<string, string[]>) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', details)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'FORBIDDEN', message)
  }
}
```

Error middleware response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": ["Name is required"]
    }
  }
}
```

Unhandled errors return 500 with generic message. Stack traces logged server-side only.

---

# Dependency Injection

Manual DI container for testability.

```typescript
// di/container.ts
export function createContainer() {
  const prisma = new PrismaClient()
  const redis = createRedisClient()

  const widgetRepo = new WidgetRepository(prisma)
  const auditRepo = new AuditRepository(prisma)
  const publishService = new PublishService(widgetRepo, redis)

  const widgetService = new WidgetService(widgetRepo, publishService, auditRepo)
  const widgetController = new WidgetController(widgetService)

  return {
    controllers: { widgetController },
    services: { widgetService },
    repositories: { widgetRepo },
  }
}
```

Services receive dependencies via constructor injection. Controllers receive services via constructor injection. No global singletons except Prisma client and Redis connection.

---

# Request Lifecycle

```
HTTP Request
      ↓
CORS Middleware
      ↓
Rate Limit Middleware
      ↓
Logger Middleware (assign requestId)
      ↓
Authentication Middleware (JWT or embed token)
      ↓
Workspace Middleware (resolve workspace context)
      ↓
Authorization Middleware (role check)
      ↓
Validation Middleware (Zod schema)
      ↓
Controller (parse request, call service)
      ↓
Service (business logic, orchestration)
      ↓
Repository (database query)
      ↓
Service (format result, side effects)
      ↓
Controller (format response)
      ↓
JSON Response
      ↓
Error Middleware (if error thrown at any step)
```

---

# Response Format

## Success Response

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

Single resources return `data` only. Lists include `meta` for pagination.

## Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Status Codes

| Code | Usage |
|---|---|
| 200 | Successful GET, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error |
| 401 | Missing or invalid authentication |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate, concurrent edit) |
| 422 | Domain validation failure (publish blocked) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

# Multi-Tenancy

Every workspace is an isolated tenant.

## Enforcement

- Every database table with tenant data includes `workspaceId`
- Every repository query filters by `workspaceId`
- Workspace middleware resolves workspace from header or URL
- No endpoint returns data across workspaces
- API keys are scoped to a single workspace

## Workspace Context

```typescript
interface WorkspaceContext {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
}
```

Resolved via `X-Workspace-Id` header or subdomain (future).

---

# Best Practices

## Do

- Keep controllers thin (≤30 lines per handler)
- Validate all inputs with Zod at the API layer
- Scope every query to workspaceId
- Use transactions for multi-step operations
- Log structured JSON with request context
- Return typed, consistent error responses
- Cache published widget configs aggressively
- Create audit logs for destructive and publish operations
- Use soft delete for all user-facing entities

## Do Not

- Put business logic in controllers or routes
- Access Prisma directly from controllers
- Return different response shapes for the same resource type
- Log sensitive data (PII, tokens, passwords)
- Skip workspace scoping on any query
- Use synchronous operations for I/O
- Expose internal error details to clients
- Hard delete user data without audit trail

---

# Acceptance Criteria

The backend architecture is production-ready when:

- [ ] Layered architecture enforced with no layer violations
- [ ] All endpoints documented in API Specification
- [ ] Authentication and authorization enforced on every protected route
- [ ] Multi-tenant isolation verified with integration tests
- [ ] Request validation covers all input with Zod schemas
- [ ] Error handling returns consistent, typed responses
- [ ] Structured logging with request correlation IDs
- [ ] Caching implemented for published widget configs
- [ ] Audit logs created for publish, delete, and settings changes
- [ ] Database migrations managed via Prisma
- [ ] Dependency injection enables unit testing without database
- [ ] Rate limiting active on public and authenticated endpoints
- [ ] Health check endpoint returns database and Redis status

---

# Future Evolution

## Phase 2 — Event-Driven Architecture

- Message queue (Bull/BullMQ) for async operations (webhooks, emails, analytics aggregation)
- Event bus for domain events (widget.published, submission.received)
- Background workers for heavy computation

## Phase 3 — GraphQL API

- GraphQL endpoint for frontend data fetching optimization
- Subscriptions for real-time analytics and collaboration

## Phase 4 — Microservices Extraction

- Analytics ingestion service (high throughput, separate scaling)
- AI service (GPU resources, separate deployment)
- Widget Runtime config CDN service

## Phase 5 — Multi-Region

- Read replicas for analytics queries
- Geo-distributed config serving
- Cross-region workspace replication for enterprise

The current monolithic Express architecture supports these evolutions through repository abstraction, service isolation, and event-ready design.

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Backend Engineering | Initial backend architecture specification |
