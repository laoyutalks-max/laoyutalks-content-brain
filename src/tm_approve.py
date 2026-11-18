"""Approve (or remove) an email for the Training Matrix Excel download.

Usage (from the site folder):
    python src/tm_approve.py someone@example.com           approve
    python src/tm_approve.py --remove someone@example.com  remove
    python src/tm_approve.py --check someone@example.com   is it approved?

Only a SHA-256 hash of the lower-case email is stored in tm-approved.json,
so the public site does not list the emails. The change takes effect once
tm-approved.json is published (commit, PR, owner merges).
"""
import hashlib
import json
import os
import re
import sys

PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tm-approved.json")
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


def digest(email):
    return hashlib.sha256(email.strip().lower().encode("utf-8")).hexdigest()


def main(argv):
    mode = "add"
    if argv and argv[0] in ("--remove", "--check"):
        mode = argv.pop(0)[2:]
    if len(argv) != 1 or not EMAIL.match(argv[0].strip()):
        print(__doc__)
        return 2
    with open(PATH, encoding="utf-8") as f:
        data = json.load(f)
    emails = data.setdefault("emails", [])
    h = digest(argv[0])
    if mode == "check":
        print("approved" if h in emails else "not approved")
        return 0
    if mode == "add":
        if h in emails:
            print("Already approved.")
            return 0
        emails.append(h)
    else:
        if h not in emails:
            print("Not on the list.")
            return 0
        emails.remove(h)
    with open(PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print(("Approved: " if mode == "add" else "Removed: ") + argv[0].strip().lower() + ". Publish tm-approved.json for it to take effect.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
