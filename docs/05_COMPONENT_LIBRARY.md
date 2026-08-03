# Component Library

**Version:** 1.0  
**Status:** Draft  
**Owner:** Product Design Team  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines every reusable UI component in Widget Platform.

It serves as the authoritative reference for component APIs, states, accessibility requirements, design rules, and usage guidelines.

Every component must comply with this document and the [Design System](./DESIGN_SYSTEM.md). No component should be introduced without documentation here.

Components are built on shadcn/ui primitives with Base UI, styled with Tailwind CSS, and typed with TypeScript.

---

# Architecture

The component library follows a three-tier hierarchy:

```
┌─────────────────────────────────────────┐
│           Domain Components              │
│  Builder Canvas · Form Builder · Theme  │
├─────────────────────────────────────────┤
│           Composite Components           │
│  InputGroup · CommandPalette · DataTable  │
├─────────────────────────────────────────┤
│           Primitive Components           │
│  Button · Input · Dialog · Card · Badge   │
└─────────────────────────────────────────┘
```

**Primitives** (`components/ui/`) — Atomic, presentation-only, no business logic.

**Composites** — Composed from primitives with minimal logic (InputGroup, CommandPalette).

**Domain** — Builder-specific, theme-specific, or form-builder-specific components with feature logic.

---

# Responsibilities

## Primitive Components

- Consistent visual appearance across the platform
- Full accessibility compliance
- All defined states (hover, focus, disabled, loading, error)
- Theme-aware via semantic design tokens
- Zero business logic

## Composite Components

- Combine primitives into reusable patterns
- Handle internal state for UI interactions (open/close, focus)
- Remain feature-agnostic

## Domain Components

- Builder canvas overlays, property controls, form field editors
- Theme token editors, color pickers
- May depend on Builder Store or feature hooks
- Documented separately within this specification

---

# Principles

1. **Predictable** — Same component behaves identically everywhere
2. **Accessible** — WCAG AA, keyboard navigable, screen reader compatible
3. **Composable** — Small primitives compose into complex interfaces
4. **Stateless** — Components receive state via props; they do not own business data
5. **Theme-aware** — All colors, spacing, and typography use semantic tokens
6. **Typed** — Every prop is typed; no implicit any

---

# Component Documentation Format

Each component in this library follows a consistent structure:

- **Purpose** — What the component does
- **Props** — Typed interface
- **States** — Visual and interaction states
- **Accessibility** — ARIA, keyboard, focus requirements
- **Design Rules** — Visual constraints from the Design System
- **Interactions** — User interaction behavior
- **Usage Guidelines** — When and how to use
- **Best Practices** — Implementation recommendations
- **Do's** — Required patterns
- **Don'ts** — Anti-patterns to avoid

---

# Button

## Purpose

Communicates actions. Every button belongs to one visual variant that communicates its importance relative to other actions on the same surface.

## Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  asChild?: boolean
}
```

## States

| State | Visual |
|---|---|
| Default | Base appearance per variant |
| Hover | Subtle background/border shift |
| Focus | Focus ring using Focus token |
| Active/Pressed | Slightly darker background |
| Loading | Spinner replaces label, button disabled |
| Disabled | Reduced opacity, no pointer events |

## Accessibility

- Native `<button>` element (or `asChild` with Radix Slot)
- `aria-disabled` when loading
- `aria-busy="true"` during loading state
- Icon buttons require `aria-label`
- Focus ring always visible on keyboard navigation

## Design Rules

- Only one Primary (`default`) button per action surface
- Destructive actions use `destructive` variant with confirmation dialog
- Icon buttons use `size="icon"` with 16px or 20px Lucide icon
- Minimum touch target: 44×44px on mobile
- Border radius: Medium token

## Interactions

- Click triggers action
- Loading state prevents double submission
- Disabled state prevents interaction
- Keyboard: Enter and Space activate

## Usage Guidelines

Use Primary for the main call-to-action (Publish, Create Widget, Save). Use Secondary for supporting actions (Cancel, Back). Use Ghost for tertiary actions in toolbars. Use Destructive only for irreversible actions with confirmation.

## Best Practices

- Include loading state for async actions
- Use verb labels ("Publish Widget", not "OK")
- Pair Destructive with confirmation dialog
- Never use more than one Primary button per view

## Do's

✓ Use semantic variants  
✓ Show loading during async operations  
✓ Provide aria-label for icon-only buttons  
✓ Keep labels concise and action-oriented

## Don'ts

✗ Use Primary for non-primary actions  
✗ Disable without explanation  
✗ Use buttons for navigation (use links)  
✗ Rely on color alone to communicate destructive intent

---

# Input

## Purpose

Collects single-line text input from users.

## Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}
```

