# Widget Platform — Backend

Phase 1 backend foundation for Widget Platform. This is an independent Express REST API, separate from the Next.js frontend.

## Architecture

The backend follows a layered clean architecture aligned with the project specification:

```
Routes → Controllers → Services → Repositories → Database (Prisma)
                ↓
           Middlewares (auth, validation, rate limit, errors)
                ↓
           External Services (Supabase Admin SDK)
```

### Design Principles

- **Layered separation** — Controllers handle HTTP; services hold business logic; repositories handle data access
- **Fail explicitly** — Typed errors with centralized handling
- **Strict TypeScript** — No `any`, strict compiler options
- **Prisma as primary ORM** — Supabase PostgreSQL via Prisma Client
- **Supabase SDK** — Admin client prepared for future Auth, Storage, Realtime, and Edge Functions

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Complete database schema (Phase 2)
│   ├── seed.ts                # Development seed data
│   └── migrations/            # Prisma migration history
├── src/
│   ├── app.ts                 # Express application factory
│   ├── server.ts              # HTTP server, graceful shutdown
│   ├── config/                # Environment configuration
│   ├── constants/             # Application constants
│   ├── controllers/           # HTTP request handlers
│   ├── database/              # Prisma singleton
│   ├── errors/                # Typed error classes
│   ├── lib/                   # External client wrappers (Supabase)
│   ├── logger/                # Pino structured logging
│   ├── middlewares/           # Express middleware
│   ├── repositories/          # Data access layer (Phase 2)
│   ├── routes/                # Route definitions
│   ├── schemas/               # Zod validation schemas
│   ├── services/              # Business logic layer
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Utility functions
│   └── validators/            # Request validators (Phase 2)
└── tests/                     # Vitest + Supertest tests
```

## Development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (Supabase recommended)

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your Supabase credentials:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

### Scripts

| Script                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Start development server with hot reload (tsx watch) |
| `npm run build`           | Compile TypeScript and generate Prisma Client        |
| `npm start`               | Run production build                                 |
| `npm test`                | Run test suite (Vitest + Supertest)                  |
| `npm run test:watch`      | Run tests in watch mode                              |
| `npm run lint`            | Run ESLint                                           |
| `npm run lint:fix`        | Fix ESLint issues                                    |
| `npm run format`          | Format code with Prettier                            |
| `npm run typecheck`       | TypeScript type checking                             |
| `npm run prisma:generate` | Generate Prisma Client                               |
| `npm run prisma:validate` | Validate Prisma schema                               |
| `npm run prisma:migrate`  | Create and apply migrations (development)            |
| `npm run prisma:migrate:deploy` | Apply migrations (production/staging)        |
| `npm run prisma:seed`     | Seed development database                            |
| `npm run prisma:studio`   | Open Prisma Studio                                   |

## Database (Phase 2)

Widget Platform uses **Supabase PostgreSQL** with **Prisma ORM**. The schema supports multi-tenancy, widget versioning, publishing, analytics, themes, and templates.

### Entity Relationship Diagram

```mermaid
erDiagram
    Workspace ||--o{ Membership : has
    User ||--o{ Membership : has
    Workspace ||--o{ Widget : owns
    Workspace ||--o{ Theme : owns
    User ||--o{ Widget : creates
    Widget ||--o{ WidgetVersion : versions
    Widget ||--o| WidgetVersion : currentVersion
    Widget }o--o| Theme : uses
    Widget ||--o{ Submission : receives
    Widget ||--o{ AnalyticsEvent : tracks
    WidgetVersion ||--o{ Submission : captures

    Workspace {
        uuid id PK
        string name
        string slug UK
        string logoUrl
        enum plan
        datetime createdAt
        datetime updatedAt
    }

    User {
        uuid id PK
        string email UK
        string fullName
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }

    Membership {
        uuid id PK
        uuid userId FK
        uuid workspaceId FK
        enum role
        datetime createdAt
        datetime updatedAt
    }

    Widget {
        uuid id PK
        uuid workspaceId FK
        string name
        string slug
        enum status
        string embedToken UK
        uuid currentVersionId FK
        uuid themeId FK
        uuid createdBy FK
        datetime publishedAt
    }

    WidgetVersion {
        uuid id PK
        uuid widgetId FK
        int version
        json schemaJson
        boolean published
        datetime publishedAt
    }

    Theme {
        uuid id PK
        uuid workspaceId FK
        string name
        json themeJson
        boolean isDefault
    }

    Template {
        uuid id PK
        enum category
        string name
        json schemaJson
        boolean featured
    }

    Submission {
        uuid id PK
        uuid widgetId FK
        uuid widgetVersionId FK
        json payload
        string country
        string ipHash
    }

    AnalyticsEvent {
        uuid id PK
        uuid widgetId FK
        enum type
        json metadata
        string sessionId
        string visitorId
    }
```

### Models

| Model | Purpose |
| ----- | ------- |
| `Workspace` | Tenant organization (company) |
| `User` | Platform user account |
| `Membership` | User ↔ Workspace join with role |
| `Widget` | Widget metadata and publish state |
| `WidgetVersion` | Immutable schema snapshot per version |
| `Theme` | Workspace visual theme tokens (JSON) |
| `Template` | Global marketplace template catalog |
| `Submission` | Form submission records |
| `AnalyticsEvent` | Append-only runtime analytics events |

### Migration Commands

```bash
# Validate schema
npm run prisma:validate

# Generate Prisma Client
npm run prisma:generate

# Create + apply migration (development)
npm run prisma:migrate

# Apply pending migrations (staging/production)
npm run prisma:migrate:deploy
```

Initial migration: `20260803174200_init`

### Supabase Connection (Important)

**`P1001: Can't reach database server`** usually means your network is **IPv4-only**.

| Mode | Host | Works on IPv4? |
| ---- | ---- | -------------- |
| Direct | `db.[ref].supabase.co:5432` | ❌ Often IPv6 only |
| **Session pooler** | `aws-0-[region].pooler.supabase.com:5432` | ✅ Use this locally |

**Fix:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Click **Connect** (top bar)
3. Copy **Session pooler** URI (port `5432`)
4. Paste into `backend/.env` as `DATABASE_URL`
5. Append if missing: `?sslmode=require`

Example (region comes from your dashboard — do not guess):

```env
DATABASE_URL=postgresql://postgres.nirpqftawbfdzxdicgqi:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
```

Then run:

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
curl http://localhost:4000/health
```

### Seed Commands

```bash
# Populate development database with demo data
npm run prisma:seed
```

Seed creates:

- 1 workspace — Bright Smile Dental
- 1 user — Sarah Chen (owner)
- 3 themes — Corporate Blue, Modern Teal, Clean Minimal
- 8 templates — healthcare, lead gen, newsletter, feedback, etc.
- 3 widgets — 2 published, 1 draft (with versions)

### Indexes & Constraints

**Unique constraints:**

- `Workspace.slug`
- `User.email`
- `Widget.embedToken`
- `Widget(workspaceId, slug)` — slug unique per workspace
- `Membership(userId, workspaceId)`
- `WidgetVersion(widgetId, version)`

**Key indexes:** `workspaceId`, `(workspaceId, status)`, `(workspaceId, deletedAt)`, `(workspaceId, widgetId, createdAt)`, `(widgetId, type, createdAt)`, `(widgetId, published)`, `sessionId`, `visitorId`

**Soft delete:** `deletedAt` on `Workspace` and `Widget` (recoverable tenant data)

**Tenant scoping:** `workspaceId` on `Submission` and `AnalyticsEvent` for multi-tenant queries without joins

## Widget API (Phase 3)

Base prefix: `/api/v1`

OpenAPI spec: [`docs/openapi.yaml`](./docs/openapi.yaml)

### Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/v1/widgets` | List widgets (pagination, search, sort, filter) |
| `POST` | `/api/v1/widgets` | Create widget |
| `GET` | `/api/v1/widgets/:id` | Get widget by ID |
| `PATCH` | `/api/v1/widgets/:id` | Update widget metadata |
| `DELETE` | `/api/v1/widgets/:id` | Soft delete widget |
| `POST` | `/api/v1/widgets/:id/archive` | Archive widget |
| `POST` | `/api/v1/widgets/:id/restore` | Restore archived widget |
| `POST` | `/api/v1/widgets/:id/duplicate` | Duplicate widget |

### Create Widget

```bash
curl -X POST http://localhost:4000/api/v1/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "YOUR_WORKSPACE_ID",
    "name": "Contact Us",
    "description": "Primary contact form",
    "createdBy": "YOUR_USER_ID"
  }'
```

Response (`201`):

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "workspaceId": "uuid",
    "name": "Contact Us",
    "slug": "contact-us",
    "status": "DRAFT",
    "embedToken": "wt_...",
    "createdAt": "2026-08-05T12:00:00.000Z",
    "updatedAt": "2026-08-05T12:00:00.000Z"
  },
  "message": "Widget created",
  "timestamp": "2026-08-05T12:00:00.000Z"
}
```

### List Widgets

```bash
curl "http://localhost:4000/api/v1/widgets?workspaceId=YOUR_WORKSPACE_ID&page=1&limit=25&search=contact&sort=updatedAt&order=desc&status=DRAFT"
```

Response (`200`):

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 0,
    "totalPages": 0
  },
  "message": null,
  "timestamp": "2026-08-05T12:00:00.000Z"
}
```

### Business Rules

- Widget name is required
- Slug is generated automatically and unique per workspace
- Embed token is generated automatically on create
- New widgets start as `DRAFT`
- Archive cannot run twice on the same widget
- Restore only works for archived widgets
- Duplicate creates new UUID, slug, embed token, timestamps, and `DRAFT` status
- Delete is soft delete via `deletedAt`

## Environment Variables

| Variable                    | Required | Description                                  |
| --------------------------- | -------- | -------------------------------------------- |
| `PORT`                      | Yes      | Server port (default: 4000)                  |
| `NODE_ENV`                  | Yes      | `development`, `production`, or `test`       |
| `DATABASE_URL`              | Yes      | PostgreSQL connection string (Supabase)      |
| `SUPABASE_URL`              | Yes      | Supabase project URL                         |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | Supabase service role key (server-side only) |

Environment variables are validated on startup using Zod. Missing or invalid values prevent the server from starting.

Optional:

| Variable      | Default                 | Description             |
| ------------- | ----------------------- | ----------------------- |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |

## How to Run

### Development

```bash
npm run dev
```

Server starts at `http://localhost:4000`.

### Production

```bash
npm run build
npm start
```

### Health Check

```bash
curl http://localhost:4000/health
```

Response:

```json
{
  "success": true,
  "version": "1.0.0",
  "environment": "development",
  "uptime": 12.345,
  "timestamp": "2026-08-03T17:00:00.000Z",
  "database": "not_connected"
}
```

`database` returns `"connected"` when PostgreSQL is reachable, otherwise `"not_connected"`.

## API Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "message": null,
  "timestamp": "2026-08-03T17:00:00.000Z"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  },
  "message": "Resource not found",
  "timestamp": "2026-08-03T17:00:00.000Z"
}
```

## Middleware Stack

1. Helmet — Security headers
2. Compression — Response compression
3. CORS — Cross-origin resource sharing
4. Cookie Parser — Cookie parsing
5. JSON Parser — Request body parsing
6. Request Logger — Structured HTTP logging (Pino)
7. Rate Limiter — Global rate limiting
8. 404 Handler — Not found errors
9. Error Handler — Global error normalization

## Logging

Structured JSON logging via Pino:

- Server startup and shutdown
- HTTP request/response (method, path, status, duration)
- Errors with request context
- Unhandled exceptions and promise rejections

Sensitive data (passwords, tokens, PII) is never logged.

## Error System

| Error Class           | HTTP Status | Code                    |
| --------------------- | ----------- | ----------------------- |
| `ValidationError`         | 400         | `VALIDATION_ERROR`      |
| `UnauthorizedError`       | 401         | `UNAUTHORIZED`          |
| `NotFoundError`           | 404         | `NOT_FOUND`             |
| `ConflictError`           | 409         | `CONFLICT`              |
| `UnprocessableEntityError`| 422         | `UNPROCESSABLE_ENTITY`  |
| `InternalServerError`     | 500         | `INTERNAL_SERVER_ERROR` |

## Future Phases

### Phase 4 — Auth & Builder Workflow

- Authentication (JWT + refresh tokens)
- Authorization middleware
- Widget schema update endpoints
- Publish / unpublish pipeline

### Phase 5 — Runtime & Submissions

- Public widget config endpoint
- Submission ingestion
- Analytics event tracking
- Rate limiting per endpoint category

### Phase 6 — Advanced Features

- AI assistant integration
- Template marketplace APIs
- Theme engine APIs
- Webhook dispatch
- Redis caching

### Phase 7 — Production Hardening

- Audit logging
- Multi-tenant isolation tests
- Performance optimization
- Docker deployment

## Related Documentation

- [Backend Architecture](../docs/07_BACKEND_ARCHITECTURE.md)
- [API Specification](../docs/09_API_SPECIFICATION.md)
- [Database Design](../docs/08_DATABASE_DESIGN.md)
- [Security Architecture](../docs/15_SECURITY_ARCHITECTURE.md)
- [Testing Strategy](../docs/16_TESTING_STRATEGY.md)
- [Deployment Architecture](../docs/17_DEPLOYMENT_ARCHITECTURE.md)
