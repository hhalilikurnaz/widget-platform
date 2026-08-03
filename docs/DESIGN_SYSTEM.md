# Design System

**Version:** 1.0  
**Status:** Draft  
**Owner:** Product Design Team  
**Last Updated:** 2026-08-03

---

# Purpose

The Design System defines the visual language, interaction principles, reusable design patterns, and component standards of Widget Platform.

Its purpose is to ensure that every interface across the platform remains visually consistent, accessible, scalable, and maintainable.

This document is the single source of truth for all UI decisions.

Any new component introduced into the application must follow the rules defined in this document.

---

# Design Philosophy

Widget Platform is not an administration dashboard.

It is a professional design tool for creating customer engagement experiences.

The interface should disappear behind the user's workflow.

Users should focus on creating widgets, not learning the software.

The design philosophy is based on five principles.

---

## Clarity

Information should be immediately understandable.

Every screen must communicate:

- Where the user is
- What they are doing
- What they can do next

Avoid visual clutter.

---

## Consistency

Every interaction should behave the same way throughout the application.

Buttons

Inputs

Dialogs

Tables

Dropdowns

Animations

Spacing

Typography

must remain consistent.

Consistency reduces cognitive load.

---

## Progressive Disclosure

Never expose advanced settings too early.

Basic workflows should remain simple.

Advanced options appear only when required.

Example:

A beginner creating a contact widget should only see:

- Title
- Description
- Fields
- Theme

Advanced settings such as:

- Custom CSS
- Webhooks
- Redirect URLs

should remain hidden until explicitly opened.

---

## Visual Hierarchy

Every page must clearly communicate importance.

Hierarchy is created using:

- Typography
- Spacing
- Contrast
- Position
- Elevation

Never rely solely on color.

---

## Speed

The interface should feel fast regardless of actual network latency.

Perceived performance is a design feature.

Skeletons should always preserve layout.

Transitions should communicate progress.

---

# Brand Identity

Widget Platform represents a modern AI-native SaaS company.

The interface should feel:

Professional

Technical

Elegant

Reliable

Minimal

Premium

Confident

Never playful.

Never childish.

Never overly decorative.

---

# Visual Language

Design inspiration comes from:

- Linear
- Stripe Dashboard
- Framer
- Vercel
- Notion

These products share common characteristics:

- clean layouts
- strong spacing
- limited color palette
- restrained animations
- functional beauty

The goal is inspiration rather than imitation.

---

# Color System

The application uses semantic colors instead of hardcoded colors.

Never reference raw hex values directly inside components.

Always use semantic tokens.

Example:

Good:

Background / Surface / Success

Bad:

Gray-900 / Blue-500

---

## Primitive Palette

Background

#09090B

Surface

#111113

Card

#18181B

Primary Blue

#3B82F6

Secondary Cyan

#06B6D4

Success

#10B981

Warning

#F59E0B

Danger

#F43F5E

Border

#27272A

---

## Semantic Tokens

Background

Surface

Card

Primary

Secondary

Accent

Muted

Success

Warning

Danger

Text Primary

Text Secondary

Text Muted

Border

Focus

Selection

Hover

Disabled

These semantic names should be referenced throughout the application.

---

# Typography

Typography is one of the most important aspects of the interface.

Only one font family should be used.

Font:

Inter

Fallback:

system-ui

The hierarchy should remain consistent.

Display

Page Title

Section Title

Card Title

Body

Caption

Label

Helper Text

Button

Each level must have a predefined size, weight and spacing.

No arbitrary font sizes are allowed.

---

# Spacing System

The application follows an 8px spacing system.

Allowed spacing values:

4

8

12

16

24

32

40

48

64

80

96

No random spacing values should be introduced.

Spacing consistency is more important than visual experimentation.

---

# Layout Grid

Desktop:

12-column responsive grid

Tablet:

8-column grid

Mobile:

4-column grid

Cards should align to the grid whenever possible.

Layouts should breathe.

Whitespace is considered a design asset rather than unused space.

---

# Border Radius

Small

Medium

Large

Extra Large

Interactive components should use consistent corner radii.

Avoid mixing multiple radius styles on the same screen.

