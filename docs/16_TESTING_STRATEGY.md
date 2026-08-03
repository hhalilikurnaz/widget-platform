# Testing Strategy

**Version:** 1.0  
**Status:** Draft  
**Owner:** Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the testing strategy, tools, coverage goals, and CI integration for Widget Platform.

Quality is enforced through automated testing at every layer. No feature is production-ready without corresponding tests.

Related documents: [Frontend Architecture](./04_FRONTEND_ARCHITECTURE.md), [Backend Architecture](./07_BACKEND_ARCHITECTURE.md), [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), [AI Rules](./AI_RULES.md).

---

# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Testing Pyramid                         │
│                                                             │
│                    ┌───────────┐                            │
│                    │   E2E     │  Playwright                │
│                   ┌┴───────────┴┐                           │
│                   │ Integration  │  Testing Library + Supertest│
│                  ┌┴─────────────┴┐                          │
│                  │    Component   │  Testing Library + Vitest│
│                 ┌┴───────────────┴┐                         │
│                 │      Unit        │  Vitest                 │
│                 └──────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

More tests at the bottom (fast, isolated), fewer at the top (slow, comprehensive).

---

# Responsibilities

- Define testing layers and tools for each layer
- Establish coverage goals per layer
- Specify critical test paths that must always pass
- Define CI pipeline testing requirements
- Document testing conventions and patterns

---

# Principles

1. **Test Behavior, Not Implementation** — Test what users experience, not internal details
2. **Fast Feedback** — Unit tests run in seconds; CI completes in minutes
3. **Deterministic** — Tests produce same result every run; no flaky tests
4. **Independent** — Tests do not depend on each other or external state
5. **Maintainable** — Tests are readable and updated alongside code changes
6. **Meaningful Coverage** — Coverage measures meaningful tests, not line count alone

---

# Unit Tests

## Tool

Vitest

## Scope

- Utility functions (`lib/`, `utils/`)
- Hooks (with `@testing-library/react-hooks`)
- Store modules (Builder Store slices)
- Service layer functions (mocked repositories)
- Validators (Zod schemas)
- Schema migration functions
- Theme token resolution

## Conventions

```typescript
// stores/schema-store.test.ts
describe('SchemaStore', () => {
  it('updates property at nested path', () => {
    const store = createSchemaStore(initialSchema)
    store.updateProperty('content.title', 'New Title')
    expect(store.getState().schema.content.title).toBe('New Title')
  })

  it('rejects invalid property values', () => {
    const store = createSchemaStore(initialSchema)
    expect(() => store.updateProperty('theme.colors.primary', 'not-a-color'))
      .toThrow(ValidationError)
  })
})
```

## Coverage Goal

≥90% for utilities, hooks, stores, validators, and services.

---

# Integration Tests

## Tool

Vitest + Testing Library (frontend), Vitest + Supertest (backend)

## Frontend Integration

Test feature flows with real component rendering and mocked API:

- Widget list with filtering and pagination
- Dashboard data loading and display
- Settings form submission
- Template browse and import flow

## Backend Integration

Test API endpoints with test database:

- Authentication flow (register, login, refresh, logout)
- Widget CRUD lifecycle
- Publish pipeline with validation
- Submission ingestion with spam protection
- Multi-tenant isolation (cross-workspace access denied)

## Conventions

```typescript
// Backend integration test
describe('POST /api/v1/widgets/:id/publish', () => {
  it('publishes valid widget and returns embed token', async () => {
    const widget = await createTestWidget({ status: 'DRAFT' })
    const response = await request(app)
      .post(`/api/v1/widgets/${widget.id}/publish`)
      .set('Authorization', `Bearer ${editorToken}`)
      .set('X-Workspace-Id', workspace.id)
      .expect(200)

    expect(response.body.data.embedToken).toMatch(/^wt_/)
    expect(response.body.data.status).toBe('PUBLISHED')
  })

  it('blocks publish for invalid schema', async () => {
    const widget = await createTestWidget({ schema: invalidSchema })
    await request(app)
      .post(`/api/v1/widgets/${widget.id}/publish`)
      .set('Authorization', `Bearer ${editorToken}`)
      .set('X-Workspace-Id', workspace.id)
      .expect(422)
  })
})
```

