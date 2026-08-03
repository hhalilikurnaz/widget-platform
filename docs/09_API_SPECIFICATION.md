# API Specification

**Version:** 1.0  
**Status:** Draft  
**Owner:** Backend Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines every REST API endpoint for Widget Platform.

It serves as the contract between the frontend, Widget Runtime, external integrations, and the backend. All implementations must conform to this specification.

Related documents: [Backend Architecture](./07_BACKEND_ARCHITECTURE.md), [Database Design](./08_DATABASE_DESIGN.md), [Security Architecture](./15_SECURITY_ARCHITECTURE.md).

---

# Architecture

```
Base URL: https://api.widgetplatform.com/api/v1

Authentication:
  Platform API:  Authorization: Bearer <access_token>
  Runtime API:   X-Embed-Token: <embed_token>
  Public API:    No authentication (rate limited)

Workspace Context:
  X-Workspace-Id: <workspace_uuid>
```

All endpoints return JSON. All timestamps are ISO 8601 UTC.

---

# Responsibilities

- Define request and response schemas for every endpoint
- Specify validation rules and error responses
- Document authentication and authorization requirements
- Define pagination, filtering, and sorting conventions
- Establish versioning strategy

---

# Principles

1. **RESTful** — Resources identified by nouns, actions by HTTP methods
2. **Consistent** — Same response envelope for all endpoints
3. **Validated** — All inputs validated before processing
4. **Scoped** — Every endpoint scoped to workspace (except auth and public)
5. **Versioned** — API version in URL path (`/api/v1/`)
6. **Documented** — Every endpoint documented here before implementation

---

# Response Format

## Success

```json
{
  "data": { },
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

`meta` included only for paginated list endpoints.

## Error

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

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no body) |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Unprocessable (domain validation) |
| 429 | Rate limited |
| 500 | Internal error |

---

# Pagination

All list endpoints support pagination:

| Parameter | Type | Default | Max |
|---|---|---|---|
| `page` | integer | 1 | — |
| `limit` | integer | 25 | 100 |

Response includes `meta` with `page`, `limit`, `total`, `totalPages`.

---

# Filtering and Sorting

## Filtering

Pass filters as query parameters:

```
GET /api/v1/widgets?status=published&search=contact
```

## Sorting

```
GET /api/v1/widgets?sort=updatedAt&order=desc
```

Default sort varies by endpoint (documented per endpoint).

---

# Authentication Endpoints

## POST /api/v1/auth/register

Register a new user account.

**Authentication:** None

**Request:**

```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "securePassword123"
}
```

**Validation:**

| Field | Rules |
|---|---|
| email | Required, valid email, unique |
| name | Required, 1–255 characters |
| password | Required, min 8 characters, 1 uppercase, 1 number |

**Response:** `201 Created`

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Jane Doe"
    },
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

**Errors:** `400` validation, `409` email exists

---

## POST /api/v1/auth/login

**Authentication:** None

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "..." },
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

**Errors:** `401` invalid credentials

---

## POST /api/v1/auth/refresh

**Authentication:** Refresh token (httpOnly cookie or body)

**Request:**

```json
{
  "refreshToken": "jwt"
}
```

**Response:** `200 OK`

```json
{
  "data": {
    "accessToken": "jwt"
  }
}
```

**Errors:** `401` invalid or expired refresh token

---

## POST /api/v1/auth/logout

**Authentication:** Bearer token

**Response:** `204 No Content`

Invalidates refresh token.

---

# Workspace Endpoints

## GET /api/v1/workspaces

List workspaces for the authenticated user.

**Authentication:** Bearer token

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "plan": "pro",
      "role": "owner"
    }
  ]
}
```

---

## POST /api/v1/workspaces

Create a new workspace.

**Authentication:** Bearer token

**Request:**

```json
{
  "name": "Acme Corp"
}
```

**Validation:** name required, 1–255 characters, slug auto-generated

**Response:** `201 Created`

---

## GET /api/v1/workspaces/:id

Get workspace details.

**Authentication:** Bearer token + workspace membership

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "pro",
    "memberCount": 5,
    "widgetCount": 12,
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