---

# Shadows

The interface should use subtle elevation.

Avoid aggressive shadows.

Use elevation only to communicate layering.

Examples:

Dropdown

Dialog

Popover

Command Palette

Floating Widget

may use elevation.

Cards should primarily rely on borders.

---

# Motion System

Motion is a functional part of the product rather than a decorative element.

Animations should communicate state changes, improve orientation, and increase perceived performance.

Users should never notice animations because they are flashy.
They should notice them because everything feels natural.

---

## Motion Principles

Every animation must have a purpose.

Allowed purposes:

- Communicate hierarchy
- Confirm user actions
- Improve navigation
- Explain spatial relationships
- Reduce cognitive load

Animations must never exist purely for decoration.

---

## Animation Timing

Micro Interaction

100–150ms

Small Transition

150–250ms

Page Transition

250–350ms

Modal & Drawer

250–300ms

Complex Layout Animation

300–450ms

Never exceed 500ms.

---

## Easing

Prefer natural easing.

Recommended:

ease-out

ease-in-out

spring (low bounce)

Avoid exaggerated bouncing.

Avoid elastic animations.

---

## Page Transitions

Page transitions should preserve orientation.

Navigation should feel continuous.

Do not fade the entire application.

Animate only meaningful layout regions.

---

## Micro Interactions

Every interactive element should communicate feedback.

Examples:

- Button hover
- Button press
- Input focus
- Card hover
- Sidebar expansion
- Table row selection
- Dropdown opening

Micro interactions should be subtle.

---

## Loading Experience

Loading is part of the experience.

Always prefer:

Skeletons

↓

Progressive Rendering

↓

Content

Never display blank pages.

---

# Component Design Principles

Every reusable component must follow the same standards.

Components should be:

- Predictable
- Accessible
- Reusable
- Stateless whenever possible
- Easy to compose

Never create duplicate UI.

---

# Buttons

Buttons communicate actions.

Every button belongs to one of the following categories.

Primary

Main call-to-action.

Only one primary button should dominate a screen.

Secondary

Supporting actions.

Outline or subtle appearance.

Ghost

Low emphasis actions.

Danger

Destructive actions.

Requires confirmation when appropriate.

Icon Button

Compact actions.

Must always include accessible labels.

---

## Button Rules

Buttons should:

- Clearly communicate intent.
- Include loading states.
- Support disabled states.
- Provide hover feedback.
- Provide keyboard focus.

Never rely only on color.

---

# Inputs

Inputs collect information.

All inputs should share consistent:

Height

Border radius

Spacing

Typography

Focus behavior

Validation

Every input must support:

- Label
- Placeholder
- Helper Text
- Validation Message
- Error State
- Disabled State

---

# Forms

Forms should minimize cognitive effort.

Only request necessary information.

Long forms should be divided into logical sections.

Validation should occur:

- On blur
- On submit

Never interrupt typing with validation.

---

# Cards

Cards group related information.

Cards should use:

Subtle borders

Minimal elevation

Consistent spacing

Avoid heavy shadows.

Cards should never become visually noisy.

---

# Tables

Tables display operational data.

Features:

Sorting

Filtering

Pagination

Selection

Bulk Actions

Sticky Header

Responsive behavior

Tables should prioritize readability.

---

# Dialogs

Dialogs interrupt the current workflow.

Use dialogs only for:

Confirmation

Critical forms

Destructive actions

Dialogs should never become mini pages.

---

# Drawers

Drawers are preferred for:

Editing

Details

Quick previews

Configuration

They preserve context better than dialogs.

---

# Dropdowns

Dropdowns should remain lightweight.

Searchable dropdowns should be used whenever the option count becomes large.

Never overload dropdown menus.

---

# Badges

Badges communicate status.

Examples:

Published

Draft

Archived

AI Generated

New

Popular

Danger

Badges should never replace descriptive text.

---

# Charts

Charts communicate trends.

Every chart must answer a business question.

Avoid decorative charts.

Always include:

Axis

Legend

Tooltip

Meaningful labels

---

# Empty States

Every page requires an intentional empty state.

An empty state should:

Explain why nothing is visible.

