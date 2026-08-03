# Widget Runtime Specification

**Version:** 1.0  
**Status:** Draft  
**Owner:** Platform Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the architecture, lifecycle, and behavior of the Widget Runtime — the lightweight JavaScript embed that renders published widgets on customer websites.

The Runtime must produce identical output to the Builder Live Preview. Any visual or behavioral discrepancy between Preview and Runtime is a critical defect.

Related documents: [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), [API Specification](./09_API_SPECIFICATION.md), [Theme Engine Specification](./13_THEME_ENGINE_SPECIFICATION.md), [Analytics Specification](./14_ANALYTICS_SPECIFICATION.md), [Security Architecture](./15_SECURITY_ARCHITECTURE.md).

---

# Architecture

The Widget Runtime is a standalone JavaScript bundle delivered via CDN. It has zero dependencies on the host page framework.

```
Customer Website
      │
      ▼
<script src="cdn.widgetplatform.com/v1/{embedToken}.js">
      │
      ▼
┌─────────────────────────────────────────┐
│            Widget Runtime                │
│                                         │
│  Loader → Config Fetch → Schema Parse   │
│       → Theme Apply → Render → Events   │
└─────────────────────────────────────────┘
      │                    │
      ▼                    ▼
  Public Config API    Analytics API
  Submission API
```

## Runtime Components

| Component | Responsibility |
|---|---|
| Loader | Script initialization, DOM ready detection |
| Config Client | Fetch and cache public widget configuration |
| Schema Parser | Parse and validate Widget Schema |
| Theme Engine | Apply theme tokens to rendered output |
| Renderer | Render widget DOM from schema |
| Animation Engine | Apply entrance/exit/interaction animations |
| Event Manager | Handle user interactions and trigger events |
| Analytics Client | Fire analytics events to backend |
| Submission Client | Validate and submit form data |
| Trigger Engine | Evaluate display triggers (time, scroll, exit intent) |

---

# Responsibilities

- Render published widgets identically to Builder Preview
- Fetch public configuration from backend API
- Handle all widget interactions (open, close, form fill, submit)
- Track analytics events without affecting render performance
- Submit form data with validation and spam protection
- Apply theme tokens for visual consistency
- Operate independently of host page framework
- Minimize impact on host page performance

---

# Principles

## 1. Preview Parity

Runtime output must be pixel-identical to Builder Preview for the same schema and theme. Same renderer logic, same theme engine, same animation tokens.

## 2. Zero Dependencies

The Runtime bundle includes everything needed. No React, Vue, or jQuery requirement on the host page.

## 3. Non-Blocking

Script loads asynchronously. Widget rendering never blocks page load or interaction.

## 4. Lightweight

Target bundle size: <30KB gzip. Total runtime memory: <5MB.

## 5. Secure by Default

No eval, no inline scripts, strict CSP compatibility, sandboxed iframe option for enterprise.

## 6. Fail Gracefully

Configuration fetch failure, render error, or submission failure never breaks the host page.

---

# Initialization

## Embed Snippet

Publishing generates a single script tag:

```html
<script
  src="https://cdn.widgetplatform.com/v1/wt_abc123def456.js"
  async
  defer
></script>
```

The embed token in the URL identifies the widget. No additional configuration required.

## Initialization Sequence

```
1. Script tag parsed by browser
2. Loader executes (async, non-blocking)
3. Loader waits for DOMContentLoaded (if not already fired)
4. Config Client fetches public configuration
      GET /api/v1/public/widgets/{embedToken}/config
5. Schema Parser validates configuration
6. Trigger Engine evaluates display conditions
7. Renderer creates widget DOM (hidden until triggered)
8. Theme Engine applies visual tokens
9. Animation Engine prepares entrance animation
10. Trigger condition met → widget displayed
11. Analytics Client fires WIDGET_VIEWED event
12. Event Manager attaches interaction handlers
```

Total initialization target: <500ms after script load on 3G connection.

---

# Public Config

## Configuration Endpoint

```
GET /api/v1/public/widgets/{embedToken}/config
```

## Response

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

