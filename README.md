# LAOYU TALKS website

Public website for LAOYU TALKS (老鱼说) — practical AI for manufacturing leaders.
Live: https://laoyutalks-max.github.io/laoyutalks-content-brain/

- Static HTML/CSS/JS on GitHub Pages; English + Chinese (`i18n.js`).
- Sidebar is generated: edit `src/catalog.json`, then run `python3 src/gen_sidebar.py`.
- Header menu and footer are shared: edit `NAV` / `FOOTER` in `src/stamp_layout.py`, then run `python src/stamp_layout.py` (also after any page generator in `src/`).
- Styles: `shell3.css` (tokens, header, footer, skin for older pages) loads on every page; `v3.css` holds the new-style page components.
- After editing a CSS/JS file, bump its `?v=` value in the HTML pages so browsers load the new copy.
- `sitemap.xml` lists public pages; owner-only pages use `noindex` and are left out.
- Never commit keys, owner keys or real company data.