Explain what users should do next.

Provide a clear call-to-action.

---

# Loading States

Never display blank layouts.

Always preserve page structure using skeleton loading.

Loading should feel intentional.

---

# Error States

Errors should be human readable.

Never expose stack traces.

Every error should explain:

What happened.

Why it happened.

What users can do next.

---

# Success States

Successful actions should provide immediate feedback.

Preferred methods:

Toast

Inline confirmation

Success animation

Success messages should remain short.

---

# Accessibility

Accessibility is a first-class requirement.

Minimum standards:

- WCAG AA contrast
- Keyboard navigation
- Focus visibility
- Screen reader compatibility
- Proper semantic HTML
- ARIA labels where appropriate

Accessibility should never be treated as an optional enhancement.

---

# Dark Mode

Dark mode is the primary visual experience.

Every component must be designed for dark mode first.

Light mode is derived from the same semantic design tokens.

Never maintain separate component implementations.

---

# Responsive Behavior

Desktop is the primary target.

However, every component must gracefully adapt to:

Tablet

Mobile

No functionality should be lost on smaller screens.

Only layout should change.

---

# Component Acceptance Checklist

Before introducing a new component, verify:

✓ Reusable

✓ Accessible

✓ Responsive

✓ Typed

✓ Theme-aware

✓ Animation compatible

✓ Documented

✓ Tested

If any requirement is not satisfied, the component should not be considered production-ready.

---

# Design Tokens

The design system is built around semantic design tokens rather than hardcoded values.

All components must consume tokens instead of raw values.

## Color Tokens

Background

Surface

Card

Primary

Secondary

Accent

Success

Warning

Danger

Border

Divider

Text Primary

Text Secondary

Text Muted

Overlay

Focus Ring

Selection

Hover

Disabled

## Typography Tokens

Display

Heading 1

Heading 2

Heading 3

Heading 4

Body Large

Body

Body Small

Caption

Label

Button

Code

## Spacing Tokens

Space XS

Space SM

Space MD

Space LG

Space XL

Space 2XL

Space 3XL

## Radius Tokens

Radius Small

Radius Medium

Radius Large

Radius XL

Radius Full

## Shadow Tokens

Shadow XS

Shadow SM

Shadow MD

Shadow LG

Shadow XL

## Motion Tokens

Fast

Normal

Slow

Spring

Ease Out

Ease In Out

---

# Interaction Rules

The interface should always respond to user interaction.

Every action must produce feedback.

Examples:

Hover

↓

Visual feedback

Click

↓

Pressed state

Submit

↓

Loading

↓

Success

Delete

↓

Confirmation

↓

Toast

↓

UI Update

Never leave the user wondering if an action was successful.

---

# UX Heuristics

The platform follows established usability principles.

## Visibility of System Status

The user should always know:

- what is loading
- what is selected
- what is saved
- what failed

---

## Match Between System and Real World

Use language users understand.

Avoid technical jargon whenever possible.

---

## User Control

Users should always be able to:

Undo

Cancel

Go Back

Discard Changes

Recover

---

## Consistency

The same interaction should always behave the same way.

Never surprise users.

---

## Error Prevention

Prevent mistakes before they happen.

Examples:

Delete confirmation

Validation

Disabled publish button

Unsaved changes warning

---

## Recognition over Recall

Users should recognize available actions instead of memorizing them.

Examples:

Visible actions

Context menus

Tooltips

Command palette

---

## Minimal Cognitive Load

Every screen should answer:

Where am I?

What can I do?

What should I do next?

---

# Copywriting Guidelines

Language should be:

Simple

Professional

Friendly

Confident

Direct

Avoid:

Technical jargon

Long paragraphs

Passive voice

Generic placeholders

Examples:

Instead of:

"Operation completed successfully."

Use:

"Widget published."

Instead of:

"Error"

Use:

"We couldn't publish your widget."

---

# Responsive Design Rules

The application follows a desktop-first strategy.

Desktop

Full experience.

Tablet

Adaptive layout.

Mobile

Essential functionality only.

The Builder remains desktop-first.

Complex editing interactions should gracefully simplify on smaller screens.