## Coverage Goal

≥80% for API endpoints and feature flows.

---

# Component Tests

## Tool

Testing Library + Vitest

## Scope

All UI components in `components/ui/` and feature components:

- Rendering with default props
- All visual states (hover, focus, disabled, loading, error)
- User interactions (click, type, select)
- Accessibility (ARIA attributes, keyboard navigation)

## Conventions

```typescript
// components/ui/button.test.tsx
describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Publish</Button>)
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<Button loading>Publish</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick handler', async () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledOnce()
  })
})
```

## Coverage Goal

≥85% for all UI components.

---

# API Tests

## Tool

Supertest + Vitest

## Scope

Every endpoint defined in the API Specification:

- Success responses with correct shape
- Validation errors with correct details
- Authentication failures (401)
- Authorization failures (403)
- Not found responses (404)
- Rate limiting (429)
- Pagination correctness

## Test Database

- Separate test database (or schema)
- Seeded before each test suite
- Cleaned after each test
- Prisma migrations applied automatically

## Coverage Goal

100% endpoint coverage (every endpoint has at least one success and one error test).

---

# E2E Tests

## Tool

Playwright

## Scope

Critical user journeys that span frontend and backend:

### Journey 1: First Widget Creation

```
Register → Create Workspace → Create Widget →
Open Builder → Edit Title → Add Field →
Apply Theme → Publish → Copy Embed Code
```

### Journey 2: Widget Editing

```
Login → Open Existing Widget → Builder →
Edit Properties → Undo → Redo →
Auto-save → Publish Changes
```

### Journey 3: Analytics Review

```
Login → Dashboard → View Metrics →
Analytics Page → Filter by Date →
View Widget Funnel
```

### Journey 4: Submission Management

```
Login → Submissions → Filter →
View Detail → Mark as Read → Export
```

### Journey 5: Template Import

```
Login → Templates → Search →
Preview → Import → Builder Opens → Customize
```

## Conventions

```typescript
// e2e/widget-creation.spec.ts
test('user creates and publishes a widget', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'TestPassword1')
  await page.click('button[type=submit]')

  await page.click('text=Create Widget')
  await page.fill('[name=name]', 'My Contact Form')
  await page.click('text=Contact')
  await page.click('button:has-text("Create")')

  await expect(page).toHaveURL(/\/builder\//)
  await page.click('button:has-text("Publish")')
  await expect(page.locator('text=Widget published')).toBeVisible()
})
```

## Coverage Goal

All 5 critical journeys pass consistently. Run on every PR.

---

# Builder Tests

Specialized tests for the Widget Builder subsystem.

## Store Tests

- SchemaStore: property updates, nested paths, validation
- HistoryStore: undo/redo, command immutability, history limits
- SelectionStore: select, deselect, hover
- ValidationStore: field validation, publish validation
- PublishingStore: state transitions

## Preview Parity Tests

Critical test ensuring Builder Preview matches Runtime output:

```typescript
describe('Preview/Runtime Parity', () => {
  const testSchemas = loadFixtureSchemas()

  for (const schema of testSchemas) {
    it(`renders ${schema.metadata.name} identically`, () => {
      const previewHTML = renderPreview(schema, defaultTheme)
      const runtimeHTML = renderRuntime(schema, defaultTheme)
      expect(normalizeHTML(previewHTML)).toEqual(normalizeHTML(runtimeHTML))
    })
  }
})
```

## Interaction Tests

- Property update reflects in Preview within 16ms
- Drag and drop reorders fields correctly
- Inline text editing synchronizes with store
- Theme switch propagates to all components
- Device preview changes layout without changing content

## Auto-Save Tests

- Changes saved after 10-second debounce
- Changes saved on blur
- Draft recovered after simulated crash
- Dirty state indicator accurate

---

# Performance Tests

## Tool

Lighthouse CI (frontend), k6 or Artillery (backend)

## Frontend Performance

| Test | Target |
|---|---|
| Builder initial load | <2 seconds |
| Preview update latency | ≤16ms |
| Dashboard load | <1.5 seconds |
| Lighthouse Performance score | ≥90 |

