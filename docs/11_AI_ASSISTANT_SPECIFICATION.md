# AI Assistant Specification

**Version:** 1.0  
**Status:** Draft  
**Owner:** AI Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the architecture, capabilities, interaction model, and implementation requirements of the AI Widget Assistant integrated into Widget Platform.

The AI Assistant accelerates widget creation without replacing human decision-making. Users remain in full control of every generated result.

Related documents: [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), [API Specification](./09_API_SPECIFICATION.md), [Template Marketplace Specification](./12_TEMPLATE_MARKETPLACE_SPECIFICATION.md), [Theme Engine Specification](./13_THEME_ENGINE_SPECIFICATION.md).

---

# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Assistant Layer                       │
│                                                             │
│  Prompt Pipeline → Context Builder → LLM Provider           │
│       → Response Parser → Suggestion Engine → UI            │
├─────────────────────────────────────────────────────────────┤
│                     Integration Points                       │
│  Builder Store · Template Marketplace · Theme Gallery        │
└─────────────────────────────────────────────────────────────┘
```

The AI Assistant operates as a service layer between the user and the LLM provider. It never directly mutates the Widget Schema without user confirmation.

---

# Responsibilities

- Translate natural language prompts into Widget Schema
- Generate copywriting for widget elements
- Recommend themes based on industry and intent
- Suggest UX improvements for conversion and accessibility
- Explain design decisions to educate users
- Provide context-aware suggestions during editing
- Maintain conversation memory within editing sessions

---

# Principles

## 1. Assist, Never Replace

AI proposes. The user decides. No automatic destructive modifications. Every generated change requires explicit user confirmation.

## 2. Context Awareness

The assistant always understands the current widget, selected element, theme, layout, industry, language, widget goal, and screen size. Suggestions consider full editing context.

## 3. Explain Decisions

Whenever AI generates content, it explains why. The assistant educates users rather than simply generating content.

## 4. Progressive AI

AI becomes more powerful as users continue editing. Early prompts generate widgets; later prompts optimize specific elements.

## 5. Editable Output

Every AI-generated result is fully editable. AI output is a starting point, never a locked final state.

## 6. Privacy First

User prompts and widget data sent to LLM providers must not include PII from submissions. Workspace data stays scoped.

---

# Prompt Pipeline

## Pipeline Stages

```
User Prompt
      ↓
Input Sanitization (PII removal, length validation)
      ↓
Intent Classification (generate, improve, copy, theme, accessibility)
      ↓
Context Assembly (widget schema, selection, theme, history)
      ↓
System Prompt Construction
      ↓
LLM Request (with structured output schema)
      ↓
Response Validation (schema conformance, safety check)
      ↓
Result Presentation (preview + explanation + accept/reject)
```

## Intent Classification

| Intent | Trigger Examples | Output |
|---|---|---|
| generate | "Create a lead form for a dental clinic" | Full Widget Schema |
| improve | "Improve conversion", "Make it more professional" | Schema modifications + explanation |
| copy | "Write a better CTA", "Generate title" | Text suggestions (multiple options) |
| theme | "Suggest a theme", "Use a minimal design" | Theme recommendation |
| fields | "Add a phone field", "Reduce form length" | Field additions/removals |
| accessibility | "Check accessibility", "Improve contrast" | Accessibility report + fixes |
| explain | "Explain this widget", "Why this layout?" | Natural language explanation |

## System Prompt Structure

```
Role: You are an expert product designer and frontend engineer specializing
in customer engagement widgets.

Context:
- Widget Type: {type}
- Current Schema: {schema_summary}
- Selected Element: {selected_element}
- Theme: {theme_name}
- Industry: {industry}
- Goal: {widget_goal}

Rules:
- Generate valid Widget Schema JSON
- Follow Widget Platform design system
- Optimize for conversion
- Ensure WCAG AA accessibility
- Keep forms concise (3-5 fields for lead generation)
- Use professional, clear copywriting
- Explain every design decision

