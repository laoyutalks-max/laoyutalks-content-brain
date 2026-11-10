"""LAOYU site checks — standard library only.  Run:  python .claude/tests/run_checks.py
Each check reports pass / warn / fail. Failures listed in baseline.json are pre-existing ("known")
and do not block; anything new does. Agents may not edit this folder or the baseline."""
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, ".claude", "hooks"))
from _common import find_secrets  # noqa: E402

CJK = re.compile(r"[㐀-鿿]")
SKIP_SCAN = {".claude/tests/test_hooks.py"}
TEXT_EXT = {".html", ".js", ".css", ".json", ".py", ".md", ".txt", ".xml", ".svg", ".csv", ".yml", ".yaml", ".gs"}


def git(*a):
    r = subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.stdout


def repo_files():
    out = git("ls-files", "-co", "--exclude-standard")
    return [f for f in out.splitlines() if f and os.path.isfile(os.path.join(ROOT, f))]


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8", errors="replace") as f:
        return f.read()


def load_baseline():
    try:
        return set(json.load(open(os.path.join(HERE, "baseline.json"), encoding="utf-8")).get("known", []))
    except Exception:
        return set()


# ---------- checks: each returns (status, [finding strings]) ----------

def check_secrets():
    found = []
    for f in repo_files():
        if f in SKIP_SCAN or os.path.splitext(f)[1].lower() not in TEXT_EXT:
            continue
        if os.path.getsize(os.path.join(ROOT, f)) > 3_000_000:
            continue
        for h in find_secrets(read(f)):
            found.append(f"{f}: {h}")
    return ("fail" if found else "pass"), found


def check_forbidden_files():
    bad = [f for f in repo_files()
           if re.search(r"(^|/)(jarvis[^/]*\.html|\.env[^/]*|[^/]*\.(pem|key|p12|pfx))$", f, re.I)
           or f.startswith(".agent-work/")]
    gi = read(".gitignore") if os.path.isfile(os.path.join(ROOT, ".gitignore")) else ""
    if ".agent-work" not in gi:
        bad.append(".gitignore does not ignore .agent-work/")
    return ("fail" if bad else "pass"), bad


def _catalog():
    return json.load(open(os.path.join(ROOT, "src", "catalog.json"), encoding="utf-8"))


def check_catalog():
    issues = []
    try:
        d = _catalog()
    except Exception as e:
        return "fail", [f"src/catalog.json invalid: {e}"]
    ids = [i.get("id") for i in d.get("items", [])]
    issues += [f"duplicate id {x}" for x in sorted({x for x in ids if ids.count(x) > 1})]
    cats = {c[0] for c in d.get("cats", [])}
    for i in d.get("items", []):
        for k in ("id", "url", "cat", "type", "status", "signup", "title", "aka", "kw"):
            if k not in i:
                issues.append(f"{i.get('id')}: missing '{k}'")
        if i.get("cat") not in cats:
            issues.append(f"{i.get('id')}: unknown cat {i.get('cat')}")
        if i.get("type") not in d.get("types", {}):
            issues.append(f"{i.get('id')}: unknown type {i.get('type')}")
        url = i["id"] + ".html" if i.get("type") == "dashboard" else (i.get("url") or "")
        if url and not url.startswith("http") and not os.path.isfile(os.path.join(ROOT, url.split("?")[0].split("#")[0])):
            issues.append(f"{i.get('id')}: page {url} does not exist")
        issues += _bilingual(i.get("title"), f"{i.get('id')} title")
    for c in d.get("cats", []):
        issues += _bilingual(c[2], f"cat {c[0]} name")
    return ("fail" if issues else "pass"), issues


def _bilingual(pair, label):
    if not (isinstance(pair, list) and len(pair) == 2 and all(pair)):
        return [f"{label}: needs [English, 中文]"]
    out = []
    if CJK.search(pair[0]):
        out.append(f"{label}: Chinese text in English version")
    if not CJK.search(pair[1]):
        out.append(f"{label}: Chinese version has no Chinese text")
    return out


def check_sidebar_sync():
    try:
        d = _catalog()
        m = re.search(r"var SB = (\{.*?\});\n", read("sidebar.js"), re.S)
        if not m:
            return False, "could not find 'var SB = {...};' in sidebar.js"
        sb = json.loads(m.group(1))
        keys = ("id", "url", "cat", "type", "status", "signup", "title", "aka", "kw")
        items = []
        for i in d["items"]:
            x = {k: i[k] for k in keys}
            if x["type"] == "dashboard":
                x["url"] = x["id"] + ".html"
            items.append(x)
        if items != sb.get("items"):
            diff = [x["id"] for x, y in zip(items, sb.get("items", [])) if x != y] or ["item count differs"]
            return False, "items differ: " + ", ".join(diff[:8])
        if [[c[0], c[1], c[2]] for c in d["cats"]] != sb.get("cats") or d["types"] != sb.get("types"):
            return False, "categories or types differ"
        return True, "in sync"
    except Exception as e:
        return False, str(e)


def _sidebar():
    ok, msg = check_sidebar_sync()
    return ("pass" if ok else "fail"), ([] if ok else [msg])


LINK_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)


