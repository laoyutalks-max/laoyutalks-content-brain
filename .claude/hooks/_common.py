"""Shared safety rules for LAOYU hooks. Standard library only.
Agents must never edit this folder (enforced by pre_tool_use.py and settings deny rules)."""
import json
import os
import re
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(HOOK_DIR))
WORK_DIR = os.path.join(PROJECT_DIR, ".agent-work")          # git-ignored scratch for agents
LOG_FILE = os.path.join(WORK_DIR, "safety.log")

# The one Apps Script deployment that is public on purpose (sign-up + chatbot endpoint).
PUBLIC_APPS_SCRIPT_IDS = {
    "AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg",
}

READ_ONLY_AGENTS = {"qa-security", "release-reviewer", "planner"}

SECRET_PATTERNS = [
    (r"AKfycb[A-Za-z0-9_-]{20,}", "Apps Script deployment ID (only the public sign-up endpoint is allowed)"),
    (r"\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}", "Stripe secret key"),
    (r"\bwhsec_[A-Za-z0-9]{10,}", "webhook signing secret"),
    (r"\bgh[pousr]_[A-Za-z0-9]{20,}", "GitHub token"),
    (r"\bgithub_pat_[A-Za-z0-9_]{20,}", "GitHub token"),
    (r"\bAIza[0-9A-Za-z_-]{35}", "Google API key"),
    (r"\bAKIA[0-9A-Z]{16}\b", "AWS access key"),
    (r"\bxox[abprs]-[A-Za-z0-9-]{10,}", "Slack token"),
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "private key"),
    (r"(?i)\b(read_key|client_secret|client_key|api[_-]?key|secret|passw(or)?d|access_token|refresh_token)\b"
     r"[\"']?\s*[:=]\s*[\"'][^\"'\s<>{}$]{12,}[\"']", "hard-coded credential"),
    (r"[?&]owner=(?!off\b|<|%3C|\$\{|\"|'|\+)[^&\s\"'#<>]{4,}", "owner preview key in a URL"),
]

PROTECTED_RE = re.compile(
    r"(^|/)(\.claude/(?!projects/)|claude\.md$|\.git/|\.git$|\.github/workflows/|\.gitignore$|\.env|jarvis[^/]*\.html$)",
    re.I,
)


def read_input():
    raw = sys.stdin.buffer.read().decode("utf-8", "replace")
    try:
        return json.loads(raw or "{}")
    except Exception:
        return {}


def emit(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False))
    sys.stdout.flush()


def log(event, detail):
    try:
        os.makedirs(WORK_DIR, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps({"event": event, **detail}, ensure_ascii=False) + "\n")
    except Exception:
        pass


def find_secrets(text):
    hits = []
    for pat, label in SECRET_PATTERNS:
        for m in re.finditer(pat, text or ""):
            if m.group(0) in PUBLIC_APPS_SCRIPT_IDS:
                continue
            hits.append(label)
    return sorted(set(hits))


def rel_path(path):
    p = (path or "").replace("\\", "/")
    root = PROJECT_DIR.replace("\\", "/").rstrip("/")
    if p.lower().startswith(root.lower() + "/"):
        p = p[len(root) + 1:]
    return p


def is_protected(path):
    p = (path or "").replace("\\", "/")
    return bool(PROTECTED_RE.search(rel_path(p))) or bool(PROTECTED_RE.search(p))


def git(*args):
    try:
        r = subprocess.run(["git", *args], cwd=PROJECT_DIR, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=20)
        return r.stdout.strip()
    except Exception:
        return ""


def current_branch():
    return git("rev-parse", "--abbrev-ref", "HEAD")
