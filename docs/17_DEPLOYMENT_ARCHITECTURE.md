# Deployment Architecture

**Version:** 1.0  
**Status:** Draft  
**Owner:** DevOps Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the deployment architecture, environments, CI/CD pipeline, infrastructure, and operational procedures for Widget Platform.

Related documents: [Backend Architecture](./07_BACKEND_ARCHITECTURE.md), [Frontend Architecture](./04_FRONTEND_ARCHITECTURE.md), [Security Architecture](./15_SECURITY_ARCHITECTURE.md), [Testing Strategy](./16_TESTING_STRATEGY.md).

---

# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production                                │
│                                                             │
│  CDN (Runtime) → Load Balancer → App Servers → Database     │
│       ↓              ↓              ↓            ↓          │
│  Cloudflare    Next.js (Vercel)  Express     PostgreSQL     │
│                Frontend           Backend     Redis          │
└─────────────────────────────────────────────────────────────┘
```

Widget Platform deploys as three independently scalable services: frontend (Next.js), backend (Express), and runtime (CDN static bundle).

---

# Responsibilities

- Define environment topology and configuration
- Specify CI/CD pipeline stages and deployment triggers
- Document Docker containerization strategy
- Define environment variable management
- Establish monitoring, logging, and alerting
- Define rollback procedures

---

# Principles

1. **Immutable Deployments** — Every deployment is a new version; no in-place modifications
2. **Environment Parity** — Staging mirrors production architecture
3. **Automated Pipeline** — Deployments triggered by CI, not manual steps
4. **Zero-Downtime** — Rolling deployments with health checks
5. **Rollback Ready** — Any deployment reversible within minutes
6. **Secrets External** — No secrets in code or container images

---

# Environments

## Development

Local developer machines.

| Service | Runtime | Port |
|---|---|---|
| Frontend (Next.js) | `pnpm dev` | 3000 |
| Backend (Express) | `pnpm dev` (tsx watch) | 4000 |
| PostgreSQL | Docker Compose | 5432 |
| Redis | Docker Compose | 6379 |

### Docker Compose (Development)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: widget_platform
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

volumes:
  pgdata:
```

Developers run frontend and backend natively for hot reload. Database and Redis via Docker Compose.

---

## Staging

Pre-production environment for QA and integration testing.

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel (Preview) | staging.widgetplatform.com |
| Backend | Railway / Render | api.staging.widgetplatform.com |
| Runtime CDN | Cloudflare | cdn.staging.widgetplatform.com |
| PostgreSQL | Managed (Supabase/Neon) | Internal |
| Redis | Managed (Upstash) | Internal |

Staging deploys automatically on merge to `main`.

---

## Production

Live customer-facing environment.

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel (Production) | app.widgetplatform.com |
| Backend | Railway / Render | api.widgetplatform.com |
| Runtime CDN | Cloudflare | cdn.widgetplatform.com |
| PostgreSQL | Managed (Supabase/Neon) | Internal |
| Redis | Managed (Upstash) | Internal |

Production deploys require manual approval after staging verification.

---

# Docker

## Backend Dockerfile

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

## Frontend

Frontend deploys to Vercel (not Docker). Vercel handles build, optimization, and CDN delivery for the Next.js application.

## Runtime Bundle

Runtime JavaScript bundle built separately and uploaded to CDN:

```bash
# Build runtime bundle
pnpm --filter runtime build
# Output: dist/runtime.min.js (<30KB gzip)
# Upload to CDN with content-hash filename
```

---

# CI/CD

## Pipeline

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌────────────┐
│  Push   │───▶│  Lint   │───▶│  Test   │───▶│  Build   │───▶│  Deploy    │
│  / PR   │    │  + Type │    │  Suite  │    │          │    │  Staging   │
└─────────┘    └─────────┘    └─────────┘    └──────────┘    └─────┬──────┘
                                                                    │
                                                              ┌─────▼──────┐
                                                              │  Deploy    │
                                                              │  Production│
                                                              │ (approval) │
                                                              └────────────┘
```

## GitHub Actions Workflow

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit

  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Backend to Staging
        run: # Railway/Render deploy command
      - name: Deploy Frontend to Vercel Staging
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires manual approval
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Backend to Production
        run: # Production deploy command
      - name: Deploy Frontend to Vercel Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Upload Runtime Bundle to CDN
        run: # CDN upload command
```

---

# Environment Variables

## Frontend (Vercel)

| Variable | Description | Example |
|---|---|---|
| NEXT_PUBLIC_API_URL | Backend API base URL | https://api.widgetplatform.com |
| NEXT_PUBLIC_CDN_URL | Runtime CDN URL | https://cdn.widgetplatform.com |
| NEXT_PUBLIC_APP_URL | Frontend URL | https://app.widgetplatform.com |

## Backend

