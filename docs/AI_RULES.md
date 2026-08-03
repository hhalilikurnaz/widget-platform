# Widget Platform - AI Development Rules

## Purpose

This document is the single source of truth for every AI agent working on this project.

Every coding task must follow these rules.

---

# General Principles

- Never break the existing architecture.
- Never rewrite working code without a reason.
- Never duplicate components.
- Prefer composition over duplication.
- Keep the codebase maintainable.
- Prioritize readability over cleverness.

---

# Architecture

Always follow feature-based architecture.

Business logic must never live inside React components.

Pages should orchestrate only.

Reusable logic belongs in hooks or services.

UI components must remain reusable.

---

# TypeScript

- Never use any.
- Prefer strict typing.
- Reuse interfaces.
- Keep types centralized.

---

# Components

Always reuse existing components before creating new ones.

Prefer shadcn/ui components.

Avoid giant components.

Target:

- 50–250 lines per component.

Extract reusable logic whenever possible.

---

# Styling

Use Tailwind CSS.

Keep spacing consistent.

Use the existing design system.

Do not introduce random colors.

Maintain dark-first design.

---

# State Management

Prefer local state when possible.

Use Context only when state is shared.

Introduce Zustand only if Context becomes difficult to maintain.

---

# Performance

Avoid unnecessary re-renders.

Lazy load heavy components.

Memoize expensive computations only when necessary.

Avoid premature optimization.

---

# Accessibility

Every interactive element must:

- be keyboard accessible
- have visible focus states
- include proper aria labels where needed

---

# Documentation

Whenever a feature is completed:

- update the relevant documentation
- keep docs synchronized with implementation

Documentation is the source of truth.

---

# Git

Use Conventional Commits.

Examples:

feat(builder): add widget selection

fix(preview): resolve rendering issue

refactor(theme): extract shared theme utilities

docs: update builder documentation

---

# Quality

Before considering any task complete, verify:

- builds successfully
- no TypeScript errors
- no duplicated logic
- responsive behavior
- consistent UI
- clean code

---

# Product Vision

Remember:

This project is not a university assignment.

It should feel like a premium AI-powered SaaS platform that could realistically launch as a startup.