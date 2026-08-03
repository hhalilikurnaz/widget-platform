# Widget Builder Specification

**Version:** 1.0

**Status:** Draft

**Owner:** Product Team

**Primary Audience:** Frontend Engineers, Backend Engineers, Product Designers, AI Coding Agents

**Priority:** Critical

---

# Purpose

This document defines the architecture, interaction model, user experience, technical responsibilities, and implementation requirements of the Widget Builder.

The Widget Builder is the heart of Widget Platform.

Every other module exists to support or extend the Builder.

Any architectural decision affecting widget creation must comply with this specification.

---

# Product Vision

The Builder should not feel like a settings page.

It should feel like a professional visual editor.

The experience should combine ideas from:

• Figma

• Framer

• Canva

• Stripe Dashboard

• Intercom

while remaining optimized specifically for website widgets.

Users should never think:

"I'm configuring a form."

Instead they should feel:

"I'm designing an experience."

---

# Core Design Principles

The Builder follows seven principles.

---

## 1. Visual First

Every important modification must immediately appear inside the live preview.

Users should never save before seeing changes.

No manual refresh.

No preview button.

Everything updates instantly.

---

## 2. Direct Manipulation

Whenever possible the user interacts with the widget itself instead of settings.

Examples

Changing spacing

↓

drag slider

Changing colors

↓

color picker

Changing text

↓

inline editing

Reordering fields

↓

drag & drop

---

## 3. Immediate Feedback

Every action produces feedback.

Examples

Change border radius

↓

Preview updates

Duplicate field

↓

Animation

Delete field

↓

Fade animation

Publish

↓

Toast

↓

Success animation

---

## 4. Progressive Complexity

Beginners should see only essential controls.

Advanced users may open:

Advanced

Developer

Custom CSS

Webhook

Custom JavaScript

Localization

Accessibility

---

## 5. Non-destructive Editing

Users should never fear experimentation.

The Builder always supports:

Undo

Redo

History

Auto Save

Draft Recovery

---

## 6. Performance

The Builder must remain responsive even with:

100+ fields

Complex themes

Animations

Large forms

Preview updates should remain under 16ms whenever possible.

---

## 7. Accessibility

Everything inside the Builder must remain keyboard accessible.

Every action available via mouse should also be possible via keyboard.

---

# High Level Layout

The Builder consists of three permanent panels.

```
+--------------------------------------------------------------+
| Top Toolbar                                                  |
+-----------+----------------------------+----------------------+
|           |                            |                      |
| Navigator |      Live Preview          | Property Inspector   |
|           |                            |                      |
|           |                            |                      |
|           |                            |                      |
+-----------+----------------------------+----------------------+
```

Each panel has a dedicated responsibility.

---

# Panel Responsibilities

## Left Panel

Navigation.

Never editing.

Contains:

Content

Fields

Appearance

Behavior

Trigger

Templates

Theme Gallery

Localization

Advanced

History

---

## Center Panel

Interactive preview.

The preview is the single source of visual truth.

Users should interact directly with the widget.

Everything updates instantly.

---

## Right Panel

Properties.

Displays editable properties for the currently selected object.

Nothing else.

No navigation.

No unrelated controls.

---

# Builder Toolbar

Global actions.

Contains:

Back

Undo

Redo

Preview Device

Publish

Save Draft

Share

Command Palette

Widget Status

Workspace

Search

Profile

---

# Builder Navigation

The left panel acts as a navigator.

It never changes position.

It supports icons and labels.

Required sections:

General

Content

Fields

Theme

Behavior

Trigger

Localization

Advanced

History

AI Assistant

---

# Builder Modes

The Builder supports three editing modes.

## Basic

For beginners.

Shows only essential controls.

---

## Advanced

Shows all configuration options.

---

## Developer

Shows:

Custom CSS

Webhook

JavaScript

API Integration

Schema

JSON Export

---

# Widget Lifecycle

Every widget progresses through the following states.

Draft

↓

Editing

↓

Preview

↓

Ready

↓

Published

↓

Archived

The Builder must clearly communicate the current state.

---

# Widget Types

Version 1 supports:

Lead Form

Newsletter

Appointment

Support

Contact

Feedback

Survey

Popup

Inline Widget

Floating Widget

Each widget type extends the same internal schema.

---

# Builder Navigation Rules