Composed with `Label`, helper text, and validation message externally.

## States

| State | Visual |
|---|---|
| Default | Border using Border token |
| Focus | Focus ring, border highlight |
| Error | Border using Danger token, error message below |
| Disabled | Muted background, no interaction |
| Read Only | Normal appearance, no editing |

## Accessibility

- Always paired with `<Label htmlFor={id}>`
- Error messages linked via `aria-describedby`
- `aria-invalid="true"` in error state
- Placeholder is supplementary, never replaces label

## Design Rules

- Height: 40px (default), 36px (sm)
- Border radius: Medium token
- Typography: Body token
- Padding: Space SM horizontal
- Full width within container by default

## Interactions

- Focus on click or Tab
- Validation on blur (not during typing)
- Clear button optional for search inputs

## Usage Guidelines

Use for single-line text: names, emails, URLs, search queries. For multi-line text, use Textarea. For structured selection, use Select or Dropdown.

## Best Practices

- Always include a visible label
- Use appropriate `type` attribute (email, url, password)
- Show helper text for format requirements
- Debounce search inputs at 300ms

## Do's

✓ Pair with Label and error message  
✓ Validate on blur  
✓ Use semantic input types

## Don'ts

✗ Use placeholder as label  
✗ Validate during typing  
✗ Create custom input styling — use the primitive

---

# Textarea

## Purpose

Collects multi-line text input.

## Props

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}
```

## States

Same as Input: Default, Focus, Error, Disabled, Read Only.

## Accessibility

Same as Input. Auto-resize should not break focus management.

## Design Rules

- Minimum height: 80px
- Border radius: Medium token
- Resize: vertical only (or none in Builder property panel)

## Interactions

- Auto-resize optional based on content
- Character count display optional for limited fields

## Usage Guidelines

Use for descriptions, messages, long-form copy. In the Builder Property Inspector, use fixed height to prevent layout shifts.

## Best Practices

- Set reasonable `rows` default (3–4)
- Show character count when max length is enforced

## Do's

✓ Allow vertical resize in forms  
✓ Fix height in constrained panels

## Don'ts

✗ Use for single-line input  
✗ Allow unbounded growth in fixed layouts

---

# Card

## Purpose

Groups related information into a contained surface.

## Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
```

## States

| State | Visual |
|---|---|
| Default | Card background, subtle border |
| Hover | Optional subtle border highlight (interactive cards) |
| Selected | Primary border or background tint |

## Accessibility

- Use semantic heading level in CardTitle
- Interactive cards use `<button>` or `<a>` wrapper with appropriate role
- Card regions do not need explicit ARIA roles when using semantic HTML

## Design Rules

- Background: Card token
- Border: 1px Border token (preferred over shadow)
- Border radius: Large token
- Padding: Space LG (24px)
- No heavy shadows — borders communicate containment

## Interactions

- Static cards: no interaction
- Interactive cards: hover state, click navigates or selects
- Dashboard stat cards: display metrics without interaction

## Usage Guidelines

Use for dashboard metrics, widget list items, template previews, settings sections. Avoid nesting cards within cards.

## Best Practices

- One primary piece of information per card
- Use CardFooter for actions
- Keep card content scannable

## Do's

✓ Use borders over shadows  
✓ Maintain consistent padding  
✓ Align cards to the layout grid

## Don'ts

✗ Nest cards deeply  
✗ Use cards for every UI grouping (use sections for simple grouping)  
✗ Add heavy elevation

