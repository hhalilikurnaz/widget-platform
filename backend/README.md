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
│   └── schema.prisma          # Prisma schema (no models in Phase 1)
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
| `ValidationError`     | 400         | `VALIDATION_ERROR`      |
| `UnauthorizedError`   | 401         | `UNAUTHORIZED`          |
| `NotFoundError`       | 404         | `NOT_FOUND`             |
| `ConflictError`       | 409         | `CONFLICT`              |
| `InternalServerError` | 500         | `INTERNAL_SERVER_ERROR` |

## Future Phases

### Phase 2 — Core Domain

- Prisma models and migrations (User, Workspace, Widget, etc.)
- Authentication (JWT + refresh tokens)
- Widget CRUD APIs
- Workspace management
- Repository implementations

### Phase 3 — Runtime & Submissions

- Public widget config endpoint
- Submission ingestion
- Analytics event tracking
- Rate limiting per endpoint category

### Phase 4 — Advanced Features

- AI assistant integration
- Template marketplace APIs
- Theme engine APIs
- Webhook dispatch
- Redis caching

### Phase 5 — Production Hardening

- Audit logging
- Multi-tenant isolation tests
- Performance optimization
- OpenAPI specification
- Docker deployment

## Related Documentation

- [Backend Architecture](../docs/07_BACKEND_ARCHITECTURE.md)
- [API Specification](../docs/09_API_SPECIFICATION.md)
- [Database Design](../docs/08_DATABASE_DESIGN.md)
- [Security Architecture](../docs/15_SECURITY_ARCHITECTURE.md)
- [Testing Strategy](../docs/16_TESTING_STRATEGY.md)
- [Deployment Architecture](../docs/17_DEPLOYMENT_ARCHITECTURE.md)