Users should never navigate deeper than one level.

Every panel should remain visible.

The Builder should preserve context.

Avoid modal-heavy workflows.

---

# Live Preview Philosophy

The Preview is not a screenshot.

It is the actual runtime.

Every interaction must behave exactly as the published widget.

Examples

Typing

Validation

Animations

Buttons

Success State

Closing

Reopening

Everything should behave identically.

---

# Device Preview

Supported devices

Desktop

Tablet

Mobile

Changing devices should only change layout.

Never change functionality.

---

# Zoom Controls

Users may zoom:

50%

75%

100%

125%

150%

Fit Width

Fit Screen

Zoom affects only the canvas.

Never modify widget dimensions.

---

# Selection Model

Only one element can be selected simultaneously.

Selected elements display:

Outline

Resize Handles

Property Synchronization

The Property Inspector always reflects the current selection.

---

# Supported Selectable Objects

Widget

↓

Header

↓

Title

↓

Subtitle

↓

Description

↓

Form

↓

Field

↓

Button

↓

Footer

↓

Success Screen

↓

Close Button

↓

Floating Button

Each object exposes different editable properties.

---

# Property Synchronization

Every property update immediately synchronizes:

Canvas

↓

Inspector

↓

Internal State

↓

Preview

No manual save is required.

---

# Auto Save

The Builder automatically saves:

Every 10 seconds

On blur

Before leaving page

Before publishing

Recovery should be possible after browser crashes.

---

# History System

Every meaningful action creates a history entry.

Examples

Change Color

↓

History

Move Field

↓

History

Delete Field

↓

History

History supports:

Undo

Redo

Restore Previous State

History should persist during the editing session.

---

# Keyboard Shortcuts

Professional software requires keyboard efficiency.

Examples

Ctrl + Z

Undo

Ctrl + Shift + Z

Redo

Ctrl + S

Save Draft

Ctrl + K

Command Palette

Delete

Remove Selected Element

Esc

Clear Selection

Space

Hand Tool (future)

Tab

Next Property

Shift + Tab

Previous Property

Every shortcut should appear in tooltips where appropriate.

---

# Builder State Architecture

The Widget Builder is driven by a centralized state engine.

Every editable property within the Builder belongs to a single source of truth.

The Builder should never rely on scattered component state.

The architecture follows a unidirectional data flow.

```
User Interaction

↓

Builder Store

↓

Widget Schema

↓

Live Preview

↓

Property Inspector

↓

History Engine

↓

Persistence
```

Every UI component reads from the Builder Store.

Every modification updates the Builder Store first.

The Preview never owns state.

The Inspector never owns state.

The Component Tree never owns state.

They are all synchronized views of the same Widget Schema.

---

# Builder Store

The Builder Store contains the complete editing session.

Responsibilities include:

- Widget Metadata
- Theme Configuration
- Selected Element
- Hovered Element
- Widget Schema
- Form Fields
- Animation Settings
- Trigger Settings
- History
- Draft State
- Validation State
- Dirty State
- Publish Status

Only the Builder Store may mutate widget data.

---

# Widget Schema

Every widget is represented as a structured JSON schema.

The Builder never edits HTML directly.

The Preview renders the schema.

Example hierarchy:

Widget

↓

Header

↓

Content

↓

Form

↓

Fields

↓

Button

↓

Success Screen

↓

Footer

Every node owns its own properties.

---

# Schema Principles

The schema must be:

Serializable

Versioned

Extensible

Portable

Framework Independent

Future Builder versions should remain backwards compatible.

---

# Component Tree

Every widget is represented as a visual component tree.

Example

```
Widget

├── Header
│
├── Content
│
├── Form
│   ├── Name Field
│   ├── Email Field
│   ├── Phone Field
│   └── Message
│
├── Button
│
└── Footer
```

The tree mirrors the Widget Schema.

Tree changes immediately affect Preview.

---

# Tree Interactions

Supported interactions

Select

Rename

Duplicate

Delete

Move

Collapse

Expand

Drag

Drop

Copy

Paste (Future)

Multi Select (Future)

---

# Selection Engine

Only one component may be selected at a time.

Selection updates:

Property Inspector

↓

Canvas Highlight

↓

Breadcrumb

↓

Builder Store

Selection should remain persistent while editing.

---

# Hover Engine

Hovering over any component should:

Highlight the component

