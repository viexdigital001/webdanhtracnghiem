---
name: full-stack-feature
description: Implements complete production-ready features across database, backend APIs, admin/vendor management UI, tenant/public UI, tests, audit logs, and deployment notes. Use when a feature changes operational data, public display, subscriptions, pricing, quota, billing, permissions, or multiple apps in the monorepo.
---

# Full-stack Feature

Use this skill when a request is not just a local code edit, but a complete product feature that must work across the system.

Always use `impact-audit` first when this skill applies.

## Core Rule

A feature is not complete just because one UI or one endpoint works.

A feature is complete only when the data can be created, edited, validated, stored, read, displayed, tested, deployed, and operated without mismatch between backend, admin/vendor UI, tenant/public UI, and production configuration.

## Required Implementation Flow

### 1. Understand Existing System Shape

- Search existing code with `rg` before designing.
- Prefer existing patterns, components, controllers, API clients, validation style, and test style.
- Read nearby files before adding abstractions.
- Do not introduce a new architecture when the repo already has a clear local convention.

### 2. Database Layer

If the feature changes persistent data:

- Add a new migration.
- Include rollback in `down()`.
- Decide default, nullable, index, unique, and foreign key behavior.
- Backfill production data when needed.
- Update model `$fillable`, casts, relationships, scopes, factories, and seeders as applicable.
- Never use `migrate:fresh`.

### 3. Backend API Layer

- Add or update routes, controllers, services, policies, request validation, resources/response mapping.
- Put validation and guard clauses near the boundary.
- Preserve tenant/property permission boundaries.
- Return stable response shapes for frontend consumers.
- Do not leak sensitive details in errors or logs.
- Use transactions when multiple writes must stay consistent.

### 4. Admin/Vendor Management UI

If operational users must control the data, implement or update the management UI.

This includes all applicable pieces:

- List/table/card display.
- Create form.
- Edit form.
- Toggle/switch for boolean flags.
- Delete/archive/disable behavior if the entity lifecycle supports it.
- Loading, empty, error, and validation states.
- API client calls.
- TypeScript types/interfaces.
- UI labels consistent with domain language.

Do not add public/landing behavior backed by DB without checking whether Admin/Vendor needs a matching management control.

### 5. Tenant/Public/Landing UI

- Consume backend/API data through the correct runtime path.
- Validate payloads defensively.
- Handle empty state separately from network/API failure.
- Use fallback only when fallback is correct for the business case.
- Avoid stale hardcoded business rules once DB/backend becomes source of truth.
- Keep layout responsive and verify mobile/desktop when visual behavior changes.

### 6. Runtime and Deployment

If the feature depends on environment, networking, cache, queues, cron, storage, or proxy behavior:

- Update Docker compose/env examples/deployment notes.
- Check CORS, nginx/proxy routing, container DNS, queue workers, scheduler, cache invalidation.
- Document required production env vars.
- Do not hide production misconfiguration behind silent fallback without an audit note.

### 7. Tests and Verification

Add tests proportional to risk:

- Backend feature tests for happy path, validation, auth/permission, empty/error state, and negative paths.
- Transaction/rollback/concurrency tests for money, quota, availability, booking, or inventory flows.
- Frontend build/typecheck.
- Targeted UI smoke test for changed screens when feasible.
- API smoke test for new public/runtime endpoints when feasible.

Do not claim verification that was not actually run.

### 8. Edge-case Pass

Before marking a feature complete, perform an explicit edge-case pass. A feature is not production-ready if only the happy path works.

Check and guard relevant cases:

- Invalid input: missing fields, wrong types, negative values, invalid enum, unknown IDs.
- Invalid state transitions: already paid, cancelled, void, suspended, terminated, disabled, deleted, expired.
- Scope mismatch: tenant/property mismatch, invoice/webhook mismatch, user owns no access, cross-tenant data leak.
- Duplicate/concurrent actions: double-click, retry, duplicate webhook/transaction, parallel updates, idempotency.
- Empty/error states: empty dataset, API/network failure, validation error, permission denial, rollback failure.
- Domain-specific risk: amount mismatch, quota double-grant, subscription period overlap, stale cache, env/proxy misconfiguration.

Add guard clauses, UI disabled states, validation, transactions, idempotency checks, or tests as appropriate. If an edge case is intentionally deferred, document it as a remaining risk and do not claim "no remaining risk".

### 9. Audit Log

After implementation, create or update a process/audit report under:

```text
G:\AVERA\process
```

Only create app-level audit files inside a source repository when the user or repository rules explicitly require it.

If implementation is based on an existing process report in `G:\AVERA\process`, update that original report directly. When all in-scope findings are fixed and verification passes, rename the original file with a `(DONE)` prefix, for example:

```text
G:\AVERA\process\coverage-audit-fe-vendor-20260603-2150.md
→ G:\AVERA\process\(DONE)coverage-audit-fe-vendor-20260603-2150.md
```

Do not add `(DONE)` when fixes are partial, blocked, unverified, or only some findings were intentionally deferred.

Include:

- AI decisions not explicitly requested by the user.
- Changes made beyond the initial user request.
- Tradeoffs considered.
- Production/deployment notes.
- Tests/builds actually run and their result.

## Definition of Done

Before saying the feature is done, confirm:

- Source of truth is clear.
- All related surfaces are updated.
- Old conflicting hardcodes are removed or intentionally retained with explanation.
- API contracts and frontend types match.
- Production data has safe defaults/backfill.
- Permission/security boundaries are respected.
- Edge cases and negative paths were checked, guarded, tested, or explicitly documented as remaining risks.
- Relevant tests/builds pass or any unrun verification is explicitly disclosed.
- Audit log exists and is accurate.

## Skill Handoff

- Always use `impact-audit` before this skill unless the audit has already been completed in the current task.
- Use `coverage-audit` first when the requested feature comes from a whole-app audit, contract mismatch audit, or broad regression review.
- If an existing flow is unclear, use `deepdive` before implementation.
- Use `code` for the actual implementation once scope and affected surfaces are clear.
- If tests, builds, API smoke checks, or runtime verification fail, use `bugfinder` to diagnose root cause before continuing.
- If the user only wants to review or compare implementation options, use `analyze` instead of implementing.
