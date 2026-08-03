# Template Marketplace Specification

**Version:** 1.0  
**Status:** Draft  
**Owner:** Product Team  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the architecture, categories, import flow, and management of the Template Marketplace — the catalog of professionally designed widget templates that accelerate widget creation.

Templates provide industry-specific starting points. Users import a template into their workspace and customize it in the Visual Builder.

Related documents: [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), [Information Architecture](./INFORMATION_ARCHITECTURE.md), [AI Assistant Specification](./11_AI_ASSISTANT_SPECIFICATION.md), [Database Design](./08_DATABASE_DESIGN.md).

---

# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Template Marketplace                        │
│                                                             │
│  Catalog → Search/Filter → Preview → Import → Builder       │
├─────────────────────────────────────────────────────────────┤
│                  Template Storage                            │
│  System Templates (global) · User Templates (future)         │
└─────────────────────────────────────────────────────────────┘
```

Templates are pre-built Widget Schemas with default themes, stored in the database and served via the Templates API.

---

# Responsibilities

- Provide professionally designed widget starting points
- Organize templates by category and widget type
- Enable search and filtering
- Support template preview before import
- Handle template import into workspace as new widget
- Track template usage analytics
- Support template versioning

---

# Principles

## 1. Production-Ready

Every template must be publishable as-is. Templates include complete schema, theme, copy, and behavior configuration.

## 2. Industry-Specific

Templates target specific industries and use cases rather than generic layouts.

## 3. Customizable

Imported templates open in the Builder as fully editable widgets. Nothing is locked.

## 4. Curated Quality

System templates are designed and reviewed by the product team. Quality over quantity.

## 5. AI-Compatible

AI Assistant can recommend templates based on user prompts and import them programmatically.

---

# Categories

| Category | Description | Example Templates |
|---|---|---|
| LEAD_GENERATION | Lead capture forms | SaaS Demo Request, Real Estate Inquiry, Insurance Quote |
| NEWSLETTER | Email signup widgets | Minimal Newsletter, E-commerce Signup, Blog Subscription |
| FEEDBACK | Customer feedback collection | NPS Survey, Product Feedback, Service Rating |
| SUPPORT | Customer support widgets | Help Request, Live Chat Trigger, FAQ Contact |
| APPOINTMENT | Booking and scheduling | Medical Appointment, Salon Booking, Consultation Request |
| ECOMMERCE | E-commerce specific | Abandoned Cart, Product Inquiry, Back in Stock Alert |
| SAAS | SaaS product widgets | Free Trial Signup, Feature Request, Changelog Subscribe |
| HEALTHCARE | Healthcare industry | Patient Intake, Appointment Booking, Insurance Verification |
| RESTAURANT | Food service industry | Table Reservation, Catering Inquiry, Menu Feedback |
| REAL_ESTATE | Real estate industry | Property Inquiry, Viewing Request, Mortgage Calculator Lead |
| EVENT | Event-related | Event Registration, RSVP, Ticket Inquiry |
| OTHER | General purpose | Contact Form, Generic Popup, Simple Survey |

Each category contains 3–5 templates at launch, expanding over time.

---

# Template Structure

```typescript
interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  type: WidgetType
  schema: WidgetSchema       // Complete pre-built schema
  theme: ThemeTokens          // Default theme
  thumbnailUrl: string        // Preview image
  previewUrl?: string         // Live preview URL (future)
  tags: string[]              // Search tags
  isPublic: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}
```

Every template includes a complete Widget Schema that passes validation and can be published immediately after import (though customization is expected).

---

# Import Flow

```
Templates Page
      ↓
Browse / Search / Filter
      ↓
Select Template
      ↓
Preview (modal or drawer)
      ↓
Click "Use Template"
      ↓
Name Widget (pre-filled from template name)
      ↓
POST /api/v1/templates/:id/import
      ↓
Backend creates new Widget with template schema
      ↓
Redirect to Builder (/builder/:widgetId)
      ↓
User customizes in Visual Builder
```

## Import Behavior

- Creates a new widget in the user's workspace (never modifies the template)
- Copies complete schema and theme from template
- Generates new UUIDs for all component nodes
- Sets widget status to DRAFT
- Increments template usageCount
- Pre-fills widget name (editable by user before import)

## Import from AI

AI Assistant can recommend and import templates:

```
User: "Create a demo request form for a SaaS startup"
      ↓
AI identifies matching template: "SaaS Demo Request"
      ↓
AI explains: "Starting from the SaaS Demo Request template
which includes name, email, company, and role fields."
      ↓