Display its boundaries

Reveal quick actions

Never change widget layout.

---

# Drag & Drop Engine

Users should reorder fields visually.

Supported actions

Move Field

Duplicate Field

Move Section

Nested Reordering (Future)

Drag feedback should include:

Insertion Line

Drop Target Highlight

Auto Scroll

Snap Animation

---

# Drop Zones

Every valid drop target should become visible while dragging.

Invalid targets should reject drops gracefully.

No hidden behavior.

---

# Resize Engine

Resizable components include:

Widget Width

Input Width

Textarea Height

Image

Logo

Spacing Blocks

Resizing updates Preview immediately.

---

# Alignment System

Supported alignment

Left

Center

Right

Stretch

Distribution should remain consistent.

---

# Property Inspector

The Inspector is context aware.

No property should appear unless it belongs to the selected component.

Example

Selecting a Button

↓

Button Properties

Selecting an Input

↓

Input Properties

Selecting the Widget

↓

Widget Properties

Avoid overwhelming users.

---

# Property Groups

Properties are grouped.

General

Layout

Typography

Colors

Spacing

Border

Shadow

Animation

Behavior

Advanced

Each group should be collapsible.

---

# Inline Editing

Text elements support inline editing.

Title

Subtitle

Description

Button Label

Success Message

Footer

Changes immediately synchronize with the Builder Store.

---

# Validation Engine

Every editable property is validated.

Examples

Empty Title

↓

Warning

Invalid Color

↓

Reject

Duplicate Field ID

↓

Reject

Invalid URL

↓

Error

Validation should occur in real time.

---

# Dirty State

Every unsaved modification marks the Builder as dirty.

The interface should clearly communicate:

Unsaved Changes

↓

Saving...

↓

Saved

Users should never lose edits unexpectedly.

---

# Live Preview Rendering Pipeline

The rendering pipeline follows these steps.

Builder Store

↓

Widget Schema

↓

Renderer

↓

Theme Engine

↓

Animation Engine

↓

Preview

No intermediate transformations should occur inside UI components.

---

# Renderer Responsibilities

The Renderer is responsible for:

Rendering Schema

Applying Theme

Applying Layout

Applying Typography

Applying Colors

Applying Animations

Applying Runtime Behaviors

Nothing else.

---

# Preview Synchronization

Every change should appear in Preview within one frame whenever possible.

Target:

<16ms

Preview should never require manual refresh.

---

# Theme Engine Integration

Themes are applied after layout generation.

Priority

Base Theme

↓

Template

↓

Widget Overrides

↓

Component Overrides

↓

Inline Overrides

Lower levels always override higher levels.

---

# Animation Engine

Animations are independent from components.

Every animation references tokens.

Examples

Fade

Scale

Slide

Pop

Bounce

Animation configuration belongs to the Theme Engine rather than individual components whenever possible.

---

# Undo / Redo Engine

Every state mutation creates a history snapshot.

Undo restores the previous snapshot.

Redo restores the next snapshot.

History should ignore:

Hover

Focus

Temporary UI state

Only meaningful edits are recorded.

---

# Clipboard Operations

Supported

Duplicate

Delete

Copy (Future)

Paste (Future)

Component cloning should preserve:

Styles

Validation

Behavior

IDs should always regenerate.

---

# Auto Save Engine

Drafts save automatically.

Triggers

10 Seconds

Manual Save

Blur

Page Leave

Publish

Browser Close

Recovery should occur automatically.

---

# Conflict Resolution

If multiple edits occur simultaneously in future collaborative versions:

Last valid operation wins until collaborative editing is introduced.

The architecture should remain ready for CRDT-based synchronization in future releases.

---

# Performance Targets

Preview Update

≤16ms

Selection Update

≤8ms

Property Update

≤16ms

History Restore

≤50ms

Theme Switch

≤100ms

Publish Preparation

≤300ms

These values define target user experience rather than strict implementation constraints.

---

# Builder Acceptance Criteria

The Builder is considered production-ready only when:

✓ Every property updates instantly

✓ Preview always reflects the current schema

✓ Drag & Drop is smooth

✓ Undo and Redo never lose state

✓ Auto Save prevents data loss

✓ Validation prevents invalid configurations

✓ Property Inspector remains context-aware

✓ Theme changes propagate correctly

✓ Keyboard shortcuts function consistently

