# Frontend Architecture

**Version:** 1.0  
**Status:** Draft  
**Owner:** Frontend Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the complete frontend architecture of Widget Platform.

It serves as the authoritative reference for how the Next.js application is structured, how data flows through the system, how the Widget Builder manages state, and how shared modules are organized.

Every frontend implementation must comply with this document, the [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), the [Design System](./DESIGN_SYSTEM.md), the [Information Architecture](./INFORMATION_ARCHITECTURE.md), and [AI Rules](./AI_RULES.md).

If a proposed implementation conflicts with this architecture, the implementation should be reconsidered.

---

# Architecture

Widget Platform is a Next.js application using the App Router with a feature-based architecture.

The frontend is divided into three primary layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  App Router · Pages · Layouts · Route Groups · Middleware   │
├─────────────────────────────────────────────────────────────┤
│                       Feature Layer                          │
│  Dashboard · Widgets · Builder · Analytics · Settings · AI  │
├─────────────────────────────────────────────────────────────┤
│                        Shared Layer                          │
│  UI Components · Hooks · Services · Types · Utils · Providers│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Backend REST API
                    Widget Runtime CDN
```

The application communicates with a separate Express backend via REST APIs. The Widget Builder and Live Preview share the same Widget Schema and rendering pipeline as the Widget Runtime to guarantee visual parity.

---

# Responsibilities

## Application Layer

- Route definition and navigation
- Authentication boundaries
- Global layout composition
- Server-side data fetching where appropriate
- Error boundaries at route level
- Metadata and SEO for public pages

## Feature Layer

- Page-specific UI and orchestration
- Feature-scoped hooks and services
- Feature-local state that does not belong in global stores
- Feature-specific components not reused elsewhere

## Shared Layer

- Reusable UI components (`components/ui/`)
- Layout components (`components/layout/`)
- Cross-feature hooks
- API client services
- Shared TypeScript types and interfaces
- Utility functions
- Global context providers

## Widget Builder (Critical Subsystem)

The Builder is the most complex frontend subsystem. It owns:

- Builder Store (centralized state engine)
- Live Preview rendering pipeline
- Property Inspector synchronization
- Navigator component tree
- History and undo/redo engine
- Auto-save and draft recovery
- Validation engine
- Publishing workflow UI

The Builder must never scatter widget editing state across unrelated components.

---

# Principles

## 1. Feature-Based Architecture

Code is organized by product feature, not by technical type.

```
features/
  dashboard/
  widgets/
  builder/
  analytics/
  submissions/
  templates/
  themes/
  ai/
  settings/
```

Each feature owns its pages, components, hooks, services, and types. Shared code lives in `components/`, `hooks/`, `lib/`, and `types/`.

Business logic must never live inside React components. Pages orchestrate; hooks and services execute.

---

## 2. Unidirectional Data Flow

All Builder state flows in one direction:

```
User Interaction
      ↓
Builder Store
      ↓
Widget Schema
      ↓
Live Preview + Property Inspector + Navigator
      ↓
History Engine
      ↓
Persistence (API)
```

Components are views. They read from stores and dispatch actions. They never own authoritative widget data.

---

## 3. Schema-Driven Rendering

The Widget Schema is the single source of truth for widget structure, content, behavior, and appearance.

The Builder edits the schema. The Preview renders the schema. The Runtime renders the same schema in production.

Never generate or edit HTML directly inside the Builder.

---

## 4. Composition Over Duplication

Reuse existing components before creating new ones. Prefer shadcn/ui primitives. Extract shared logic into hooks and services.

Target component size: 50–250 lines. Extract when a component exceeds this range.

---

## 5. Progressive Enhancement

Core functionality works without JavaScript where possible (public pages, login). The Builder and authenticated experiences are client-rendered with optimistic updates and skeleton loading.

---

## 6. Performance as a Product Feature

Preview updates target ≤16ms. Lazy load heavy features. Code split by route and by feature. Never block the main thread during editing.

---

## 7. Accessibility First

Every interactive element must be keyboard accessible, have visible focus states, and include proper ARIA labels where semantic HTML is insufficient.

---

# Next.js App Router Architecture

## Route Groups

The application uses Next.js App Router with route groups to separate authenticated and public experiences.

```
app/
├── layout.tsx                    # Root layout (fonts, providers, metadata)
├── page.tsx                      # Landing / redirect
├── login/
│   └── page.tsx
├── playground/
│   └── page.tsx                  # Public demo (no auth)
└── (app)/                        # Authenticated route group
    ├── layout.tsx                # App shell (sidebar, topbar)
    ├── dashboard/
    │   └── page.tsx
    ├── widgets/
    │   ├── page.tsx
    │   ├── create/
    │   │   └── page.tsx
    │   └── [id]/
    │       ├── page.tsx
    │       ├── edit/
    │       │   └── page.tsx
    │       └── embed/
    │           └── page.tsx
    ├── builder/
    │   └── [widgetId]/
    │       └── page.tsx
    ├── templates/
    │   └── page.tsx
    ├── themes/
    │   └── page.tsx
    ├── analytics/
    │   └── page.tsx
    ├── submissions/
    │   └── page.tsx
    ├── ai/
    │   └── page.tsx
    └── settings/
        └── page.tsx
