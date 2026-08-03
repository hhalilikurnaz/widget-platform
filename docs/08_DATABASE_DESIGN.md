# Database Design

**Version:** 1.0  
**Status:** Draft  
**Owner:** Backend Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the database schema, entity relationships, indexing strategy, migration approach, and data management policies for Widget Platform.

Every database change must comply with this document, the [Backend Architecture](./07_BACKEND_ARCHITECTURE.md), and the [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md).

The Widget Schema stored in the database is the authoritative persistence format shared by the Builder, Backend API, and Widget Runtime.

---

# Architecture

Widget Platform uses PostgreSQL as the primary database with Redis for caching and ephemeral data.

```
┌──────────────────────────────────────────────────────────┐
│                     PostgreSQL                            │
│  Users · Workspaces · Widgets · Submissions · Analytics  │
│  Themes · Templates · Audit Logs                         │
├──────────────────────────────────────────────────────────┤
│                       Redis                               │
│  Cache · Rate Limits · Sessions · Pub/Sub (future)       │
└──────────────────────────────────────────────────────────┘
```

All persistent data lives in PostgreSQL. Redis holds derived, cacheable, or ephemeral data only.

---

# Responsibilities

- Define entity schemas and relationships
- Enforce multi-tenant data isolation via workspace scoping
- Store Widget Schema as versioned JSON documents
- Track submission data with PII handling
- Aggregate analytics events for reporting
- Maintain audit trail for compliance
- Support soft delete for recoverability

---

# Principles

## 1. Schema as Document

Widget configuration is stored as a JSON document (Widget Schema). The database stores and indexes metadata; the schema field holds the complete widget definition.

## 2. Multi-Tenant Isolation

Every tenant-scoped table includes `workspaceId`. Row-level isolation enforced at the repository layer.

## 3. Soft Delete

User-facing entities use soft delete (`deletedAt` timestamp). Hard delete only for GDPR data removal requests.

## 4. Audit Everything

Destructive operations, publish events, and settings changes create audit log entries.

## 5. Index for Queries

Indexes match actual query patterns. Avoid over-indexing write-heavy tables (analytics events).

## 6. Versioned Schemas

Widget Schema includes a `version` field. Migrations transform schemas forward without breaking published widgets.

---

# Database Philosophy

Widget Platform follows a pragmatic relational model with JSON document storage for complex nested data.

**Relational** for entities with clear relationships: users, workspaces, memberships, permissions.

**JSON documents** for complex, nested, versioned data: widget schemas, theme configurations, template definitions.

**Event tables** for append-only data: analytics events, audit logs, submission records.

This hybrid approach leverages PostgreSQL JSONB for flexibility while maintaining relational integrity for core entities.

---

# Entity Relationships

```
User ──────────┐
               ├── WorkspaceMember ──── Workspace ────┬── Widget
               │                                      ├── Theme
               └── (auth tokens)                      ├── Template (imported)
                                                      ├── Submission
                                                      ├── AnalyticsEvent
                                                      ├── ApiKey
                                                      ├── Domain
                                                      └── AuditLog
```

## Core Entities

| Entity | Description | Scoped To |
|---|---|---|
| User | Platform user account | Global |
| Workspace | Tenant organization | Global |
| WorkspaceMember | User-workspace membership with role | Workspace |
| Widget | Widget definition with schema | Workspace |
| Submission | Form submission data | Workspace + Widget |
| AnalyticsEvent | Tracking event | Workspace + Widget |
| Theme | Visual theme definition | Workspace (or global for system themes) |
| Template | Widget template definition | Global (marketplace) |
| ApiKey | API authentication key | Workspace |
| Domain | Allowed embed domain | Workspace |
| AuditLog | Action audit trail | Workspace |

---

# Prisma Schema

