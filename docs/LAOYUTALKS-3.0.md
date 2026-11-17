# LAOYUTALKS 3.0 — project notes

Branch `feature/v3-home`, November 2026. This file describes what 3.0 changed, how the site fits together, what still needs work, and how to publish it.

## 1. Architecture

The site is still a static site on GitHub Pages: plain HTML, CSS and JavaScript, with no build step, framework or database. A merge to `main` publishes it.

| Layer | Files | Notes |
|---|---|---|
| Shared shell (every page) | `shell3.css`, `v3.js`, `src/stamp_layout.py` | Design tokens, header, footer, light/dark theme, phone menu. The menu and footer live in one place (`stamp_layout.py`) and are stamped into all pages. |
| New-style pages | `v3.css` + page script | Home (`home3.js`), AI Lab (`ai-lab.js`), Automation Lab (`automation.js`), Learn (`learn.js`), Our Story. |
| Older pages | `styles.css`, `twin.css`, `hub.css` + `shell3.css` skin | The 24 tool pages, Resources, Contact, legal pages. `html.legacy` switches on a skin in `shell3.css` that moves them onto the new palette without changing their layouts or tools. |
| Content data | `resources-data.js`, `workflows-data.js` | One record per resource and workflow, in English and Chinese. Drives the library, the homepage cards, previews and related links. |
| Site search | `sidebar.js` (data in `src/catalog.json`) | The "Search" button: tools plus site pages. |
| Language | `i18n.js` | English, 中文 and bilingual. New text needs an entry in `TEXT`. Pages with paired `<span class="en">`/`<span class="zh">` text use the `.pair` rules in `v3.css`. |
| Sign-ups and chat log | `gate.js`, `chatbot.js`, `contact.js`, `home3.js` | All post to the existing Google Apps Script recorder. Unchanged in 3.0 apart from the chat's name ("Help"). |
| AI proxy (not deployed) | `server/ai-lab-worker/` | Cloudflare Worker that would hold the Anthropic API key for the AI Lab. See its README. |

### Site map

Home · Learn · Resources · AI Lab · Automation · Our Story, plus Contact, Privacy, Terms, the 24 resource pages, the older AI Tools and LAOYUTALKS pages, and three owner-only dashboard previews (not indexed).

### Common tasks

- **Change the menu or footer:** edit `NAV` / `FOOTER` in `src/stamp_layout.py`, then run `python src/stamp_layout.py`.
- **Add a resource:** add a record to `resources-data.js`, add its id to the right category in the `CAT3` list in the same file, and add it to `src/catalog.json` for the Search drawer.
- **Add a workflow:** add a record to `workflows-data.js`. It appears in the Automation Lab and the library automatically.
- **Add a video:** add a row to `VIDEOS` in `learn.js`.
- **After editing any CSS or JS file:** bump its `?v=` value in the pages that load it.
- **Before every push:** `python .claude/tests/run_checks.py`.

## 2. What 3.0 added

| Area | What changed |
|---|---|
| Design | Navy foundation, light surfaces, one green accent; light theme by default with dark on the toggle. Retired the HUD effects, the 3D factory hero (565 KB) and the orange/cyan palette. |
| Navigation | Six-item menu on every page, site search, language and theme switches, phone menu below 1024 px. |
| Homepage | Sections A to I from the brief: hero with the working Quick OEE check, pillars, six problem tiles, featured resources, lessons, ASK LAOYU, worked demos, Our Story, community sign-up. |
| Resources 3.0 | One library of 31 items (19 resources, 5 AI tools, 7 workflows) in eight categories; filters for category, type, difficulty, language, access and AI; search; preview before opening; related resources; last-updated dates on detail pages; shareable filter links. |
| AI Lab | Manufacturing, Quality & Problem-Solving and Productivity & Management assistants with suggested questions, structured answers, copy, clear, loading and error states, responsible-use and privacy notices. Runs as a labelled prototype. |
| Automation Lab | Seven workflows, each with problem, solution, tools, steps, benefits, sample output and related resources. |
| Learn | The 17 real TikTok videos grouped by topic, each paired with a tool where one fits. |
| Our Story | All existing text kept in both languages, on the new design, with the three pillars and the founder line. |
| Chat | The rule-based helper is now called "Help", so it is not confused with the AI Lab. |