```

Route groups `(app)` do not affect URL paths. They enable shared layouts without URL nesting.

---

## Rendering Strategy

| Route Category | Strategy | Rationale |
|---|---|---|
| Landing, Login | Server Components | SEO, fast initial load |
| Dashboard, Widgets, Analytics | Server Components + Client islands | Data fetching on server, interactivity where needed |
| Builder | Client Components | Real-time editing, store-driven |
| Playground | Client Components | Interactive demo |
| Settings | Mixed | Forms and static content |

Use `'use client'` only when the component requires browser APIs, event handlers, or reactive state.

---

## Middleware

Next.js middleware handles:

- Authentication redirects (unauthenticated → `/login`)
- Workspace context injection via headers or cookies
- Rate limiting headers for API proxy routes (future)

Middleware must remain lightweight. No database queries in middleware.

---

## Data Fetching

### Server Components

Use Server Components for initial page data:

- Dashboard metrics
- Widget list
- Submission counts
- Settings metadata

Fetch via internal API client or direct service calls. Pass data as props to Client Components.

### Client Components

Use client-side fetching for:

- Real-time analytics updates
- Builder auto-save
- Search and filtering with debounce
- Infinite scroll pagination

Prefer TanStack Query (future) or custom hooks wrapping the API client for cache management.

---

# Folder Structure

Complete recommended frontend structure:

```
widget-platform/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated routes
│   ├── login/
│   ├── playground/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── layout/                   # Sidebar, Topbar, AppShell
│   ├── shared/                   # CommandPalette, EmptyState, etc.
│   ├── dashboard/                # Dashboard-specific components
│   └── builder/                  # Builder subsystem components
│       ├── canvas/
│       ├── navigator/
│       ├── property-panel/
│       ├── toolbar/
│       ├── preview/
│       └── dialogs/
│
├── features/                     # Feature modules (future migration target)
│   ├── builder/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── constants/
│   ├── widgets/
│   ├── analytics/
│   └── ...
│
├── hooks/                        # Shared hooks
│   ├── use-workspace.ts
│   ├── use-debounce.ts
│   └── use-media-query.ts
│
├── lib/                          # Utilities and clients
│   ├── api-client.ts
│   ├── cn.ts
│   └── formatters.ts
│
├── providers/                    # React context providers
│   ├── theme-provider.tsx
│   ├── workspace-provider.tsx
│   └── toast-provider.tsx
│
├── stores/                       # Global Zustand stores
│   └── builder/
│       ├── builder-store.ts
│       ├── selection-store.ts
│       ├── history-store.ts
│       ├── theme-store.ts
│       ├── schema-store.ts
│       ├── validation-store.ts
│       └── publishing-store.ts
│
├── types/                        # Shared TypeScript types
│   ├── widget-schema.ts
│   ├── theme.ts
│   ├── api.ts
│   └── workspace.ts
│
├── services/                     # API service layer
│   ├── widget-service.ts
│   ├── analytics-service.ts
│   ├── submission-service.ts
│   ├── theme-service.ts
│   ├── template-service.ts
│   └── ai-service.ts
│
└── constants/                    # Application constants
    ├── routes.ts
    └── widget-types.ts
