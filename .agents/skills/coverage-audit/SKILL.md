---
name: coverage-audit
description: Enforces evidence-based cross-module audits with coverage maps, contract chains, finding evidence, and verification ledgers. Use for whole-app audits, FE/BE/DB contract checks, business logic reviews, regression audits, or any task where shallow reasoning or missed files would be risky.
---

# Coverage Audit

Use this skill when the task requires broad or high-confidence review across modules.

This skill exists to prevent shallow cross-module reasoning, missed files, premature conclusions, fake "done" claims, and business invariant blind spots.

## Core Rule

Do not claim a finding, completion, or verification unless there is explicit evidence.

If evidence is incomplete, label the item as `Suspicion`, `Partial`, or `Not Checked`. Do not present it as confirmed.

## When To Use

- Whole-app or whole-module audits.
- FE -> API -> BE -> DB contract checks.
- Vendor/Admin/Tenant/Landing consistency reviews.
- Business logic and invariant reviews.
- Button/action/form audit.
- Regression audit after a large feature.
- Any task where the user asks "check all", "audit toàn bộ", "xem liên quan", "xem conflict", or "đủ field chưa".

## Required Workflow

### 1. Build A Coverage Map First

Before giving conclusions, map what was checked.

Use this table:

```md
Coverage Map:
| Surface | Search terms used | Files found | Files read | Contract checked | Status |
|---|---|---:|---:|---|---|
| FE pages/components |  |  |  |  | checked/partial/not checked |
| FE API clients/types |  |  |  |  | checked/partial/not checked |
| Backend routes |  |  |  |  | checked/partial/not checked |
| Backend controllers/services |  |  |  |  | checked/partial/not checked |
| Request validation/policies |  |  |  |  | checked/partial/not checked |
| Models/migrations/schema |  |  |  |  | checked/partial/not checked |
| Seeders/factories/tests |  |  |  |  | checked/partial/not checked |
| Runtime/deploy/config |  |  |  |  | checked/partial/not checked |
```

Rules:

- Use `rg` before reading files.
- Search by route, page name, component name, API client function, model name, table name, field name, button label, and business keyword.
- If a relevant surface is not checked, say why.
- If any critical surface is `partial` or `not checked`, do not say the audit is complete.
- A Coverage Map count is not enough. The report must also include the detailed file appendices defined in `6. Required Coverage Appendices`.

### 2. Trace Contract Chains

For each feature/page/action audited, trace the chain:

```md
Contract Chain:
UI page/component
-> form state/type
-> API client payload
-> backend route
-> controller/action
-> request validation/policy
-> service/domain logic
-> model/fillable/casts
-> migration/schema
-> response payload
-> frontend response mapper/render
```

Mark missing links as `not found`, `not checked`, or `not applicable`.

### 3. Classify Findings By Evidence

Every finding must include file evidence.

Use this format:

```md
[P1] Short title
Status: Confirmed Finding / Suspicion / Needs Verification
Evidence:
- FE:
- API client/type:
- BE route/controller:
- Validation/policy:
- DB/model/schema:
Why it matters:
- 
Recommended fix:
- 
Verification:
- 
```

Severity:

- `P0`: production-breaking, data loss, security, tenant/property isolation, billing/quota correctness.
- `P1`: major broken flow, contract mismatch, missing required management UI, wrong business logic.
- `P2`: incomplete state, weak validation, missing empty/error/loading state, non-critical mismatch.
- `P3`: polish, cleanup, naming, minor consistency issue.

If evidence is only one-sided, for example only FE evidence without BE/DB confirmation, classify it as `Suspicion`.

### 4. Check Business Invariants

Explicitly check whether the audited flow touches:

- Tenant isolation.
- Property isolation.
- Auth and permission boundaries.
- Subscription, quota, billing, pricing, availability, booking, invoice, payment, or revenue logic.
- Admin/Vendor ownership of operational data.
- Public/Landing display of DB-backed data.
- Cache, queues, scheduled jobs, external services, runtime env, CORS, proxy, or Docker networking.

If an invariant is relevant but not checked, mark it as `Not Checked`.

### 5. Audit Edge Cases and Negative Paths

For every audited feature/action, do not stop at the happy path. Actively search for edge cases and negative paths.

Check:

- Invalid input: missing required fields, wrong types, negative values, invalid enum, empty strings, invalid dates, unknown IDs.
- Invalid state transitions: already paid, cancelled, void, refunded, suspended, terminated, disabled, deleted, expired.
- Ownership/scope mismatch: tenant mismatch, property mismatch, invoice/webhook mismatch, wrong user role, cross-tenant access.
- Duplicate/concurrent actions: double-click, retry, duplicate webhook/transaction, parallel requests, idempotency.
- Empty/error states: empty list, 4xx/5xx, network failure, validation error, permission denial, partial write, rollback failure.
- Domain-specific risks: amount mismatch, quota double grant, subscription period overlap, stale cache/state, runtime env/proxy mismatch.

Include this section in the report:

```md
Edge Cases / Negative Paths:
| Feature/Action | Edge Case | Evidence Checked | Guard/Test Present | Status |
|---|---|---|---|---|
|  |  | file/line or command | yes/no/not checked | confirmed risk/covered/needs verification |
```