---

# Dialog

## Purpose

Interrupts the current workflow for confirmation, critical forms, or destructive actions.

## Props

```typescript
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}
```

Subcomponents: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose.

## States

| State | Visual |
|---|---|
| Closed | Not rendered (or hidden) |
| Open | Overlay + centered content panel |
| Closing | Fade-out animation (250–300ms) |

## Accessibility

- Focus trapped within dialog when open
- ESC closes dialog
- `role="dialog"` with `aria-labelledby` and `aria-describedby`
- Focus returns to trigger element on close
- Background content inert (`aria-hidden`)

## Design Rules

- Overlay: semi-transparent using Overlay token
- Content: Card background, Large radius, Shadow LG
- Max width: 480px (confirmation), 640px (forms)
- Animation: 250–300ms ease-out

## Interactions

- Open via trigger click or programmatic `open` prop
- Close via ESC, overlay click (configurable), close button, or action button
- Primary action in DialogFooter (right-aligned)
- Cancel action as Ghost or Outline variant (left of primary)

## Usage Guidelines

Use for: delete confirmation, publish confirmation, critical one-step forms. Do NOT use for multi-step workflows, detailed editing, or content that preserves context — use Drawer instead.

## Best Practices

- Keep dialog content focused on one task
- Always provide a cancel/close path
- Destructive dialogs require explicit confirmation text

## Do's

✓ Trap focus  
✓ Limit to single-task workflows  
✓ Use DialogFooter for actions

## Don'ts

✗ Create mini-pages inside dialogs  
✗ Stack dialogs (dialog over dialog)  
✗ Use for editing workflows (use Drawer)

---

# Drawer

## Purpose

Provides contextual editing, detail views, and configuration panels while preserving page context.

## Props

```typescript
interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  children: React.ReactNode
}
```

## States

Same as Dialog: Closed, Open, Closing.

## Accessibility

- Focus trapped within drawer
- ESC closes drawer
- `role="dialog"` with appropriate ARIA labels
- Focus returns to trigger on close

## Design Rules

- Default side: right
- Width: 400px (detail), 480px (editing), 640px (complex forms)
- Animation: slide-in 250–300ms ease-out
- Overlay: semi-transparent

## Interactions

- Slide in from specified side
- Scrollable content area
- Fixed header and footer optional
- Swipe to close on mobile (future)

## Usage Guidelines

Use for: submission detail view, widget quick preview, theme editor, settings panels. Preferred over Dialog when context preservation matters.

## Best Practices

- Include clear close button
- Use sticky header for long content
- Right-side drawer for detail views, bottom drawer for mobile actions

## Do's

✓ Preserve page context behind drawer  
✓ Use for editing and detail views  
✓ Support scroll for long content

## Don'ts

✗ Use for simple confirmations (use Dialog)  
✗ Make drawer wider than 50% viewport  
✗ Hide close button

---

# Dropdown Menu

## Purpose

Presents a list of actions or options triggered by a button.

## Props

```typescript
interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
}
```

Subcomponents: DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuRadioGroup.

## States

| State | Visual |
|---|---|
| Closed | Trigger visible, menu hidden |
| Open | Menu positioned below/above trigger |
| Item Hover | Background highlight |
| Item Disabled | Muted text, no interaction |

## Accessibility

- Trigger is a `<button>` with `aria-haspopup="menu"`
- Menu uses `role="menu"`, items use `role="menuitem"`
- Arrow keys navigate items
- Enter/Space selects item
- ESC closes menu
- Typeahead search for long menus

## Design Rules

- Background: Surface token
- Border: 1px Border token
- Shadow: Shadow MD
- Item height: 36px
- Separator: Divider token
- Max height: 320px with scroll

## Interactions

- Click trigger to open
- Click item to select and close
- Hover highlights item
- Destructive items styled with Danger token
- Separators group related actions

## Usage Guidelines

Use for contextual actions on widgets (Edit, Duplicate, Archive, Delete), table row actions, and toolbar overflow menus. Maximum 8–10 items before considering alternative patterns.

