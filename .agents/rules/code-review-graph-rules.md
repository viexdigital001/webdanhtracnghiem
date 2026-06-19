---
trigger: always_on
---

## MCP Tools: code-review-graph - MANDATORY

This project has a codebase knowledge graph. The AI MUST use the `code-review-graph` MCP tools BEFORE using `Grep`/`Glob`/`Read` to explore the codebase. The graph is faster, cheaper, and provides structural context (callers, dependents, test coverage).

### Key Tools:
- `detect_changes`: Use when reviewing code changes.
- `get_review_context`: Use when extracting source code efficiently.
- `get_impact_radius` / `get_affected_flows`: Analyze impact radius before editing code.
- `query_graph`: Find callers, callees, imports, tests, and dependencies.
- `semantic_search_nodes`: Search functions/classes/variables by semantic meaning or keyword.

If the MCP server is not loaded, the AI MUST query the graph via CLI (e.g., `code-review-graph status`) or query the SQLite database at [`graph.db`](file:///G:/AVERA/.code-review-graph/graph.db).

### Graph Synchronization:
- At the start of a task or session, the AI MUST verify if the graph database is synchronized.
- If files have been added, modified, or deleted since the last graph update, the AI MUST run `code-review-graph build` in the background to ensure the graph reflects the latest codebase state before performing any code review, search, or modification tasks.