## User

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  passwordHash  String
  avatarUrl     String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  memberships   WorkspaceMember[]
  auditLogs     AuditLog[]

  @@map("users")
}
```

## Workspace

```prisma
model Workspace {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  members       WorkspaceMember[]
  widgets       Widget[]
  themes        Theme[]
  submissions   Submission[]
  analyticsEvents AnalyticsEvent[]
  apiKeys       ApiKey[]
  domains       Domain[]
  auditLogs     AuditLog[]

  @@map("workspaces")
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}
```

## WorkspaceMember

```prisma
model WorkspaceMember {
  id          String   @id @default(uuid())
  userId      String
  workspaceId String
  role        Role     @default(VIEWER)
  invitedAt   DateTime @default(now())
  acceptedAt  DateTime?

  user      User      @relation(fields: [userId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([userId, workspaceId])
  @@map("workspace_members")
}

enum Role {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}
```

---

# Widget Schema

## Widget Entity

```prisma
model Widget {
  id          String       @id @default(uuid())
  workspaceId String
  name        String
  type        WidgetType
  status      WidgetStatus @default(DRAFT)
  schema      Json         // Complete Widget Schema document
  schemaVersion Int        @default(1)
  embedToken  String?      @unique
  publishedAt DateTime?
  createdBy   String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  workspace   Workspace    @relation(fields: [workspaceId], references: [id])
  submissions Submission[]
  analyticsEvents AnalyticsEvent[]

  @@index([workspaceId, status])
  @@index([workspaceId, deletedAt])
  @@index([embedToken])
  @@map("widgets")
}

enum WidgetType {
  LEAD_FORM
  NEWSLETTER
  APPOINTMENT
  SUPPORT
  CONTACT
  FEEDBACK
  SURVEY
  POPUP
  INLINE
  FLOATING
}

enum WidgetStatus {
  DRAFT
  EDITING
  PREVIEW
  READY
  PUBLISHED
  ARCHIVED
}
```

## Widget Schema JSON Structure

The `schema` JSON column stores the complete widget definition:

```typescript
interface WidgetSchema {
  version: number
  metadata: {
    name: string
    type: WidgetType
    description?: string
  }
  theme: ThemeReference
  layout: LayoutConfig
  content: {
    title: string
    subtitle?: string
    description?: string
  }
  components: ComponentNode[]
  behavior: BehaviorConfig
  triggers: TriggerConfig
  localization: LocalizationConfig
  analytics: AnalyticsConfig
  publishing: PublishingConfig
}
```

See [Widget Builder Specification — Appendix A](./06_WIDGET_BUILDER_SPECIFICATION.md) for complete schema definition.

## ComponentNode Structure

```typescript
interface ComponentNode {
  id: string
  type: ComponentType
  properties: Record<string, unknown>
  children?: ComponentNode[]
}

type ComponentType =
  | 'header' | 'title' | 'subtitle' | 'description'
  | 'form' | 'field' | 'button' | 'footer'
  | 'success-screen' | 'close-button' | 'floating-button'
```

---

# Submission Schema

```prisma
model Submission {
  id          String   @id @default(uuid())
  workspaceId String
  widgetId    String
  data        Json     // Field key → value pairs
  metadata    Json     // IP (hashed), user agent, referrer, page URL
  status      SubmissionStatus @default(NEW)
  createdAt   DateTime @default(now())
  deletedAt   DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  widget    Widget    @relation(fields: [widgetId], references: [id])

  @@index([workspaceId, widgetId, createdAt])
  @@index([workspaceId, status])
  @@map("submissions")
}

enum SubmissionStatus {
  NEW
  READ
  ARCHIVED
  SPAM
}
```

## Submission Data Format

```typescript
interface SubmissionData {
  fields: Record<string, string | number | boolean>
  metadata: {
    pageUrl: string
    referrer?: string
    userAgent: string
    ipHash: string        // SHA-256 hashed, never store raw IP
    timestamp: string
    widgetVersion: number
  }
}
```

PII in submission data is encrypted at rest (future). IP addresses are hashed before storage.

---

# Analytics Schema

```prisma
model AnalyticsEvent {
  id          String   @id @default(uuid())
  workspaceId String
  widgetId    String
  eventType   AnalyticsEventType
  properties  Json?    // Event-specific metadata
  sessionId   String?  // Anonymous session identifier
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  widget    Widget    @relation(fields: [widgetId], references: [id])

  @@index([workspaceId, widgetId, eventType, createdAt])
  @@index([workspaceId, createdAt])
  @@map("analytics_events")
}

enum AnalyticsEventType {
  WIDGET_VIEWED
  WIDGET_OPENED
  WIDGET_CLOSED
  FIELD_FOCUSED
  FIELD_COMPLETED
  SUBMISSION_STARTED
  SUBMISSION_COMPLETED
  SUBMISSION_FAILED
  EXIT_INTENT_TRIGGERED
  CTA_CLICKED
}
```

## Analytics Aggregation Tables (Future)

Pre-computed aggregates for dashboard performance:

```prisma
model AnalyticsDailyAggregate {
  id          String   @id @default(uuid())
  workspaceId String
  widgetId    String
  date        DateTime @db.Date
  views       Int      @default(0)
  opens       Int      @default(0)
  submissions Int      @default(0)
  conversions Float    @default(0)

  @@unique([workspaceId, widgetId, date])
  @@map("analytics_daily_aggregates")
}
```

---

# Theme Schema

```prisma
model Theme {
  id          String   @id @default(uuid())
  workspaceId String?  // null for system themes
  name        String
  description String?
  tokens      Json     // Theme token overrides
  isSystem    Boolean  @default(false)
  isPublic    Boolean  @default(false)
  createdBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  workspace Workspace? @relation(fields: [workspaceId], references: [id])

  @@index([workspaceId, deletedAt])
  @@index([isSystem, isPublic])
  @@map("themes")
}
```

## Theme Token Structure

```typescript
interface ThemeTokens {
  colors: {
    background: string
    surface: string
    primary: string
    secondary: string
    text: string
    textMuted: string
    border: string
    success: string
    warning: string
    danger: string
  }
  typography: {
    fontFamily: string
    headingSize: string
    bodySize: string
    labelSize: string
  }
  spacing: {
    unit: number     // Base spacing unit (8px)
    padding: string
    gap: string
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
  shadows: {
    small: string
    medium: string
    large: string
  }
  animations: {
    duration: string
    easing: string
  }
}
```

Theme inheritance: Base Theme → Template → Widget Overrides → Component Overrides → Inline Overrides. Lower levels override higher levels.

---

# Workspace Schema

Covered above in Entity Relationships. Additional workspace-related entities:

## ApiKey

```prisma
model ApiKey {
  id          String   @id @default(uuid())
  workspaceId String
  name        String
  keyHash     String   @unique  // Store hash, never plaintext
  prefix      String            // First 8 chars for identification
  permissions String[]          // Scoped permissions
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdBy   String
  createdAt   DateTime @default(now())
  revokedAt   DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@index([workspaceId, revokedAt])
  @@map("api_keys")
}
```

## Domain

```prisma
model Domain {
  id          String   @id @default(uuid())
  workspaceId String
  domain      String
  verified    Boolean  @default(false)
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([workspaceId, domain])
  @@map("domains")
}
```

---

# Template Schema

```prisma
model Template {
  id          String   @id @default(uuid())
  name        String
  description String
  category    TemplateCategory
  type        WidgetType
  schema      Json     // Pre-built Widget Schema
  theme       Json     // Default theme tokens
  thumbnailUrl String?
  isPublic    Boolean  @default(true)
  usageCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category, isPublic])
  @@index([type, isPublic])
  @@map("templates")
}

enum TemplateCategory {
  LEAD_GENERATION
  NEWSLETTER
  FEEDBACK
  SUPPORT
  APPOINTMENT
  ECOMMERCE
  SAAS
  HEALTHCARE
  RESTAURANT
  REAL_ESTATE
  EVENT
  OTHER
}
```

---

# Users, Roles, Permissions

## Permission Matrix

| Permission | Owner | Admin | Editor | Viewer |
|---|---|---|---|---|
| Manage billing | ✓ | | | |
| Delete workspace | ✓ | | | |
| Manage team | ✓ | ✓ | | |
| Manage API keys | ✓ | ✓ | | |
| Manage domains | ✓ | ✓ | | |
| Create widget | ✓ | ✓ | ✓ | |
| Edit widget | ✓ | ✓ | ✓ | |
| Publish widget | ✓ | ✓ | ✓ | |
| Delete widget | ✓ | ✓ | | |
| View analytics | ✓ | ✓ | ✓ | ✓ |
| View submissions | ✓ | ✓ | ✓ | ✓ |
| Export submissions | ✓ | ✓ | ✓ | |
| Manage themes | ✓ | ✓ | ✓ | |
| Use AI assistant | ✓ | ✓ | ✓ | |

Permissions are enforced at the service layer based on the user's role in the current workspace.

---

# Indexes

## Primary Query Patterns

| Query | Index |
|---|---|
| List widgets by workspace + status | `(workspaceId, status)` |
| List widgets by workspace (exclude deleted) | `(workspaceId, deletedAt)` |
| Lookup widget by embed token | `(embedToken)` unique |
| List submissions by widget + date | `(workspaceId, widgetId, createdAt)` |
| List submissions by status | `(workspaceId, status)` |
| Analytics events by widget + type + date | `(workspaceId, widgetId, eventType, createdAt)` |
| Analytics events by workspace + date | `(workspaceId, createdAt)` |
| List themes by workspace | `(workspaceId, deletedAt)` |
| System/public themes | `(isSystem, isPublic)` |
| Templates by category | `(category, isPublic)` |
| Templates by type | `(type, isPublic)` |
| API keys by workspace | `(workspaceId, revokedAt)` |
| User email lookup | `(email)` unique |
| Workspace slug lookup | `(slug)` unique |

## Index Guidelines

- Composite indexes match query filter column order
- Avoid indexing JSON columns directly (use generated columns if needed)
- Analytics events table is write-heavy — minimize indexes to essential query patterns
- Monitor index usage with `pg_stat_user_indexes`

---

# Performance

## Connection Pooling

- Development: direct Prisma connection
- Production: PgBouncer with transaction pooling mode
- Pool size: 20 connections per application instance

## Query Optimization

- Paginate all list queries (default limit: 25, max: 100)
- Use `select` to fetch only required columns for list views
- Widget schema JSON loaded only for detail/edit endpoints
- Analytics aggregations use pre-computed daily tables (future)
- Submission list excludes `data` JSON column (loaded on detail view only)

## Partitioning (Future)

Analytics events table partitioned by month for tables exceeding 10M rows:

```sql
CREATE TABLE analytics_events_2026_08 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
```

---

# Migration Strategy

## Prisma Migrations

All schema changes managed through Prisma Migrate:

```bash
# Create migration
npx prisma migrate dev --name add_widget_embed_token

# Apply in production
npx prisma migrate deploy
```

## Migration Rules

1. Every migration is reversible (include down migration notes)
2. Never modify existing migrations after deployment
3. Additive changes preferred (new columns with defaults, new tables)
4. Destructive changes require data migration scripts
5. Widget Schema migrations are separate from database migrations (schema version field)

## Widget Schema Migration

When the Widget Schema structure evolves:

```typescript
function migrateSchema(schema: WidgetSchema): WidgetSchema {
  switch (schema.version) {
    case 1:
      return migrateV1toV2(schema)
    case 2:
      return migrateV2toV3(schema)
    default:
      return schema
  }
}
```

Schema migrations run on read (lazy) and on publish (eager). Published widgets always serve the latest schema version.

## Seed Data

Development seed includes:

- Demo user and workspace
- Sample widgets (one per type)
- System themes (Minimal, Corporate, Modern, Glass)
- Template catalog (10+ templates)
- Sample submissions and analytics events

---

# Soft Delete

All user-facing entities implement soft delete via `deletedAt` timestamp.

## Behavior

- `deletedAt = null` → active record
- `deletedAt = timestamp` → soft deleted
- All repository queries filter `deletedAt: null` by default
- Soft deleted records excluded from lists and searches
- Recovery possible by setting `deletedAt = null` (admin action)

## Entities with Soft Delete

Widget, Theme, Submission, Workspace

## Entities without Soft Delete

AnalyticsEvent (append-only), AuditLog (append-only), ApiKey (uses `revokedAt`)

## Hard Delete

Only performed for:

- GDPR right-to-erasure requests
- Workspace permanent deletion (after 30-day grace period)
- Automated cleanup of expired sessions and rate limit counters

Hard delete operations create audit log entries before execution.

---

# Audit Logs

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  workspaceId String
  userId      String?
  action      String   // e.g., "widget.published", "member.invited"
  entityType  String   // e.g., "widget", "workspace", "member"
  entityId    String?
  metadata    Json?    // Action-specific details
  ipAddress   String?  // Hashed
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  user      User?     @relation(fields: [userId], references: [id])

  @@index([workspaceId, createdAt])
  @@index([workspaceId, entityType, entityId])
  @@map("audit_logs")
}
```

## Audited Actions

| Action | Entity |
|---|---|
| widget.created | Widget |
| widget.updated | Widget |
| widget.published | Widget |
| widget.archived | Widget |
| widget.deleted | Widget |
| submission.exported | Submission |
| member.invited | WorkspaceMember |
| member.removed | WorkspaceMember |
| member.role_changed | WorkspaceMember |
| api_key.created | ApiKey |
| api_key.revoked | ApiKey |
| domain.added | Domain |
| settings.updated | Workspace |

Audit logs are append-only and never modified or deleted (except GDPR workspace hard delete).

---

# Best Practices

## Do

- Include `workspaceId` on every tenant-scoped table
- Use UUID primary keys for all entities
- Store Widget Schema as JSONB with version field
- Filter soft deletes in every query
- Index based on actual query patterns
- Use transactions for multi-table operations
- Hash sensitive data (IP addresses, API keys) before storage
- Paginate all list endpoints

## Do Not

- Store raw IP addresses or API key plaintext
- Query across workspaces
- Hard delete user data without audit trail
- Modify deployed migrations
- Index JSON columns without generated columns
- Store binary data in PostgreSQL (use object storage)
- Skip `updatedAt` on mutable entities

---

# Acceptance Criteria

The database design is production-ready when:

- [ ] All entities defined in Prisma schema with proper relationships
- [ ] Multi-tenant isolation enforced via workspaceId on all tenant tables
- [ ] Widget Schema stored as versioned JSON with migration support
- [ ] Soft delete implemented on all user-facing entities
- [ ] Audit logs capture all destructive and publish operations
- [ ] Indexes match documented query patterns
- [ ] Seed data provides complete development environment
- [ ] Migration strategy documented and tested
- [ ] Submission PII handling complies with security requirements
- [ ] Connection pooling configured for production
- [ ] All foreign keys enforce referential integrity

---

# Future Evolution

## Phase 2 — Analytics Optimization

- Daily/hourly aggregate tables for dashboard queries
- Materialized views for conversion funnel calculations
- Table partitioning for analytics events

## Phase 3 — Data Warehouse

- ETL pipeline to data warehouse (BigQuery/Snowflake)
- BI tool integration for advanced reporting
- Retention analysis and cohort queries

## Phase 4 — Encryption

- Column-level encryption for submission PII
- Encrypted JSON fields for sensitive widget configurations
- Key rotation via external secrets manager

## Phase 5 — Multi-Region

- Read replicas for analytics queries
- Cross-region workspace data replication
- Geo-aware data residency for enterprise compliance

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Backend Engineering | Initial database design specification |