## Best Practices

- Group related items with separators
- Place destructive actions last
- Include keyboard shortcuts in labels where applicable
- Keep labels concise

## Do's

✓ Group related actions  
✓ Place destructive actions last with Danger styling  
✓ Close after selection

## Don'ts

✗ Use for navigation (use sidebar)  
✗ Include more than 10 items without search  
✗ Nest dropdown menus

---

# Context Menu

## Purpose

Provides contextual actions on right-click or long-press.

## Props

Same API pattern as Dropdown Menu with ContextMenuTrigger wrapping the target element.

## States

Same as Dropdown Menu.

## Accessibility

- Trigger via right-click (contextmenu event) or Shift+F10
- Same keyboard navigation as Dropdown Menu
- `role="menu"` with menuitem roles

## Design Rules

Identical to Dropdown Menu styling.

## Interactions

- Right-click on target element opens menu at cursor position
- Same selection behavior as Dropdown Menu

## Usage Guidelines

Use in Builder canvas for component actions (Duplicate, Delete, Move Up, Move Down). Use in widget list for quick actions.

## Best Practices

- Mirror actions available in toolbar/inspector
- Keep menu focused on context-relevant actions

## Do's

✓ Provide same actions via keyboard-accessible alternatives  
✓ Keep context-specific

## Don'ts

✗ Use as primary action discovery mechanism  
✗ Include actions unrelated to the target element

---

# Tabs

## Purpose

Organizes content into switchable panels within the same context.

## Props

```typescript
interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}
```

Subcomponents: TabsList, TabsTrigger, TabsContent.

## States

| State | Visual |
|---|---|
| Inactive Tab | Muted text, no underline |
| Active Tab | Primary text, bottom border or background highlight |
| Disabled Tab | Muted, no interaction |
| Focus | Focus ring on trigger |

## Accessibility

- `role="tablist"`, triggers use `role="tab"`, content uses `role="tabpanel"`
- Arrow keys navigate between tabs
- `aria-selected="true"` on active tab
- Tab panels linked via `aria-labelledby`

## Design Rules

- Tab height: 40px
- Active indicator: 2px Primary bottom border or subtle background
- Typography: Label token
- Spacing: Space MD between tabs

## Interactions

- Click tab to switch content
- Content switches instantly (no animation between panels)
- Keyboard: Left/Right arrows navigate tabs

## Usage Guidelines

Use in Builder left panel (Content, Fields, Theme, Behavior), Settings sections, Analytics views (Overview, Trends, Funnels). Limit to 2–7 tabs per group.

## Best Practices

- Use concise tab labels
- Default to the most frequently used tab
- Never nest tabs within tabs

## Do's

✓ Keep tab count manageable (≤7)  
✓ Use for related content views  
✓ Preserve tab state in URL when appropriate

## Don'ts

✗ Use tabs for sequential steps (use stepper)  
✗ Nest tab groups  
✗ Hide critical actions inside inactive tabs

---

# Accordion

## Purpose

Progressively discloses grouped content sections.

## Props

```typescript
interface AccordionProps {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  children: React.ReactNode
  collapsible?: boolean
}
```

Subcomponents: AccordionItem, AccordionTrigger, AccordionContent.

## States

| State | Visual |
|---|---|
| Collapsed | Header visible, content hidden |
| Expanded | Header visible, content shown with animation |
| Focus | Focus ring on trigger |

## Accessibility

- Trigger is a `<button>` with `aria-expanded`
- Content region linked via `aria-controls`
- Enter/Space toggles section
- Arrow keys navigate between accordion headers

## Design Rules

- Header height: 44px
- Expand/collapse animation: 200ms ease-out
- Chevron icon rotates on expand
- Border between items using Divider token

## Interactions

- Click header to toggle section
- Single mode: opening one closes others
- Multiple mode: sections toggle independently

## Usage Guidelines

Use in Property Inspector for property groups (General, Layout, Typography, Colors, Spacing, Border, Shadow, Animation, Behavior, Advanced). Use in Settings for configuration sections.