✓ The Builder feels responsive under heavy editing sessions

---

# AI Widget Assistant

The AI Widget Assistant is an intelligent co-pilot integrated directly into the Widget Builder.

Its purpose is not to replace users.

Its purpose is to accelerate creation, reduce repetitive work, and improve design quality.

Users remain in full control of every generated result.

The AI should feel like working alongside an experienced Product Designer and Frontend Engineer.

---

# AI Design Philosophy

The assistant follows four principles.

## Assist, Never Replace

AI should propose.

The user decides.

No automatic destructive modifications.

Every generated change requires user confirmation.

---

## Context Awareness

The assistant always understands:

Current widget

Selected element

Current theme

Current layout

Industry

Language

Widget goal

Screen size

AI suggestions should always consider the current editing context.

---

## Explain Decisions

Whenever AI generates content it should explain why.

Example

"We reduced the form from six fields to three because shorter forms generally convert better."

The assistant should educate users rather than simply generating content.

---

## Progressive AI

AI becomes more powerful as users continue editing.

Examples

First prompt

↓

Generate Widget

Second prompt

↓

Improve CTA

Third prompt

↓

Optimize Colors

Fourth prompt

↓

Reduce Form Friction

The Builder becomes smarter during the editing session.

---

# AI Capabilities

Version 1 supports:

Generate Widget

Improve Widget

Generate Copy

Generate Form Fields

Suggest CTA

Suggest Colors

Suggest Theme

Improve Accessibility

Improve Conversion

Suggest Animations

Generate Success Screen

Optimize Layout

Summarize Widget

Explain Widget

Future versions may support complete multi-step customer journeys.

---

# AI Generation Flow

Describe Widget

↓

Analyze Prompt

↓

Choose Template

↓

Generate Schema

↓

Generate Theme

↓

Generate Copy

↓

Generate Fields

↓

Generate Behavior

↓

Preview

↓

User Review

↓

Accept

↓

Continue Editing

The Builder always opens with editable results.

Never locked output.

---

# Prompt Examples

Users may type:

Create a lead generation widget for a dental clinic.

Create a demo request popup for a SaaS startup.

Create a newsletter signup widget using a minimal theme.

Create a Black Friday popup with countdown.

Create an appointment booking widget.

Create a restaurant reservation form.

The assistant translates natural language into Widget Schema.

---

# AI Generated Properties

The assistant may generate:

Widget Name

Title

Subtitle

Description

Fields

Validation

CTA

Success Screen

Theme

Spacing

Typography

Animation

Trigger

Position

Default Language

Everything remains editable.

---

# AI Suggestions Panel

The Builder contains a dedicated AI Suggestions panel.

Examples

Reduce Form Length

Increase Button Contrast

Use Higher Converting CTA

Improve Mobile Layout

Improve Accessibility

Reduce Cognitive Load

Improve Visual Hierarchy

Each suggestion may be accepted individually.

---

# AI Copywriting

The assistant generates:

Titles

Descriptions

Placeholder Text

Validation Messages

CTA Buttons

Success Messages

Error Messages

All copy should follow professional UX writing standards.

---

# AI Accessibility Review

The assistant continuously evaluates:

Color Contrast

Touch Target Size

Typography

Field Labels

Keyboard Accessibility

Screen Reader Compatibility

Accessibility improvements appear as suggestions.

---

# AI Theme Recommendation

The assistant analyzes:

Industry

Brand Personality

Widget Goal

User Intent

Then recommends the most appropriate visual theme.

Examples

Healthcare

↓

Clean

Minimal

Blue

Professional

Restaurant

↓

Warm

Elegant

Photography

Startup

↓

Modern

Gradient

Bold CTA

---

# AI Conversion Review

The assistant evaluates:

Too Many Fields

Weak CTA

Long Description

Poor Contrast

Button Position

Visual Hierarchy

Animations

Recommendations should reference UX best practices.

---

# AI Interaction Model

Every AI response follows the same interaction.

Prompt

↓

Generation

↓

Preview

↓

Explanation

↓

Accept

↓

Modify

↓

Reject

Users always remain in control.

---

# Template Marketplace Integration

The AI may recommend templates.

Examples

Lead Generation

↓

Healthcare Lead Form

Demo Request

↓

SaaS Demo Template

Restaurant

↓

Reservation Template