Output Format: {structured_output_schema}
```

---

# Context Building

The Context Builder assembles all relevant information before sending to the LLM.

## Context Components

```typescript
interface AIContext {
  widget: {
    id: string
    type: WidgetType
    schema: WidgetSchema
    status: WidgetStatus
  }
  selection: {
    elementId: string | null
    elementType: ComponentType | null
    elementProperties: Record<string, unknown>
  }
  theme: {
    name: string
    tokens: ThemeTokens
  }
  workspace: {
    industry?: string
    language: string
  }
  session: {
    previousPrompts: PromptHistory[]
    appliedSuggestions: string[]
  }
  marketplace: {
    availableTemplates: TemplateSummary[]
    availableThemes: ThemeSummary[]
  }
}
```

## Context Optimization

Full schema can be large. Context Builder sends:

- Complete schema for generate intent
- Selected element subtree for improve/copy intent
- Schema summary (structure without full properties) for explain intent
- Theme tokens relevant to selected element for theme intent

Token budget: target <8000 tokens for context, reserving space for response.

---

# Suggestion Engine

The Suggestion Engine generates proactive recommendations during editing.

## Suggestion Types

| Type | Description | Example |
|---|---|---|
| reduce_fields | Form has too many fields | "Reduce from 6 to 3 fields for better conversion" |
| improve_cta | CTA text could be stronger | "Change to 'Book Free Consultation'" |
| improve_contrast | Color contrast below WCAG AA | "Button text contrast is 3.2:1, needs 4.5:1" |
| improve_mobile | Layout issues on mobile | "Stack fields vertically on mobile" |
| improve_hierarchy | Visual hierarchy unclear | "Increase title size relative to subtitle" |
| suggest_theme | Theme doesn't match industry | "Healthcare widgets perform better with clean, blue themes" |
| suggest_animation | Animation could improve engagement | "Add fade-in animation for popup entrance" |
| reduce_friction | Unnecessary form complexity | "Remove optional company field" |

## Suggestion Lifecycle

```
Schema Change Detected
      ↓
Suggestion Engine Evaluates (debounced 2s)
      ↓
Generate Suggestions (max 3 visible)
      ↓
Display in AI Suggestions Panel
      ↓
User: Accept → Apply changes to SchemaStore
User: Dismiss → Remove suggestion
User: Ignore → Suggestion fades after session
```

Suggestions appear in the Builder's AI Suggestions panel (left navigation → AI Assistant section). Each suggestion is individually acceptible.

---

# AI Generation Flow

## Full Widget Generation

```
User: "Create a lead generation widget for a dental clinic"
      ↓
Intent: generate
      ↓
Context: empty schema, industry=healthcare
      ↓
LLM generates:
  - Widget Schema (title, fields, button, success screen)
  - Theme recommendation (Clean, Blue, Professional)
  - Copy (professional healthcare tone)
  - Behavior (popup, 5-second delay trigger)
      ↓
Preview displayed in Builder canvas
      ↓
Explanation: "Created a 3-field lead form optimized for healthcare
conversion. Used clean layout with blue accent for trust."
      ↓
User: Accept → Schema loaded into Builder Store
User: Modify → Continue editing with generated base
User: Reject → Return to empty/previous state
```

## Incremental Improvement

```
User selects button element
User: "Make the CTA more compelling"
      ↓
Intent: copy
      ↓
Context: selected button, current label="Submit", industry, widget goal
      ↓
LLM generates 3 CTA options:
  1. "Book Your Free Consultation"
  2. "Schedule Today — It's Free"
  3. "Claim Your Free Dental Checkup"
      ↓