| Variable | Description | Secret |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| JWT_PRIVATE_KEY | RS256 private key for access tokens | Yes |
| JWT_PUBLIC_KEY | RS256 public key for verification | No |
| JWT_REFRESH_SECRET | Refresh token signing secret | Yes |
| LLM_API_KEY | AI provider API key | Yes |
| SMTP_HOST | Email service host | Yes |
| SMTP_USER | Email service credentials | Yes |
| SMTP_PASS | Email service credentials | Yes |
| NODE_ENV | Environment name | No |
| PORT | Server port (default 4000) | No |
| CORS_ORIGIN | Allowed frontend origin | No |
| LOG_LEVEL | Logging level (info/debug) | No |

## Management

- Development: `.env` file (gitignored)
- Staging/Production: Platform secrets manager (Vercel Env, Railway Variables)
- Never committed to version control
- Validated on startup via Zod schema
- Missing required variables prevent server start

---

# Build Pipeline

## Frontend Build

```bash
pnpm build    # next build
```

Output: Optimized Next.js production build with automatic code splitting, image optimization, and static generation.

## Backend Build

```bash
pnpm build    # tsc + prisma generate
```

Output: Compiled JavaScript in `dist/` with Prisma client generated.

## Runtime Build

```bash
pnpm --filter runtime build    # esbuild bundle
```

Output: Single minified JavaScript file (<30KB gzip) uploaded to CDN.

## Database Migration

```bash
npx prisma migrate deploy    # Apply pending migrations
```

Runs automatically as part of backend deployment, before server start.

---

# Monitoring

## Application Monitoring

| Tool | Purpose |
|---|---|
| Vercel Analytics | Frontend performance, Web Vitals |
| Sentry | Error tracking (frontend + backend) |
| Uptime monitor | Health check endpoint polling |

## Health Check

```
GET /api/v1/health
```

Returns database and Redis connectivity status. Monitored every 60 seconds. Alert on 2 consecutive failures.

## Metrics

| Metric | Alert Threshold |
|---|---|
| API error rate (5xx) | >1% over 5 minutes |
| API latency (p95) | >500ms over 5 minutes |
| Database connection pool | >80% utilization |
| Redis memory | >80% capacity |
| Frontend LCP | >2.5 seconds |
| Submission failure rate | >5% over 15 minutes |

---

# Logging

## Backend Logging

Structured JSON via Pino:

- Request/response logging (method, path, status, duration)
- Error logging with stack traces (server-side only)
- Business event logging (publish, submission, login)

## Log Aggregation

- Development: stdout
- Staging/Production: Log drain to aggregation service (Axiom, Datadog, or similar)
- Retention: 30 days staging, 90 days production

## Frontend Logging

- Client errors sent to Sentry
- Performance metrics sent to Vercel Analytics
- No console.log in production code

---

# Rollback

## Frontend Rollback

Vercel instant rollback to previous deployment:

```bash
vercel rollback
```

Zero downtime. Previous build served immediately.

## Backend Rollback

Platform-specific rollback to previous deployment:

```bash
# Railway
railway rollback

# Render
render deploy --rollback
```

Database migrations are forward-only. Rollback does not reverse migrations. Additive migrations ensure backward compatibility.

## Runtime Rollback

CDN serves previous bundle version by content hash. Rollback = update CDN routing to previous hash.

## Rollback Decision

Rollback triggered when:

- Error rate exceeds 5% for 5 minutes post-deploy
- Health check fails for 2 consecutive minutes
- Critical functionality broken (manual decision)

---

# Best Practices

## Do

- Deploy to staging before production
- Run database migrations before server start
- Monitor error rates after every deployment
- Keep staging environment synchronized with production architecture
- Use feature flags for risky changes (future)
- Test rollback procedure quarterly

## Do Not

- Deploy directly to production without staging verification
- Store secrets in code or container images
- Skip health checks in deployment pipeline
- Run destructive migrations without backup
- Deploy on Fridays (unless critical fix)

---

# Acceptance Criteria

Deployment architecture is operational when:

- [ ] Development environment starts with single command
- [ ] CI pipeline runs lint, test, and build on every PR
- [ ] Staging deploys automatically on merge to main
- [ ] Production deploys with manual approval
- [ ] Health check endpoint monitored
- [ ] Error tracking active on frontend and backend
- [ ] Environment variables validated on startup
- [ ] Database migrations run automatically on deploy
- [ ] Rollback procedure tested and documented
- [ ] Runtime bundle deployed to CDN

---

# Future Evolution

## Phase 2

- Kubernetes deployment for backend (horizontal scaling)
- Blue-green deployments
- Feature flags (LaunchDarkly/Unleash)
- Automated performance regression detection in CI

## Phase 3

- Multi-region deployment
- Database read replicas
- CDN edge computing for runtime
- Infrastructure as Code (Terraform/Pulumi)

## Phase 4

- Auto-scaling based on traffic patterns
- Canary deployments with automatic rollback
- Multi-cloud redundancy

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | DevOps Engineering | Initial deployment architecture specification |