The recommendation should include a reason.

---

# Theme Gallery Integration

AI may recommend:

Minimal

Linear

Stripe

Corporate

Glass

Apple

Modern

The recommendation is applied only after user confirmation.

---

# Widget Publishing Pipeline

Publishing follows a deterministic pipeline.

Draft

↓

Validation

↓

Generate Embed Token

↓

Generate Runtime Configuration

↓

Generate Public Configuration

↓

Generate Embed Snippet

↓

Publish

↓

Widget Available

Publishing should never bypass validation.

---

# Validation Before Publish

The Builder verifies:

Title

Required Fields

Button Label

Theme

Trigger

Widget Schema

Accessibility

Runtime Configuration

If validation fails publishing is blocked.

---

# Runtime Synchronization

The Builder never generates HTML directly.

The Builder generates Widget Schema.

↓

Runtime receives Schema.

↓

Runtime renders Widget.

This ensures Preview and Production remain identical.

---

# Embed Generation

Publishing generates:

Unique Embed Token

↓

Public Configuration Endpoint

↓

JavaScript Snippet

↓

Copy Button

↓

Installation Instructions

Every widget receives its own immutable identifier.

---

# Widget Runtime

The Runtime is framework independent.

Supported websites:

HTML

React

Next.js

Vue

Angular

Svelte

WordPress

Webflow

Shopify

The runtime should require only one JavaScript snippet.

---

# Analytics Integration

Every runtime interaction produces analytics events.

Examples

Widget Viewed

Widget Opened

Field Focused

Field Completed

Submission Started

Submission Completed

Widget Closed

Exit Intent Triggered

Analytics should never affect rendering performance.

---

# Submission Flow

Successful submission pipeline.

User

↓

Validation

↓

Spam Protection

↓

Backend

↓

Database

↓

Webhook

↓

Email

↓

Analytics

↓

Success Screen

Every step should be observable.

---

# Developer Mode

Advanced users may access Developer Mode.

Capabilities include:

Schema Viewer

JSON Export

JSON Import

Webhook Configuration

Custom CSS

Custom JavaScript

Debug Console

Preview Events

Network Requests

Developer Mode should never affect beginner workflows.

---

# Collaboration (Future)

Future releases should support:

Live Collaboration

Presence Indicators

Cursor Sharing

Commenting

Version History

Branching

Merge Requests

Conflict Resolution

The Builder architecture should remain compatible with collaborative editing technologies.

---

# Future Builder Vision

The Builder should eventually evolve into a complete Customer Experience Designer.

Instead of creating isolated widgets, users should be able to design entire customer journeys.

Possible future capabilities include:

Multi-step Experiences

Workflow Builder

AI Agents

A/B Testing

Personalization

Conditional Flows

CRM Integrations

Marketplace Plugins

Custom Components

Public SDK

The Builder should become the operating system for customer engagement.

---

# Definition of Done

The Widget Builder is considered production-ready only when:

✓ Every interaction is immediate.

✓ Every change is reflected in the Preview.

✓ AI accelerates creation without reducing user control.

✓ Publishing is deterministic.

✓ Runtime renders exactly what Preview displays.

✓ Every configuration is serializable.

✓ Every feature is keyboard accessible.

✓ The editing experience feels professional, responsive, and trustworthy.

The Builder should leave users with the feeling that they are designing software—not filling out forms.
---

# Appendix A — Widget Schema Specification

Every widget is represented internally as a serializable JSON document.

The schema is the single source of truth.

The Builder edits the schema.

The Runtime renders the schema.

The Backend persists the schema.

The API transports the schema.

The Preview visualizes the schema.

Every subsystem communicates through the Widget Schema.

---

## Schema Principles

The schema must always be:

- Serializable
- Versioned
- Deterministic
- Framework Independent
- Extensible
- Backward Compatible

Schema migrations should always preserve existing widgets.

---

## Widget Schema Structure

The root widget consists of:

Widget Metadata

↓

Theme

↓

Layout

↓

Content

↓

Components

↓

Behavior

↓

Triggers

↓

Localization

↓

Analytics

↓

Publishing

Every section owns its own configuration.

---

# Appendix B — Builder Folder Structure

Recommended Builder architecture.

```

builder/

components/
canvas/
property-panel/
navigator/
toolbar/
preview/
dialogs/

hooks/

stores/

schemas/

services/

utils/

types/

constants/

providers/

```

