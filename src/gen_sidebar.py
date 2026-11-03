"""Build sidebar.js from src/catalog.json (edit catalog.json to add or move tools)."""
import json
ROOT = "/home/claude/src/site"
d = json.load(open(f"{ROOT}/src/catalog.json"))
items = []
for i in d["items"]:
    x = {k: i[k] for k in ("id", "url", "cat", "type", "status", "signup", "title", "aka", "kw")}
    if x["type"] == "dashboard": x["url"] = x["id"] + ".html"
    items.append(x)
data = {"cats": [[c[0], c[1], c[2]] for c in d["cats"]], "types": d["types"], "items": items}
tpl = open(f"{ROOT}/src/sidebar.tpl.js").read()
open(f"{ROOT}/sidebar.js", "w").write(tpl.replace("__DATA__", json.dumps(data, ensure_ascii=False)))
print("sidebar.js built:", len(items), "items")