def check_links():
    broken = []
    for f in repo_files():
        if not f.endswith(".html"):
            continue
        base = os.path.dirname(f)
        for url in LINK_RE.findall(read(f)):
            if re.match(r"^(https?:|//|mailto:|tel:|#|javascript:|data:|\$|\{|'|\+)", url) or "' +" in url:
                continue
            p = url.split("#")[0].split("?")[0]
            if p.startswith("/"):  # site-root link on GitHub Pages
                p, here = re.sub(r"^/laoyutalks-content-brain/?", "", p) or "index.html", ""
            else:
                here = base
            if p.endswith("/"):
                p += "index.html"
            if p and not os.path.exists(os.path.join(ROOT, here, p)):
                broken.append(f"{f} -> {url}")
    return ("fail" if broken else "pass"), broken


def check_sitemap():
    issues = []
    if not os.path.isfile(os.path.join(ROOT, "sitemap.xml")):
        return "warn", ["sitemap.xml missing"]
    locs = re.findall(r"<loc>([^<]+)</loc>", read("sitemap.xml"))
    for loc in locs:
        page = re.sub(r"^https?://[^/]+/[^/]+/?", "", loc.strip()) or "index.html"
        if page.endswith("/"):
            page += "index.html"
        if not os.path.isfile(os.path.join(ROOT, page)):
            issues.append(f"sitemap lists missing page {page}")
        elif re.search(r'name=["\']robots["\'][^>]*noindex', read(page), re.I):
            issues.append(f"sitemap lists noindex page {page}")
    return ("fail" if issues else "pass"), issues


def check_syntax():
    issues = []
    for f in repo_files():
        ext = os.path.splitext(f)[1].lower()
        try:
            if ext == ".json":
                json.loads(read(f))
            elif ext == ".py":
                compile(read(f), f, "exec")
        except Exception as e:
            issues.append(f"{f}: {e}")
        if ext in TEXT_EXT and re.search(r"^(<<<<<<<|>>>>>>>)( |$)", read(f), re.M):
            issues.append(f"{f}: merge-conflict markers")
    return ("fail" if issues else "pass"), issues


def check_cache_bust():
    """Warn if a CSS/JS file changed vs origin/main but no HTML ?v= value changed."""
    changed = git("diff", "--name-only", "origin/main").splitlines() + git("ls-files", "-o", "--exclude-standard").splitlines()
    assets = [f for f in changed if re.search(r"^[^/]+\.(css|js)$", f)]
    if not assets:
        return "pass", []
    html_diff = git("diff", "origin/main", "--", "*.html")
    stale = [a for a in assets if not re.search(r"^\+.*" + re.escape(a) + r"\?v=", html_diff, re.M)]
    return ("warn" if stale else "pass"), [f"{a} changed but its ?v= was not bumped" for a in stale]


def check_i18n():
    m = re.search(r"var TEXT = \{(.*?)\n\s*\};", read("i18n.js"), re.S)
    if not m:
        return "warn", ["could not parse TEXT in i18n.js"]
    pairs = re.findall(r'"((?:[^"\\]|\\.)+)"\s*:\s*"((?:[^"\\]|\\.)*)"', m.group(1))
    bad = [f"'{en[:40]}' has no Chinese translation" for en, zh in pairs if zh != en and not CJK.search(zh) and re.search(r"[a-z]{3}", zh)]
    bad += [f"English key '{en[:40]}' contains Chinese" for en, zh in pairs if CJK.search(en)]
    return ("warn" if bad else "pass"), bad


CHECKS = [("secrets", check_secrets), ("forbidden-files", check_forbidden_files), ("catalog", check_catalog),
          ("sidebar-sync", _sidebar), ("links", check_links), ("sitemap", check_sitemap),
          ("syntax", check_syntax), ("cache-bust", check_cache_bust), ("i18n", check_i18n)]


def run_all(write=True):
    known = load_baseline()
    results = []
    for name, fn in CHECKS:
        try:
            status, findings = fn()
        except Exception as e:
            status, findings = "fail", [f"check crashed: {e}"]
        new = [x for x in findings if f"{name}|{x}" not in known]
        is_known = status == "fail" and not new
        results.append({"name": name, "status": status, "known": is_known,
                        "detail": "; ".join((new or findings)[:6]) + (" …" if len(new or findings) > 6 else ""),
                        "findings": findings})
    if write:
        out = os.path.join(ROOT, ".agent-work")
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, "test-results.json"), "w", encoding="utf-8") as f:
            json.dump({"at": datetime.now(timezone.utc).isoformat(), "branch": git("rev-parse", "--abbrev-ref", "HEAD").strip(),
                       "results": results}, f, ensure_ascii=False, indent=1)
    return results


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    res = run_all()
    if "--baseline" in sys.argv:  # owner-only: record today's failures as known
        print(json.dumps({"known": [f"{r['name']}|{x}" for r in res if r["status"] == "fail" for x in r["findings"]]},
                         ensure_ascii=False, indent=1))
        sys.exit(0)
    for r in res:
        tag = r["status"].upper() + (" (known)" if r["known"] else "")
        print(f"{tag:14} {r['name']:16} {r['detail']}")
    sys.exit(1 if any(r["status"] == "fail" and not r["known"] for r in res) else 0)
