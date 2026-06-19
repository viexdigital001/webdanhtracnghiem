---
name: analyze
description: Analyzes project architecture, feature scope, code relationships, risks, and implementation options without modifying files. Use when the user asks for analysis, review, planning, technical direction, or impact assessment before coding.
---

# Analyze

Use this skill for read-only project analysis and technical guidance.

Do not modify files when this skill is active unless the user explicitly changes the task from analysis to implementation.

## When To Use

- The user asks to analyze a feature, plan, architecture, bug report, code path, or technical direction.
- The user asks whether an approach is correct before implementation.
- The user wants risks, tradeoffs, affected files, or implementation strategy.
- The request is exploratory and should not immediately produce code changes.

## Required Workflow

### 1. Clarify Scope

- Identify the exact module, app, surface, or behavior being discussed.
- If the repo is a monorepo, identify which apps are relevant.
- Restate the practical objective in a short form before deep analysis when helpful.

### 2. Gather Evidence

- Use code search first, preferably `rg`, for routes, components, models, table names, field names, API clients, and UI labels.
- Read nearby files before drawing conclusions.
- Check existing patterns before recommending new patterns.
- When external behavior may have changed recently, verify using current official docs or reliable sources.

### 3. Analyze Impact

Check applicable areas:

- Backend and DB source of truth.
- API request/response contracts.
- Admin/Vendor management UI.
- Tenant or public UI.
- Permissions, tenant/property isolation, billing, quota, cache, queues, cron, and deployment.
- Tests, seeders, migrations, runtime environment, and production data safety.

### 4. Provide Direction

- Lead with findings, risks, and missing pieces.
- Explain why a risk matters.
- Suggest the smallest complete path that solves the root issue.
- Separate confirmed facts from assumptions.
- Do not provide large code blocks unless the user asks for implementation details.

## Output Format

Use concise sections when helpful:

```md
Findings:
- ...

Impact:
- ...

Recommendation:
- ...

Verification Needed:
- ...
```

If there are no major issues, say that clearly and mention remaining residual risk or unverified areas.

## Skill Handoff

- If the analysis shows the feature affects DB, API, UI, deployment, permissions, billing, quota, or operational data, use `impact-audit` before any implementation.
- If the analysis is broad, cross-module, or requires proof that all relevant files/contracts were checked, use `coverage-audit`.
- If the user wants the analyzed feature implemented end-to-end, use `impact-audit` and then `full-stack-feature`.
- If the analysis requires tracing a complex existing flow, use `deepdive`.
- If the analysis reveals a suspected bug or regression, use `bugfinder`.
- If scope is already clear and the user explicitly wants code changes, use `code`.
