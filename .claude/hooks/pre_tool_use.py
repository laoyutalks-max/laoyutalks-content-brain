"""PreToolUse: the main safety gate. Denies destructive / protected / secret-leaking actions,
asks the owner for sensitive ones. Fails closed: any internal error denies the action."""
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import (READ_ONLY_AGENTS, current_branch, emit, find_secrets, is_protected,  # noqa: E402
                     log, read_input)

EDIT_TOOLS = {"Edit", "Write", "MultiEdit", "NotebookEdit"}
SHELL_TOOLS = {"Bash", "PowerShell"}

# (regex, reason) — always denied
DENY_CMD = [
    (r"\brm\s+(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\b", "recursive delete"),
    (r"\bRemove-Item\b.*-Recurse", "recursive delete"),
    (r"\b(rd|rmdir)\s+/s\b|\bdel\s+/[sq]", "recursive delete"),
    (r"\b(format|diskpart|mkfs)\b", "disk formatting"),
    (r"\bgit\s+push\b.*(\s-f\b|--force|--mirror|--delete|\s:\S|\s\+\S)", "force/delete push"),
    (r"\bgit\s+push\b.*\b(main|master|gh-pages)\b", "push to production branch"),
    (r"\bgit\s+push\s+--all\b", "push of all branches"),
    (r"\bgit\s+reset\s+--hard\b", "discards work"),
    (r"\bgit\s+clean\s+-[a-zA-Z]*f", "deletes untracked files"),
    (r"\bgit\s+branch\s+-D\b", "force-deletes a branch"),
    (r"\bgit\s+(filter-branch|filter-repo|update-ref|reflog\s+expire)\b", "rewrites history"),
    (r"--no-verify\b|core\.hooksPath|\bgit\s+config\b.*hooks", "bypasses checks"),
    (r"--dangerously-skip-permissions|bypassPermissions|disableAllHooks", "bypasses safety controls"),
    (r"\bgh\s+(pr\s+merge|repo\s+(delete|edit|rename|archive)|secret|variable|ruleset|release\s+(create|delete)|workflow\s+(run|enable|disable))\b",
     "production / repository-level GitHub action"),
    (r"\bgh\s+api\b.*(-X|--method)\s*(DELETE|PUT|PATCH|POST)", "write call to GitHub API"),
    (r"\bgh\s+api\b.*(branches/[^/\s]+/protection|/pages\b)", "changes branch protection or Pages"),
    (r"\b(Set-ExecutionPolicy|reg\s+(add|delete)|netsh|bcdedit|icacls|takeown|attrib)\b", "system/security setting"),
]

# (regex, reason) — owner must approve
ASK_CMD = [
    (r"\bgit\s+push\b", "pushes to GitHub"),
    (r"\bgh\s+pr\s+(create|edit|close|comment|review)\b", "changes a pull request"),
    (r"\bgit\s+(merge|rebase|cherry-pick)\b", "rewrites branch contents"),
    (r"\bgit\s+(checkout|restore)\s+(--\s|\.|-f)", "discards local changes"),
    (r"\b(pip|pip3|npm|npx|pnpm|yarn|winget|choco|scoop|gem|cargo)\s+(install|i|add|exec|dlx)\b|\bnpx\s|\bInstall-(Module|Package)\b",
     "installs software"),
    (r"\b(curl|wget|Invoke-WebRequest|Invoke-RestMethod|iwr|irm)\b", "network request"),
    (r"\bgit\s+commit\b", "creates a commit"),
]

# Shell commands that only read — allowed for read-only agents
READ_ONLY_CMD = re.compile(
    r"^\s*(git\s+(status|diff|log|show|branch|rev-parse|ls-files|blame|grep)\b|"
    r"python\s+\S*\.claude/tests/run_checks\.py|ls\b|cat\b|head\b|tail\b|grep\b|rg\b|find\b|wc\b|"
    r"Get-ChildItem\b|Get-Content\b|Select-String\b)", re.I)

WRITE_TOKENS = re.compile(r"(>|\btee\b|\bsed\s+-i|\bmv\b|\bcp\b|\brm\b|\bdel\b|\btouch\b|\bchmod\b|"
                          r"Set-Content|Add-Content|Out-File|Move-Item|Copy-Item|Remove-Item|New-Item|"
                          r"Rename-Item|\.write|open\(|truncate|\bgit\s+(rm|mv|checkout|restore)\b)", re.I)
PROTECTED_IN_CMD = re.compile(r"(\.claude[/\\](?!projects)|CLAUDE\.md|\.git[/\\]|\.github[/\\]workflows|"
                              r"\.gitignore|\.env\b|JARVIS[^\s\"']*\.html|settings(\.local)?\.json)", re.I)


def decide(decision, reason):
    emit({"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                 "permissionDecision": decision,
                                 "permissionDecisionReason": "LAOYU safety: " + reason}})
    sys.exit(0)


def main():
    data = read_input()
    tool = data.get("tool_name", "")
    ti = data.get("tool_input") or {}
    agent = (data.get("agent_type") or "").lower()

    if tool in EDIT_TOOLS:
        path = ti.get("file_path") or ti.get("notebook_path") or ""
        if agent in READ_ONLY_AGENTS:
            log("deny", {"tool": tool, "agent": agent, "path": path})
            decide("deny", f"agent '{agent}' is read-only and may not edit files.")
        if is_protected(path):
            log("deny", {"tool": tool, "path": path})
            decide("deny", f"'{path}' is a protected safety/secret file. Ask the owner to change it.")
        text = " ".join(str(ti.get(k, "")) for k in ("content", "new_string", "new_source"))
        for e in ti.get("edits") or []:
            text += " " + str(e.get("new_string", ""))
        hits = find_secrets(text)
        if hits:
            log("deny", {"tool": tool, "path": path, "secrets": hits})
            decide("deny", "content looks like a secret (" + ", ".join(hits) + "). Never put secrets in files.")
        if current_branch() in ("main", "master"):
            decide("deny", "you are on 'main' (production). Create a branch first: git checkout -b feature/<name>.")
        return

    if tool in SHELL_TOOLS:
        cmd = ti.get("command", "")
        for pat, why in DENY_CMD:
            if re.search(pat, cmd, re.I):
                log("deny", {"tool": tool, "cmd": cmd, "why": why})
                decide("deny", f"blocked ({why}). The owner must do this themselves.")
        if PROTECTED_IN_CMD.search(cmd) and WRITE_TOKENS.search(cmd):
            log("deny", {"tool": tool, "cmd": cmd, "why": "protected file write"})
            decide("deny", "command may change a protected safety/secret file.")
        hits = find_secrets(cmd)
        if hits:
            decide("deny", "command contains what looks like a secret (" + ", ".join(hits) + ").")
        if agent in READ_ONLY_AGENTS and not READ_ONLY_CMD.search(cmd):
            decide("deny", f"agent '{agent}' may only run read-only commands and the test runner.")
        if re.search(r"\bgit\s+(commit|merge|rebase|cherry-pick)\b", cmd) and current_branch() in ("main", "master"):
            decide("deny", "you are on 'main' (production). Work on a branch.")
        for pat, why in ASK_CMD:
            if re.search(pat, cmd, re.I):
                log("ask", {"tool": tool, "cmd": cmd, "why": why})
                decide("ask", f"{why} — owner approval required.")
        return

    if tool.startswith("mcp__") and re.search(r"(send|delete|trash|forward|share|update|create|publish|deploy)", tool, re.I):
        decide("ask", f"external action via {tool} — owner approval required.")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as e:  # fail closed
        decide("deny", f"safety hook error ({e}); action blocked until fixed.")