User selects option 1 → Button label updated in SchemaStore
```

---

# Conversation Memory

## Session Memory

Within a Builder editing session, the AI maintains conversation history:

```typescript
interface PromptHistory {
  id: string
  prompt: string
  intent: AIIntent
  response: AIResponse
  applied: boolean
  timestamp: Date
}
```

Session memory enables progressive AI:

- First prompt: "Create a contact form" → full generation
- Second prompt: "Make it shorter" → understands "it" refers to generated form
- Third prompt: "Use a darker theme" → understands widget context

## Memory Limits

- Session memory: last 20 prompts per editing session
- Memory cleared on page leave
- No cross-session memory in MVP (future: user preferences)

## Memory Privacy

- Prompt history stored in Builder Store (client-side only)
- Not persisted to backend in MVP
- No PII from submissions included in context

---

# Tool Architecture

The AI Assistant uses a tool-based architecture for structured operations.

## Available Tools

| Tool | Purpose | Input | Output |
|---|---|---|---|
| generateSchema | Create widget schema from description | prompt, type, industry | WidgetSchema |
| modifyElement | Change properties of selected element | elementId, changes | Updated properties |
| generateCopy | Generate text content | elementType, intent, industry | string[] (options) |
| recommendTheme | Suggest theme based on context | industry, goal, personality | ThemeRecommendation |
| recommendTemplate | Suggest template from marketplace | prompt, type | TemplateRecommendation |
| validateAccessibility | Check accessibility compliance | schema | AccessibilityReport |
| analyzeConversion | Evaluate conversion optimization | schema | ConversionReport |
| explainWidget | Describe widget in natural language | schema | string |

## Tool Execution

```typescript
interface AITool {
  name: string
  description: string
  parameters: ZodSchema
  execute(params: unknown, context: AIContext): Promise<ToolResult>
}
```

Tools execute server-side via the AI API endpoints. Results returned to frontend for user review before application.

## Tool Safety

- Tools never execute destructive operations (delete, publish)
- All tool outputs validated against Widget Schema structure
- Schema modifications pass through ValidationStore before application
- Rate limiting: 20 AI requests per minute per user

---

# AI Interaction Model

Every AI response follows the same interaction pattern:

```
Prompt → Generation → Preview → Explanation → Accept / Modify / Reject
```

## UI Components

### AI Chat Panel

Located in Builder left navigation (AI Assistant section).

- Text input for natural language prompts
- Conversation history display
- Loading indicator during generation
- Suggestion cards with accept/dismiss actions

### AI Suggestion Cards

Proactive suggestions displayed during editing:

```
┌─────────────────────────────────────────┐
│ 💡 Reduce Form Length                    │
│                                         │
│ Forms with 3 fields convert 2x better   │
│ than forms with 6+ fields.              │
│                                         │
│ [Accept]  [Dismiss]                     │
└─────────────────────────────────────────┘
```

### AI Preview Overlay

For full widget generation, preview appears in the Builder canvas with a banner:

```
┌─ AI Generated — Review before applying ─┐
│                                         │
│         [Generated Widget Preview]       │
│                                         │
│ [Accept & Edit]  [Regenerate]  [Cancel] │
└─────────────────────────────────────────┘
```

---

# Version 1 Capabilities

| Capability | Status | Description |
|---|---|---|
| Generate Widget | MVP | Full widget from natural language |
| Improve Widget | MVP | Optimize existing widget |
| Generate Copy | MVP | Titles, descriptions, CTAs, messages |
| Generate Form Fields | MVP | Field suggestions based on widget type |
| Suggest CTA | MVP | Higher-converting button text |
| Suggest Colors | MVP | Color recommendations for elements |
| Suggest Theme | MVP | Theme selection based on industry |
| Improve Accessibility | MVP | Contrast, labels, touch targets |
| Improve Conversion | MVP | Form length, CTA, hierarchy |
| Suggest Animations | MVP | Entrance/exit animation recommendations |
| Generate Success Screen | MVP | Post-submission screen content |
| Optimize Layout | MVP | Spacing, alignment, hierarchy |
| Summarize Widget | MVP | Natural language widget description |
| Explain Widget | MVP | Design decision explanation |

---

# Best Practices

## Do

- Always show preview before applying AI changes
- Explain every AI recommendation with reasoning
- Limit proactive suggestions to 3 visible at a time
- Validate all AI-generated schemas before application
- Rate limit AI requests to control costs
- Log AI usage for analytics (prompt count, acceptance rate)
- Support "Regenerate" for unsatisfactory results

## Do Not

- Auto-apply AI changes without user confirmation
- Send submission PII to LLM providers
- Generate widgets that bypass validation rules
- Store conversation history on backend without consent
- Allow AI to publish widgets directly
- Expose LLM provider details to users

---

# Acceptance Criteria

The AI Assistant is production-ready when:

- [ ] Full widget generation from natural language works for all widget types
- [ ] Generated schemas pass Widget Schema validation
- [ ] Copy generation produces professional, context-appropriate text
- [ ] Theme recommendations align with industry best practices
- [ ] Accessibility suggestions identify real WCAG violations
- [ ] Conversion suggestions reference UX best practices
- [ ] Every AI change requires explicit user acceptance
- [ ] Session memory enables progressive conversation
- [ ] AI Suggestions panel displays proactive recommendations
- [ ] Rate limiting prevents abuse
- [ ] AI-generated preview matches accepted result
- [ ] Response latency under 5 seconds for generation, 2 seconds for suggestions

---

# Future Evolution

## Phase 2 — MCP Integration

- Model Context Protocol tools for external data access
- CRM integration (pull contact fields from HubSpot)
- Analytics-aware suggestions ("Your conversion dropped 20%, try reducing fields")

## Phase 3 — Agent Architecture

- Multi-step AI agents for complete customer journey design
- Autonomous A/B test generation and analysis
- AI-powered form field intelligence (auto-detect required fields by industry)
- Voice input for widget generation

## Phase 4 — Custom AI Models

- Fine-tuned models on widget conversion data
- Industry-specific generation models
- On-device suggestions for privacy-sensitive customers

---

# Future MCP Integration

Widget Platform will expose MCP-compatible tools for external AI agents:

| MCP Tool | Description |
|---|---|
| `get_widget_schema` | Retrieve current widget schema |
| `update_widget_element` | Modify element properties |
| `list_templates` | Browse template marketplace |
| `apply_theme` | Apply theme to widget |
| `get_analytics` | Retrieve widget performance data |
| `publish_widget` | Publish widget (with confirmation) |

MCP server runs alongside the backend API, enabling third-party AI agents (Cursor, Claude, custom agents) to interact with Widget Platform programmatically.

---

# Future Agent Architecture

```
User Goal: "Create a complete lead generation system"
      ↓
Orchestrator Agent
      ├── Widget Generator Agent (creates widget)
      ├── Theme Agent (selects and customizes theme)
      ├── Copy Agent (writes all text content)
      ├── Analytics Agent (sets up tracking)
      └── Deployment Agent (publishes and generates embed code)
      ↓
User Review → Accept / Modify individual agent outputs
```

Agents operate autonomously but require user approval before applying changes. Each agent specializes in one domain and communicates through the Widget Schema.

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | AI Engineering | Initial AI assistant specification |