```

Current implementation places feature components directly under `components/`. As features grow, migrate to the `features/` directory without changing public APIs.

---

# Feature-Based Architecture

Each feature module follows the same internal structure:

```
features/builder/
├── components/       # Feature-specific UI
├── hooks/            # Feature-specific hooks
├── stores/           # Feature-specific state
├── services/         # Feature API calls
├── schemas/          # Zod validation schemas
├── types/            # Feature types
├── constants/        # Feature constants
└── utils/            # Feature utilities
```

## Feature Boundaries

| Feature | Owns | Does NOT Own |
|---|---|---|
| Dashboard | Overview metrics, quick actions, activity feed | Widget editing |
| Widgets | CRUD, list, filter, status management | Schema editing |
| Builder | Visual editing, preview, publish | Submission management |
| Analytics | Charts, metrics, trends | Widget configuration |
| Submissions | Lead data, export, detail view | Analytics aggregation |
| Templates | Browse, preview, import | Theme customization |
| Themes | Browse, apply, duplicate | Widget content |
| AI | Generation, suggestions, copywriting | Direct schema mutation without user consent |
| Settings | Workspace, team, domains, API keys | Widget or theme data |

Features communicate through shared services and types, never through direct component imports across feature boundaries (except shared layer).

---

# Shared Modules

## UI Components (`components/ui/`)

shadcn/ui-based primitives built on Base UI and Tailwind CSS. These are presentation-only. No business logic.

Current inventory: Button, Input, Textarea, Card, Dialog, Dropdown Menu, Select, Tabs, Table, Badge, Skeleton, Tooltip, Popover, Switch, Slider, Avatar, Progress, Command, Label, Separator, Scroll Area, Toggle, Input Group.

See [Component Library](./05_COMPONENT_LIBRARY.md) for full specifications.

## Layout Components (`components/layout/`)

- `Sidebar` — Primary navigation, workspace context
- `Topbar` — Breadcrumbs, search, notifications, profile, theme switch

## Shared Components (`components/shared/`)

- `CommandPalette` — Global search and actions (Ctrl+K)
- Empty states, error states, loading wrappers (future)

## API Client (`lib/api-client.ts`)

Centralized HTTP client for backend communication.

```typescript
// Conceptual interface
interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>
  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  delete(path: string, options?: RequestOptions): Promise<void>
}
```

Responsibilities:

- Attach authentication tokens
- Attach workspace context headers
- Normalize error responses
- Handle 401 redirects
- Support request cancellation

## Type System (`types/`)

All shared interfaces live in `types/`. Feature-specific types live in feature directories.

Critical shared types:

- `WidgetSchema` — Complete widget definition
- `ThemeConfig` — Theme token overrides
- `Workspace` — Multi-tenant workspace
- `ApiResponse<T>` — Standard API envelope
- `PaginatedResponse<T>` — Paginated list responses

Never use `any`. Prefer strict typing with reusable interfaces.

---

# Component Hierarchy

## Application Shell

```
RootLayout
├── ThemeProvider
├── WorkspaceProvider
├── ToastProvider
└── AppLayout (authenticated)
    ├── Sidebar
    ├── Topbar
    │   ├── Breadcrumb
    │   ├── WorkspaceSelector
    │   ├── GlobalSearch
    │   ├── Notifications
    │   ├── ThemeSwitch
    │   └── UserProfile
    ├── MainContent (page)
    └── CommandPalette
```

## Widget Builder

```
BuilderPage
├── BuilderToolbar
│   ├── BackButton
│   ├── UndoRedo
│   ├── DevicePreview
│   ├── SaveDraft
│   ├── Publish
│   └── WidgetStatus
├── BuilderLayout (three-panel)
│   ├── LeftPanel (Navigator)
│   │   ├── SectionTabs
│   │   └── ComponentTree
│   ├── CenterPanel (Canvas)
│   │   ├── PreviewFrame
│   │   ├── SelectionOverlay
│   │   ├── HoverOverlay
│   │   └── ZoomControls
│   └── RightPanel (Property Inspector)
│       ├── PropertyGroups
│       └── ContextActions
└── BuilderDialogs
    ├── PublishDialog
    ├── EmbedCodeDialog
    └── CrashRecoveryDialog
