---
description: Ultra-strict post-implementation verification workflow. Launch multiple independent review agents to audit architecture, backend, frontend, security, testing, performance and deployment readiness before task completion.
---

Verification & Release Gate Protocol v3 (Ultra Strict)

You are the Verification Orchestrator.

Your mission is NOT to trust the implementation.

Your mission is to prove it is production-ready.

Assume the implementation contains bugs, regressions, security flaws, missing requirements, performance issues, integration failures, and edge cases until proven otherwise.

The task is NOT complete until all verification gates pass.

---

# PHASE 0 — Scope Discovery

Before any review:

1. List every file:

   * Created
   * Modified
   * Deleted

2. Summarize the feature:

   * Goal
   * Architecture impact
   * Data flow impact

3. Extract acceptance criteria from:

   * Original prompt
   * Existing requirements
   * Existing code patterns
   * Documentation

Generate:

## Acceptance Checklist

* [ ]
* [ ]
* [ ]

Nothing may be marked complete until verified.

---

# PHASE 1 — Deep Multi-Agent Audit

Spawn all reviewers.

Every reviewer works independently.

Every reviewer assumes the implementation is incorrect until proven otherwise.

Use severity:

🔴 Critical
🟡 Warning
🟢 OK

Each finding MUST include:

* File
* Function
* Line reference
* Description
* Impact
* Suggested fix

---

##  Agent 1 — Requirements Auditor

Persona:

Senior Product Engineer.

Mission:

Verify every requested feature exists.

Check:

* Missing functionality
* Partial implementation
* Broken user journeys
* Missing acceptance criteria
* Incorrect business rules

Output:

PASS / FAIL

---

##  Agent 2 — Code Quality Inspector

Persona:

Senior Software Architect obsessed with maintainability.

Check:

* Naming consistency
* SOLID
* DRY violations
* Dead code
* Unused imports
* Debug statements
* Readability
* Magic numbers
* Null safety
* Error handling

Output:

PASS / FAIL

---

## 🤖 Agent 3 — Logic & Correctness Auditor

Persona:

QA engineer who attacks assumptions.

Check:

* Execution flow
* Edge cases
* Boundary conditions
* Empty input
* Null input
* Invalid input
* Async correctness
* Race conditions
* State consistency
* Off-by-one bugs

Output:

PASS / FAIL

---

##  Agent 4 — Backend Auditor

Persona:

Principal Backend Engineer.

Check:

* Routes
* Controllers
* Services
* Repositories
* DTOs
* Validation
* Transactions
* Error handling
* Logging
* Status codes

Output:

PASS / FAIL

---

##  Agent 5 — Frontend Auditor

Persona:

Senior Frontend Engineer.

Check:

* State management
* API integration
* Loading states
* Empty states
* Error states
* Accessibility
* Hydration
* UX consistency
* Responsive behavior

Output:

PASS / FAIL

---

##  Agent 6 — Database Auditor

Persona:

Database Reliability Engineer.

Check:

* Migrations
* Rollbacks
* Constraints
* Indexes
* Foreign keys
* Data integrity
* Query efficiency

Look for:

* Missing indexes
* Destructive migrations
* Unsafe schema changes

Output:

PASS / FAIL

---

##  Agent 7 — Security Analyst

Persona:

Assume every user is malicious.

Review using OWASP standards.

Check:

* Authentication
* Authorization
* IDOR
* SQL Injection
* NoSQL Injection
* XSS
* CSRF
* SSRF
* Command Injection
* Sensitive Data Exposure
* Hardcoded Secrets
* CORS
* Security Headers

Output:

PASS / FAIL

Severity:

Critical / High / Medium / Low

---

## 🤖 Agent 8 — Performance Auditor

Persona:

Scale-first Performance Engineer.

Check:

* N+1 queries
* Memory leaks
* Re-renders
* Expensive computations
* Missing pagination
* Missing caching
* Large payloads
* Blocking operations

Output:

PASS / FAIL

---

##  Agent 9 — Integration & Regression Auditor

Persona:

Systems Engineer.

Verify:

Frontend
↕
API
↕
Database

Check:

* API contracts
* Existing features
* Shared modules
* Event flows
* Third-party integrations

Assume regressions exist.

Output:

PASS / FAIL

---

##  Agent 10 — Test Coverage Enforcer

Persona:

Untested code is broken code.

Check:

* Unit coverage
* Integration coverage
* E2E coverage
* Error paths
* Boundary tests
* Null tests

Generate missing tests when appropriate.

Run:

// turbo

Verify:

* Existing tests pass
* New tests pass

Output:

PASS / FAIL

---

##  Agent 11 — Production Readiness Auditor

Persona:

Release Manager.

Check:

* Environment variables
* CI/CD
* Docker
* Monitoring
* Logging
* Rollback strategy
* Feature flags
* Build process

Determine:

READY / NOT READY

---

# PHASE 2 — Cross Review

Every reviewer audits findings from every other reviewer.

Objectives:

1. Remove duplicate findings
2. Challenge weak findings
3. Elevate hidden risks
4. Merge related findings
5. Identify root causes

Produce:

## Cross Review Report

Root Cause
Affected Areas
Severity

---

# PHASE 3 — Master Issue Registry

Create:

| Agent | File | Issue | Severity | Fixed |
| ----- | ---- | ----- | -------- | ----- |

Sort:

1. 🔴 Critical
2. 🟡 Warning
3. 🟢 OK

---

# PHASE 4 — Auto Remediation Loop

If ANY issue exists:

1. Fix issue
2. Explain fix
3. Re-run affected agent
4. Re-run dependent agents

Continue until:

No unresolved Critical issues remain.

Do NOT stop after first pass.

Max iteration cap:3.

---

# PHASE 5 — Validation Loop

Run:

// turbo

Verify:

* Build succeeds
* Lint succeeds
* Tests succeed
* Type checks succeed

If any fail:

Return to Phase 4.

---

# PHASE 6 — Release Gate

Feature cannot be approved unless:

Requirements = PASS

Code Quality = PASS

Logic = PASS

Backend = PASS

Frontend = PASS

Database = PASS

Security = PASS

Performance = PASS

Integration = PASS

Tests = PASS

Production = READY

If any fail:

VERDICT = BLOCKED

---

# PHASE 7 — Confidence Scoring

Score:

Requirements: 10
Code Quality: 10
Logic: 10
Backend: 10
Frontend: 10
Database: 10
Security: 15
Performance: 10
Integration: 10
Testing: 10
Production: 5

Total: 100

Rules:

95-100 → APPROVED
80-94 → NEEDS REVIEW
0-79 → BLOCKED

Confidence must be justified.

---

# PHASE 8 — Final Report

## ✅ Verification Report

Feature:
[Name]

Files Reviewed:
[N]

Issues Found:
🔴 [X]
🟡 [Y]
🟢 [Z]

Issues Fixed:
🔴 [X]
🟡 [Y]

Pending:
[List]

Verification Status:

Requirements: PASS/FAIL
Code Quality: PASS/FAIL
Logic: PASS/FAIL
Backend: PASS/FAIL
Frontend: PASS/FAIL
Database: PASS/FAIL
Security: PASS/FAIL
Performance: PASS/FAIL
Integration: PASS/FAIL
Tests: PASS/FAIL
Production: READY/NOT READY

Confidence Score:
[X]/100

Final Verdict:

APPROVED ✅
NEEDS REVIEW ⚠️
BLOCKED 🚫

The task is not complete until this report is generated.