# RTK - Rust Token Killer (Google Antigravity)

**Usage**: Token-optimized CLI proxy for shell commands.

## Rule

Always prefix shell commands with `rtk` to minimize token consumption, **except for file/path discovery commands**.

Examples:

```bash
rtk git status
rtk cargo test
rtk docker ps
rtk gh pr list
```

## Exceptions for File & Path Discovery

For read-only file/path discovery commands (like `find`, `grep`, `rg`, `ls`), `rtk`'s output compression can strip exact paths or omit crucial matches, causing agent confusion (Issue #2110).

**Guidelines**:
1. **Prefer MCP Tools**: Always use dedicated MCP tools (`code-review-graph` or `grep_search`) for finding files, symbols, or searching text. They are token-efficient and return 100% accurate structural paths.
2. **Use `rtk proxy`**: If you must run a discovery command in the shell and need the exact, un-truncated output, run it via `rtk proxy <cmd>` (or run without the `rtk` prefix) to disable filtering.

## Meta Commands

```bash
rtk gain              # Show token savings
rtk gain --history    # Command history with savings
rtk discover          # Find missed RTK opportunities
rtk proxy <cmd>       # Run raw (no filtering, for debugging/exact output)
```

## Why

RTK filters and compresses command output before it reaches the LLM context, saving 60-90% tokens on common operations. Always use `rtk <cmd>` instead of raw commands, except when exact, uncompressed file paths and discovery outputs are required.
