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

## Schema API (Phase 4)

Base prefix: `/api/v1`

The Schema API powers the Visual Builder auto-save workflow. It reads and writes draft widget schemas stored on the current `WidgetVersion`.

### Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/v1/widgets/:id/schema` | Get current draft schema |
| `PUT` | `/api/v1/widgets/:id/schema` | Replace widget schema |
| `POST` | `/api/v1/widgets/:id/schema/reset` | Restore default schema template |
| `POST` | `/api/v1/widgets/:id/schema/validate` | Validate schema without saving |

### Schema Structure

Every widget schema is a versioned JSON document:

```json
{
  "version": 1,
  "content": {},
  "layout": {},
  "theme": {},
  "fields": [],
  "behavior": {},
  "triggers": {},
  "localization": {},
  "animations": {},
  "metadata": {}
}
```

Legacy schemas that use `components` are normalized on read and validated for backward compatibility.

### Builder Workflow

1. Builder loads schema via `GET /api/v1/widgets/:id/schema`
2. User edits in Visual Builder (auto-save every 10 seconds)
3. Builder sends full schema via `PUT /api/v1/widgets/:id/schema`
4. Builder validates locally and via `POST /api/v1/widgets/:id/schema/validate`
5. Reset restores the default template via `POST /api/v1/widgets/:id/schema/reset`

### Update Schema

```bash
curl -X PUT http://localhost:4000/api/v1/widgets/WIDGET_ID/schema \
  -H "Content-Type: application/json" \
  -d '{
    "schema": {
      "version": 1,
      "content": { "title": "Contact Us" },
      "layout": { "type": "popup", "width": "480px", "alignment": "center" },
      "theme": {},
      "fields": [
        { "id": "field-name", "type": "text", "label": "Full Name", "required": true }
      ],
      "behavior": {},
      "triggers": { "type": "immediate" },
      "localization": { "defaultLocale": "en", "locales": {} },
      "animations": {},
      "metadata": { "name": "Contact Us" }
    }
  }'
```

### Business Rules

- Schema belongs to the current `WidgetVersion`
- Only unpublished draft versions can be edited or reset
- Published versions remain immutable (422)
- Validation endpoint performs validation only (no database writes)
- Field ids must be unique within a schema
- Supported field types: text, email, phone, number, textarea, select, checkbox, radio, date, url, hidden

## Publishing & Versioning (Phase 5)

Base prefix: `/api/v1`

### Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/v1/widgets/:id/publish` | Publish current draft as immutable version |
| `POST` | `/api/v1/widgets/:id/unpublish` | Unpublish widget |
| `GET` | `/api/v1/widgets/:id/versions` | List version history |
| `GET` | `/api/v1/widgets/:id/versions/:versionId` | Get version detail |
| `POST` | `/api/v1/widgets/:id/versions/:versionId/restore` | Restore version as new draft |

### Lifecycle

```text
DRAFT (editable)
   │
   ▼ publish ──► PUBLISHED (immutable version created)
   │
   ▼ unpublish ► DRAFT (widget status only; history preserved)
   │
   ▼ restore version ──► new DRAFT (incremented version number)
```

### Publish Widget

```bash
curl -X POST http://localhost:4000/api/v1/widgets/WIDGET_ID/publish
```

Response (`200`):

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PUBLISHED",
    "version": 2,
    "versionId": "uuid",
    "embedToken": "wt_...",
    "embedSnippet": "<script src=\"https://cdn.widgetplatform.com/v1/wt_....js\" async></script>",
    "publicConfigUrl": "https://api.widgetplatform.com/api/v1/public/widgets/wt_.../config",
    "publishedAt": "2026-08-05T12:00:00.000Z"
  },
  "message": "Widget published",
  "timestamp": "2026-08-05T12:00:00.000Z"
}
```

### Version History

```bash
curl http://localhost:4000/api/v1/widgets/WIDGET_ID/versions
```

### Restore Version

```bash
curl -X POST http://localhost:4000/api/v1/widgets/WIDGET_ID/versions/VERSION_ID/restore
```

Creates a **new** draft version copied from the selected historical version. History is never mutated.

### Business Rules

- Publishing creates a new immutable version (v1, v2, v3…)
- Version numbers always increment and are never reused
- Published versions cannot be edited
- Restore copies a historical version into a new draft
- Publish validation requires name, valid schema, active draft, and no slug conflict
- Unpublish sets widget status back to `DRAFT`

## Public Runtime API (Phase 6)

Base prefix: `/public`

These endpoints power the embeddable widget runtime consumed by `widget.js`. No authentication required. Rate limited separately.

### Runtime Architecture

```text
Customer Website
      │
      ▼
