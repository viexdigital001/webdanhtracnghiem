#!/usr/bin/env python3
import os
import sys
import json
import shutil
import re
import subprocess
import platform

def run_command(cmd_list):
    try:
        result = subprocess.run(cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def install_python_packages():
    print("[*] Installing code-review-graph via pip...")
    cmd = [sys.executable, "-m", "pip", "install", "code-review-graph"]
    success, stdout, stderr = run_command(cmd)
    if success:
        print("[+] Successfully installed code-review-graph.")
    else:
        print(f"[x] Failed to install code-review-graph: {stderr or stdout}")

def setup_rtk():
    print("[*] Checking RTK (Rust Token Killer) installation...")
    rtk_path = shutil.which("rtk")
    if rtk_path:
        print(f"[+] RTK is already installed at: {rtk_path}")
    else:
        if platform.system() == "Windows":
            print("[*] RTK not found. Attempting to install via winget...")
            cmd = ["winget", "install", "rtk-ai.rtk", "--accept-source-agreements", "--accept-package-agreements"]
            success, stdout, stderr = run_command(cmd)
            if success:
                print("[+] Successfully installed RTK via winget.")
            else:
                print(f"[x] Failed to install RTK: {stderr or stdout}")
                print("[!] Please install RTK manually: https://github.com/rtk-ai/rtk")
                return
        else:
            print("[!] RTK must be installed manually on non-Windows systems: https://github.com/rtk-ai/rtk")
            return

    # Initialize RTK globally
    print("[*] Initializing RTK globally...")
    success, stdout, stderr = run_command(["rtk", "init", "-g"])
    if success:
        print("[+] RTK initialized globally successfully.")
    else:
        print(f"[!] Warning: RTK initialization returned: {stderr or stdout}")

def main():
    print("====================================================")
    print("       Antigravity Auto-Configuration Script        ")
    print("====================================================")

    # 1. Detect paths
    workspace_root = os.path.abspath(os.path.dirname(__file__))
    workspace_root_forward = workspace_root.replace('\\', '/')
    print(f"[*] Detected Workspace Root: {workspace_root}")

    # Determine Python executable path
    python_exe = sys.executable
    print(f"[*] Python Executable: {python_exe}")

    # 2. Install Python packages
    install_python_packages()

    # 3. Configure RTK
    setup_rtk()

    # 4. Setup mcp_config.json
    home = os.path.expanduser('~')
    antigravity_dir = os.path.join(home, '.gemini', 'antigravity')
    mcp_config_path = os.path.join(antigravity_dir, 'mcp_config.json')

    print(f"[*] Checking AppData configuration directory: {antigravity_dir}")
    if not os.path.exists(antigravity_dir):
        os.makedirs(antigravity_dir, exist_ok=True)
        print("[+] Created Antigravity directory.")

    existing_config = {}
    if os.path.exists(mcp_config_path):
        print(f"[*] Found existing mcp_config.json. Merging settings...")
        try:
            with open(mcp_config_path, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print(f"[!] Warning: Could not read existing mcp_config.json: {e}")

    # Build new config structure
    mcp_servers = existing_config.get("mcpServers", {})

    mcp_servers["code-review-graph"] = {
        "command": python_exe,
        "args": ["-m", "code_review_graph", "serve"],
        "cwd": workspace_root
    }

    if "sentry" not in mcp_servers:
        mcp_servers["sentry"] = {
            "command": "npx",
            "args": [
                "-y",
                "@sentry/mcp-server@latest",
                "--access-token",
                "YOUR_SENTRY_ACCESS_TOKEN"
            ]
        }

    new_config = {"mcpServers": mcp_servers}

    try:
        with open(mcp_config_path, 'w', encoding='utf-8') as f:
            json.dump(new_config, f, indent=2)
        print(f"[+] Successfully wrote configuration to {mcp_config_path}")
    except Exception as e:
        print(f"[x] Error writing mcp_config.json: {e}")
        return

    # 5. Update paths in rules & GEMINI.md
    print("[*] Updating absolute paths in project rule/guideline files...")
    
    # We will search in workspace root for GEMINI.md, and inside .agents/ recursively
    files_to_check = []
    
    # Check GEMINI.md
    gemini_md = os.path.join(workspace_root, "GEMINI.md")
    if os.path.exists(gemini_md):
        files_to_check.append(gemini_md)
        
    # Check AGENTS.md
    agents_md = os.path.join(workspace_root, "AGENTS.md")
    if os.path.exists(agents_md):
        files_to_check.append(agents_md)

    # Check .agents/ folder
    agents_dir = os.path.join(workspace_root, ".agents")
    if os.path.exists(agents_dir):
        for root, dirs, files in os.walk(agents_dir):
            for file in files:
                if file.endswith('.md') or file.endswith('.txt'):
                    files_to_check.append(os.path.join(root, file))

    print(f"[*] Scanning {len(files_to_check)} files for absolute path references...")
    
    # We want to replace paths matching:
    # 1. file:///g:/AVERA/ or file:///G:/AVERA/ (case insensitive) -> file:///<workspace_root_forward>/
    # 2. G:\AVERA or g:\AVERA -> <workspace_root>
    # 3. G:/AVERA or g:/AVERA -> <workspace_root_forward>
    
    drive_path_pattern = re.compile(r'file:///g:/AVERA/', re.IGNORECASE)
    win_path_pattern = re.compile(r'g:\\AVERA', re.IGNORECASE)
    forward_path_pattern = re.compile(r'g:/AVERA(?!-platform)', re.IGNORECASE) # avoid matching avera-platform

    modified_count = 0
    for file_path in files_to_check:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # Perform replacements using lambda to avoid backslash escape issues
            new_content = drive_path_pattern.sub(lambda m: f'file:///{workspace_root_forward}/', new_content)
            new_content = win_path_pattern.sub(lambda m: workspace_root, new_content)
            new_content = forward_path_pattern.sub(lambda m: workspace_root_forward, new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                # Print relative path for cleaner output
                rel_path = os.path.relpath(file_path, workspace_root)
                print(f"  [+] Updated paths in: {rel_path}")
                modified_count += 1
        except Exception as e:
            print(f"  [!] Failed to process file {file_path}: {e}")

    print(f"[*] Paths updated in {modified_count} files.")
    print("\n[+] Setup Complete! Please restart your Antigravity agent/IDE to load new MCP servers.")
    print("====================================================")

if __name__ == '__main__':
    main()
