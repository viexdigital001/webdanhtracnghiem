---
trigger: always_on
---

## Skill Routing - MANDATORY

Every feature request or prompt MUST invoke multiple subagents in parallel to accelerate completion, followed by 2 cross-checking subagents (QA Auditors) to thoroughly review the code.

Do NOT use SSH-MCP unless explicitly requested by the user (the codebase runs locally).

For any feature/fix/refactor affecting DB, API, UI, deployment, permissions, billing, quota, or operational data, the AI MUST run the `impact-audit` skill before implementing. If a feature changes operational data end-to-end across multiple surfaces, the AI MUST also run the `full-stack-feature` skill.

Verify the complete data lifecycle in the Production environment before concluding. Verify the actual database schema in production before deploying updates to prevent Data State Mismatch (do not assume demo/seed data exists in production).

Maintain complete consistency in property names, data types, and casing (spaces, underscores, camelCase) for any entity/model across all APIs (e.g., Create/Update response vs. Get Detail/List response, or Initial state vs. Page Reload).

For any frontend state persistence (React Context, LocalState, LocalStorage, cache), do NOT just test the happy path. Perform page reloads/refreshes and temporary disconnect tests to verify data is correctly restored from the database/API without breaking layout or permission logic.

For any task involving full app/module audits, contract checks, action flows, regression audits, or commands like "check all" / "verify everything", the AI MUST use the `coverage-audit` skill. Never mark a task as DONE without a Coverage Map and a Verification Ledger.

For frontend UI polish, redesigns, landing pages, or dashboard improvements, use `design-taste-frontend`, `redesign-existing-projects`, or `high-end-visual-design`. These visual skills MUST NOT override `impact-audit`, `full-stack-feature`, domain rules, API contracts, accessibility, or the existing design system.

All process-related files (coverage maps, contract chains, impact audits, deepdives, bug investigations, verification ledgers, implementation plans) MUST be placed in `G:\AVERA\process` unless specified otherwise. Do not mix process files with application source code.

If a process file in `G:\AVERA\process` was used as a source for a fix/feature, update the file with Completion Status + Verification Ledger once finished. If all items are complete and verified, rename the file by prefixing it with `(DONE)`. For example, `G:\AVERA\process\coverage-audit.md` -> `G:\AVERA\process\(DONE)coverage-audit.md`. Do not add `(DONE)` if items are pending user review.

## Cross-surface Impact Analysis - MANDATORY

Before implementing any DB, API, pricing, config, permission, quota, subscription, tenant/property, billing, or public UI changes, the AI MUST analyze the end-to-end data lifecycle. Do not modify only the file mentioned in the request.

Any data displayed on the Public/Landing UI that comes from the DB or is subject to operational changes MUST have a corresponding admin/vendor UI or API for management (unless confirmed as read-only/hardcoded).

Answer these questions before coding:
1. **Source of Truth**: Which DB table/field and Model? Which migration/seeder/backfill is needed?
2. **Data Management**: If the data is dynamic, is there an Admin/Vendor UI or API to manage it? Do not hardcode business configs.
3. **Surfaces**: Trace migration, model, validation, controller, API response, tests, Admin portal UI, tenant app, public UI, and environment/cache.
4. **Code Search**: Use `rg` to find occurrences of the table, model, field, API route, or business keyword.
5. **New DB Fields**: Require a new migration with `down()`, model `$fillable`, casts, seeder/backfill, updated Admin/Public APIs, and validation tests.

A task is only DONE when the data has a complete lifecycle: created, edited, saved, read, displayed correctly, handles fallbacks, passes tests, and has no mismatch between backend, admin, frontend, and public UI.

## Edge-case and Negative-path Analysis - MANDATORY FOR ALL FEATURES

The AI MUST NOT design, implement, audit, or verify using only the happy path. Analyze edge cases, negative paths, and implicit business invariants for every user interaction and data write/read:
1. **Invalid Input**: Missing fields, incorrect types, negative values, NaN, empty strings, invalid enums, chronological errors, non-existent IDs.
2. **Wrong State**: Actions performed on entities that are paid, cancelled, terminated, suspended, deleted, disabled, or expired. Duplicate requests, double-clicks, and parallel requests.
3. **Wrong Ownership/Scope**: Cross-tenant/cross-property access, mismatched invoice-tenant or webhook-invoice associations, insufficient permissions, unauthorized public client payloads.
4. **Mismatch and Stale Data**: FE payload vs. BE validation, missing fields in BE response, outdated frontend types, stale local state/cache, hidden fallback configs masking errors.
5. **Empty/Error/Permission States**: Empty lists, API 4xx/5xx errors, network failures, validation errors, unauthorized states, partial success, failed database rollbacks.
6. **Financial/Quota/Billing Checks**: Amount mismatches, currency rounding, duplicate transactions, invoice status checks, overlapping subscription periods, double quota grants, idempotency keys.

Every implementation or audit report MUST include an `Edge Cases / Negative Paths` section:
- Checked:
- Guarded by code:
- Covered by tests:
- Remaining risks:

Never declare a change "production-ready", "fully fixed", or "DONE" without edge-case analysis and appropriate verification.