---

## PATCH /api/v1/workspaces/:id

Update workspace settings.

**Authentication:** Bearer token + Admin/Owner role

**Request:**

```json
{
  "name": "Acme Corporation"
}
```

**Response:** `200 OK`

---

## GET /api/v1/workspaces/:id/members

List workspace members.

**Authentication:** Bearer token + workspace membership

**Response:** `200 OK` (paginated)

---

## POST /api/v1/workspaces/:id/members/invite

Invite a team member.

**Authentication:** Bearer token + Admin/Owner role

**Request:**

```json
{
  "email": "newmember@example.com",
  "role": "editor"
}
```

**Validation:** role must be admin, editor, or viewer

**Response:** `201 Created`

---

## DELETE /api/v1/workspaces/:id/members/:memberId

Remove a team member.

**Authentication:** Bearer token + Admin/Owner role

**Response:** `204 No Content`

---

# Widget Endpoints

## GET /api/v1/widgets

List widgets in the current workspace.

**Authentication:** Bearer token + workspace context

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| status | string | Filter by status (draft, published, archived) |
| type | string | Filter by widget type |
| search | string | Search by name |
| sort | string | Sort field (default: updatedAt) |
| order | string | asc or desc (default: desc) |
| page | integer | Page number |
| limit | integer | Items per page |

**Response:** `200 OK` (paginated)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Contact Form",
      "type": "CONTACT",
      "status": "PUBLISHED",
      "submissionCount": 142,
      "viewCount": 3200,
      "conversionRate": 4.4,
      "updatedAt": "2026-08-01T14:30:00Z",
      "publishedAt": "2026-07-15T09:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 12, "totalPages": 1 }
}
```

---

## POST /api/v1/widgets

Create a new widget.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "name": "Contact Form",
  "type": "CONTACT",
  "templateId": "uuid"
}
```

**Validation:**

| Field | Rules |
|---|---|
| name | Required, 1–255 characters |
| type | Required, valid WidgetType enum |
| templateId | Optional, valid UUID referencing existing template |

**Response:** `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "name": "Contact Form",
    "type": "CONTACT",
    "status": "DRAFT",
    "schema": { },
    "createdAt": "2026-08-03T10:00:00Z"
  }
}
```

If `templateId` provided, widget schema initialized from template.

---

## GET /api/v1/widgets/:id

Get widget details including full schema.

**Authentication:** Bearer token + workspace membership

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "name": "Contact Form",
    "type": "CONTACT",
    "status": "DRAFT",
    "schema": { },
    "schemaVersion": 1,
    "embedToken": null,
    "publishedAt": null,
    "createdBy": "uuid",
    "createdAt": "2026-08-03T10:00:00Z",
    "updatedAt": "2026-08-03T10:00:00Z"
  }
}
```

---

## PATCH /api/v1/widgets/:id

Update widget metadata (not schema).

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "name": "Updated Contact Form"
}
```

**Response:** `200 OK`

---

## PUT /api/v1/widgets/:id/schema

Update widget schema (Builder auto-save).

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "schema": { }
}
```

**Validation:** Schema must pass Widget Schema validation

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "schema": { },
    "schemaVersion": 1,
    "updatedAt": "2026-08-03T10:05:00Z"
  }
}
```

**Errors:** `422` schema validation failure

---

## POST /api/v1/widgets/:id/publish

Publish a widget.

**Authentication:** Bearer token + Editor role

