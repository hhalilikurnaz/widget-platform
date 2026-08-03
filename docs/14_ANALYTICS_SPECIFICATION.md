# Analytics Specification

**Version:** 1.0  
**Status:** Draft  
**Owner:** Data Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the event tracking, metrics, aggregation, visualization, and reporting architecture for Widget Platform analytics.

Analytics provides business insights into widget performance, conversion tracking, and customer engagement measurement.

Related documents: [Widget Runtime Specification](./10_WIDGET_RUNTIME_SPECIFICATION.md), [API Specification](./09_API_SPECIFICATION.md), [Database Design](./08_DATABASE_DESIGN.md), [Information Architecture](./INFORMATION_ARCHITECTURE.md).

---

# Architecture

```
Widget Runtime ──→ Event Ingestion API ──→ Analytics Events Table
                                                ↓
Dashboard / Analytics Page ←── Aggregation Layer ←── Raw Events
                                     ↓
                              Daily Aggregates (future)
                                     ↓
                              BI Integration (future)
```

Analytics data flows from Widget Runtime events through the backend ingestion API into PostgreSQL, then aggregated for dashboard and analytics page display.

---

# Responsibilities

- Define and track widget interaction events
- Calculate business metrics (views, submissions, conversion)
- Provide funnel analysis for widget engagement
- Support date range filtering and trend comparison
- Display analytics via charts on Dashboard and Analytics pages
- Aggregate events for query performance
- Support real-time event counts (future)

---

# Principles

## 1. Non-Intrusive

Analytics tracking never affects widget rendering performance. Events fire asynchronously with fire-and-forget semantics.

## 2. Privacy-Aware

No PII in analytics events. Session IDs are anonymous. IP addresses hashed. GDPR-compliant data handling.

## 3. Accurate

Event counts reflect actual user interactions. Deduplication prevents inflated metrics from page refreshes.

## 4. Actionable

Every metric answers a business question. No vanity metrics without context.

## 5. Scalable

Event ingestion handles high throughput. Aggregations pre-computed for dashboard queries.

---

# Event Tracking

## Event Types

| Event | Trigger | Properties |
|---|---|---|
| WIDGET_VIEWED | Widget enters viewport or page loads (inline) | pageUrl, referrer, device |
| WIDGET_OPENED | User opens popup/floating widget | triggerType, timeOnPage |
| WIDGET_CLOSED | User closes widget | duration, closeMethod (button, overlay, escape) |
| FIELD_FOCUSED | User focuses a form field | fieldId, fieldType |
| FIELD_COMPLETED | User fills and leaves a field | fieldId, fieldType, hasValue |
| SUBMISSION_STARTED | User clicks submit button | fieldCount, filledFieldCount |
| SUBMISSION_COMPLETED | Server confirms submission | fieldCount, duration |
| SUBMISSION_FAILED | Validation or server error | errorType, fieldCount |
| CTA_CLICKED | User clicks non-submit button | buttonLabel, buttonId |
| EXIT_INTENT_TRIGGERED | Exit intent trigger fires | timeOnPage, scrollDepth |

## Event Payload

```typescript
interface AnalyticsEventPayload {
  eventType: AnalyticsEventType
  sessionId: string           // Anonymous, generated per page load
  properties?: {
    pageUrl?: string
    referrer?: string
    device?: 'desktop' | 'tablet' | 'mobile'
    fieldId?: string
    fieldType?: string
    triggerType?: string
    duration?: number
    [key: string]: unknown
  }
}
```

## Session Management

```javascript
// Generated once per page load, stored in sessionStorage
const sessionId = sessionStorage.getItem('wp:session')
  || crypto.randomUUID()
sessionStorage.setItem('wp:session', sessionId)
```

Session IDs are anonymous UUIDs. No cross-session tracking in MVP.

## Deduplication

| Event | Deduplication Rule |
|---|---|
| WIDGET_VIEWED | Once per session per widget |
| WIDGET_OPENED | Once per open action |
| FIELD_FOCUSED | Once per field per session |
| SUBMISSION_COMPLETED | Once per submission |

