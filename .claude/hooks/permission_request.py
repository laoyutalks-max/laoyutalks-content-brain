"""PermissionRequest: never auto-approves. Denies forbidden requests outright, logs the rest
and leaves the decision to the owner's approval dialog."""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import emit, find_secrets, is_protected, log, read_input  # noqa: E402

FORBIDDEN = re.compile(r"(--force|\bpush\b.*\b(main|master|gh-pages)\b|--no-verify|reset\s+--hard|"
                       r"gh\s+pr\s+merge|dangerously|bypassPermissions)", re.I)


def deny(msg):
    emit({"hookSpecificOutput": {"hookEventName": "PermissionRequest",
                                 "decision": {"behavior": "deny", "message": "LAOYU safety: " + msg}}})
    sys.exit(0)


def main():
    data = read_input()
    tool = data.get("tool_name", "")
    ti = data.get("tool_input") or {}
    cmd = str(ti.get("command", ""))
    path = ti.get("file_path") or ti.get("notebook_path") or ""
    log("permission_request", {"tool": tool, "cmd": cmd, "path": path, "agent": data.get("agent_type", "")})
    if path and is_protected(path):
        deny(f"'{path}' is a protected file.")
    if cmd and FORBIDDEN.search(cmd):
        deny("this operation is never allowed for agents; the owner must do it.")
    if find_secrets(cmd + " " + str(ti.get("content", "")) + " " + str(ti.get("new_string", ""))):
        deny("request contains what looks like a secret.")
    # No output = normal approval dialog; the owner decides.


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as e:
        deny(f"permission hook error ({e}).")
