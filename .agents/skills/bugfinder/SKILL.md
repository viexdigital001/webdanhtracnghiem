---
name: bugfinder
description: Investigates suspected bugs, regressions, runtime errors, failing tests, and production issues to identify likely root causes without changing code. Use when the user asks to find, diagnose, or explain a bug before fixing it.
---

# Bugfinder

Use this skill to diagnose bugs and likely root causes.

This is a read-only investigation skill. Do not modify files unless the user explicitly asks to implement the fix after the diagnosis.

## When To Use

- The user reports an error, failing test, broken UI behavior, API failure, 500/502/404 issue, data mismatch, or production incident.
- The user asks "why is this happening?", "find the bug", "check root cause", or "review this failure".
- The user provides logs, screenshots, stack traces, or a reproduction description.

## Required Workflow

### 1. Build Initial Hypotheses

From the user's report and current context, list up to 3 likely causes before deep searching.

For each hypothesis, include:

- Why it is plausible.
- What evidence would confirm or reject it.

### 2. Inspect Local Evidence

- Search with `rg` for error messages, route names, component names, env vars, model/table names, and relevant keywords.
- Read the smallest useful set of files.
- Check recent diffs or commit context when relevant.
- Check config/runtime files when the bug smells like CORS, proxy, Docker, env, build, cache, or route mismatch.

### 3. Narrow The Cause

- Rank causes from most likely to least likely.
- Mark each cause as confirmed, likely, possible, or rejected.
- Identify the exact file/function/config responsible when possible.
- Avoid claiming certainty without evidence.

### 4. Recommend Fix Direction

- Describe the minimal fix path.
- Mention tests or commands needed to verify the fix.
- Do not edit code in this skill unless the user explicitly asks to proceed.

## Output Format

```md
Most Likely Root Cause:
- ...

Evidence:
- ...

Other Possibilities:
- ...

Recommended Fix:
- ...

Verification:
- ...
```

## Skill Handoff

- If the user asks to fix the confirmed bug, use `code`.
- If the bug report spans multiple modules or requires proving FE/BE/DB contract coverage, use `coverage-audit`.
- If the fix affects DB, API, UI, deployment, permissions, billing, quota, or operational data, use `impact-audit` before coding.
- If the fix requires coordinated changes across backend, admin/vendor UI, tenant/public UI, tests, or deployment, use `full-stack-feature`.
- If the root cause depends on an unclear end-to-end flow, use `deepdive`.
- If verification fails after a fix, return to `bugfinder` to diagnose the new failure before making more changes.