```

## Dashboard

```
DashboardPage
├── StatsCards
├── VisitorsChart
├── TopPerforming
├── RecentActivity
└── QuickActions
```

Component hierarchy follows progressive disclosure. Never render all controls simultaneously in the Builder.

---

# Context Providers

## ThemeProvider

Manages application dark/light mode preference.

- Dark mode is the default experience
- Persists preference to localStorage
- Applies `class="dark"` to document root
- All components consume semantic tokens, never raw colors

## WorkspaceProvider

Manages active workspace context.

- Current workspace ID and metadata
- Workspace switching
- Permission context for UI gating
- Injected into API client headers

## ToastProvider

Wraps Sonner toast library.

- Global success, error, warning, info notifications
- Used after publish, save, delete, and API errors

## BuilderProvider (Builder-scoped)

Scoped to the Builder route. Initializes Builder Store with widget data.

- Loads widget schema on mount
- Sets up auto-save interval
- Registers beforeunload handler for dirty state
- Cleans up on unmount

Prefer Zustand stores over Context for Builder state due to update frequency and performance requirements.

---

# Builder State Management

The Widget Builder uses a centralized state engine divided into logical store modules.

## Store Architecture

```
BuilderStore (facade)
├── SchemaStore        # Widget Schema (authoritative)
├── SelectionStore     # Selected and hovered elements
├── HistoryStore       # Undo/redo command stack
├── ThemeStore         # Active theme configuration
├── ValidationStore    # Real-time validation state
├── PublishingStore    # Publish workflow state
└── AIStore            # AI generation and suggestions
```

Each module exposes a public API. Internal state is not accessed directly from components.

## SchemaStore

The authoritative store for widget data.

Contains:

- Widget metadata (id, name, type, status)
- Theme configuration
- Layout definition
- Content (title, subtitle, description)
- Component tree (fields, buttons, footer)
- Behavior settings
- Trigger configuration
- Localization
- Analytics configuration

Only SchemaStore mutations trigger Preview re-renders.

## SelectionStore

Tracks UI selection state (non-persistent):

- `selectedElementId: string | null`
- `hoveredElementId: string | null`
- `focusedPropertyKey: string | null`

Selection changes do not create history entries.

## HistoryStore

Implements Command Pattern for undo/redo.

Every meaningful mutation creates an immutable command:

```typescript
interface Command {
  execute(): void
  undo(): void
  redo(): void
  description: string
}
```

History ignores hover, focus, and temporary UI state.

Targets: Undo ≤50ms, Redo ≤50ms.

## ValidationStore

Real-time validation against Widget Schema rules.

- Field-level validation on blur
- Schema-level validation on publish
- Warning vs error severity
- Blocks publish on errors

## PublishingStore

Manages publish workflow state:

- `isDirty: boolean`
- `isSaving: boolean`
- `lastSavedAt: Date | null`
- `publishStatus: 'idle' | 'validating' | 'publishing' | 'published' | 'error'`

## State Management Decision Tree

```
Is state local to one component?
  → useState / useReducer

Is state shared within one feature but infrequent?
  → React Context

Is state shared with high update frequency (Builder)?
  → Zustand store module

Is state server-derived?
  → Server Component fetch + client cache