User accepts → Template imported → Builder opens
```

---

# Preview

## Preview Modal

Before importing, users preview the template:

```
┌─────────────────────────────────────────────────┐
│  SaaS Demo Request                          ✕   │
│  Category: SaaS · Type: Lead Form                 │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │     [Live Template Preview Render]       │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Request a demo of our product. Fill in your    │
│  details and we'll schedule a call.             │
│                                                 │
│  Fields: Name, Email, Company, Role             │
│  Used by 1,240 workspaces                       │
│                                                 │
│  [Use Template]  [Cancel]                         │
└─────────────────────────────────────────────────┘
```

Preview renders the template schema using the same Renderer as the Builder Preview. Visual output is identical to what the user will see after import.

## Preview Sources

- **MVP:** Rendered client-side from template schema
- **Future:** Pre-generated thumbnail images + live preview iframe

---

# Search

## Search Implementation

Full-text search across template name, description, and tags.

```
GET /api/v1/templates?search=dental+clinic
```

Search results ranked by:

1. Exact name match
2. Tag match
3. Description match
4. Usage count (popularity boost)

## Search UI

Search input in Templates page header. Results update as user types (debounced 300ms). Empty search shows full catalog.

Command Palette (Ctrl+K) also searches templates globally.

---

# Filtering

## Filter Parameters

| Filter | Options |
|---|---|
| category | All categories |
| type | All widget types |
| sort | popular (usageCount), newest (createdAt), name |

## Filter UI

Horizontal filter bar below search:

```
[All Categories ▾]  [All Types ▾]  [Sort: Popular ▾]
```

Active filters displayed as removable badges. Clear all filters button when multiple active.

---

# Publishing

## System Templates

Created and managed by the Widget Platform team:

- Designed in the Builder using Developer Mode
- Reviewed for quality, accessibility, and conversion optimization
- Published to marketplace via admin tooling (future)
- Cannot be edited by users (only duplicated into workspace)

## User Templates (Future)

Users will be able to publish their widgets as templates:

- Save widget as template (from widget actions menu)
- Choose visibility: private (workspace only) or public (marketplace)
- Community review process before public listing
- Template ownership attributed to creator

---

# Template Versioning

Templates include a version field aligned with Widget Schema versioning.

```typescript
interface Template {
  // ...
  schemaVersion: number
  version: string          // Semantic version "1.0.0"
  changelog?: string
}
```

## Version Behavior

- Importing a template always uses the latest version
- Previously imported widgets retain the schema version at time of import
- Template updates do not affect already-imported widgets
- Version history maintained for template authors (future)

## Schema Migration

When Widget Schema version increments, templates are migrated forward using the same migration pipeline as existing widgets (see Database Design).

---

# Template Ownership

| Template Type | Owner | Editable By | Visibility |
|---|---|---|---|
| System | Widget Platform | Platform team only | Public |
| Workspace | Workspace | Workspace members | Workspace only |
| Community (future) | User | Template author | Public (after review) |

System templates are the primary catalog for MVP. Workspace and community templates are future capabilities.

---

# Best Practices

## Do

- Include complete, valid Widget Schema in every template
- Provide professional copywriting appropriate to the industry
- Apply theme that matches the template's industry
- Generate thumbnail previews for visual browsing
- Test every template by importing and publishing in the Builder
- Track usage count for popularity sorting

## Do Not

- Publish templates with incomplete schemas
- Include placeholder text ("Lorem ipsum")
- Create templates that fail accessibility validation
- Duplicate existing templates with minor variations
- Allow template import to modify the source template

---

# Acceptance Criteria

The Template Marketplace is production-ready when:

- [ ] Minimum 30 system templates across all categories
- [ ] Search returns relevant results within 300ms
- [ ] Filtering by category and type works correctly
- [ ] Preview renders identically to imported widget
- [ ] Import creates new editable widget in workspace
- [ ] All imported templates pass Widget Schema validation
- [ ] Usage count increments on import
- [ ] AI Assistant can recommend and import templates
- [ ] Templates page includes empty state, loading skeleton, and error state
- [ ] All templates meet WCAG AA accessibility standards

---

# Future Evolution

## Phase 2 — Community Templates

- User-published templates with review workflow
- Template ratings and reviews
- Creator profiles and attribution
- Template collections (curated groups)

## Phase 3 — Template Marketplace Economy

- Premium templates (paid)
- Template bundles by industry
- Agency template sharing
- Template analytics (conversion rates per template)

## Phase 4 — Dynamic Templates

- Templates with conditional content based on import context
- AI-customized templates (template + AI personalization on import)
- Template A/B variants

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Product Team | Initial template marketplace specification |
