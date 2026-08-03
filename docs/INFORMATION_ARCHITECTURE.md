# Information Architecture

**Version:** 1.0  
**Status:** Draft  
**Owner:** Product Team  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the information architecture of Widget Platform.

Its purpose is to describe how users navigate the application, how pages relate to each other, which responsibilities belong to each section, and how information should flow across the platform.

This document acts as the blueprint for navigation, routing, layout decisions, and future scalability.

No feature should introduce new pages or navigation patterns without updating this document.

---

# Architecture Philosophy

The application follows four fundamental principles.

## 1. Task-Oriented Navigation

Users should never wonder where a feature belongs.

Every page exists for a single primary responsibility.

Avoid feature duplication across pages.

---

## 2. Progressive Disclosure

The interface should reveal complexity only when necessary.

Simple tasks remain simple.

Advanced functionality appears only when the user requests it.

---

## 3. Single Responsibility Pages

Every page owns a clear responsibility.

Examples:

Dashboard → Workspace overview

Widgets → Widget management

Builder → Widget creation

Analytics → Business insights

Settings → Workspace configuration

---

## 4. Predictable Navigation

Navigation should remain consistent.

The sidebar never changes.

The top navigation always contains global actions.

Breadcrumbs always indicate current location.

---

# Global Application Layout

Every authenticated page follows the same layout.

```
+-----------------------------------------------------------+
| Top Navigation                                             |
+----------------------+------------------------------------+
|                      |                                    |
|                      |                                    |
| Sidebar              | Main Content                      |
|                      |                                    |
|                      |                                    |
+----------------------+------------------------------------+
```

---

# Primary Navigation

The sidebar represents the primary navigation of the application.

Pages are ordered according to user frequency.

1. Dashboard
2. Widgets
3. Visual Builder
4. Templates
5. Theme Gallery
6. Analytics
7. Submissions
8. AI Assistant
9. Settings

Navigation should remain stable.

Users should develop muscle memory.

---

# Top Navigation

The top navigation contains global actions.

Required elements:

- Workspace Selector
- Global Search
- Command Palette
- Notifications
- Theme Switch
- User Profile
- Breadcrumb Navigation

These actions must remain accessible from every authenticated page.

---

# Route Structure

```
/

├── login
├── dashboard
├── widgets
│   ├── create
│   ├── :id
│   ├── :id/edit
│   └── :id/embed
│
├── builder
│   └── :widgetId
│
├── templates
├── themes
├── analytics
├── submissions
├── ai
├── playground
└── settings
```

Routes should remain flat whenever possible.

Nested navigation should be minimized.

---

# User Journey

## First-Time User

```
Sign Up

↓

Create Workspace

↓

Dashboard

↓

Create First Widget

↓

Visual Builder

↓

Preview

↓

Publish

↓

Copy Embed Code

↓

Paste Into Website

↓

Receive First Submission
```

The first experience should take less than five minutes.

---

## Returning User

```
Login

↓

Dashboard

↓

Continue Existing Widget

↓

Review Analytics

↓

Optimize

↓

Publish Changes
```

---

## Widget Creation Flow

```
Dashboard

↓

Widgets

↓

Create Widget

↓

Choose Template

↓

Visual Builder

↓

AI Assistant (Optional)

↓

Customize Theme

↓

Configure Behavior

↓

Preview

↓

Publish
```

---

## Widget Publishing Flow

```
Publish

↓

Generate Embed Token

↓

Generate Embed Snippet

↓

Copy

↓

Paste Into Website

↓

Widget Runtime Loads

↓

Collect Leads
```

---

## AI Widget Generation Flow

```
Open Builder

↓

Describe Widget

↓

AI Generates Layout

↓

Review

↓

Customize

↓

Publish
```

---

# Page Inventory

---

## Dashboard

### Purpose

Provide a high-level overview of the workspace.

### Responsibilities

- Workspace health
- Active widgets
- Recent activity
- Conversion overview
- Notifications
- Quick actions

### Does NOT Own

Widget editing

---

## Widgets

### Purpose

Manage every widget inside the workspace.

### Responsibilities

- Search
- Filtering
- Status
- Duplicate
- Archive
- Delete
- Open Builder

---

## Visual Builder

### Purpose

Create and edit widgets visually.

This is the most important page in the product.

Everything should happen visually.

### Responsibilities

- Live Preview
- Property Editing
- Form Builder
- Theme Builder
- AI Assistant
- Animations
- Widget Behavior

---

## Templates

### Purpose

Provide professionally designed widget templates.

### Responsibilities

- Categories
- Search
- Preview
- Import

---

## Theme Gallery

### Purpose

Provide reusable visual themes.

### Responsibilities

- Browse Themes
- Apply Theme
- Duplicate Theme
- Favorite Theme

---

## Playground

### Purpose

Public product showcase.

Visitors can experiment with the platform without authentication.

---

## Analytics

### Purpose

Measure widget performance.

### Responsibilities

- Visitors
- Views
- Leads
- Conversion
- Trends
- Top Widgets

---

## Submissions

### Purpose

Manage collected customer submissions.

### Responsibilities

- Search
- Filtering
- Export
- Detail Drawer

---

## AI Assistant

### Purpose

Accelerate widget creation.

### Responsibilities

- Widget Generation
- UX Suggestions
- Theme Suggestions
- Copywriting
- Accessibility Recommendations

---

## Settings

### Purpose

Workspace administration.

### Responsibilities

- Team Members
- Domains
- API Keys
- Notifications
- Appearance
- Security

---

# Page Relationships

```
Dashboard
    │
    ├──────────── Widgets
    │                  │
    │                  │
    │                  ▼
    │           Visual Builder
    │                  │
    │      ┌───────────┼────────────┐
    │      │           │            │
    ▼      ▼           ▼            ▼
Analytics Templates Theme Gallery AI Assistant
    │
    ▼
Submissions
```

The Visual Builder acts as the center of the entire platform.

Everything eventually connects back to it.

---

# Navigation Rules

The user should never be more than three interactions away from creating or editing a widget.

Primary actions must remain visible.

Secondary actions belong inside contextual menus.

Dangerous actions require confirmation.

---

# Empty States

Every page requires meaningful empty states.

Examples:

No Widgets

No Templates

No Analytics

No Submissions

Each empty state should educate users about the next logical action.

---

# Loading States

Every asynchronous page must include skeleton loading.

Never show blank pages.

Loading indicators should preserve layout stability.

---

# Error States

Every page must gracefully recover from errors.

Provide:

- Clear explanation
- Retry button
- Helpful guidance

Never expose raw technical errors to users.

---

# Responsive Navigation

Desktop:

Persistent sidebar.

Tablet:

Collapsible sidebar.

Mobile:

Bottom navigation + slide-over menu.

The Visual Builder should remain desktop-first but gracefully degrade for tablet devices.

---

# Future Expansion

The architecture should support future modules without restructuring navigation.

Potential future additions include:

- Workflow Automation
- AI Agents
- Integrations Marketplace
- White Label Management
- Team Permissions
- Billing
- Usage Metering
- Audit Logs
- Public SDK
- Plugin Ecosystem

These modules should integrate naturally into the existing navigation hierarchy.

---

# Guiding Principle

Navigation should reduce cognitive load.

Users should always know:

- Where they are.
- What they can do.
- What happens next.

A well-designed information architecture should become invisible to the user.