```

---

# Hooks

## Shared Hooks

| Hook | Purpose |
|---|---|
| `useWorkspace()` | Access current workspace from provider |
| `useDebounce(value, delay)` | Debounce search and auto-save inputs |
| `useMediaQuery(query)` | Responsive breakpoint detection |
| `useKeyboardShortcut(keys, handler)` | Register global and Builder shortcuts |
| `useIntersectionObserver(ref)` | Infinite scroll, lazy loading |

## Builder Hooks

| Hook | Purpose |
|---|---|
| `useBuilderStore(selector)` | Subscribe to Builder Store slices |
| `useSelectedElement()` | Current selection with schema node |
| `useWidgetSchema()` | Read-only schema access |
| `useHistory()` | Undo, redo, canUndo, canRedo |
| `useAutoSave()` | Auto-save lifecycle management |
| `usePropertyEditor(key)` | Two-way binding for property values |
| `useDragAndDrop()` | dnd-kit integration for field reorder |
| `usePreviewDevice()` | Desktop/tablet/mobile preview mode |
| `useValidation()` | Validation state for current selection |

## Feature Hooks

| Hook | Purpose |
|---|---|
| `useWidgets(filters)` | Fetch and filter widget list |
| `useAnalytics(dateRange)` | Analytics data with date range |
| `useSubmissions(filters)` | Submission list with pagination |
| `useTemplates(category)` | Template marketplace data |
| `useThemes()` | Theme gallery data |
| `useAIAssistant()` | AI generation and suggestion flow |

Hooks encapsulate business logic. Components call hooks; hooks call services.

---

# Services

Services are pure async functions that communicate with the backend API. No React dependencies.

## Service Layer

```
services/
├── widget-service.ts       # Widget CRUD, publish, duplicate
├── submission-service.ts   # Submission list, export, detail
├── analytics-service.ts    # Metrics, trends, funnels
├── theme-service.ts        # Theme CRUD, apply, export
├── template-service.ts     # Template browse, import
├── ai-service.ts           # AI generation, suggestions
├── workspace-service.ts    # Workspace settings, team
└── auth-service.ts         # Login, logout, token refresh
```

## Service Pattern

```typescript
// services/widget-service.ts
export const widgetService = {
  list(params: WidgetListParams): Promise<PaginatedResponse<WidgetSummary>>,
  getById(id: string): Promise<WidgetDetail>,
  create(data: CreateWidgetInput): Promise<WidgetDetail>,
  update(id: string, data: UpdateWidgetInput): Promise<WidgetDetail>,
  updateSchema(id: string, schema: WidgetSchema): Promise<WidgetDetail>,
  publish(id: string): Promise<PublishResult>,
  duplicate(id: string): Promise<WidgetDetail>,
  archive(id: string): Promise<void>,
  delete(id: string): Promise<void>,
}
```

Services throw typed errors (`ApiError`) that hooks and components handle uniformly.

---

# Data Flow

## Standard Page Flow

```
Server Component (page.tsx)
      ↓ fetch initial data
Service Layer
      ↓ HTTP
Backend API
      ↓ response
Props → Client Component
      ↓ user interaction
Hook → Service → API
      ↓ optimistic update / refetch
UI Update
```

## Builder Data Flow

```
BuilderPage mount
      ↓
widgetService.getById(widgetId)
      ↓
SchemaStore.initialize(schema)
      ↓
Preview renders schema
      ↓
User edits property in Inspector
      ↓
SchemaStore.updateProperty(path, value)
      ↓
ValidationStore.validate(path, value)
      ↓
HistoryStore.record(command)
      ↓
Preview re-renders (≤16ms target)
      ↓
AutoSave debounce (10s / blur / leave)
      ↓
widgetService.updateSchema(id, schema)
```

## Publish Flow

```
User clicks Publish
      ↓
ValidationStore.validateAll()
      ↓ (pass)
PublishingStore.setStatus('publishing')
      ↓
widgetService.publish(id)
      ↓
Backend generates embed token + public config
      ↓
PublishingStore.setStatus('published')
      ↓
