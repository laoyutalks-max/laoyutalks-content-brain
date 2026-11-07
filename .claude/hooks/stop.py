"""Stop: re-run the checks itself (results are never trusted from files), block once if
changes fail new checks, and summarise unresolved issues for the owner."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import PROJECT_DIR, WORK_DIR, emit, git, read_input  # noqa: E402

sys.path.insert(0, os.path.join(PROJECT_DIR, ".claude", "tests"))


def main():
    data = read_input()
    changed = git("status", "--porcelain")
    if not changed:
        return  # nothing edited: nothing to verify
    import run_checks
    results = run_checks.run_all(write=True)
    new_fail = [r for r in results if r["status"] == "fail" and not r.get("known")]
    known = [r for r in results if r["status"] == "fail" and r.get("known")]
    warns = [r for r in results if r["status"] == "warn"]

    summary = [f"Checks: {sum(r['status'] == 'pass' for r in results)} pass, {len(new_fail)} new fail, "
               f"{len(known)} known fail, {len(warns)} warn."]
    for r in new_fail:
        summary.append(f"FAIL {r['name']}: {r['detail']}")
    for r in warns:
        summary.append(f"warn {r['name']}: {r['detail']}")
    issues = os.path.join(WORK_DIR, "issues.md")
    if os.path.isfile(issues):
        open_items = [l.strip() for l in open(issues, encoding="utf-8") if l.strip().startswith("- [ ]")]
        if open_items:
            summary.append(f"Unresolved issues ({len(open_items)}):")
            summary += open_items[:15]
    summary.append("Not tested automatically: browser behaviour (gate.js sign-up, chatbot, EN/ZH switch) — needs a manual or QA check.")
    text = "\n".join(summary)

    if new_fail and not data.get("stop_hook_active"):
        emit({"decision": "block",
              "reason": "LAOYU Stop check: your changes fail checks. Fix them (do not weaken the checks), "
                        "or tell the owner clearly what is still failing.\n" + text})
    else:
        emit({"systemMessage": text})


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        emit({"systemMessage": f"LAOYU Stop hook error: {e}. Tests were NOT verified."})