## Best Practices

- Open the most relevant section by default
- Keep section headers descriptive
- Limit nesting to one level

## Do's

✓ Use for property groups in Inspector  
✓ Animate expand/collapse smoothly  
✓ Show chevron indicator

## Don'ts

✗ Nest accordions more than one level  
✗ Use for primary navigation  
✗ Hide required fields inside collapsed sections by default

---

# Table

## Purpose

Displays operational data with sorting, filtering, and pagination.

## Props

Built on TanStack Table with shadcn/ui Table primitives.

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilteringConfig
  selection?: SelectionConfig
  onRowClick?: (row: TData) => void
}
```

Subcomponents: Table, TableHeader, TableBody, TableRow, TableHead, TableCell.

## States

| State | Visual |
|---|---|
| Default Row | Standard appearance |
| Hover Row | Subtle background highlight |
| Selected Row | Primary background tint |
| Empty | Empty state message centered |
| Loading | Skeleton rows |

## Accessibility

- Use semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
- Sortable columns: `aria-sort="ascending|descending|none"`
- Selectable rows: checkbox with `aria-label`
- Loading: `aria-busy="true"` on table container

## Design Rules

- Row height: 48px (default), 40px (compact)
- Header: Label token, sticky on scroll
- Cell padding: Space MD horizontal
- Border: horizontal dividers only (Divider token)
- No vertical borders

## Interactions

- Click column header to sort (toggle asc/desc/none)
- Click row to open detail (drawer or navigate)
- Checkbox selection for bulk actions
- Pagination controls below table

## Usage Guidelines

Use for: widget list, submission list, team members, API keys, analytics breakdowns. Always include empty state and loading skeleton.

## Best Practices

- Sticky header for long lists
- Right-align numeric columns
- Include bulk action bar when selection is enabled
- Paginate at 25/50/100 rows

## Do's

✓ Include sorting and pagination  
✓ Show skeleton during loading  
✓ Provide empty state with action

## Don'ts

✗ Display unbounded data without pagination  
✗ Use tables for layout (use grid/flex)  
✗ Hide critical data in overflow

---

# Charts

## Purpose

Communicates trends, comparisons, and distributions for business analytics.

Built on Recharts with platform-specific styling.

## Props

```typescript
interface AreaChartProps {
  data: ChartDataPoint[]
  xKey: string
  yKey: string
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  color?: string  // Semantic token reference
}

interface BarChartProps { /* similar */ }
interface LineChartProps { /* similar */ }
interface PieChartProps { /* similar */ }
```

## States

| State | Visual |
|---|---|
| Default | Rendered chart with data |
| Loading | Skeleton matching chart dimensions |
| Empty | Empty state with guidance message |
| Hover | Tooltip showing data point details |
| Error | Error message with retry |

## Accessibility

- Provide text alternative summary for screen readers
- Tooltip data available via keyboard focus on data points
- Sufficient color contrast for all chart colors
- Do not rely on color alone — use patterns or labels

## Design Rules

- Colors: Primary, Secondary, Success, Warning, Danger tokens only
- Gridlines: subtle, Muted token at 20% opacity
- Axis labels: Caption token
- Tooltip: Card background, Shadow MD
- Chart height: 300px (default), 200px (compact), 400px (detailed)
- No decorative chart elements

## Interactions

- Hover data point shows tooltip
- Click data point for drill-down (future)
- Legend click toggles series visibility
- Responsive: chart resizes with container

## Usage Guidelines

Every chart must answer a business question. Dashboard: visitors over time (Area), top widgets (Bar), conversion funnel (Bar). Analytics page: trends, comparisons, distributions.

## Best Practices

- Label axes meaningfully
- Limit to 5–6 data series
- Include time range selector
- Show loading skeleton matching chart dimensions

## Do's

✓ Answer a specific business question  
✓ Include axis labels and tooltips  
✓ Use semantic color tokens

## Don'ts

✗ Create decorative charts without purpose  
✗ Use more than 6 colors in one chart  
✗ Omit loading and empty states

---

# Badge

## Purpose

Communicates status, category, or metadata in compact form.

## Props

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
}
```