Toast success + EmbedCodeDialog
```

---

# Code Splitting

## Route-Level Splitting

Next.js App Router automatically code-splits by route. Each page in `app/` becomes a separate chunk.

Heavy routes that benefit from explicit splitting:

- `/builder/[widgetId]` — Builder subsystem (~largest bundle)
- `/analytics` — Recharts dependency
- `/ai` — AI chat interface

## Component-Level Splitting

Use `next/dynamic` for heavy components loaded on demand:

```typescript
const AnalyticsChart = dynamic(
  () => import('@/components/analytics/visitors-chart'),
  { loading: () => <ChartSkeleton /> }
)
```

Apply to:

- Chart components (Recharts)
- AI Assistant panel
- Color picker
- Code editor (Developer Mode)
- Template preview modal

## Builder Splitting Strategy

The Builder loads as a single route chunk but internally lazy-loads:

- Developer Mode panels
- AI Assistant panel
- Advanced property groups
- JSON schema viewer

Never lazy-load core Builder panels (Navigator, Canvas, Inspector).

---

# Performance Strategy

## Rendering Performance

| Target | Metric |
|---|---|
| Preview update | ≤16ms |
| Selection update | ≤8ms |
| Property update | ≤16ms |
| Theme switch | ≤100ms |
| Builder initial load | <2s |
| Undo/redo | ≤50ms |

## Optimization Techniques

**Selector-based subscriptions.** Builder components subscribe to specific store slices via selectors. Never subscribe to the entire store.

**Memoization.** Use `React.memo` for Preview sub-trees that do not change on every property update. Memoize expensive schema traversals.

**Virtualization.** Component tree in Navigator virtualizes when widget exceeds 50 nodes.

**Debounced persistence.** Auto-save debounces at 10 seconds. Property updates do not trigger API calls.

**Web Workers (future).** Schema validation and theme computation may move to Web Workers for complex widgets.

## Bundle Budget

| Chunk | Target Size (gzip) |
|---|---|
| Main application shell | <150KB |
| Builder route | <300KB |
| Analytics route | <200KB |
| Shared UI components | <100KB |

Monitor with `@next/bundle-analyzer` in CI.

## Image and Font Optimization

- Use `next/font` for Inter (already configured)
- Lucide icons imported individually (`import { Plus } from 'lucide-react'`)
- No external image dependencies in MVP

---

# Error Boundaries

## Route-Level Boundaries

Every major route group has an error boundary:

```
app/(app)/error.tsx          # Authenticated app errors
app/(app)/builder/error.tsx  # Builder-specific recovery
app/playground/error.tsx     # Public demo errors
```

Error boundaries display human-readable messages with retry actions. Never expose stack traces to users.

## Builder Error Recovery

The Builder implements specialized recovery (see Builder Spec Appendix H):

| Failure | Recovery |
|---|---|
| Preview crash | Restart Preview button |
| Auto-save failure | Retry with exponential backoff |
| Network failure | Offline draft in localStorage |
| Invalid schema | Restore previous version from history |
| Unexpected exception | Crash Recovery Dialog |

## API Error Handling

Services normalize backend errors into `ApiError`:

```typescript
interface ApiError {
  code: string
  message: string          // Human-readable
  status: number
  details?: Record<string, string[]>
}
```

Components display errors via toast (transient) or inline (form validation).

---

# Accessibility Strategy

## Standards

- WCAG 2.1 AA minimum
- Keyboard-only workflow must be fully functional
- Screen reader compatibility verified before release

## Implementation Requirements

**Semantic HTML.** Use native elements (`button`, `input`, `nav`, `main`, `section`) before ARIA roles.

**Focus management.** Dialogs and drawers trap focus. Builder shortcuts do not break tab order. ESC clears selection and closes overlays.

**Visible focus.** All interactive elements display focus rings using the `Focus` semantic token.

**ARIA labels.** Icon buttons require `aria-label`. Builder component tree uses `aria-selected`, `aria-expanded`. Live Preview uses `aria-live="polite"` for dynamic content.

**Reduced motion.** Respect `prefers-reduced-motion`. Disable non-essential animations when enabled.

**Color contrast.** All text meets 4.5:1 ratio against backgrounds. Never rely on color alone for status communication.

**Accessible drag and drop.** dnd-kit provides keyboard alternatives for field reordering. Announce drop results to screen readers.

## Builder Accessibility Matrix

Every Builder feature must support: keyboard navigation, screen reader labels, focus visibility, reduced motion, ARIA attributes, semantic HTML, color contrast, and accessible drag and drop.

---

# Testing Strategy

See [Testing Strategy](./16_TESTING_STRATEGY.md) for complete details.

Frontend-specific testing layers:

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | Hooks, services, utils, store modules |
| Component | Testing Library + Vitest | UI components, Builder panels |
| Integration | Testing Library | Feature flows (create widget, publish) |
| E2E | Playwright | Critical user journeys |
| Accessibility | axe-core + Playwright | WCAG compliance |
| Visual | Chromatic (future) | Component regression |

## Critical Test Paths

1. Widget creation → Builder editing → Publish → Embed code
2. Undo/redo preserves schema integrity
3. Auto-save recovers after simulated crash
4. Preview matches Runtime output (schema parity)
5. Keyboard-only Builder workflow
6. Responsive layout at desktop, tablet, mobile breakpoints

---

# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` — use `unknown` with type guards when necessary
- Prefer interfaces for object shapes, types for unions
- Export types from dedicated `types/` files

