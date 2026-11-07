# LAOYU TALKS website — rules for Claude and all agents

Static HTML/CSS/JS on GitHub Pages. **A push or merge to `main` is a production deploy.**

## Mandatory safety rules (no exceptions, no agent may change them)
1. Never modify production directly: never push, merge or force-push to `main`. Work on `feature/*`, `fix/*` or `chore/*` branches only.
2. Never expose or commit API keys, passwords, tokens, the `?owner=` key, the JARVIS READ_KEY, or payment secrets. The only Apps Script URL allowed in front-end code is the public sign-up/chat endpoint already used in `gate.js` / `chatbot.js`.
3. Test happy paths AND unhappy paths (invalid input, empty input, network/Apps Script failure, EN and ZH modes).
4. Payment authorization (if ever added) must be verified on a server, never in browser code.
5. Deployment needs the owner's explicit "approve" or "push" in chat. Agents may at most open a pull request; only the owner merges.
6. Never disable, weaken or skip security checks, hooks or tests to make something pass (`--no-verify`, deleting tests, loosening scanners).
7. Never edit `.claude/**`, `CLAUDE.md`, `.git/`, `.github/workflows/**` or `.gitignore` — these are the safety controls. Ask the owner instead.
8. `JARVIS-*.html` and anything with analytics or sign-up data must never enter this repo.

## Working style
- Show a preview first; wait for "approve" / "push". "Ignore" = drop the change.
- Keep English and Chinese strictly separate (brand/standard terms excepted). New text needs an `i18n.js` entry.
- Dark theme default, less wording, neutral sample data (no employer names or internal terms). Honest AI labelling.

## Project facts
- Sidebar data: edit `src/catalog.json`; `sidebar.js` embeds it (`var SB = {...}`). Known issue: `src/gen_sidebar.py` has a hard-coded Linux path and its template `src/sidebar.tpl.js` is missing.
- After editing a CSS/JS file, bump its `?v=` value in the HTML pages.
- `sitemap.xml` lists public pages only; owner-only pages use `noindex`.
- Python is `python` (not `python3`) on this PC. Node is not installed.

## Checks
- Site checks: `python .claude/tests/run_checks.py` (writes `.agent-work/test-results.json`; the Stop hook re-runs them itself).
- Hook self-tests: `python .claude/tests/test_hooks.py`.
- Open issues: `.agent-work/issues.md`, one line each: `- [ ] [severity] file — problem`. Tick `- [x]` when fixed.
- `.agent-work/` is git-ignored (logs, results, issues). `.agent-work/safety.log` records every block/ask.
- Not covered automatically (no Node/browser installed): real browser behaviour of gate.js, chatbot.js, EN/ZH switching. QA lists manual checks for these.

## Agent workflow
planner → owner approves plan → developer (branch) → qa-security (read-only) → developer fixes → release-reviewer → owner says "approve"/"push" → PR → owner merges.