## Backend Performance

| Test | Target |
|---|---|
| Widget list API (p95) | <100ms |
| Widget config API (p95) | <50ms |
| Submission API (p95) | <200ms |
| Analytics overview API (p95) | <300ms |
| Concurrent submissions (100/s) | No errors |

## Runtime Performance

| Test | Target |
|---|---|
| Script load (gzip) | <30KB |
| Config fetch + render | <500ms on 3G |
| Submission latency | <300ms |

Performance tests run on main branch merges, not every PR.

---

# Accessibility Tests

## Tool

axe-core + Playwright, manual keyboard testing

## Automated

```typescript
test('dashboard passes accessibility audit', async ({ page }) => {
  await page.goto('/dashboard')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

Run axe-core on every page and critical Builder states.

## Manual

- Keyboard-only navigation through entire Builder workflow
- Screen reader testing (VoiceOver/NVDA) on critical flows
- Color contrast verification for all themes
- Reduced motion preference respected

## Coverage Goal

Zero axe-core violations on all pages. Keyboard-only Builder workflow functional.

---

# Coverage Goals

| Layer | Tool | Target |
|---|---|---|
| Unit tests | Vitest | ≥90% |
| Component tests | Testing Library | ≥85% |
| Integration tests | Supertest + Testing Library | ≥80% |
| API endpoint coverage | Supertest | 100% |
| E2E critical journeys | Playwright | 100% (5/5 pass) |
| Accessibility | axe-core | 0 violations |
| Builder preview parity | Custom | 100% fixture schemas |

Coverage measured but not enforced as gate in MVP. Becomes CI gate in Phase 2.

---

# CI Strategy

## Pipeline Stages

```
Push / PR
  ↓
Lint (ESLint + TypeScript check)
  ↓
Unit Tests (Vitest)
  ↓
Component Tests (Vitest + Testing Library)
  ↓
Integration Tests (Vitest + Supertest)
  ↓
Build (Next.js + Backend)
  ↓
E2E Tests (Playwright, on PR to main)
  ↓
Accessibility Audit (axe-core, on PR to main)
  ↓
Deploy to Staging (on merge to main)
  ↓
Performance Tests (on merge to main)
  ↓
Deploy to Production (manual approval)
```

## PR Requirements

- All lint checks pass
- All unit and component tests pass
- All integration tests pass
- Build succeeds with no TypeScript errors
- No decrease in coverage below thresholds

## Test Environment

- CI uses Docker Compose for test dependencies (PostgreSQL, Redis)
- Test database seeded via Prisma seed
- Environment variables from CI secrets
- Playwright runs headless Chromium

---

# Best Practices

## Do

- Write tests alongside feature implementation
- Test user-visible behavior, not implementation details
- Use factory functions for test data creation
- Mock external services (LLM, email) in tests
- Keep tests independent and idempotent
- Update tests when behavior intentionally changes
- Run tests locally before pushing

## Do Not

- Skip tests for "simple" changes
- Test implementation details (internal state, private methods)
- Share mutable state between tests
- Use arbitrary timeouts (use `waitFor` instead)
- Commit failing or skipped tests
- Mock what you don't own in integration tests

---

# Acceptance Criteria

Testing strategy is operational when:

- [ ] Vitest configured for unit, component, and integration tests
- [ ] Playwright configured for E2E tests
- [ ] Test database setup with seed data
- [ ] All 5 critical E2E journeys pass
- [ ] Builder preview parity tests pass for all fixture schemas
- [ ] axe-core reports zero violations on all pages
- [ ] CI pipeline runs all test stages on PR
- [ ] Coverage reports generated and accessible
- [ ] Performance test baselines established

---

# Future Evolution

## Phase 2

- Visual regression testing (Chromatic/Percy)
- Mutation testing for critical business logic
- Contract testing between frontend and backend (Pact)
- Coverage gates enforced in CI

## Phase 3

- Load testing in staging environment
- Chaos engineering for resilience testing
- Synthetic monitoring in production

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Engineering | Initial testing strategy specification |