## 3. Features that need the AI server

The AI Lab answers from built-in guidance until live AI is switched on. Every answer says "Prototype", and nothing leaves the browser.

To switch on live AI, follow `server/ai-lab-worker/README.md`. In short:
1. Create an Anthropic API key and set a monthly spend limit.
2. Deploy the Worker with Cloudflare (`npx wrangler secret put ANTHROPIC_API_KEY`, then `npx wrangler deploy`).
3. Set `ENDPOINT` in `ai-lab.js` and publish.

The Worker has not been run yet. Test it with `npx wrangler dev` first.

## 4. Deployment

1. Review the pull request from `feature/v3-home`.
2. Merge it into `main`. GitHub Pages publishes within a few minutes.
3. Open the live site and check: the homepage, one tool page, the 404 page (it only works on the live address), and EN / 中文 switching.
4. If anything is wrong, revert the merge commit on `main`; the old site returns on the next publish.

## 5. Test results (Phase 4)

| Check | Result |
|---|---|
| Repo site checks (secrets, links, sitemap, syntax, cache-bust, i18n and more) | 9 of 9 pass |
| 38 pages × 7 combinations (EN, 中文, bilingual; light, dark; 1280, 768, 375 px) | No sideways scroll, header overflow, menu overlap, wrong menu text, broken images, failed requests or low-contrast text |
| Header at 48 width/language/page combinations | No overlap or overflow |
| Script errors on all 38 pages, both languages, with language, theme, menu, search and chat exercised | None |
| Colour contrast of the design tokens | All text pairs pass WCAG AA (4.5:1) in both themes; lowest is 4.73:1 |
| Sign-up gate | Missing name, bad format, typo, throwaway and non-existent domains rejected; unlocks on success and when offline; returning visitors open instantly |
| Each new page | Happy and unhappy paths tested in its own step (see the commit messages) |

Not tested: real phones and Safari or Firefox (one desktop browser was used at phone and tablet sizes), the 404 page (live address only), the AI Worker, the clipboard (blocked in the test browser; the select-and-copy fallback was tested), and a real submission to the Google Sheet.

## 6. Known limitations

- **Older pages keep their own layouts.** The 24 tool pages, Resources, Contact and the legal pages are re-skinned, not rebuilt: some orange details, the round chat button and dark screenshots remain.
- **Two content lists.** The Search drawer reads `src/catalog.json`; the library reads `resources-data.js`. A new resource has to be added to both. `src/gen_sidebar.py` still cannot run on Windows (hard-coded path).
- **Legal pages are English only.** In Chinese mode they show a notice saying so.
- **Language filter.** Every resource is bilingual, so the filter has no effect yet.
- **No Premium access.** The access filter shows "No sign-up" and "Free sign-up" only.
- **Real-world impact.** The homepage shows the three demos, marked as sample data, until real case studies are supplied.
- **Estimates and editorial choices to review:** workflow setup times, the Learn video topics and tool pairings, and the wording of the 13 prototype answers and 7 workflows.
- **Unused files** kept for now: `home.js`, `twin.js`, `factory3d.js`, `story.css`.

## 7. Recommended next steps

1. Deploy and test the AI Worker, then switch the AI Lab to live answers.
2. Merge the two content lists into one source and fix the sidebar generator.
3. Rebuild the most-used tool pages (OEE, shift handover, 8D) on the new design.
4. Add real case studies to Real-World Impact and written guides to Learn.
5. Retake the resource screenshots in the new design.
6. Remove the unused files once 3.0 has been live for a while.
