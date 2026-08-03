# Theme Engine Specification

**Version:** 1.0  
**Status:** Draft  
**Owner:** Platform Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the architecture, inheritance model, token system, and customization capabilities of the Widget Platform Theme Engine.

Themes control the visual appearance of widgets across the Builder Preview, published widgets, and Widget Runtime. The Theme Engine ensures consistent visual output across all rendering contexts.

Related documents: [Design System](./DESIGN_SYSTEM.md), [Widget Builder Specification](./06_WIDGET_BUILDER_SPECIFICATION.md), [Widget Runtime Specification](./10_WIDGET_RUNTIME_SPECIFICATION.md), [Database Design](./08_DATABASE_DESIGN.md).

---

# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Theme Engine                            │
│                                                             │
│  Base Tokens → Theme Definition → Inheritance Chain         │
│       → Override Resolution → CSS Variable Generation        │
│       → Applied to Renderer Output                           │
├─────────────────────────────────────────────────────────────┤
│  Consumed By: Builder Preview · Runtime · Theme Gallery      │
└─────────────────────────────────────────────────────────────┘
```

The Theme Engine is shared between the Builder and Runtime. Both consume the same token resolution pipeline to guarantee visual parity.

---

# Responsibilities

- Define and manage theme token structures
- Resolve theme inheritance and override chains
- Generate CSS custom properties from resolved tokens
- Apply themes to widget rendering in Builder and Runtime
- Support theme creation, duplication, and export/import
- Validate theme configurations
- Support dark mode theming

---

# Principles

## 1. Token-Based

All visual properties expressed as named tokens, never raw values in components.

## 2. Inheritance

Themes inherit from base tokens with progressive override capability.

## 3. Consistent Resolution

Same inheritance chain produces identical output in Builder Preview and Runtime.

## 4. Non-Destructive Customization

Applying a theme never modifies the Widget Schema structure. Theme references are separate from content.

## 5. Validated

Theme configurations validated before application. Invalid tokens rejected with clear errors.

---

# Theme Architecture

## Theme Layers

```
System Base Tokens (platform defaults)
      ↓
Theme Definition (Minimal, Corporate, Modern, etc.)
      ↓
Template Theme (applied on template import)
      ↓
Widget Theme Override (widget-level customization)
      ↓
Component Override (individual component styling)
      ↓
Inline Override (specific property override)
```

Each layer overrides only the tokens it defines. Undefined tokens inherit from the layer above.

## Theme Reference in Widget Schema

```typescript
interface ThemeReference {
  themeId: string | null       // Reference to Theme entity (null = system default)
  overrides: Partial<ThemeTokens>  // Widget-level token overrides
}
```

Component-level overrides stored in individual ComponentNode properties:

```typescript
interface ComponentNode {
  id: string
  type: ComponentType
  properties: {
    // ... content properties
    themeOverrides?: Partial<ComponentThemeTokens>
  }
}
```

---

# Inheritance

## Resolution Algorithm

```typescript
function resolveTheme(
  baseTokens: ThemeTokens,
  theme: ThemeTokens,
  widgetOverrides: Partial<ThemeTokens>,
  componentOverrides: Partial<ComponentThemeTokens>,
  inlineOverrides: Record<string, string>,
): ResolvedTokens {
  return deepMerge(
    baseTokens,
    theme,
    widgetOverrides,
    componentOverrides,
    inlineOverrides,
  )
}
```

Deep merge with last-writer-wins for conflicting keys. Arrays replaced, not merged.

## Inheritance Example

```
Base:     primary: #3B82F6
Theme:    primary: #2563EB  (overrides base)
Widget:   (not set)         (inherits theme)
Component: primary: #1D4ED8 (overrides for this button only)
Result:   Button primary = #1D4ED8, everything else = #2563EB
```

## Priority Order

1. Inline Overrides (highest)
2. Component Overrides
3. Widget Overrides
4. Template Theme
5. Theme Definition
6. System Base Tokens (lowest)

---

# Overrides

## Widget-Level Overrides

Applied in the Builder Theme section. Affect the entire widget.

```typescript
interface WidgetThemeOverrides {
  colors?: Partial<ThemeColors>
  typography?: Partial<ThemeTypography>
  spacing?: Partial<ThemeSpacing>
  borderRadius?: Partial<ThemeBorderRadius>
}
```

## Component-Level Overrides

Applied in the Property Inspector when a component is selected.

```typescript
interface ComponentThemeTokens {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  fontSize?: string
  fontWeight?: string
  padding?: string
  borderRadius?: string
}
```

## Override UI

Property Inspector shows theme properties alongside content properties. Color properties render as Color Picker components. Typography properties render as Select/Input components. Overrides visually indicated with a dot or badge to distinguish from inherited values.

Reset button on overridden properties restores inheritance.

---

# Theme Tokens

## Complete Token Structure

```typescript
interface ThemeTokens {
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
  animations: ThemeAnimations
}

