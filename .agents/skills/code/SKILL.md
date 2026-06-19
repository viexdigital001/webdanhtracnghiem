---
name: code
description: Implements scoped code changes using existing project patterns, with guard clauses, defensive validation, focused tests, and verification. Use when the user asks to modify, fix, or build code after scope and impact are understood.
---

# Code

Use this skill when the user wants implementation.

Follow the repository rules first. If the task affects DB, API, UI, deployment, permission, billing, quota, or operational data, use `impact-audit` before coding. If it is an end-to-end product feature, use `full-stack-feature` as well.

## Implementation Principles

- Understand the requirement, business value, affected files, and expected behavior before editing.
- Prefer existing project patterns over new abstractions.
- Keep changes scoped to the task.
- Use clear domain names and guard clauses near boundaries.
- Validate input at API/request boundaries.
- Avoid comments unless they clarify complex logic.
- Do not over-engineer or create unrelated refactors.
- Do not hide business rules in frontend code when backend/DB is the source of truth.

## Required Workflow

### 1. Inspect Before Editing

- Search with `rg` for related functions, routes, models, components, API clients, types, and tests.
- Read nearby files to match style.
- Check whether the working tree already has user changes.
- Never revert unrelated user changes.

### 2. Implement Safely

- Edit only the files required by the task.
- Use migrations for DB changes; never use `migrate:fresh`.
- Update backend validation, response mapping, frontend types, API clients, and UI states together when contracts change.
- Use transactions for multi-write consistency.
- Handle empty, invalid, permission, network, and error states where applicable.
- Do an explicit edge-case pass before considering the implementation complete. Do not implement only the happy path.
- Add guard clauses for invalid input, invalid state, wrong tenant/property ownership, duplicate/retry/concurrent actions, and stale data when relevant.
- For money, quota, billing, invoice, payment, subscription, booking, availability, or inventory flows, check amount/status/idempotency/period-overlap edge cases explicitly.

### 3. Test and Verify

Run the narrowest meaningful verification available:

- Backend feature/unit tests for changed backend logic, including at least one negative path when the behavior has validation, permissions, state transitions, money, quota, billing, or ownership rules.
- Frontend build/typecheck/lint for changed frontend logic.
- Targeted smoke test for user-facing flows when feasible.
- Visual/browser verification for meaningful UI changes when feasible.

Do not claim tests/builds passed unless they were actually run.
Do not claim "no remaining risk", "fully fixed", or "DONE" unless edge cases were checked and either guarded/tested or explicitly documented.

### 4. Review Changes

- Inspect the diff before finalizing.
- Confirm no unrelated files were changed.
- Confirm old hardcoded behavior does not conflict with the new source of truth.
- Create or update audit notes when required by repository rules.
- If the work came from a report in `G:\AVERA\process`, update that report's findings and Verification Ledger. If every in-scope finding is fixed and verified, rename the original report file with a `(DONE)` prefix.

## Final Response

Keep the final response concise:

- What changed.
- What was verified.
- Edge cases/negative paths checked.
- Any remaining risk or command that could not be run.

## Skill Handoff

- If requirements or affected surfaces are unclear, stop and use `analyze` or `impact-audit` before editing.
- If the task is based on broad audit findings, require `coverage-audit` evidence before implementing.
- If the code change touches DB, API contracts, admin/vendor UI, tenant/public UI, deployment, permissions, billing, quota, or operational data, use `impact-audit` first.
- If the task is a full production feature across multiple surfaces, use `full-stack-feature`.
- If implementation requires understanding an existing flow first, use `deepdive`.
- If tests, builds, or runtime checks fail, use `bugfinder` to identify the root cause before continuing.
