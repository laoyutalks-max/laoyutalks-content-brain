"""Self-tests for the safety hooks (happy and unhappy paths). Run: python .claude/tests/test_hooks.py
Contains FAKE secrets on purpose; excluded from the secret scan."""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HOOKS = os.path.join(ROOT, ".claude", "hooks")
F = os.path.join(ROOT, "index.html")
FAKE_PRIVATE_SCRIPT = "https://script.google.com/macros/s/AKfycbwFAKEFAKEFAKEFAKEFAKEFAKEFAKE123/exec"
PUBLIC_SCRIPT = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec"


def run(hook, payload):
    r = subprocess.run([sys.executable, os.path.join(HOOKS, hook)], input=json.dumps(payload).encode("utf-8"),
                       capture_output=True, env={**os.environ, "CLAUDE_PROJECT_DIR": ROOT})
    out = r.stdout.decode("utf-8", "replace").strip()
    return json.loads(out) if out else {}


def pre(tool, ti, agent=None):
    p = {"hook_event_name": "PreToolUse", "tool_name": tool, "tool_input": ti}
    if agent:
        p["agent_type"] = agent
    return run("pre_tool_use.py", p).get("hookSpecificOutput", {}).get("permissionDecision", "none")


B = lambda c, a=None: pre("Bash", {"command": c}, a)  # noqa: E731
W = lambda path, content="ok", a=None: pre("Write", {"file_path": path, "content": content}, a)  # noqa: E731

CASES = [
    # --- destructive commands: deny
    ("rm -rf", B("rm -rf assets"), "deny"),
    ("Remove-Item -Recurse", pre("PowerShell", {"command": "Remove-Item files -Recurse -Force"}), "deny"),
    ("push main", B("git push origin main"), "deny"),
    ("push HEAD:main", B("git push origin HEAD:main"), "deny"),
    ("force push", B("git push -f origin feature/x"), "deny"),
    ("reset --hard", B("git reset --hard HEAD~1"), "deny"),
    ("no-verify", B("git commit --no-verify -m x"), "deny"),
    ("gh pr merge", B("gh pr merge 5 --squash"), "deny"),
    ("gh api delete", B("gh api -X DELETE repos/x/y"), "deny"),
    ("skip permissions", B("claude --dangerously-skip-permissions"), "deny"),
    # --- self-protection
    ("edit hook", W(os.path.join(HOOKS, "pre_tool_use.py")), "deny"),
    ("edit settings", W(os.path.join(ROOT, ".claude", "settings.json")), "deny"),
    ("edit CLAUDE.md", W(os.path.join(ROOT, "CLAUDE.md")), "deny"),
    ("edit user settings", W("C:/Users/User/.claude/settings.json"), "deny"),
    ("shell write hook", B("echo x > .claude/hooks/stop.py"), "deny"),
    ("sed -i settings", B("sed -i 's/deny/allow/' .claude/settings.json"), "deny"),
    ("write .env", W(os.path.join(ROOT, ".env"), "A=1"), "deny"),
    ("write JARVIS", W(os.path.join(ROOT, "JARVIS-4.0.html")), "deny"),
    ("edit workflow", W(os.path.join(ROOT, ".github", "workflows", "ci.yml")), "deny"),
    # --- secrets
    ("private script URL", W(F, f'fetch("{FAKE_PRIVATE_SCRIPT}")'), "deny"),
    ("stripe key", W(F, "const k='sk_live_abcdefghijklmnop';"), "deny"),
    ("github token", W(F, "ghp_abcdefghijklmnopqrstuvwxyz123456"), "deny"),
    ("owner key in url", W(F, '<a href="?owner=mysecret123">'), "deny"),
    ("password literal", W(F, 'password = "Sup3rS3cretValue!"'), "deny"),
    ("secret in Edit", pre("Edit", {"file_path": F, "old_string": "a", "new_string": "READ_KEY: 'abcdefghijklmnop1'"}), "deny"),
    # --- read-only agents
    ("QA edit", W(F, "x", "qa-security"), "deny"),
    ("QA shell write", B("echo x > index.html", "qa-security"), "deny"),
    ("reviewer push", B("git push origin feature/x", "release-reviewer"), "deny"),
    # --- sensitive: ask
    ("push branch", B("git push -u origin feature/x"), "ask"),
    ("pr create", B("gh pr create --fill"), "ask"),
    ("pip install", B("pip install requests"), "ask"),
    ("curl", B("curl https://example.com"), "ask"),
    ("commit", B("git commit -m 'fix'"), "ask"),
    # --- happy paths: allowed (no decision)
    ("normal edit", W(F, "<p>Hello</p>"), "none"),
    ("public script URL", W(F, f'fetch("{PUBLIC_SCRIPT}")'), "none"),
    ("owner=off", W(F, '<a href="?owner=off">'), "none"),
    ("READ_KEY label", W(F, '<label>READ_KEY<input type="password"></label>'), "none"),
    ("git status", B("git status"), "none"),
    ("git diff", B("git diff origin/main"), "none"),
    ("read hook file", B("cat .claude/hooks/stop.py"), "none"),
    ("run checks", B("python .claude/tests/run_checks.py"), "none"),
    ("QA run checks", B("python .claude/tests/run_checks.py", "qa-security"), "none"),
    ("QA git log", B("git log --oneline -5", "qa-security"), "none"),
    ("rm one file", B("rm .agent-work/tmp.txt"), "none"),
]


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    fails = [(n, got, want) for n, got, want in CASES if got != want]
    # PermissionRequest
    pr = run("permission_request.py", {"tool_name": "Bash", "tool_input": {"command": "git push --force"}})
    if pr.get("hookSpecificOutput", {}).get("decision", {}).get("behavior") != "deny":
        fails.append(("permreq force push", pr, "deny"))
    pr = run("permission_request.py", {"tool_name": "Bash", "tool_input": {"command": "git push -u origin feature/x"}})
    if pr:
        fails.append(("permreq branch push passes to owner", pr, "{}"))
    # PostToolUse: bad JSON is caught
    tmp = os.path.join(ROOT, ".agent-work", "bad.json")
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    open(tmp, "w").write("{bad")
    po = run("post_tool_use.py", {"tool_name": "Write", "tool_input": {"file_path": tmp}})
    if po.get("decision") != "block":
        fails.append(("post bad json", po, "block"))
    open(tmp, "w").write('{"ok": 1}')
    po = run("post_tool_use.py", {"tool_name": "Write", "tool_input": {"file_path": tmp}})
    if po.get("decision") == "block":
        fails.append(("post good json", po, "no block"))
    os.remove(tmp)
    # SessionStart
    ss = run("session_start.py", {})
    if "Git branch" not in ss.get("hookSpecificOutput", {}).get("additionalContext", ""):
        fails.append(("session start", ss, "branch info"))

    total = len(CASES) + 5
    for n, got, want in fails:
        print(f"FAIL {n}: got {got!r}, expected {want!r}")
    print(f"{total - len(fails)}/{total} hook tests passed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