interface ThemeColors {
  background: string
  surface: string
  card: string
  primary: string
  secondary: string
  accent: string
  muted: string
  success: string
  warning: string
  danger: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  divider: string
  overlay: string
  focusRing: string
}

interface ThemeTypography {
  fontFamily: string
  fontFamilyHeading: string
  displaySize: string
  heading1Size: string
  heading2Size: string
  heading3Size: string
  bodyLargeSize: string
  bodySize: string
  bodySmallSize: string
  captionSize: string
  labelSize: string
  buttonSize: string
  headingWeight: string
  bodyWeight: string
  labelWeight: string
  lineHeight: string
  letterSpacing: string
}

interface ThemeSpacing {
  unit: number
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
  widgetPadding: string
  fieldGap: string
  sectionGap: string
}

interface ThemeBorderRadius {
  small: string
  medium: string
  large: string
  xl: string
  full: string
  widget: string
  field: string
  button: string
}

interface ThemeShadows {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  widget: string
}

interface ThemeAnimations {
  durationFast: string
  durationNormal: string
  durationSlow: string
  easingDefault: string
  easingSpring: string
  entranceType: 'fade' | 'scale' | 'slide' | 'pop'
  exitType: 'fade' | 'scale' | 'slide'
}
```

## CSS Variable Generation

Resolved tokens generate CSS custom properties:

```css
:root {
  --wp-color-background: #09090B;
  --wp-color-primary: #3B82F6;
  --wp-color-text: #FAFAFA;
  --wp-font-family: 'Inter', system-ui, sans-serif;
  --wp-font-size-body: 14px;
  --wp-spacing-md: 16px;
  --wp-radius-button: 8px;
  --wp-shadow-widget: 0 4px 24px rgba(0, 0, 0, 0.3);
  --wp-animation-duration: 250ms;
}
```

Components reference CSS variables, never hardcoded values:

```css
.wp-button {
  background: var(--wp-color-primary);
  color: var(--wp-color-text);
  font-size: var(--wp-font-size-button);
  border-radius: var(--wp-radius-button);
  padding: var(--wp-spacing-sm) var(--wp-spacing-md);
}
```

---

# Theme Export/Import

## Export

Users export workspace themes as JSON files:

```json
{
  "name": "My Brand Theme",
  "version": "1.0.0",
  "tokens": { }
}
```

Export available from Theme Gallery and Builder Theme section.

## Import

Users import theme JSON files into their workspace:

1. Upload JSON file or paste JSON
2. Theme Engine validates token structure
3. Theme created as workspace theme
4. Available in Theme Gallery and Builder

## Validation on Import

- All required token categories present
- Color values valid (hex, rgb, hsl)
- Size values valid (px, rem, em)
- Font family strings valid
- No unknown token keys (warn, don't reject)

---

# Dark Mode

Dark mode is the primary visual experience for Widget Platform.

## Platform Dark Mode

The application UI is dark-first. All platform components designed for dark mode using semantic tokens from the Design System.

## Widget Dark Mode

Widgets inherit theme colors. System themes are designed dark-first:

| System Theme | Character |
|---|---|
| Minimal | Dark background, subtle borders, clean typography |
| Corporate | Dark navy, professional, structured |
| Modern | Dark with gradient accents, bold CTAs |
| Glass | Dark with frosted glass effect, blur backgrounds |
| Linear | Dark inspired by Linear app, precise spacing |
| Stripe | Dark inspired by Stripe Dashboard, clean data feel |

## Light Mode (Future)

Light mode themes derived from dark themes by inverting background/text relationships while maintaining accent colors. Same token structure, different values.

Never maintain separate component implementations for dark and light mode.

---

# Theme Validation

## Validation Rules

| Rule | Check |
|---|---|
| Required tokens | All color, typography, spacing tokens defined |
| Color format | Valid hex, rgb, or hsl values |
| Contrast ratio | Text on background ≥ 4.5:1 (WCAG AA) |
| Button contrast | Button text on button background ≥ 4.5:1 |
| Font size minimum | Body text ≥ 14px, labels ≥ 12px |
| Touch target | Button height ≥ 44px (mobile) |
| Spacing consistency | Values align to 4px grid |

## Validation Timing

- On theme creation/update (server-side)
- On theme application in Builder (client-side, real-time)
- On widget publish (server-side, blocks publish if contrast fails)

## Validation UI

Contrast failures shown as warnings in the Builder Theme section:

```
⚠ Button text contrast is 3.2:1 (needs 4.5:1)
  [Auto-fix] [Ignore]