---

# Metrics

## Primary Metrics

| Metric | Calculation | Display |
|---|---|---|
| Views | Count of WIDGET_VIEWED events | Number + trend |
| Opens | Count of WIDGET_OPENED events | Number + trend |
| Submissions | Count of SUBMISSION_COMPLETED events | Number + trend |
| Conversion Rate | Submissions / Views × 100 | Percentage + trend |
| Open Rate | Opens / Views × 100 | Percentage |
| Completion Rate | Submissions / SUBMISSION_STARTED × 100 | Percentage |

## Dashboard Metrics

Dashboard displays workspace-level aggregates:

- Total views (30-day)
- Total submissions (30-day)
- Average conversion rate
- Active widgets count
- Trend comparison (current period vs previous period)

## Widget-Level Metrics

Analytics page and widget detail show per-widget metrics with date range filtering.

---

# Funnels

## Standard Widget Funnel

```
Viewed → Opened → Field Focused → Submission Started → Completed
```

## Funnel Calculation

```typescript
interface FunnelStep {
  name: string
  count: number
  rate: number        // Percentage of previous step
  dropoff: number     // Percentage lost from previous step
}

interface WidgetFunnel {
  viewed: FunnelStep
  opened: FunnelStep
  started: FunnelStep
  completed: FunnelStep
}
```

Example:

| Step | Count | Rate | Dropoff |
|---|---|---|---|
| Viewed | 4,200 | 100% | — |
| Opened | 2,100 | 50.0% | 50.0% |
| Started | 890 | 42.4% | 57.6% |
| Completed | 342 | 38.4% | 61.6% |

Funnel visualization uses horizontal bar chart with step labels and dropoff percentages.

---

# Conversion

## Conversion Rate

Primary conversion metric: submissions divided by views.

```
Conversion Rate = (Submissions / Views) × 100
```

## Conversion by Dimension

| Dimension | Description |
|---|---|
| Widget | Per-widget conversion rate |
| Time | Conversion trend over time |
| Device | Desktop vs tablet vs mobile |
| Source | Referrer domain conversion |
| Trigger | Conversion by trigger type |

## Conversion Benchmarks

Display industry benchmark comparison (future):

```
Your conversion: 3.2%
Industry average: 2.8%
↑ 14% above average
```

---

# Realtime

## MVP

MVP does not include real-time analytics. Dashboard and analytics page show data with up to 5-minute delay (event processing + cache TTL).

## Future Real-Time

WebSocket connection for live event counts:

- Live visitor count per widget
- Submission notifications (toast on new submission)
- Real-time conversion rate ticker

Implementation: Redis pub/sub for event streaming, WebSocket server for client delivery.

---

# Charts

Analytics visualizations use Recharts with platform styling from the Design System.

## Dashboard Charts

| Chart | Type | Data |
|---|---|---|
| Visitors Over Time | Area chart | Daily views, 30-day range |
| Top Performing Widgets | Horizontal bar | Top 5 by submissions |
| Conversion Trend | Line chart | Daily conversion rate |

## Analytics Page Charts

| Chart | Type | Data |
|---|---|---|
| Views Trend | Area chart | Configurable date range |
| Submissions Trend | Area chart | Configurable date range |
| Conversion Rate | Line chart | Configurable date range |
| Funnel | Horizontal bar | Widget engagement funnel |
| Device Breakdown | Pie chart | Views by device type |
| Top Sources | Table | Referrer domains by views |

## Chart Design Rules

- Colors: Primary, Secondary, Success tokens only
- Gridlines: Muted at 20% opacity
- Tooltips: Card background, formatted values
- Empty state: Meaningful message with guidance
- Loading: Skeleton matching chart dimensions
- Responsive: Charts resize with container

---

# Aggregation

## MVP Aggregation

MVP queries raw analytics events table directly with SQL aggregation:

```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'WIDGET_VIEWED') as views,
  COUNT(*) FILTER (WHERE event_type = 'SUBMISSION_COMPLETED') as submissions
FROM analytics_events
WHERE workspace_id = $1
  AND created_at BETWEEN $2 AND $3
GROUP BY DATE(created_at)
ORDER BY date
```

## Future: Pre-Computed Aggregates

Daily aggregation job (cron or queue worker):

```
Every hour:
  Aggregate previous hour's events into analytics_daily_aggregates
  Update workspace-level summary counters in Redis
  Invalidate dashboard cache
```

Benefits:

- Dashboard queries hit aggregate table (< 10ms)
- Raw events table handles write throughput independently
- Historical data preserved even after aggregation

## Aggregation Schema

```typescript
interface DailyAggregate {
  workspaceId: string
  widgetId: string
  date: string
  views: number
  opens: number
  submissions: number
  conversionRate: number
  uniqueSessions: number
}
```

---

# Retention

## Data Retention Policy

| Data | Retention | Storage |
|---|---|---|
| Raw events | 90 days | PostgreSQL |
| Daily aggregates | 2 years | PostgreSQL |
| Dashboard cache | 5 minutes | Redis |

## GDPR Compliance

- Analytics events contain no PII
- Session IDs are anonymous and not linkable to individuals
- Workspace deletion removes all associated analytics data
- Data export available for workspace owners (future)

## Archival (Future)

Events older than 90 days archived to cold storage (S3/GCS). Aggregates preserved indefinitely.

---

# Analytics Pages

## Dashboard (Summary)

- Stats cards: views, submissions, conversion, active widgets
- Visitors area chart (30-day)
- Top performing widgets list
- Recent activity feed

## Analytics Page (Detailed)

- Date range selector (7d, 30d, 90d, custom)
- Metric cards with trend comparison
- Views and submissions trend charts
- Conversion rate chart
- Widget performance table (sortable)
- Funnel visualization (per selected widget)

## Widget Detail Analytics

Accessible from widget list or Builder toolbar:

- Widget-specific metrics
- Funnel for selected widget
- Device and source breakdown
- Comparison with workspace average

---

# Best Practices

## Do

- Track events asynchronously (fire-and-forget)
- Deduplicate view events per session
- Display trends with previous period comparison
- Use skeleton loading for all chart areas
- Format numbers with locale-aware formatting
- Cache dashboard queries in Redis

## Do Not

- Block widget rendering for analytics
- Store PII in analytics events
- Display analytics without date context
- Query raw events table for dashboard (use aggregates in production)
- Show vanity metrics without actionable context

---

# Acceptance Criteria

Analytics is production-ready when:

- [ ] All 10 event types tracked correctly from Runtime
- [ ] Dashboard displays accurate 30-day metrics
- [ ] Analytics page supports date range filtering
- [ ] Conversion rate calculated correctly
- [ ] Funnel visualization shows accurate step counts
- [ ] Top performing widgets ranked correctly
- [ ] Charts render with loading skeletons and empty states
- [ ] Event ingestion handles 1000 events/minute without degradation
- [ ] No PII stored in analytics events
- [ ] Analytics tracking does not affect Runtime performance

---

# Future Evolution

## Phase 2 — Real-Time Analytics

- WebSocket live event streaming
- Real-time submission notifications
- Live visitor counter

## Phase 3 — Advanced Analytics

- A/B test result tracking
- Cohort analysis
- Retention curves
- Custom event definitions
- Goal tracking with conversion attribution

## Phase 4 — BI Integration

- Data warehouse ETL pipeline
- Looker/Metabase/Tableau integration
- Custom report builder
- Scheduled report emails
- API for external analytics tools

---

# Future BI Integration

```
Analytics Events (PostgreSQL)
      ↓ ETL (hourly)
Data Warehouse (BigQuery/Snowflake)
      ↓
BI Tools (Looker, Metabase)
      ↓
Custom Reports · Scheduled Emails · API Export
```

Enterprise customers connect their BI tools to the data warehouse for advanced analysis beyond platform dashboards.

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Data Engineering | Initial analytics specification |