widget.js (CDN)
      │
      ▼
GET /public/widgets/:embedToken/runtime
      │
      ▼
Render published widget
```

### Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/public/widgets/:embedToken/config` | Published widget configuration |
| `GET` | `/public/widgets/:embedToken/runtime` | Full runtime payload for widget.js |
| `GET` | `/public/widgets/:embedToken/health` | Runtime health check |

### Embed Snippet

```html
<script src="https://cdn.widgetplatform.com/widget.js"></script>
<script>
WidgetPlatform.init({
  token: "wt_YOUR_EMBED_TOKEN"
})
</script>
```

The runtime response also includes this snippet in `embedSnippet`.

### Caching

Config and runtime responses include:

- `ETag` — content hash for conditional requests
- `Cache-Control: public, max-age=300`
- `Last-Modified` — published version timestamp

Send `If-None-Match` with the ETag to receive `304 Not Modified` when content is unchanged.

### Example: Load Runtime

```bash
curl http://localhost:4000/public/widgets/wt_YOUR_EMBED_TOKEN/runtime
```

### Example: Conditional Config Fetch

```bash
curl -H 'If-None-Match: "abc123def4567890"' \
  http://localhost:4000/public/widgets/wt_YOUR_EMBED_TOKEN/config
```

### Business Rules

- Embed token is the only public identifier (no widget UUIDs exposed)
- Draft, archived, and deleted widgets return generic `404`
- Only the latest published version is served
- Internal fields (`workspaceId`, `createdBy`, database IDs) are never exposed
- Invalid embed token format returns `400`

## Submission Pipeline (Phase 7)

The submission pipeline receives form data from publicly embedded widgets, validates it against the published schema, applies spam protection, and stores submissions for management and export.

### Submission Flow

```text
Website
   │
   ▼
widget.js
   │
   ▼
POST /public/widgets/:embedToken/submit
   │
   ▼
Validation (published schema)
   │
   ▼
Spam Protection (rate limit, duplicate detection, honeypot)
   │
   ▼
Repository (IP hashed, metadata stored)
   │
   ▼
Success Response
```

### Public Endpoint

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/public/widgets/:embedToken/submit` | Accept widget form submission |

### Private Endpoints (Widget-Scoped)

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/v1/widgets/:id/submissions` | List submissions with pagination and filters |
| `GET` | `/api/v1/widgets/:id/submissions/:submissionId` | Get submission detail |
| `DELETE` | `/api/v1/widgets/:id/submissions/:submissionId` | Soft delete submission |
| `POST` | `/api/v1/widgets/:id/submissions/export` | Export submissions as CSV |

### Example: Submit Form Data

```bash
curl -X POST http://localhost:4000/public/widgets/wt_YOUR_EMBED_TOKEN/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello"
    },
    "metadata": {
      "pageUrl": "https://example.com/contact",
      "referrer": "https://google.com"
    }
  }'
```

### Example: List Submissions

```bash
curl "http://localhost:4000/api/v1/widgets/WIDGET_ID/submissions?page=1&limit=25&order=desc"
```

### Example: Export CSV

```bash
curl -X POST http://localhost:4000/api/v1/widgets/WIDGET_ID/submissions/export \
  -H 'Content-Type: application/json' \
  -d '{"dateFrom":"2026-01-01T00:00:00.000Z","dateTo":"2026-08-05T00:00:00.000Z"}' \
  -o submissions.csv
```

### Validation

Submissions are validated against the **published widget schema**:

- Required fields enforced
- Email, phone, URL, date, number, textarea formats checked
- Select, radio, and checkbox values validated against schema options
- Unknown fields rejected
- Invalid payloads return `400` with field-level errors

### Spam Protection

| Control | Behavior |
| ------- | -------- |
| Global rate limiting | Applied via existing middleware |
| Submission rate limit | 10 submissions/minute per IP |
| Duplicate detection | Same IP + payload within 5 minutes rejected (`409`) |
| Honeypot field | Non-empty honeypot rejected (`400`) |
| Payload size limit | Request body limited to 1 MB (Express JSON parser) |
| IP storage | Raw IP never stored; SHA-256 hash saved as `ipHash` |

