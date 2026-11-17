"""LAOYUTALKS 3.0 - stamp the shared header, footer and shell stylesheet into every page.

One place to change the site menu or footer: edit NAV / FOOTER below, then run
    python src/stamp_layout.py
from the repo root. Safe to run again (it replaces what it stamped before).
Run it after any page generator in src/ too, because those still write the old header.

Pages that load v3.css are new-style pages (class "v3"); all others also get the
class "legacy", which switches on the legacy skin in shell3.css.
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL_V = "20261115d"     # bump when shell3.css changes
SIDEBAR_V = "20261117a"   # bump when sidebar.js changes

# Menu items. Learn and AI Lab point at homepage sections until their own pages exist.
NAV = [("index.html", "Home"), ("index.html#learn", "Learn"), ("resources.html", "Resources"),
       ("ai-lab.html", "AI Lab"), ("about.html", "Our Story")]

THEME = ('<script>try{if(localStorage.getItem("laoyuTheme")!=="dark")document.documentElement.setAttribute("data-theme","light")}'
         'catch(e){document.documentElement.setAttribute("data-theme","light")}</script>')

FOOTER = """<footer class="footer on-navy">
  <div class="wrap foot">
    <div>
      <img class="lgD" src="assets/laoyu-logo-dark-mode.svg" alt="LAOYU" width="140" height="34">
      <p>Think First. Improve Always. Build with AI.</p>
    </div>
    <div>
      <h4>NAVIGATION</h4>
      <a href="index.html">Home</a>
      <a href="laoyutalks.html">LAOYUTALKS</a>
      <a href="about.html">Our Story</a>
      <a href="resources.html">Resources</a>
      <a href="ai-tools.html">AI Tools</a>
      <a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a>
    </div>
    <div>
      <h4>RESOURCES</h4>
      <a href="resources.html#type-template">Templates</a>
      <a href="resources.html#type-prompts">AI Prompts</a>
      <a href="resources.html#type-solver">Problem Solvers</a>
      <a href="resources.html#type-checklist">Checklists</a>
    </div>
    <div>
      <h4>CONNECT</h4>
      <a href="https://www.tiktok.com/@laoyu.talks" target="_blank" rel="noopener noreferrer">TikTok @laoyu.talks</a>
      <a href="contact.html">Email</a>
    </div>
  </div>
  <div class="wrap copy">
    <span>© <span data-year></span> LAOYU. All rights reserved.</span>
    <span>Built with ♥ by LAOYU</span>
  </div>
</footer>"""


def nav_html(page):
    out = []
    for href, label in NAV:
        # on the homepage, section links stay on the page
        if page == "index.html" and href.startswith("index.html#"):
            href = href[len("index.html"):]
        out.append('<a href="%s">%s</a>' % (href, label))
    return '<nav class="links" aria-label="Main">' + "".join(out) + "</nav>"


def stamp(path):
    page = os.path.basename(path)
    src = open(path, encoding="utf-8", newline="").read()
    s = src
    notes = []
    new_style = "v3.css" in s

    # <html> class
    s, n = re.subn(r"<html lang=\"en\"(?: class=\"[^\"]*\")?>", '<html lang="en" class="%s">' % ("v3" if new_style else "v3 legacy"), s, count=1)
    if not n: notes.append("no <html lang> tag")

    # theme start-up script: light unless the visitor chose dark
    s, n = re.subn(r"<script>try\{if\(localStorage\.getItem\(\"laoyuTheme\"\).*?</script>", lambda m: THEME, s, count=1, flags=re.S)
    if not n: notes.append("no theme script")

    # shell stylesheet: before v3.css on new pages, otherwise last in <head>
    s = re.sub(r"<link rel=\"stylesheet\" href=\"shell3\.css\?v=[^\"]*\">", "", s)
    link = '<link rel="stylesheet" href="shell3.css?v=%s">' % SHELL_V
    if new_style:
        s = re.sub(r"(<link rel=\"stylesheet\" href=\"v3\.css)", lambda m: link + m.group(1), s, count=1)
    else:
        s = s.replace(THEME, link + "\n" + THEME, 1)
    if "shell3.css" not in s: notes.append("shell3.css not linked")

    # header
    s, n = re.subn(r"<header class=\"nav[^\"]*\">", '<header class="nav on-navy">', s, count=1)
    if not n: notes.append("no header")
    s, n = re.subn(r"<nav class=\"links\"[^>]*>.*?</nav>", lambda m: nav_html(page), s, count=1, flags=re.S)
    if not n: notes.append("no nav")

    # footer
    s, n = re.subn(r"<footer class=\"footer[^\"]*\">.*?</footer>", lambda m: FOOTER, s, count=1, flags=re.S)
    if not n: notes.append("no footer")

    # cache-bust the drawer script
    s = re.sub(r"sidebar\.js\?v=[0-9a-z]+", "sidebar.js?v=" + SIDEBAR_V, s)

    if s != src:
        open(path, "w", encoding="utf-8", newline="").write(s)
    return s != src, notes


def main():
    changed = 0
    for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        did, notes = stamp(path)
        changed += did
        if notes:
            print("%-34s %s" % (os.path.basename(path), "; ".join(notes)))
    print("stamped %d page(s)" % changed)


if __name__ == "__main__":
    sys.exit(main())