```

---

# System Themes

Launch system themes:

| Theme | Target Industry | Key Characteristics |
|---|---|---|
| Minimal | General | Clean, dark, subtle, Inter font |
| Corporate | B2B, Finance | Structured, navy tones, professional |
| Modern | Startups, SaaS | Gradient accents, bold CTAs, contemporary |
| Glass | Creative, Tech | Frosted glass, blur, transparency |
| Linear | SaaS, Developer Tools | Precise spacing, muted palette, sharp |
| Stripe | Fintech, SaaS | Clean data aesthetic, blue accents |
| Warm | Restaurant, Hospitality | Warm tones, inviting, rounded |
| Healthcare | Medical, Dental | Clean, blue, trustworthy, accessible |

Each system theme is a complete ThemeTokens object stored in the database with `isSystem: true`.

---

# Best Practices

## Do

- Use semantic token names, never raw values in widget components
- Test themes with all widget types before publishing
- Verify WCAG AA contrast for every theme
- Provide reset-to-default for every override
- Generate CSS variables from resolved tokens
- Keep system themes curated and high-quality

## Do Not

- Hardcode colors in Renderer components
- Create themes with insufficient contrast
- Allow theme overrides to break widget layout
- Store resolved tokens (always resolve at render time)
- Mix token naming conventions

---

# Acceptance Criteria

The Theme Engine is production-ready when:

- [ ] Token resolution produces identical output in Builder and Runtime
- [ ] All 8 system themes implemented and validated
- [ ] Inheritance chain correctly resolves overrides at all levels
- [ ] CSS variable generation works for all token categories
- [ ] Theme export/import preserves all token values
- [ ] Contrast validation catches WCAG AA violations
- [ ] Theme switching in Builder completes within 100ms
- [ ] Custom workspace themes can be created and applied
- [ ] Theme Gallery displays all available themes with previews
- [ ] Component-level overrides work in Property Inspector

---

# Future Evolution

## Phase 2 — Theme Marketplace

- Community-published themes
- Premium theme packs by industry
- Theme ratings and reviews
- Theme preview with user's actual widget content

## Phase 3 — Advanced Theming

- Light mode theme variants
- Custom font upload
- CSS animation builder
- Theme responsive breakpoints (different tokens per device)

## Phase 4 — Brand Kit

- Workspace brand kit (logo, colors, fonts) auto-applied to themes
- Brand consistency enforcement across all widgets
- Theme generation from brand colors (AI-powered)

---

# Future Marketplace

The Theme Marketplace follows the same architecture as the Template Marketplace:

- System themes (platform curated)
- Community themes (user published)
- Premium themes (paid)
- Theme collections (curated sets)
- AI theme generation from brand description

Themes in the marketplace include live preview, usage count, and category filtering.

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Platform Engineering | Initial theme engine specification |