### CSV Export

Export columns: **Date**, **Widget**, **Version**, **Payload**, **Country**, **Browser**, **Device**.

Filters: date range, country, browser, device, version.

### Business Rules

- Only **published** widgets accept submissions; draft, archived, and deleted widgets return `404`
- Submissions are linked to the published version at submit time
- Internal IDs and hashed IP are never exposed on public endpoints
- Private list supports pagination, filtering, payload search, and sorting (newest/oldest)

## Analytics Engine (Phase 8)

The analytics engine ingests widget runtime events and exposes dashboard metrics for widget performance, conversion, and breakdowns.

### Event Lifecycle

```text
widget.js
   │
   ▼
POST /public/widgets/:embedToken/events
   │
   ▼
Published widget validation
   │
   ▼
Event stored in analytics_events
   │
   ▼
Dashboard queries aggregate raw events
```

### Public Endpoint

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/public/widgets/:embedToken/events` | Ingest analytics event (returns `204`) |

Supported event types: `VIEW`, `OPEN`, `START`, `FIELD_FOCUS`, `FIELD_BLUR`, `FIELD_CHANGE`, `SUBMIT`, `SUCCESS`, `ERROR`, `CLOSE`.

### Private Dashboard Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/v1/widgets/:id/analytics` | Overview metrics |
| `GET` | `/api/v1/widgets/:id/analytics/timeline` | Time-series metrics |
| `GET` | `/api/v1/widgets/:id/analytics/devices` | Device and browser breakdown |
| `GET` | `/api/v1/widgets/:id/analytics/countries` | Top countries |
| `GET` | `/api/v1/widgets/:id/analytics/sources` | Traffic sources |
| `GET` | `/api/v1/widgets/:id/analytics/performance` | Runtime performance |

### Example: Track Event

```bash
curl -X POST http://localhost:4000/public/widgets/wt_YOUR_EMBED_TOKEN/events \
  -H 'Content-Type: application/json' \
  -d '{
    "eventType": "VIEW",
    "sessionId": "sess-123",
    "visitorId": "vis-456",
    "metadata": {
      "pageUrl": "https://example.com",
      "referrer": "https://google.com",
      "country": "US",
      "browser": "Chrome",
      "device": "desktop",
      "responseTimeMs": 120,
      "runtimeVersion": "1.0.0"
    }
  }'
```

### Example: Dashboard Overview

```bash
curl "http://localhost:4000/api/v1/widgets/WIDGET_ID/analytics?dateFrom=2026-01-01T00:00:00.000Z&dateTo=2026-08-05T00:00:00.000Z"
```

### Dashboard Metrics

| Metric | Description |
| ------ | ----------- |
| Views | Count of `VIEW` events |
| Unique Visitors | Distinct `visitorId` values |
| Opens | Count of `OPEN` events |
| Starts | Count of `START` events |
| Submissions | Count of `SUBMIT` events |
| Successes | Count of `SUCCESS` events |
| Errors | Count of `ERROR` events |
| Conversion Rate | Submissions / Views × 100 |
| Completion Rate | Successes / Starts × 100 |
| Average Completion Time | Mean `durationMs` on `SUCCESS` events |
| Bounce Rate | Sessions with view but no open / total view sessions |

### Timeline

Granularity options: `hour`, `day`, `week`, `month`. Custom ranges via `dateFrom` and `dateTo`.

### Breakdowns

- **Devices:** desktop, tablet, mobile (+ browsers: Chrome, Safari, Firefox, Edge)
- **Countries:** top countries with counts and percentages
- **Sources:** direct, organic, referral, campaign (derived from referrer/page URL)

### Filters

All dashboard endpoints support: date range, widget version, country, browser, device, source.

### Performance Metrics

- Load count (VIEW events)
- Average response time (`responseTimeMs` in metadata)
- Slow requests (>1000ms)
- Latest runtime version
- Cache hit ratio (placeholder — `null` until cache telemetry is available)

### Business Rules

- Only **published** widgets accept analytics events
- Extended event metadata stored in JSON `metadata` column (no schema redesign)
- Analytics rate limit: 100 events/minute per IP
- Internal IDs never exposed on public endpoints

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
