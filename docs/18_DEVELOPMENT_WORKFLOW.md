# Development Workflow

**Version:** 1.0  
**Status:** Draft  
**Owner:** Engineering  
**Last Updated:** 2026-08-03

---

# Purpose

This document defines the development workflow, git conventions, code review process, and release procedures for Widget Platform.

Consistent workflow practices enable efficient collaboration between human engineers and AI coding agents.

Related documents: [AI Rules](./AI_RULES.md), [Testing Strategy](./16_TESTING_STRATEGY.md), [Deployment Architecture](./17_DEPLOYMENT_ARCHITECTURE.md).

---

# Architecture

```
Feature Branch → Pull Request → Code Review → CI Checks → Merge → Deploy
      ↑                                           ↓
  Local Dev                              Documentation Update
  + Tests
```

Every change flows through a pull request with review and automated checks before reaching production.

---

# Responsibilities

- Define git branching strategy and commit conventions
- Establish pull request requirements and review process
- Specify documentation update requirements
- Define release process and versioning

---

# Principles

1. **Trunk-Based Development** — Short-lived feature branches merged to main frequently
2. **Review Everything** — No direct commits to main
3. **Document Changes** — Update docs alongside code changes
4. **Automate Quality** — CI enforces lint, types, and tests
5. **Small PRs** — Prefer focused, reviewable changes over large diffs

---

# Git Workflow

## Branch Strategy

```
main (protected)
  ├── feat/builder-inline-editing
  ├── fix/preview-theme-override
  ├── refactor/analytics-chart-hooks
  └── docs/api-specification-update
```

### Branch Naming

```
<type>/<short-description>
```

| Type | Usage | Example |
|---|---|---|
| feat | New feature | feat/builder-drag-drop |
| fix | Bug fix | fix/preview-render-error |
| refactor | Code restructuring | refactor/theme-token-utils |
| docs | Documentation only | docs/component-library |
| test | Test additions | test/builder-store-unit |
| chore | Maintenance | chore/update-dependencies |

Use kebab-case. Keep descriptions under 50 characters.

### Branch Lifecycle

1. Create branch from latest `main`
2. Implement changes with commits
3. Push branch and open PR
4. Address review feedback
5. Merge to `main` (squash merge)
6. Delete branch

Branches should live less than 3 days. Long-running branches rebase on main regularly.

---

# Conventional Commits

Every commit follows the Conventional Commits specification.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | Description |
|---|---|
| feat | New feature |
| fix | Bug fix |
| refactor | Code change that neither fixes a bug nor adds a feature |
| docs | Documentation only |
| test | Adding or updating tests |
| chore | Maintenance tasks |
| perf | Performance improvement |
| ci | CI/CD changes |
| build | Build system changes |

## Scopes

| Scope | Area |
|---|---|
| builder | Widget Builder |
| preview | Live Preview |
| runtime | Widget Runtime |
| analytics | Analytics module |
| auth | Authentication |
| api | Backend API |
| ui | UI components |
| theme | Theme engine |
| ai | AI assistant |
| templates | Template marketplace |
| submissions | Submission management |
| settings | Workspace settings |
| deps | Dependencies |

## Examples

```
feat(builder): add inline text editing for title elements

fix(preview): resolve theme override not applying to buttons

refactor(analytics): extract chart data hooks

docs: update API specification with submission endpoints

test(builder): add undo/redo store unit tests

chore(deps): update Next.js to 16.2.6
```

## Rules

- Use imperative mood ("add", not "added" or "adds")
- No period at end of description
- Description under 72 characters
- Body explains "why", not "what"
- Reference issue numbers in footer when applicable

---

# Pull Requests

## PR Requirements

Every PR must include:

1. **Clear title** following Conventional Commits format
2. **Description** explaining what changed and why
3. **Test plan** describing how changes were verified
4. **Documentation updates** if behavior or architecture changed
5. **Screenshots/video** for UI changes

## PR Template

```markdown
## Summary
- Brief description of changes

## Test Plan
- [ ] Unit tests pass
- [ ] Manual testing performed
- [ ] No TypeScript errors
- [ ] Responsive behavior verified
- [ ] Accessibility checked (if UI change)

## Documentation
- [ ] Updated relevant documentation
- [ ] No documentation needed (explain why)

## Screenshots
(if applicable)
```

## PR Size Guidelines

| Size | Lines Changed | Review Time |
|---|---|---|
| Small | <100 | Same day |
| Medium | 100–400 | 1–2 days |
| Large | 400+ | Split if possible |

Prefer multiple small PRs over one large PR. Builder features may require larger PRs — document the scope clearly.

---

# Code Review

## Review Requirements

- Minimum 1 approval required before merge
- Author cannot approve own PR
- All CI checks must pass
- No unresolved review comments