Rules:

- If only happy path was checked, mark the feature/action as `Needs Verification`.
- If edge-case evidence is missing, do not claim "no remaining risk".
- If a high-risk domain is involved, such as billing, quota, payments, tenant isolation, permissions, or data deletion, at least one negative-path finding or explicit guard/test must be documented.

### 6. Produce A Verification Ledger

Do not say "verified" without command or method evidence.

Use this table:

```md
Verification Ledger:
| Check | Command/Method | Result | Evidence/Notes |
|---|---|---|---|
| FE build/typecheck |  | passed/failed/not run |  |
| Backend tests |  | passed/failed/not run |  |
| API smoke check |  | passed/failed/not run |  |
| UI click/manual check |  | passed/failed/not run |  |
| Contract comparison |  | passed/failed/partial |  |
```

If a check was not run, say `not run` and why.

### 7. Required Coverage Appendices

For any whole-module, whole-app, FE/BE/DB contract, or "audit all" task, include these appendices in the report. Do not omit them.

The goal is to make coverage falsifiable: the user must be able to see exactly which files were read line-by-line, which files were only scanned, which backend controllers were checked, and which commands were actually run.

Use this format:

```md
## Appendix A: Files Fully Read

List files read end-to-end, line-by-line. Include why each file mattered.

1. `apps/.../file.ext` - reason / surface checked
2. `apps/.../file.ext` - reason / surface checked
```

```md
## Appendix B: Files Scanned

List files scanned by search, routing, dependency, or structure checks, but not fully read. Include what was scanned for.

1. `apps/.../file.ext` - scanned for routes/actions/mock timers/fields/etc.
2. `apps/.../file.ext` - scanned for routes/actions/mock timers/fields/etc.
```

```md
## Appendix C: Backend Controllers/Services Checked

List backend controllers, services, jobs, policies, FormRequests, resources, and models that were checked for contracts. Mark each as `fully read`, `scanned`, or `not checked`.

| File | Read Level | Contract Checked | Notes |
|---|---|---|---|
| `apps/.../Controller.php` | fully read/scanned/not checked | route/validation/model/response |  |
```

```md
## Appendix D: Commands Run

List exact commands or tool methods used for verification. Include concise output evidence, not just "passed".

| Command/Method | Working Directory | Result | Evidence Summary |
|---|---|---|---|
| `npm run typecheck` | `apps/...` | passed/failed/not run | exact key lines |
| `php artisan test ...` | `apps/...` | passed/failed/not run | exact test/assertion summary |
```

Rules:

- Do not mark the audit `complete` unless Appendix A-D are present.
- Do not write "all files checked" unless every relevant file is either in Appendix A or Appendix B.
- Do not write "all controllers checked" unless each relevant controller/service is listed in Appendix C.
- Do not write "verified", "passed", or "DONE" unless Appendix D includes command/method evidence.
- If a file was only scanned, never imply it was fully read.
- If a claim depends on a file that is not in Appendix A-C, classify it as `Needs Verification`.

### 8. Process Files

If creating any audit/report/checklist file, place it under:

```text
G:\AVERA\process
```

Recommended names:

```text
G:\AVERA\process\coverage-audit-<scope>-YYYYMMDD-HHMM.md
G:\AVERA\process\verification-ledger-<scope>-YYYYMMDD-HHMM.md
G:\AVERA\process\contract-map-<scope>-YYYYMMDD-HHMM.md
```

Do not create process reports inside app source folders unless the user explicitly asks.

### 9. Process File Completion Lifecycle

When a process report created under `G:\AVERA\process` is later used as the source for implementation/fixing:

1. Update the original report content directly after fixes are completed.
2. Add a completion section near the top or bottom:

```md
## Completion Status

Status: DONE / PARTIAL / BLOCKED
Completed at:
Implemented scope:
- 
Verification completed:
- 
Remaining issues:
- 
```

3. Update the Verification Ledger with actual commands/methods and results.
4. Mark each original finding as `DONE`, `PARTIAL`, `BLOCKED`, or `DEFERRED`.
5. If and only if all in-scope findings are fixed and required verification has passed, rename the same file by prefixing `(DONE)` to the filename.

Example:

```text
Before:
G:\AVERA\process\coverage-audit-fe-vendor-20260603-2150.md

After:
G:\AVERA\process\(DONE)coverage-audit-fe-vendor-20260603-2150.md
```

Do not create a separate duplicate "done" file. Update and rename the original file.

Do not add `(DONE)` if any in-scope item is still partial, blocked, not verified, or deliberately deferred without user approval.

## Skill Handoff

- Use `deepdive` when a feature flow must be traced in detail.
- Use `impact-audit` when the audit reveals cross-surface implementation impact.
- Use `bugfinder` when a confirmed or suspected defect needs root-cause diagnosis.
- Use `full-stack-feature` if fixes require DB, backend, admin/vendor UI, public/tenant UI, tests, or deployment changes together.
- Use `code` only after findings are evidence-backed and the user asks to implement.
- Use `analyze` if the user only wants strategic recommendations after the coverage audit.
