---
name: deepdive
description: Performs deep read-only exploration of a feature flow across UI, API, backend, database, jobs, cache, and deployment to produce a complete data/control-flow summary. Use when the user asks to understand a feature deeply or trace how something works end-to-end.
---

# Deepdive

Use this skill for comprehensive read-only exploration of an existing feature or system behavior.

Do not modify files when this skill is active unless the user explicitly asks to implement after the deep dive.

## When To Use

- The user asks how a feature works end-to-end.
- The user wants to trace data flow from UI to API to database.
- The user wants hidden dependencies, constraints, or related modules discovered.
- The user asks for a full flow summary before planning or changing code.

## Required Workflow

### 1. Map The Entry Points

- Identify UI pages/components, routes, API endpoints, jobs, commands, or scheduled tasks that start the flow.
- Search by business keyword, route name, table/model name, component name, and API client function.

### 2. Trace The Flow

Read the relevant files and trace:

- UI event or render path.
- API client request.
- Backend route/controller/request validation.
- Service/domain logic.
- Model/database tables.
- Side effects: events, jobs, notifications, cache, audit logs, external integrations.
- Response back to UI and state update.

### 3. Check Hidden Couplings

- Permissions and tenant/property boundaries.
- Feature flags or environment variables.
- Seeders, fixtures, migrations, and demo data.
- Cache invalidation and stale state.
- Deployment/proxy/CORS/runtime config when relevant.

### 4. Summarize Clearly

Provide both a detailed explanation and a compact arrow flow.

Example:

```md
Flow Summary:
UI Component -> API Client -> Backend Route -> Controller -> Service -> Model/Table -> Response -> UI State
```

## Output Format

```md
Deep Dive:
- Entry points:
- Main flow:
- Data model:
- Permissions/rules:
- Hidden dependencies:
- Risks or unclear areas:

Compact Flow:
A -> B -> C -> D

Suggested Next Steps:
1. ...
2. ...
```

## Skill Handoff

- If the deep dive reveals a feature change is needed, use `impact-audit` before implementation.
- If the user needs proof that every related surface/file/contract was checked, use `coverage-audit`.
- If the user wants the traced feature implemented or changed end-to-end, use `impact-audit` and then `full-stack-feature`.
- If the deep dive exposes a likely bug, regression, or runtime mismatch, use `bugfinder`.
- If the user only wants strategic recommendations after the flow summary, use `analyze`.
- If the flow is fully understood and the user explicitly asks for a scoped code change, use `code`.