**Validation:** Widget must pass publish validation (title, required fields, button label, theme, trigger, accessibility)

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "status": "PUBLISHED",
    "embedToken": "wt_abc123...",
    "embedSnippet": "<script src=\"https://cdn.widgetplatform.com/v1/wt_abc123.js\" async></script>",
    "publicConfigUrl": "https://api.widgetplatform.com/api/v1/public/widgets/wt_abc123/config",
    "publishedAt": "2026-08-03T10:10:00Z"
  }
}
```

**Errors:** `422` validation failure with details

---

## POST /api/v1/widgets/:id/unpublish

Unpublish a widget.

**Authentication:** Bearer token + Editor role

**Response:** `200 OK`

---

## POST /api/v1/widgets/:id/duplicate

Duplicate a widget.

**Authentication:** Bearer token + Editor role

**Response:** `201 Created` (new widget with copied schema)

---

## DELETE /api/v1/widgets/:id

Soft delete a widget.

**Authentication:** Bearer token + Admin role

**Response:** `204 No Content`

---

# Submission Endpoints

## GET /api/v1/submissions

List submissions for the workspace.

**Authentication:** Bearer token + workspace membership

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| widgetId | uuid | Filter by widget |
| status | string | Filter by status (new, read, archived, spam) |
| search | string | Search submission data |
| dateFrom | ISO 8601 | Start date filter |
| dateTo | ISO 8601 | End date filter |
| sort | string | Default: createdAt |
| order | string | Default: desc |
| page, limit | integer | Pagination |

**Response:** `200 OK` (paginated)

```json
{
  "data": [
    {
      "id": "uuid",
      "widgetId": "uuid",
      "widgetName": "Contact Form",
      "preview": "john@example.com",
      "status": "NEW",
      "createdAt": "2026-08-03T09:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 142, "totalPages": 6 }
}
```

Note: List view excludes full submission data. Use detail endpoint for complete data.

---

## GET /api/v1/submissions/:id

Get submission detail.

**Authentication:** Bearer token + workspace membership

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "widgetId": "uuid",
    "widgetName": "Contact Form",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, I have a question."
    },
    "metadata": {
      "pageUrl": "https://example.com/contact",
      "referrer": "https://google.com",
      "timestamp": "2026-08-03T09:30:00Z"
    },
    "status": "NEW",
    "createdAt": "2026-08-03T09:30:00Z"
  }
}
```

---

## PATCH /api/v1/submissions/:id

Update submission status.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "status": "READ"
}
```

**Response:** `200 OK`

---

## POST /api/v1/submissions/export

Export submissions as CSV.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "widgetId": "uuid",
  "dateFrom": "2026-01-01T00:00:00Z",
  "dateTo": "2026-08-03T00:00:00Z",
  "format": "csv"
}
```

**Response:** `200 OK` with CSV file download

---

## DELETE /api/v1/submissions/:id

Soft delete a submission.

**Authentication:** Bearer token + Admin role

**Response:** `204 No Content`

---

# Analytics Endpoints

## GET /api/v1/analytics/overview

Workspace analytics overview.

**Authentication:** Bearer token + workspace membership

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| dateFrom | ISO 8601 | Start date (default: 30 days ago) |
| dateTo | ISO 8601 | End date (default: now) |

**Response:** `200 OK`

```json
{
  "data": {
    "totalViews": 12400,
    "totalSubmissions": 342,
    "conversionRate": 2.76,
    "activeWidgets": 8,
    "trends": {
      "views": { "current": 12400, "previous": 10200, "change": 21.6 },
      "submissions": { "current": 342, "previous": 298, "change": 14.8 },
      "conversion": { "current": 2.76, "previous": 2.92, "change": -5.5 }
    }
  }
}
```

---

## GET /api/v1/analytics/widgets/:widgetId

Widget-specific analytics.

**Authentication:** Bearer token + workspace membership

**Query Parameters:** dateFrom, dateTo, granularity (hour, day, week)

**Response:** `200 OK`

```json
{
  "data": {
    "views": [{ "date": "2026-08-01", "count": 420 }],
    "submissions": [{ "date": "2026-08-01", "count": 12 }],
    "conversionRate": [{ "date": "2026-08-01", "rate": 2.86 }],
    "topSources": [{ "referrer": "google.com", "count": 180 }],
    "funnel": {
      "viewed": 4200,
      "opened": 2100,
      "started": 890,
      "completed": 342
    }
  }
}
```

---

## GET /api/v1/analytics/widgets/top

Top performing widgets.

**Authentication:** Bearer token + workspace membership

**Query Parameters:** dateFrom, dateTo, metric (views, submissions, conversion), limit (default: 5)

**Response:** `200 OK`

---

# Theme Endpoints

## GET /api/v1/themes

List available themes.

**Authentication:** Bearer token + workspace membership

**Query Parameters:** scope (system, workspace, all — default: all)

**Response:** `200 OK` (paginated)

---

## GET /api/v1/themes/:id

Get theme details with full token definition.

**Authentication:** Bearer token + workspace membership

**Response:** `200 OK`

---

## POST /api/v1/themes

Create a custom theme.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "name": "My Brand Theme",
  "tokens": { }
}
```

**Response:** `201 Created`

---

## PATCH /api/v1/themes/:id

Update theme tokens.

**Authentication:** Bearer token + Editor role (workspace themes only)

**Response:** `200 OK`

---

## POST /api/v1/themes/:id/duplicate

Duplicate a theme to workspace.

**Authentication:** Bearer token + Editor role

**Response:** `201 Created`

---

## DELETE /api/v1/themes/:id

Soft delete a workspace theme.

**Authentication:** Bearer token + Admin role

**Response:** `204 No Content`

---

# Template Endpoints

## GET /api/v1/templates

Browse template marketplace.

**Authentication:** Bearer token (optional for public templates)

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| category | string | Template category |
| type | string | Widget type |
| search | string | Search by name/description |
| page, limit | integer | Pagination |

**Response:** `200 OK` (paginated)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Healthcare Lead Form",
      "description": "Professional lead capture for healthcare providers",
      "category": "HEALTHCARE",
      "type": "LEAD_FORM",
      "thumbnailUrl": "https://...",
      "usageCount": 1240
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 48, "totalPages": 2 }
}
```

