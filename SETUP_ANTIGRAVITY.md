# 🚀 AVERA Workspace Setup Playbook for Antigravity & MCP

This document contains instructions to set up the development environment, Model Context Protocol (MCP) servers, and custom agent rules for the AVERA monorepo. 

It is designed to be read by **both developers** and **their Antigravity AI coding assistant**.

---

## 📂 Project Rule Directory Structure

For Antigravity and the custom agents to automatically pick up these rules, workflows, and skills, the files must be organized in your workspace root exactly as follows:

```text
AVERA-monorepo/ (Workspace Root)
├── .agents/
│   ├── rules/
│   │   ├── antigravity-rtk-rules.md
│   │   ├── code-review-graph-rules.md
│   │   ├── sentry-rules.md
│   │   └── rules.md
│   ├── workflows/
│   │   └── verification.md
│   └── skills/
│       ├── analyze/
│       ├── bugfinder/
│       ├── coverage-audit/
│       └── deepdive/
├── GEMINI.md
├── AGENTS.md
├── setup_antigravity.py
└── SETUP_ANTIGRAVITY.md
```

> [!IMPORTANT]
> The `.agents/` directory must be placed in the **absolute root** of the workspace directory. Antigravity dynamically scans this directory to fetch context, apply rules, run skill sets, and enforce development/verification workflows.

---

## 🤖 Direct Instructions for your Antigravity AI Agent

> [!NOTE]
> **Colleague instruction:** copy/paste the block below directly into your first chat with Antigravity to let the AI set up your environment automatically.

```markdown
Dear Antigravity, 

Your task is to automatically set up and configure the local development environment for this AVERA monorepo workspace. Please execute the following steps:

1. **Verify Python Environment**:
   - Check if Python 3.12+ is installed on the local system.
   - Install the required MCP package via pip:
     ```bash
     pip install code-review-graph
     ```

2. **Run the Auto-Configuration Script**:
   - Execute the local setup script `setup_antigravity.py` in the workspace root:
     ```bash
     python setup_antigravity.py
     ```
   - This script will:
     - Automatically detect your Python executable path.
     - Generate or update your global `mcp_config.json` in your AppData directory (`~/.gemini/antigravity/mcp_config.json`) with `code-review-graph` and `sentry`.
     - Scan and rewrite all hardcoded absolute paths (`G:\AVERA`, `file:///g:/AVERA/`) in the project rules (`GEMINI.md`, `AGENTS.md`, and `.agents/rules/*.md`) to match your current local workspace root.

3. **Install and Configure RTK (Rust Token Killer)**:
   - Check if `rtk` is installed. If not on Windows or `winget` is unavailable, guide the user to install it. On Windows, run:
     ```bash
     winget install rtk-ai.rtk --accept-source-agreements --accept-package-agreements
     ```
   - Run the initialization command globally to enable CLI compression:
     ```bash
     rtk init -g
     ```

4. **Verify MCP Servers**:
   - Confirm that the newly registered `code-review-graph` and `sentry` MCP servers are recognized and loaded.

5. **Provide a Setup Summary**:
   - Confirm which files were updated, that the setup is complete, and remind the user to configure their Sentry access token in `mcp_config.json` if they haven't already.
```

---

## 🛠️ Step-by-Step Manual Setup

If you prefer to configure the environment manually, follow the steps below:

### 1. Install Global CLI & Python Dependencies

Run the following commands in your terminal:

```bash
# Install Python MCP Server
pip install code-review-graph

# Install RTK (Rust Token Killer) on Windows
winget install rtk-ai.rtk --accept-source-agreements --accept-package-agreements
rtk init -g
```

> [!TIP]
> **What is RTK?** 
> RTK is a CLI proxy tool that compresses terminal outputs (like test runs, docker logs, git status) before sending them to the AI, saving 60-90% of token usage.

---

### 2. Configure Antigravity MCP Servers (`mcp_config.json`)

Antigravity loads MCP servers from a configuration file located at:
`C:\Users\<Your-Username>\.gemini\antigravity\mcp_config.json`

Create or edit this file and paste the configuration below. Make sure to replace `<WORKSPACE_ROOT>` with the absolute path to your local repository (e.g., `D:\projects\AVERA` or `C:\Code\AVERA`), and `<PYTHON_PATH>` with the path to your Python executable (e.g., `C:\Users\<Username>\AppData\Local\Programs\Python\Python312\python.exe`):

```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "<PYTHON_PATH>",
      "args": [
        "-m",
        "code_review_graph",
        "serve"
      ],
      "cwd": "<WORKSPACE_ROOT>"
    },
    "sentry": {
      "command": "npx",
      "args": [
        "-y",
        "@sentry/mcp-server@latest",
        "--access-token",
        "YOUR_SENTRY_ACCESS_TOKEN"
      ]
    }
  }
}
```

---

### 3. Adjust Absolute Path References in Rule Files

The project features deep integration with Antigravity through custom rules and workflows. To make absolute link references clickable in your IDE, any references to the old root path (`G:\AVERA` or `file:///g:/AVERA/`) must be updated to match your local drive and folder name.

The files containing these links are:
* [GEMINI.md](./GEMINI.md) - Global project rules.
* [AGENTS.md](./AGENTS.md) - Developer guidelines redirect.
* [.agents/rules/code-review-graph-rules.md](./.agents/rules/code-review-graph-rules.md) - Rules enforcing the use of codebase graphs.
* [.agents/rules/sentry-rules.md](./.agents/rules/sentry-rules.md) - Sentry error logging and debugging rules.
* [.agents/rules/rules.md](./.agents/rules/rules.md) - Mandatory feature development, edge case audits, and data lifecycle rules.

Simply execute the auto-configuration python script to fix these paths instantly:
```bash
python setup_antigravity.py
```

---

## 📖 Key Rules Summary for New Developers

Once configured, Antigravity will automatically adhere to the following core guidelines:

1. **Codebase Graph First**: Always search using `code-review-graph` MCP tools (`semantic_search_nodes`, `query_graph`) before falling back to `grep_search`. This is faster, cheaper, and maps project relationships.
2. **Synchronize Graph**: If you modify/add/delete code, run `code-review-graph build` in the terminal to keep the knowledge knowledge graph up to date.
3. **RTK Command Prefix**: Always prefix terminal commands with `rtk` (e.g. `rtk git status`, `rtk php artisan test`) except for read-only path/file discovery commands.
4. **No Happy-Path-Only Dev**: Every feature/fix requires an `Edge Cases / Negative Paths` audit (guarding invalid input, wrong ownership states, empty responses, API errors, etc.).
5. **Sentry Error Logging**: When investigating bugs, check Sentry MCP tools to retrieve recent errors and stack traces before attempting to fix them.
6. **Strict Verification**: Every release must pass through the validation steps detailed in the [.agents/workflows/verification.md](./.agents/workflows/verification.md) protocol.