## States

| State | Visual |
|---|---|
| Default | Per variant styling |
| With Icon | Icon + text inline |

Static component — no hover or interaction states.

## Accessibility

- Use `<span>` with descriptive text
- Color is supplementary to text label
- Never use badge as the only status indicator

## Design Rules

- Height: 22px
- Padding: Space XS horizontal
- Border radius: Radius Full (pill)
- Typography: Caption token, medium weight
- Variants map to semantic tokens

## Standard Badge Labels

| Label | Variant | Usage |
|---|---|---|
| Published | success | Active widget |
| Draft | secondary | Unpublished widget |
| Archived | outline | Archived widget |
| AI Generated | default | AI-created content |
| New | default | New template or feature |
| Popular | warning | High-usage template |

## Usage Guidelines

Use for widget status, template categories, feature tags. One badge per status — do not stack multiple badges for the same attribute.

## Best Practices

- Always include text (never color-only)
- Use consistent variant mapping across the platform
- Keep labels short (1–2 words)

## Do's

✓ Use standard label vocabulary  
✓ Pair with descriptive text in tables  
✓ Keep labels concise

## Don'ts

✗ Replace descriptive text with badges alone  
✗ Use badges for actions (use buttons)  
✗ Create custom colors outside variants

---

# Skeleton

## Purpose

Preserves layout during loading to prevent content shift and communicate progress.

## Props

```typescript
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string  // Width, height, border-radius
}
```

## States

| State | Visual |
|---|---|
| Loading | Pulsing animation on Muted background |
| Reduced Motion | Static Muted block (no animation) |

## Accessibility

- `aria-busy="true"` on parent container
- `aria-label="Loading"` or specific loading message
- Content replaced by skeleton should not be focusable

## Design Rules

- Background: Muted token with pulse animation
- Border radius matches the component being loaded
- Dimensions match the expected content size exactly

## Pre-built Skeleton Patterns

| Pattern | Usage |
|---|---|
| StatCardSkeleton | Dashboard metric cards |
| TableRowSkeleton | Table loading (5–10 rows) |
| ChartSkeleton | Analytics chart area |
| CardSkeleton | Widget/template cards |
| TextSkeleton | Paragraph loading |
| AvatarSkeleton | User profile loading |

## Usage Guidelines

Use on every async page and component. Never show blank layouts. Skeleton dimensions must match final content to prevent layout shift.

## Best Practices

- Match skeleton shape to expected content
- Show realistic number of skeleton items (5 table rows, 4 stat cards)
- Replace skeleton atomically when data arrives

## Do's

✓ Preserve layout dimensions  
✓ Use on every async surface  
✓ Respect reduced motion preference

## Don'ts

✗ Show blank pages during loading  
✗ Use spinners instead of skeletons for page loads  
✗ Make skeleton dimensions mismatch content

---

# Toast

## Purpose

Provides transient feedback after user actions.

Built on Sonner.

## Props

```typescript
// Via toast() function
toast(message: string, options?: {
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
  type?: 'success' | 'error' | 'warning' | 'info'
})
```

## States

| State | Visual |
|---|---|
| Entering | Slide in from bottom-right |
| Visible | Displayed for duration (4s default) |
| Exiting | Fade out |
| With Action | Action button inline |

## Accessibility

- Uses `role="status"` (success/info) or `role="alert"` (error/warning)
- Auto-dismiss does not prevent screen reader announcement
- Action button is keyboard accessible
- Not the sole feedback mechanism for critical actions

## Design Rules

- Position: bottom-right
- Background: Card token
- Border: 1px Border token
- Shadow: Shadow LG
- Max width: 400px
- Animation: slide-in 200ms ease-out
- Success icon: Success token, Error icon: Danger token

## Standard Messages

| Action | Message |
|---|---|
| Widget published | "Widget published." |
| Draft saved | "Draft saved." |
| Widget deleted | "Widget deleted." |
| Error | "We couldn't publish your widget." |
| Copied | "Embed code copied." |