---

## GET /api/v1/templates/:id

Get template details with preview schema.

**Authentication:** Bearer token

**Response:** `200 OK`

---

## POST /api/v1/templates/:id/import

Import template into workspace as new widget.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "name": "My Healthcare Form"
}
```

**Response:** `201 Created` (new widget with template schema)

---

# AI Endpoints

## POST /api/v1/ai/generate

Generate a widget from natural language.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "prompt": "Create a lead generation widget for a dental clinic",
  "widgetType": "LEAD_FORM"
}
```

**Validation:** prompt required, 10–2000 characters

**Response:** `200 OK`

```json
{
  "data": {
    "schema": { },
    "theme": { },
    "explanation": "Created a clean, professional lead form with name, email, and phone fields optimized for healthcare conversion.",
    "suggestions": [
      { "id": "s1", "type": "reduce_fields", "message": "Consider removing phone field to increase conversion" }
    ]
  }
}
```

---

## POST /api/v1/ai/suggest

Get AI suggestions for current widget.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "widgetId": "uuid",
  "context": {
    "selectedElementId": "field-email",
    "intent": "improve_conversion"
  }
}
```

**Response:** `200 OK`

```json
{
  "data": {
    "suggestions": [
      {
        "id": "s1",
        "type": "improve_cta",
        "message": "Change CTA to 'Book Free Consultation' for higher conversion",
        "changes": { },
        "confidence": 0.85
      }
    ]
  }
}
```

---

## POST /api/v1/ai/copy

Generate copywriting for widget elements.

**Authentication:** Bearer token + Editor role

**Request:**

```json
{
  "widgetId": "uuid",
  "elementId": "title",
  "intent": "professional",
  "industry": "healthcare"
}
```

**Response:** `200 OK`

```json
{
  "data": {
    "suggestions": [
      "Schedule Your Dental Consultation",
      "Book Your Appointment Today",
      "Get Expert Dental Care"
    ]
  }
}
```

---

# Public / Runtime Endpoints

These endpoints serve the Widget Runtime. No user authentication required.

## GET /api/v1/public/widgets/:embedToken/config

Get published widget public configuration.

**Authentication:** Embed token (in URL)

**Response:** `200 OK`

```json
{
  "data": {
    "schema": { },
    "theme": { },
    "version": 1,
    "publishedAt": "2026-08-03T10:10:00Z"
  }
}
```

**Cache:** 5 minutes (Cache-Control header)

**Errors:** `404` invalid or unpublished token

---

## POST /api/v1/public/widgets/:embedToken/submit

Submit form data from Widget Runtime.

**Authentication:** Embed token (in URL)

**Rate Limit:** 10 submissions per minute per IP

**Request:**

```json
{
  "fields": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "pageUrl": "https://example.com",
    "referrer": "https://google.com"
  }
}
```

**Validation:** Fields validated against widget schema field definitions

**Response:** `201 Created`

```json
{
  "data": {
    "success": true,
    "message": "Thank you for your submission!"
  }
}
```

**Errors:** `400` validation, `429` rate limited

---

## POST /api/v1/public/widgets/:embedToken/events

Track analytics event from Widget Runtime.

**Authentication:** Embed token (in URL)

**Rate Limit:** 100 events per minute per session

**Request:**

```json
{
  "eventType": "WIDGET_VIEWED",
  "sessionId": "anon-session-id",
  "properties": {
    "pageUrl": "https://example.com"
  }
}
```

**Response:** `204 No Content`

Fire-and-forget. Runtime does not retry failed analytics calls.

---

# Settings Endpoints

## GET /api/v1/settings/domains

List allowed embed domains.

**Authentication:** Bearer token + Admin role

**Response:** `200 OK`

---

## POST /api/v1/settings/domains

Add allowed domain.

**Authentication:** Bearer token + Admin role

**Request:**

```json
{
  "domain": "example.com"
}
```

**Response:** `201 Created`

---

## GET /api/v1/settings/api-keys

List API keys.

**Authentication:** Bearer token + Admin role

**Response:** `200 OK` (prefix only, never full key)

---

## POST /api/v1/settings/api-keys

Create API key.

**Authentication:** Bearer token + Admin role

**Request:**

```json
{
  "name": "Production Integration",
  "permissions": ["widgets:read", "submissions:read"]
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "name": "Production Integration",
    "key": "wp_live_abc123...",
    "prefix": "wp_live_",
    "permissions": ["widgets:read", "submissions:read"],
    "createdAt": "2026-08-03T10:00:00Z"
  }
}
```

Full key returned only on creation. Store immediately.

---

## DELETE /api/v1/settings/api-keys/:id

Revoke API key.

**Authentication:** Bearer token + Admin role

**Response:** `204 No Content`

---

# Health Check

## GET /api/v1/health

**Authentication:** None

**Response:** `200 OK`

```json
{
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "redis": "connected",
    "uptime": 86400
  }
}
```

---

# Versioning

API version is included in the URL path: `/api/v1/`.

Breaking changes require a new version (`/api/v2/`). Non-breaking additions (new fields, new endpoints) are added to the current version.

Deprecation policy: deprecated endpoints supported for 6 months with `Deprecation` and `Sunset` headers.

---

# Best Practices

## Do

- Validate all inputs with Zod before processing
- Return consistent response envelopes
- Include pagination meta on all list endpoints
- Scope every query to workspace
- Rate limit public endpoints aggressively
- Cache public widget config responses
- Document new endpoints here before implementation

## Do Not

- Return different shapes for the same resource
- Expose internal IDs in public endpoints (use embed tokens)
- Include sensitive data in list responses
- Skip authentication on protected endpoints
- Return stack traces in error responses

---

# Acceptance Criteria

The API is production-ready when:

- [ ] All endpoints documented and implemented
- [ ] Request validation covers every input field
- [ ] Authentication enforced on all protected routes
- [ ] Authorization checks role permissions per endpoint
- [ ] Pagination works on all list endpoints
- [ ] Error responses follow consistent format
- [ ] Public endpoints rate limited
- [ ] Widget config endpoint cached
- [ ] API integration tests cover all endpoints
- [ ] OpenAPI/Swagger spec generated from this document (future)

---

# Future Evolution

## Phase 2

- Webhook endpoints for submission notifications
- Bulk widget operations (archive, delete)
- Real-time analytics via WebSocket
- OpenAPI 3.1 spec auto-generation

## Phase 3

- GraphQL endpoint for optimized frontend queries
- API versioning with `/api/v2/` for breaking changes
- Batch analytics event ingestion endpoint

## Phase 4

- Public SDK endpoints
- OAuth2 provider for third-party integrations
- Partner API with scoped access tokens

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Backend Engineering | Initial API specification |
