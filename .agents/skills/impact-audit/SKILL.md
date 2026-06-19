---
name: impact-audit
description: Audits product changes before implementation across domain invariants, DB, API contracts, admin/vendor UI, tenant/public UI, deployment, cache, permissions, tests, and regression risk. Use before coding any non-trivial feature, fix, refactor, or behavior change.
---

# Impact Audit

Use this skill before implementing any product change that can affect more than one file, one surface, or one runtime environment.

The goal is to prevent incomplete changes, hidden conflicts, missing admin/vendor controls, broken API contracts, production data issues, and regressions.

## Required Behavior

Before coding, produce a short Impact Audit in the plan. Do not jump straight into implementation unless the request is truly trivial.

If the user mentions only one surface, still audit all related surfaces. For example, if the user asks to make Landing pricing dynamic from DB, you must also check whether Vendor/Admin needs UI to manage that pricing or related flags.

## Audit Checklist

### 1. Domain and Invariants

- Identify the domain/module touched by the request.
- Read the relevant blueprint or module documentation when available.
- Check whether the change touches tenant isolation, property isolation, subscription, quota, billing, permissions, audit logs, availability, or financial flows.
- If the request conflicts with a core invariant, warn the user before implementing.

### 2. Source of Truth

- Identify the source of truth: DB table/field, backend config, environment variable, third-party service, or frontend-only state.
- If data belongs to DB/backend, do not hardcode business behavior in frontend unless the user explicitly confirms it is static.
- If data can change during operation, there must be a management path through Admin/Vendor UI or an equivalent internal API.

### 3. Cross-surface Impact

Use code search before deciding scope. Search by table name, model name, field name, route, API client, UI label, and business keyword.

Check all applicable surfaces:

- Backend: migration, model, casts, fillable, validation, controller, service, policy, route, response/resource, tests.
- Admin/Vendor portal: list table/card, create form, edit form, toggles, API client, TypeScript types, validation, loading/error states.
- Tenant app: any user-facing behavior, permissions, quotas, state updates, error handling.
- Landing/Public UI: display logic, empty state, fallback, runtime config, SEO/static rendering implications.
- Seeder/demo data/test fixtures: default values and backfills.
- Deployment/runtime: env vars, Docker compose, nginx/proxy, CORS, cache, queues, scheduled jobs.

### 4. API Contract

- Identify request and response schema changes.
- Find every frontend consumer of changed APIs.
- Preserve backward compatibility when production clients may still rely on old fields.
- Add fallback/default values only when they preserve correctness and do not hide configuration errors.
- If adding a field, update backend validation, response mapping, frontend types, API client code, and tests.

### 5. Database and Production Safety

- DB changes must use a new migration with both `up()` and `down()`.
- Never edit old migrations that may have run already.
- For production tables, decide nullable/non-nullable, default values, backfill, indexes, unique constraints, and rollback behavior.
- Avoid ambiguous production states. If a default must be inferred, document the rule in audit notes.

### 6. Conflict and Regression Risk

- Look for old hardcoded logic that conflicts with the new source of truth.
- Check cache invalidation, stale state, retries, idempotency, and race conditions.
- Check auth/permission boundaries and fail-closed behavior.
- Check whether concurrent requests can create duplicate, partial, or inconsistent data.

### 7. Edge Cases and Negative Paths

Do not audit only the happy path. For every affected feature/action, proactively identify edge cases before implementation.

Check:

- Invalid input: missing required fields, wrong types, negative numbers, invalid enum values, empty strings, invalid dates, unknown IDs.
- Wrong state: already paid/cancelled/void/terminated/suspended/deleted/disabled/expired entities.
- Wrong ownership/scope: tenant mismatch, property mismatch, invoice/webhook mismatch, unauthorized user, forbidden field updates.
- Duplicate/concurrent actions: double-click, retry, duplicate transaction, parallel requests, idempotency.
- Empty/error states: empty result, 4xx/5xx, network failure, validation failure, partial success, rollback failure.
- Money/quota/payment risks when relevant: amount mismatch, rounding, currency, duplicate grant, period overlap, stale balance.

The audit output must include:

```md
Edge Cases / Negative Paths:
- Checked:
- Guards required:
- Tests required:
- Remaining risks:
```

### 8. Verification Plan

Define what must be run before marking done:

- Backend tests for happy path, validation, permission, empty/error state, rollback/concurrency when relevant.
- Frontend build/typecheck.
- Targeted UI verification for changed screens.
- API smoke test when runtime config or proxying is involved.

## Output Format

Keep the audit concise but explicit:

```md
Impact Audit:
- Domain:
- Source of truth:
- Surfaces affected:
- Risks/conflicts:
- Edge cases / negative paths:
- Required changes:
- Verification:
```

If the audit shows that the user request is under-scoped, say so and expand the implementation plan. Do not silently implement only the narrow surface.

## Skill Handoff

- If the audit requires deeper tracing of an existing flow, use `deepdive`.
- If the audit is broad or the user needs evidence that all related files/contracts were covered, use `coverage-audit`.
- If the audit identifies a suspected bug or regression, use `bugfinder`.
- If the audit confirms a narrow implementation scope and the user wants changes, use `code`.
- If the audit confirms an end-to-end feature across DB, backend, admin/vendor UI, tenant/public UI, tests, or deployment, use `full-stack-feature`.
- If the audit finds a conflict with core invariants or production safety, pause implementation and report the risk before coding.