## Caching Strategy

| Layer | TTL | Invalidation |
|---|---|---|
| CDN | 5 minutes | On publish/unpublish |
| Runtime memory | Session lifetime | On config version change |
| localStorage | 1 hour (fallback) | On version mismatch |

Runtime checks `version` field. If cached version differs from fetched version, re-render with new configuration.

## Offline Fallback

If config fetch fails, Runtime checks localStorage for cached config. If cached config exists and is less than 1 hour old, render from cache. Otherwise, fail silently (no widget displayed, no host page impact).

---

# Rendering

## Renderer Pipeline

```
Widget Schema
      ↓
Schema Parser (validate structure)
      ↓
Component Tree Builder (map schema nodes to DOM)
      ↓
Theme Engine (apply tokens to each component)
      ↓
Layout Engine (position, spacing, alignment)
      ↓
Animation Engine (prepare transitions)
      ↓
DOM Insertion (shadow DOM or iframe)
      ↓
Interactive Widget
```

## Rendering Modes

### Shadow DOM (Default)

Widget renders inside a Shadow DOM root attached to a container element. Provides CSS isolation from host page styles.

```javascript
const container = document.createElement('div')
container.id = 'wp-widget-{embedToken}'
const shadow = container.attachShadow({ mode: 'open' })
// Render widget inside shadow root
document.body.appendChild(container)
```

### Iframe (Enterprise Option)

Widget renders inside a sandboxed iframe for maximum isolation. Used when customers require strict CSP or complete style isolation.

```html
<iframe
  src="https://embed.widgetplatform.com/v1/{embedToken}"
  sandbox="allow-scripts allow-forms"
  style="border: none; ..."
></iframe>
```

## Widget Display Types

| Type | Behavior |
|---|---|
| Popup | Overlay modal triggered by conditions |
| Inline | Embedded directly in page content via target selector |
| Floating | Fixed-position button that opens widget on click |

## Component Rendering

Each ComponentNode in the schema maps to a rendered element:

| Schema Type | Rendered Element |
|---|---|
| header | `<header>` with styled container |
| title | `<h2>` with theme typography |
| subtitle | `<h3>` with muted typography |
| description | `<p>` with body typography |
| form | `<form>` with novalidate (Runtime handles validation) |
| field | `<input>`, `<textarea>`, `<select>` per field type |
| button | `<button type="submit">` with theme styling |
| footer | `<footer>` with optional links |
| success-screen | Conditional overlay after submission |
| close-button | `<button aria-label="Close">` |
| floating-button | Fixed-position trigger button |

---

# Events

## User Interaction Events

| Event | Trigger | Analytics Event |
|---|---|---|
| Widget displayed | Trigger condition met | WIDGET_VIEWED |
| Widget opened | User clicks floating button or trigger fires | WIDGET_OPENED |
| Widget closed | User clicks close button or overlay | WIDGET_CLOSED |
| Field focused | User focuses form field | FIELD_FOCUSED |
| Field completed | User fills and leaves field | FIELD_COMPLETED |
| Form submission started | User clicks submit | SUBMISSION_STARTED |
| Form submission completed | Server confirms submission | SUBMISSION_COMPLETED |
| Form submission failed | Validation or server error | SUBMISSION_FAILED |
| CTA clicked | User clicks non-submit button | CTA_CLICKED |
| Exit intent detected | Mouse leaves viewport top | EXIT_INTENT_TRIGGERED |

## Event Manager

The Event Manager attaches handlers to rendered DOM elements:

```javascript
class EventManager {
  attach(formElement, schema) {
    formElement.addEventListener('focusin', this.handleFieldFocus)
    formElement.addEventListener('focusout', this.handleFieldComplete)
    formElement.addEventListener('submit', this.handleSubmit)
    closeButton.addEventListener('click', this.handleClose)
  }
}
```

Events are dispatched to Analytics Client asynchronously. Event handling never blocks UI interaction.

---

# Analytics

Analytics events fire asynchronously via the public events endpoint.