## Usage Guidelines

Use for confirming successful actions and reporting transient errors. Do not use for critical errors requiring user action (use inline error or dialog).

## Best Practices

- Keep messages short and professional
- Include action button for undoable operations
- Error toasts persist until dismissed
- Success toasts auto-dismiss after 4 seconds

## Do's

✓ Use professional, concise copy  
✓ Provide undo action when applicable  
✓ Show error toasts for failed operations

## Don'ts

✗ Stack excessive toasts  
✗ Use toasts for validation errors (use inline)  
✗ Write generic messages ("Operation completed successfully")

---

# Color Picker

## Purpose

Allows users to select colors for theme customization and widget styling in the Builder.

## Props

```typescript
interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  presets?: string[]
  showAlpha?: boolean
  disabled?: boolean
}
```

## States

| State | Visual |
|---|---|
| Default | Color swatch + hex input |
| Open | Popover with color selection grid |
| Focus | Focus ring on trigger |
| Disabled | Muted, no interaction |

## Accessibility

- Trigger button with `aria-label` describing the color property
- Keyboard navigable color grid
- Hex input for precise value entry
- Color contrast warning for accessibility (future)

## Design Rules

- Swatch size: 32×32px
- Popover: standard Popover styling
- Preset colors: semantic token palette
- Hex input: monospace typography

## Interactions

- Click swatch to open popover
- Click preset color to select
- Type hex value directly
- Changes propagate immediately to Preview

## Usage Guidelines

Use in Property Inspector for color properties (background, text, border, accent). Use in Theme Editor for token overrides.

## Best Practices

- Show current color as swatch
- Include semantic preset colors
- Validate hex input format
- Warn when contrast ratio falls below WCAG AA (future)

## Do's

✓ Update Preview immediately on change  
✓ Provide hex input for precision  
✓ Include preset palette

## Don'ts

✗ Allow invalid color values  
✗ Use raw hex in component code (store as token reference when possible)  
✗ Hide contrast warnings

---

# Form Builder Components

Domain components specific to the Widget Builder form editing experience.

## FieldTypeSelector

### Purpose

Allows users to select and add form field types to the widget.

### Props

```typescript
interface FieldTypeSelectorProps {
  onSelect: (fieldType: FieldType) => void
  disabled?: boolean
}
```

### Supported Field Types

Text, Email, Phone, Number, Textarea, Select, Checkbox, Radio, Date, URL, Hidden.

### Usage Guidelines

Display as grid or list in Builder left panel Fields section. Each type shows icon and label.

---

## FieldEditor

### Purpose

Edits properties of a selected form field in the Property Inspector.

### Props

```typescript
interface FieldEditorProps {
  field: FormFieldSchema
  onChange: (updates: Partial<FormFieldSchema>) => void
}
```

### Property Groups

General (label, placeholder, required), Validation (rules, messages), Appearance (width, layout), Behavior (conditional visibility — future).

---

## FieldPreview

### Purpose

Renders a form field inside the Live Preview canvas.

### Props

```typescript
interface FieldPreviewProps {
  field: FormFieldSchema
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
}
```

### Interactions

Click to select. Hover shows boundary overlay. Drag handle for reordering via dnd-kit.

---

## ValidationRuleEditor

### Purpose

Configures validation rules for form fields.

### Props

```typescript
interface ValidationRuleEditorProps {
  rules: ValidationRule[]
  fieldType: FieldType
  onChange: (rules: ValidationRule[]) => void
}
```

---

# Builder Canvas Components

Domain components for the Widget Builder editing canvas.

## CanvasFrame

### Purpose

Container for the Live Preview with device simulation and zoom controls.

### Props

```typescript
interface CanvasFrameProps {
  device: 'desktop' | 'tablet' | 'mobile'
  zoom: number
  children: React.ReactNode
}
```

### Design Rules

- Desktop: full width within canvas
- Tablet: 768px centered
- Mobile: 375px centered
- Background: checkerboard or muted pattern outside widget bounds
- Zoom: 50%–150%, Fit Width, Fit Screen