## Components

- Functional components only
- Named exports for components, default exports for pages
- Props interface defined above component
- Destructure props in function signature
- 50–250 lines target per component

## Styling

- Tailwind CSS utility classes
- Semantic design tokens only (never raw hex)
- Use `cn()` utility for conditional classes
- Dark-first: design for dark mode, verify light mode

## Imports

Order: React → Next.js → external libraries → internal aliases (`@/`) → relative imports → types.

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `PropertyPanel.tsx` |
| Hooks | camelCase with `use` prefix | `useBuilderStore.ts` |
| Services | camelCase | `widgetService.ts` |
| Types/Interfaces | PascalCase | `WidgetSchema` |
| Constants | SCREAMING_SNAKE_CASE | `WIDGET_TYPES` |
| Files | kebab-case | `property-panel.tsx` |
| Store modules | camelCase with `Store` suffix | `schemaStore.ts` |

## Git Commits

Conventional Commits format:

```
feat(builder): add inline text editing
fix(preview): resolve theme override rendering
refactor(analytics): extract chart hooks
docs: update frontend architecture
```

---

# Best Practices

## Do

- Read from Builder Store; never duplicate widget state in component state
- Use Server Components for data fetching when possible
- Lazy load heavy routes and components
- Validate props with TypeScript, validate API inputs with Zod
- Keep Preview and Runtime rendering pipelines identical
- Update documentation when architecture changes
- Use skeleton loading for all async content
- Test keyboard navigation for every new interactive feature

## Do Not

- Put business logic in components or pages
- Create duplicate UI components — check `components/ui/` first
- Use raw color values — always use semantic tokens
- Subscribe to entire Zustand stores — use selectors
- Fetch data in useEffect when Server Components can prefetch
- Introduce modal-heavy workflows in the Builder
- Skip error boundaries on new routes
- Use `any` type anywhere in the codebase

---

# Acceptance Criteria

The frontend architecture is considered production-ready when:

- [ ] All routes match the Information Architecture route structure
- [ ] Feature-based folder structure is established with clear boundaries
- [ ] Builder Store drives all widget editing with unidirectional data flow
- [ ] Live Preview renders identical output to Widget Runtime
- [ ] Auto-save prevents data loss with offline draft recovery
- [ ] Undo/redo preserves schema integrity across all operations
- [ ] All pages include skeleton loading, error states, and empty states
- [ ] Keyboard-only workflow is functional across the entire application
- [ ] Performance targets are met (Preview ≤16ms, Builder load <2s)
- [ ] No TypeScript errors in strict mode
- [ ] No duplicated components or business logic
- [ ] API client handles authentication, workspace context, and errors uniformly
- [ ] Code splitting keeps initial bundle within budget
- [ ] All interactive elements meet WCAG AA standards
- [ ] Documentation remains synchronized with implementation

---

# Future Evolution

## Phase 2 — State Management Maturity

- Adopt TanStack Query for server state caching and invalidation
- Migrate feature components from `components/` to `features/` directory
- Introduce optimistic updates for widget list operations

## Phase 3 — Real-Time Collaboration

- WebSocket connection for Builder presence indicators
- CRDT-based schema synchronization (compatible with current SchemaStore design)
- Conflict resolution UI

## Phase 4 — Micro-Frontend Architecture

- Widget Runtime as independently deployable package
- Builder Renderer extracted to shared npm package
- Plugin system for custom Builder panels

## Phase 5 — Edge Rendering

- Public widget configuration served from CDN edge
- Analytics ingestion at edge for reduced latency
- Geo-routed Runtime delivery

The current architecture anticipates these evolutions through schema-driven rendering, modular store design, and feature isolation.

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Frontend Engineering | Initial frontend architecture specification |
