"""SessionStart: report Git state and remind every agent of the safety rules."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import PROJECT_DIR, WORK_DIR, current_branch, emit, git, read_input  # noqa: E402


def main():
    read_input()
    lines = []
    branch = current_branch() or "(not a git repo!)"
    lines.append(f"Git branch: {branch}")
    if branch in ("main", "master"):
        lines.append("WARNING: on 'main' = PRODUCTION. Create a branch before any change: git checkout -b feature/<name>")
    status = git("status", "--short")
    lines.append("Uncommitted changes:\n" + status if status else "Working tree clean.")
    ahead = git("rev-list", "--left-right", "--count", "origin/main...HEAD")
    if ahead:
        behind, ahead_n = (ahead.split() + ["0", "0"])[:2]
        lines.append(f"Compared with origin/main: {ahead_n} commit(s) ahead, {behind} behind.")
    for name in ("CLAUDE.md",):
        if not os.path.isfile(os.path.join(PROJECT_DIR, name)):
            lines.append(f"WARNING: {name} (project rules) is missing.")
    issues = os.path.join(WORK_DIR, "issues.md")
    if os.path.isfile(issues):
        open_items = [l.strip() for l in open(issues, encoding="utf-8") if l.strip().startswith("- [ ]")]
        if open_items:
            lines.append(f"Open issues ({len(open_items)}):\n" + "\n".join(open_items[:10]))
    lines.append("Rules: follow CLAUDE.md. Never touch main, secrets, or .claude/**. Deploy only after the owner says 'approve'/'push'.")
    emit({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "\n".join(lines)}})


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        emit({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                     "additionalContext": f"session_start hook error: {e}. Follow CLAUDE.md."}})