---

## SelectionOverlay

### Purpose

Visual indicator for the currently selected element in the canvas.

### Props

```typescript
interface SelectionOverlayProps {
  bounds: DOMRect
  label: string
  resizeHandles?: boolean
}
```

### Design Rules

- Border: 2px Primary color
- Corner handles: 8×8px squares
- Label: positioned above selection, Caption typography
- No layout impact (absolute positioned)

---

## HoverOverlay

### Purpose

Subtle highlight when hovering over selectable elements.

### Design Rules

- Border: 1px Primary at 50% opacity
- Label: element type name
- No handles, no interaction

---

## ComponentTree

### Purpose

Navigator panel displaying the widget component hierarchy.

### Props

```typescript
interface ComponentTreeProps {
  schema: WidgetSchema
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (fromId: string, toId: string) => void
}
```

### Interactions

Click to select. Drag to reorder. Right-click for context menu. Expand/collapse nodes.

---

## PropertyPanel

### Purpose

Context-aware property editor for the selected element.

### Props

```typescript
interface PropertyPanelProps {
  element: SchemaNode | null
  onPropertyChange: (key: string, value: unknown) => void
}
```

Renders property groups as Accordion sections. Only shows properties belonging to the selected element type.

---

## DragOverlay

### Purpose

Visual feedback during drag-and-drop reordering.

### Design Rules

- Semi-transparent copy of dragged element
- Insertion line at drop target
- Auto-scroll when near canvas edges

---

# Theme Components

Domain components for theme editing and preview.

## ThemePreview

### Purpose

Renders a widget with a specific theme applied for preview in Theme Gallery.

## ThemeTokenEditor

### Purpose

Edits individual theme token values (color, typography, spacing, radius, shadow).

### Props

```typescript
interface ThemeTokenEditorProps {
  token: ThemeToken
  value: string
  onChange: (value: string) => void
}
```

## ThemeSelector

### Purpose

Grid of available themes for selection in Builder and Theme Gallery.

### Props

```typescript
interface ThemeSelectorProps {
  themes: ThemeSummary[]
  activeThemeId: string
  onSelect: (themeId: string) => void
}
```

---

# Best Practices

## Component Development Lifecycle

Every component follows: Research → Design → Implementation → Documentation → Testing → Review → Release → Maintenance.

No component ships without documentation in this library.

## Composition Pattern

```typescript
// Good: compose primitives
<Card>
  <CardHeader>
    <CardTitle>Widget Name</CardTitle>
    <Badge variant="success">Published</Badge>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>
    <Button variant="outline">Edit</Button>
    <Button>View Analytics</Button>
  </CardFooter>
</Card>

// Bad: monolithic component with embedded logic
<WidgetCard widget={widget} onEdit={...} onDelete={...} />
```

Prefer composition unless the pattern repeats identically across 3+ locations.

## State Matrix Compliance

Every component must implement all applicable states from the Design System state matrix: Default, Hover, Focus, Active, Loading, Error, Disabled, Read Only.

---

# Acceptance Criteria

The component library is production-ready when:

- [ ] All primitive components are implemented and documented
- [ ] Every component supports dark mode via semantic tokens
- [ ] All interactive components are keyboard accessible
- [ ] Every component defines all applicable states
- [ ] Builder domain components integrate with Builder Store
- [ ] No duplicate components exist
- [ ] All components are typed with strict TypeScript
- [ ] Component tests cover rendering, states, and accessibility
- [ ] Storybook or equivalent visual documentation exists (future)
- [ ] This document remains synchronized with implementation

---

# Future Evolution

## Phase 2

- Storybook integration for visual component documentation
- Light mode verification for all components
- Component performance benchmarks

## Phase 3

- Custom component plugin API for Builder
- Animated component variants (Framer Motion integration)
- Advanced Color Picker with accessibility contrast checking

## Phase 4

- Public component library package (`@widget-platform/ui`)
- Theme-aware component tokens exportable to Runtime
- Component usage analytics in CI

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Product Design Team | Initial component library specification |
