---
trigger: always_on
---

## Sentry Error Logging & Sentry MCP - RECOMMENDED FOR BUG INVESTIGATION

Both PMS and Avera Cloud applications have Sentry error logging integrated. The Sentry MCP server is registered in the workspace config.

### Key Rules:
- When investigating runtime bugs, exceptions, or 500 server errors reported by the user, the AI should check the `sentry` MCP tools to fetch recent events, issues, or stack traces.
- If Sentry MCP is not loaded, the AI can check the local Laravel log files (e.g., `storage/logs/laravel.log`) or `sentry.log` (if DebugFileLogger is active).
- Always inspect the stack trace to pinpoint the exact file, class, method, and line number where the exception occurred before implementing bug fixes.