## Review Focus Areas

| Area | Check |
|---|---|
| Architecture | Follows feature-based architecture, no layer violations |
| Types | Strict TypeScript, no `any`, reusable interfaces |
| Components | Reuses existing components, 50–250 lines |
| Business Logic | In hooks/services, not components |
| Security | Input validation, auth checks, no secrets |
| Performance | No unnecessary re-renders, lazy loading where appropriate |
| Accessibility | Keyboard accessible, ARIA labels, focus states |
| Tests | Adequate test coverage for changes |
| Documentation | Updated if behavior or API changed |

## Review Guidelines

Reviewers should:

- Approve if changes are correct and follow conventions
- Request changes with specific, actionable feedback
- Distinguish between blocking issues and suggestions
- Respond within 24 hours on business days

Authors should:

- Respond to all comments
- Push fixes as new commits (squashed on merge)
- Re-request review after addressing feedback

---

# Documentation Updates

## When to Update Documentation

| Change Type | Documents to Update |
|---|---|
| New API endpoint | API Specification |
| New UI component | Component Library |
| Architecture change | Frontend/Backend Architecture |
| New database entity | Database Design |
| New feature | Relevant specification document |
| Security change | Security Architecture |
| Workflow change | Development Workflow |
| Builder behavior change | Widget Builder Specification |

## Documentation in PRs

PRs that change behavior must include documentation updates in the same PR. Documentation-only PRs use the `docs` commit type.

AI coding agents must update relevant documentation when completing features (per AI Rules).

---

# Release Process

## Versioning

Widget Platform follows Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

| Version | When |
|---|---|
| MAJOR | Breaking API changes, major product pivots |
| MINOR | New features, new widget types, new modules |
| PATCH | Bug fixes, performance improvements, doc updates |

Current version: `0.1.0` (pre-release/MVP development)

## Release Steps

```
1. Ensure main branch is stable (all CI green)
2. Create release branch: release/v0.2.0
3. Update version in package.json
4. Update CHANGELOG.md with release notes
5. Final QA on staging environment
6. Merge release branch to main
7. Tag commit: git tag v0.2.0
8. Deploy to production (manual approval)
9. Create GitHub Release with changelog
10. Announce release (if customer-facing)
```

## Changelog Format

```markdown
## [0.2.0] - 2026-09-01

### Added
- Widget Builder inline text editing
- Template marketplace with 30 templates
- AI widget generation

### Changed
- Improved Builder performance for large forms

### Fixed
- Theme override not applying to button components
- Auto-save failure on network disconnect
```

## Release Cadence

| Phase | Cadence |
|---|---|
| MVP development | Continuous deployment to staging, weekly production |
| Post-MVP | Bi-weekly production releases |
| Enterprise | Monthly stable releases with hotfix path |

---

# Local Development Setup

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL and Redis)
- Git

## Setup Steps

```bash
# Clone repository
git clone https://github.com/org/widget-platform.git
cd widget-platform

# Install dependencies
pnpm install

# Start database and Redis
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env with local values

# Run database migrations and seed
cd server && npx prisma migrate dev && npx prisma db seed

# Start development servers
pnpm dev          # Frontend (port 3000)
pnpm dev:server   # Backend (port 4000)
```

## Development Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start frontend dev server |
| `pnpm dev:server` | Start backend dev server |
| `pnpm build` | Production build (frontend) |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run test suite |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:e2e` | Run Playwright E2E tests |

---

# Best Practices

## Do

- Create focused PRs with clear descriptions
- Write Conventional Commits
- Update documentation with code changes
- Run tests locally before pushing
- Rebase feature branches on main regularly
- Review AI-generated code with same rigor as human code
- Keep branches short-lived (<3 days)

## Do Not

- Commit directly to main
- Push without running lint and tests locally
- Merge PRs with failing CI
- Leave PRs open without activity for >5 days
- Skip code review for "small" changes
- Force push to main or shared branches

---

# Acceptance Criteria

Development workflow is operational when:

- [ ] Branch protection rules enforced on main
- [ ] Conventional Commits followed consistently
- [ ] PR template configured in repository
- [ ] CI checks required for merge
- [ ] Code review required for merge
- [ ] Documentation update policy followed
- [ ] Release process documented and tested
- [ ] Local development setup works with documented steps
- [ ] CHANGELOG maintained for all releases

---

# Future Evolution

## Phase 2

- Automated changelog generation from commits
- PR size bot (warn on large PRs)
- Stale branch cleanup automation
- Release automation via GitHub Actions

## Phase 3

- Feature flag integration in release process
- Canary releases with automated rollback
- Deployment approval workflows for enterprise

---

# Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-08-03 | Engineering | Initial development workflow specification |