```javascript
class AnalyticsClient {
  track(eventType, properties = {}) {
    const payload = {
      eventType,
      sessionId: this.sessionId,
      properties: {
        pageUrl: window.location.href,
        ...properties,
      },
    }

    // Fire-and-forget with navigator.sendBeacon fallback
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.eventsUrl, JSON.stringify(payload))
    } else {
      fetch(this.eventsUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {}) // Silent failure
    }
  }
}
```

Analytics must never affect rendering performance. Events are batched when possible (future). Failed analytics calls are silently dropped.

See [Analytics Specification](./14_ANALYTICS_SPECIFICATION.md) for complete event definitions.

---

# Caching

## Config Cache

```javascript
class ConfigCache {
  get(embedToken) {
    const cached = localStorage.getItem(`wp:config:${embedToken}`)
    if (!cached) return null
    const { data, timestamp, version } = JSON.parse(cached)
    if (Date.now() - timestamp > 3600000) return null // 1 hour TTL
    return data
  }

  set(embedToken, data) {
    localStorage.setItem(`wp:config:${embedToken}`, JSON.stringify({
      data,
      timestamp: Date.now(),
      version: data.version,
    }))
  }
}
```

## Asset Cache

Theme fonts and images cached via standard browser cache headers. CDN serves assets with long TTL and content-hash filenames.

---

# Performance

## Bundle Budget

| Metric | Target |
|---|---|
| Loader script (gzip) | <8KB |
| Full runtime (gzip) | <30KB |
| Config fetch | <200ms |
| First render | <100ms after config |
| Memory usage | <5MB |
| Main thread blocking | 0ms (all async) |

## Optimization Techniques

- Tree-shake unused widget type renderers
- Lazy load animation engine (only when animations configured)
- Use `requestIdleCallback` for non-critical initialization
- Minimize DOM mutations (batch updates)
- CSS injected once, reused for component variations
- No external font loading unless theme specifies custom font

## Performance Monitoring

Runtime reports performance metrics (future):

- Time to first render
- Config fetch duration
- Submission latency
- Error rate

---

# Embed Script Lifecycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Load    │────▶│  Init    │────▶│  Active  │────▶│ Destroy  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
 Script parsed    Config fetched   User interacts   Page unload
 DOM ready        Widget rendered  Events tracked   Cleanup handlers
                  Triggers armed   Submissions sent  Final analytics
```

## Load

Script tag with `async defer` parsed. Loader function executes.

## Init

Config fetched, schema parsed, widget DOM created (hidden), triggers armed.

## Active

Widget displayed per trigger conditions. User interactions handled. Analytics tracked. Submissions processed.

## Destroy

On page unload (`beforeunload` / `pagehide`):

- Flush pending analytics events via `sendBeacon`
- Remove event listeners
- Remove DOM elements
- Clear timers

## Re-initialization

If the embed script is loaded multiple times (e.g., SPA navigation), Runtime detects existing instance by embed token and reuses it rather than creating duplicates.

---

# Security

## Content Security Policy

Runtime compatible with strict CSP:

```
script-src: cdn.widgetplatform.com
connect-src: api.widgetplatform.com
style-src: 'unsafe-inline' (shadow DOM styles only)
frame-src: embed.widgetplatform.com (iframe mode only)
```

No `eval()`, no `Function()`, no dynamic script injection.

## Domain Validation

Backend validates submission origin against workspace allowed domains. Submissions from unauthorized domains are rejected.

## Input Sanitization

All form data sanitized before submission:

- HTML tags stripped from text fields
- URL fields validated against URL format
- Email fields validated against email format
- Maximum field length enforced per schema definition

## XSS Prevention

- Widget content rendered via textContent, not innerHTML (except styled containers)
- User-submitted data never rendered back in widget UI
- Shadow DOM provides CSS isolation

## Spam Protection

- Honeypot field (hidden field that bots fill)
- Rate limiting (10 submissions/minute/IP)
- Timestamp validation (reject submissions <2 seconds after widget open)

See [Security Architecture](./15_SECURITY_ARCHITECTURE.md) for complete security requirements.

---

# Browser Compatibility

## Supported Browsers

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |
| iOS Safari | 15+ |
| Chrome Android | 90+ |

## Required APIs

- Shadow DOM v1
- Fetch API
- Promise
- `async/await` (transpiled for bundle)
- `navigator.sendBeacon` (with fetch fallback)
- `localStorage` (with in-memory fallback)
- `IntersectionObserver` (for scroll triggers, with fallback)

## Polyfills

Minimal polyfills included in bundle:

- `fetch` fallback for older browsers (future)
- `sendBeacon` fallback to `fetch` with `keepalive`

## Unsupported

- Internet Explorer (all versions)
- Browsers without ES2018 support

---

# Submission Flow

```
User clicks Submit
      ↓