Each folder should have one clear responsibility.

Avoid mixing UI and business logic.

---

# Appendix C — Builder Store Modules

The Builder Store should be divided into logical domains.

Selection Store

History Store

Theme Store

Schema Store

Preview Store

Validation Store

Publishing Store

AI Store

Future Collaboration Store

Each module should expose only its public API.

---

# Appendix D — Event System

The Builder communicates internally using events.

Examples

Element Selected

↓

Property Changed

↓

History Recorded

↓

Preview Updated

↓

Analytics Logged

No component should directly manipulate another component.

Communication should remain event driven.

---

# Appendix E — Command Pattern

Undo and Redo should be implemented using the Command Pattern.

Every meaningful modification becomes a command.

Examples

Move Field

↓

Change Color

↓

Rename Widget

↓

Delete Component

↓

Duplicate Component

Each command supports:

Execute()

Undo()

Redo()

Commands should remain immutable after execution.

---

# Appendix F — Keyboard Shortcut Matrix

Global

Ctrl + K

Command Palette

Ctrl + S

Save Draft

Ctrl + Shift + P

Publish

Builder

Ctrl + Z

Undo

Ctrl + Shift + Z

Redo

Delete

Delete Selected Element

Esc

Clear Selection

Tab

Next Editable Property

Shift + Tab

Previous Property

Future

Ctrl + D

Duplicate

Ctrl + C

Copy

Ctrl + V

Paste

Space

Hand Tool

Keyboard shortcuts should remain configurable in future versions.

---

# Appendix G — Performance Budget

Target performance.

Builder Initial Load

< 2 seconds

Widget Schema Parse

< 10ms

Preview Update

< 16ms

Property Update

< 16ms

Theme Switch

< 100ms

Undo

< 50ms

Redo

< 50ms

Publish

< 300ms

These values represent UX targets.

---

# Appendix H — Error Recovery

The Builder should gracefully recover from failures.

Recoverable errors:

Preview Crash

↓

Restart Preview

Autosave Failure

↓

Retry

Network Failure

↓

Offline Draft

Invalid Schema

↓

Restore Previous Version

Unexpected Exception

↓

Crash Recovery Dialog

Users should never permanently lose work.

---

# Appendix I — Accessibility Matrix

Every Builder feature must support:

Keyboard Navigation

Screen Reader Labels

Focus Visibility

Reduced Motion

ARIA

Semantic HTML

Color Contrast

Accessible Drag & Drop

Accessibility should be verified before release.

---

# Appendix J — QA Checklist

Every release of the Builder must pass the following review.

## Functional

□ Widget creation

□ Editing

□ Live Preview

□ Publish

□ Runtime

□ Undo

□ Redo

□ Auto Save

□ Validation

□ Theme Switching

---

## UX

□ Smooth interactions

□ Clear hierarchy

□ Responsive layout

□ Consistent spacing

□ Helpful feedback

□ No layout shifts

---

## Accessibility

□ Keyboard only workflow

□ Screen reader compatibility

□ Focus visibility

□ WCAG AA

---

## Performance

□ Fast initial load

□ No unnecessary renders

□ Stable FPS during editing

□ Lightweight runtime

---

## Code Quality

□ TypeScript strict mode

□ No duplicated logic

□ Reusable components

□ Feature isolation

□ Documentation updated

---

# Engineering Acceptance Criteria

The Widget Builder implementation is considered complete only if all of the following are true.

- The Builder is entirely driven by the Widget Schema.
- Every modification updates the Builder Store before the UI.
- Live Preview and Runtime produce identical output.
- All interactions are reversible through Undo/Redo.
- Auto Save prevents data loss.
- Every component is reusable.
- Every property is validated.
- Every interaction is keyboard accessible.
- The Builder performs within the defined performance budget.
- Documentation, implementation, and tests remain synchronized.

---

# Final Statement

The Widget Builder is the core product of Widget Platform.

Its architecture should prioritize clarity, extensibility, performance, and user confidence over short-term implementation convenience.

Every future feature should integrate into the Builder through the existing architecture rather than introducing parallel systems.

If a proposed implementation increases complexity without improving the user experience, it should be reconsidered.

The Builder should remain the single, coherent environment where users can design, customize, preview, publish, and evolve customer engagement widgets with confidence.