---

# Navigation Standards

Primary navigation should never exceed one level.

Secondary navigation belongs inside pages.

The user should never be more than three clicks away from the Builder.

---

# Component Lifecycle

Every reusable component follows the same lifecycle.

Research

↓

Design

↓

Implementation

↓

Documentation

↓

Testing

↓

Review

↓

Release

↓

Maintenance

No component should skip documentation.

---
# Layout System Specification

- Container widths
- Content widths
- Sidebar sizing
- Builder layout
- Inspector layout
- Canvas sizing

---

# Component Anatomy Standards

Button Anatomy

Input Anatomy

Card Anatomy

Table Anatomy

Modal Anatomy

Drawer Anatomy

Widget Anatomy

---

# Component State Matrix

Every component must define:

Default

Hover

Focus

Active

Pressed

Selected

Loading

Success

Warning

Error

Disabled

Read Only

---

# Iconography Guidelines

Lucide Icons

Size

16

20

24

32

Stroke Width

Filled icons policy

When to use icons

When NOT to use icons

---

# Focus Management

Keyboard navigation

Focus trap

Dialog focus

Drawer focus

Builder shortcuts

Tab order

ESC behavior

---

# Layer System (Z-Index)

Base Layout

Sticky Header

Sidebar

Dropdown

Popover

Tooltip

Dialog

Drawer

Command Palette

Toast

Widget Preview Overlay

---

# Data Visualization Guidelines

Chart hierarchy

Color usage

Gridlines

Axis

Tooltip

Legend

Empty analytics

Loading analytics

---

# Builder UX Rules

Canvas behavior

Selection behavior

Property panel

Component tree

Drag & Drop

Resize

Snap

Guidelines

Keyboard shortcuts

Undo

Redo

History

---

# Responsive Matrix

Desktop

Tablet

Mobile

For:

Dashboard

Widgets

Builder

Marketplace

Analytics

Settings

---

# Accessibility Checklist

WCAG AA

Keyboard

ARIA

Contrast

Reduced Motion

Screen Reader

Forms

Focus Visibility

---

# Design QA Checklist

Before release verify:

Typography

Spacing

Color

Motion

Accessibility

Performance

Responsive

Component consistency

Interaction consistency

Dark mode

Builder UX

# Design Review Checklist

Before approving any screen, verify:

Visual hierarchy

Spacing consistency

Accessibility

Responsive layout

Dark mode

Loading state

Error state

Empty state

Keyboard support

Performance

Animation quality

Copywriting

If any item fails, the screen is not production-ready.

---

# Do's

✓ Use semantic colors.

✓ Reuse components.

✓ Follow spacing tokens.

✓ Keep layouts clean.

✓ Prefer whitespace over separators.

✓ Design mobile intentionally.

✓ Keep animations subtle.

✓ Build accessible interfaces.

✓ Think in systems rather than pages.

✓ Optimize for clarity.

---

# Don'ts

✗ Do not introduce random colors.

✗ Do not hardcode spacing.

✗ Do not duplicate UI.

✗ Do not mix border radius values.

✗ Do not use unnecessary gradients.

✗ Do not overload pages.

✗ Do not create inconsistent interactions.

✗ Do not rely only on color.

✗ Do not sacrifice usability for aesthetics.

✗ Do not invent new patterns without updating this Design System.

---

# Definition of Good Design

A screen is considered well designed when:

The purpose is immediately clear.

The primary action is obvious.

The layout feels balanced.

Visual hierarchy guides the eye naturally.

Interactions are predictable.

Animations improve understanding.

Accessibility is built in.

The interface feels calm.

Nothing feels unnecessary.

The user completes their task with minimal effort.

Good design is invisible.

The software should disappear behind the user's workflow.

---

# Governance

This document is the official design authority for Widget Platform.

Every UI decision must reference this document.

If implementation and documentation ever conflict, this document takes precedence until formally updated.

All future design changes must be reviewed against these principles before implementation.

---

# Revision History

| Version | Date | Author | Changes |
|----------|------------|----------------|-----------------------------|
| 1.0 | 2026-08-03 | Product & Design Team | Initial Design System |
