"""PostToolUse: quick checks on the file that was just edited. Problems are fed back to Claude."""
import json
import os
import py_compile
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import PROJECT_DIR, emit, find_secrets, read_input, rel_path  # noqa: E402

sys.path.insert(0, os.path.join(PROJECT_DIR, ".claude", "tests"))


def check_file(path):
    problems, notes = [], []
    if not os.path.isfile(path):
        return problems, notes
    rel = rel_path(path).replace("\\", "/")
    ext = os.path.splitext(path)[1].lower()
    try:
        text = open(path, encoding="utf-8").read()
    except UnicodeDecodeError:
        return problems, notes  # binary

    hits = find_secrets(text)
    if hits:
        problems.append(f"{rel}: possible secret ({', '.join(hits)}). Remove it now.")
    if re.search(r"^(<<<<<<<|=======|>>>>>>>)( |$)", text, re.M):
        problems.append(f"{rel}: merge-conflict markers left in file.")
    if text.startswith("﻿"):
        problems.append(f"{rel}: starts with a BOM; save as UTF-8 without BOM.")

    if ext == ".json":
        try:
            json.loads(text)
        except Exception as e:
            problems.append(f"{rel}: invalid JSON ({e}).")
    elif ext == ".py":
        try:
            py_compile.compile(path, doraise=True)
        except Exception as e:
            problems.append(f"{rel}: Python syntax error ({e}).")
    elif ext == ".js":
        if re.search(r"\bdebugger\b", text):
            problems.append(f"{rel}: 'debugger' statement left in.")
        if re.search(r"\beval\s*\(|new Function\s*\(", text):
            notes.append(f"{rel}: uses eval/new Function — QA must review for XSS.")
        if re.search(r"\.innerHTML\s*[+]?=", text) and rel not in ("factory3d.js",):
            notes.append(f"{rel}: sets innerHTML — make sure user input is escaped.")
        notes.append(f"{rel}: JS changed — bump its ?v= value in the HTML pages that load it.")
    elif ext == ".css":
        notes.append(f"{rel}: CSS changed — bump its ?v= value in the HTML pages that load it.")
    elif ext == ".html":
        if text.lower().count("<script") != text.lower().count("</script>"):
            problems.append(f"{rel}: unbalanced <script> tags.")
        if 'target="_blank"' in text and not re.search(r'target="_blank"[^>]*rel="[^"]*noopener|rel="[^"]*noopener[^"]*"[^>]*target="_blank"', text):
            notes.append(f"{rel}: target=_blank links should have rel=\"noopener\".")

    if rel in ("src/catalog.json", "sidebar.js"):
        try:
            import run_checks
            ok, msg = run_checks.check_sidebar_sync()
            if not ok:
                problems.append("sidebar.js is out of sync with src/catalog.json: " + msg)
        except Exception as e:
            notes.append(f"could not check sidebar sync ({e}).")
    return problems, notes


def main():
    data = read_input()
    ti = data.get("tool_input") or {}
    path = ti.get("file_path") or ti.get("notebook_path")
    if not path:
        return
    if not os.path.isabs(path):
        path = os.path.join(PROJECT_DIR, path)
    problems, notes = check_file(path)
    if problems:
        emit({"decision": "block",
              "reason": "LAOYU post-edit checks failed:\n- " + "\n- ".join(problems + notes)})
    elif notes:
        emit({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                     "additionalContext": "LAOYU post-edit notes:\n- " + "\n- ".join(notes)}})


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        emit({"decision": "block", "reason": f"post-edit check crashed ({e}); review the file manually."})