Client-side validation (schema rules)
      ↓ (pass)
Honeypot check
      ↓ (pass)
Analytics: SUBMISSION_STARTED
      ↓
POST /api/v1/public/widgets/{embedToken}/submit
      ↓
Success response
      ↓
Analytics: SUBMISSION_COMPLETED
      ↓
Show success screen (from schema)
      ↓
Optional: redirect URL (from behavior config)
```

Validation failure shows inline error messages without server round-trip. Server errors show user-friendly message with retry option.

---

# Trigger Engine

Evaluates display conditions defined in schema `triggers` configuration.

## Trigger Types

| Trigger | Evaluation |
|---|---|
| Immediate | Display on page load |
| Time Delay | Display after N seconds |
| Scroll Depth | Display when user scrolls to N% of page |
| Exit Intent | Display when mouse leaves viewport top |
| Click | Display when target element clicked |
| Page Load | Display after page fully loaded |

## Trigger Configuration

```typescript
interface TriggerConfig {
  type: 'immediate' | 'delay' | 'scroll' | 'exit_intent' | 'click' | 'page_load'
  delay?: number          // seconds (for delay trigger)
  scrollDepth?: number    // percentage (for scroll trigger)
  clickSelector?: string  // CSS selector (for click trigger)
  showOnce?: boolean      // show only once per session
  showOncePerDays?: number // show once per N days (uses localStorage)
}
```

Only one trigger active per widget. Trigger evaluation begins after config load.

---

# Best Practices

## Do

- Load script with `async defer`
- Place script before closing `</body>` tag
- Test widget on actual website before going live
- Verify domain is added to allowed domains in Settings
- Monitor analytics after deployment

## Do Not

- Load multiple instances of the same widget
- Modify the embed script URL
- Wrap widget in additional containers (Runtime handles positioning)
- Block the Runtime script with CSP `script-src` restrictions
- Expect widget to work on unsupported browsers

---

# Acceptance Criteria

The Widget Runtime is production-ready when:

- [ ] Runtime renders identical output to Builder Preview
- [ ] Bundle size under 30KB gzip
- [ ] Initialization completes in <500ms on 3G
- [ ] All widget types render correctly (popup, inline, floating)
- [ ] All trigger types function correctly
- [ ] Form validation matches schema rules
- [ ] Submissions reach backend with spam protection
- [ ] Analytics events fire without affecting performance
- [ ] Shadow DOM provides CSS isolation from host page
- [ ] Runtime fails gracefully on config fetch failure
- [ ] No JavaScript errors on host page
- [ ] Compatible with all supported browsers
- [ ] CSP compatible without unsafe-eval
- [ ] Domain validation prevents unauthorized submissions

---

# Future Evolution

## Phase 2

- A/B testing support (multiple schema variants)
- Personalization based on visitor attributes
- Custom event tracking API for host page integration
- Widget appearance callbacks (`onOpen`, `onClose`, `onSubmit`)

## Phase 3

- Server-side rendering for iframe mode (faster first paint)
- Web Component wrapper (`<widget-platform token="...">`)
- NPM package for programmatic integration
- Service Worker for offline config caching

## Phase 4

- Real-time widget updates without page reload (WebSocket config push)
- Multi-widget orchestration (widget sequences)
- Custom component plugins
- Public JavaScript SDK

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Platform Engineering | Initial widget runtime specification |
