"""Match extracted catalogue images to production product variants (read-only).

Usage  : python match.py <images_dir> <variants.json> [--plan out.json] [--exclude-page "K1 p.83"]
Inputs : <images_dir>/*.png, <images_dir>/_REVIEW.md, variants.json (from fetch_variants.py)
Outputs: plan.json   - every image with its target variants and a status
         <images_dir>/_MATCH_REVIEW.html - visual review page (open in a browser)

Status:
  confident - code + colour match exactly one colour of the product, image not flagged
  review    - a match exists but something is uncertain (reason given)
  nomatch   - product code or colour not in production
"""
import argparse, html, json, re
from collections import defaultdict, Counter
from pathlib import Path

ARGS = argparse.ArgumentParser(description="Match extracted catalogue images to production variants")
ARGS.add_argument("images", help="folder with extracted <code>-<colour>.png files and _REVIEW.md")
ARGS.add_argument("variants", help="JSON from fetch_variants.py")
ARGS.add_argument("--plan", default=None, help="output plan.json (default: <images>/_work/plan.json)")
ARGS.add_argument("--exclude-page", action="append", default=[],
                  help='page from _REVIEW.md to treat as unusable, e.g. "K1 p.83" (repeatable)')
OPT = ARGS.parse_args() if __name__ == "__main__" else None
IMG_DIR = Path(OPT.images) if OPT else Path(".")
GR2LAT = str.maketrans("ΑΒΕΖΗΙΚΜΝΟΡΤΧΥ", "ABEZHIKMNOPTXY")
LAT2GR = str.maketrans("ABEZHIKMNOPTXY", "ΑΒΕΖΗΙΚΜΝΟΡΤΧΥ")
DECORATION = {"ΣΚΕΤΟ", "ΣΤΑΜΠΑ", "ΚΕΝΤΗΜΑ", "PVC"}
NO_COLOUR = {"ΠΡΟΙΟΝ", "ΧΩΡΙΣ", "ΩΣΕΧΕ"}
# production abbreviations -> words they stand for (prefix-matched against catalogue words)
PROD_EXPAND = {"Σ": ["ΣΚΟΥΡΟ"], "ΑΝ": ["ΑΝΟΙΚΤΟ"], "ΦΩΣ": ["ΦΩΣΦΟΡΙΖΕ"], "ΚΟΚΚΝ": ["ΚΟΚΚΙΝΟ"],
               "ΑΝΠΟΡΤ": ["ΑΝΟΙΚΤΟ", "ΠΟΡΤ"], "ΣΜΠΕΖ": ["ΣΚΟΥΡΟ", "ΜΠΕΖ"], "ΣΜΠΛ": ["ΣΚΟΥΡΟ", "ΜΠΛ"]}
# review flags that do not put the match itself in doubt
HARMLESS_FLAGS = {"Low resolution in the PDF"}


def base_code(sku):
    return sku.split("-")[0].translate(GR2LAT).upper()


def sku_colour(sku):
    parts = sku.split("-")[1:]
    return " ".join(p for p in parts if p not in DECORATION)


def colour_matches(prod_colour, cat_words):
    words = []
    for w in prod_colour.split():
        words += PROD_EXPAND.get(w, [w])
    cat = [w.upper() for w in cat_words]
    if len(words) != len(cat):
        return False
    return all(c.translate(LAT2GR).startswith(p.translate(LAT2GR)) or c.startswith(p) for p, c in zip(words, cat))


def read_flags():
    flags, page_of, cat = defaultdict(list), {}, None
    page = None
    for line in (IMG_DIR / "_REVIEW.md").read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            cat = re.sub(r"\s*\(\d+\)$", "", line[3:])
        elif line.startswith("**"):
            page = line.strip("*")
        elif line.startswith("- `"):
            name = line[3:line.index("`", 3)]
            detail = line.split(" - ", 1)[1] if " - " in line else ""
            flags[name].append(cat + (f" ({detail})" if detail else ""))
            page_of[name] = page
    return flags, page_of


def main():
    variants = json.loads(Path(OPT.variants).read_text(encoding="utf-8"))
    by_code = defaultdict(list)
    for v in variants:
        by_code[base_code(v["sku"])].append(v)
    flags, page_of = read_flags()

    plan = []
    for f in sorted(IMG_DIR.glob("*.png")):
        name = f.name
        stem = f.stem
        dup = re.search(r"-(\d+)$", stem)
        base = stem[: dup.start()] if dup else stem
        parts = base.split("-")
        code = parts[0].upper()
        rest = parts[1:]
        design = next((p for p in rest if re.fullmatch(r"no\d+", p)), None)
        colour_words = [p for p in rest if p != design]
        entry = {"file": name, "code": code, "colour": " ".join(colour_words), "design": design,
                 "page": page_of.get(name, ""), "flags": flags.get(name, []), "variants": [],
                 "status": "", "reason": "", "product": ""}
        plan.append(entry)

        if page_of.get(name) in OPT.exclude_page:
            entry.update(status="nomatch", reason=f"{page_of[name]} excluded - redo by hand")
            continue
        if "_" in code or code.startswith(("K1", "K2")) and "NOCODE" in stem.upper():
            entry.update(status="nomatch", reason="no single product code")
            continue
        prod = by_code.get(code)
        if not prod:
            entry.update(status="nomatch", reason=f"code {code} not in production")
            continue
        entry["product"] = prod[0]["productName"]
        colours = sorted({sku_colour(v["sku"]) for v in prod})
        real_colours = [c for c in colours if c.split(" ")[0] not in NO_COLOUR and c]

        if not colour_words:
            if not real_colours:
                targets = prod
                reason = "code-only photo, product has no colour options"
            elif len(real_colours) == 1:
                targets = prod
                reason = f"code-only photo, product has one colour ({real_colours[0]})"
            else:
                entry.update(status="nomatch", reason="photo has no colour but product has colours: " + ", ".join(real_colours))
                continue
        else:
            hits = [c for c in real_colours if colour_matches(c, colour_words)]
            if len(hits) != 1:
                entry.update(status="nomatch",
                             reason=("colour ambiguous: " if hits else "colour not in production. Available: ")
                             + ", ".join(hits or real_colours))
                continue
            targets = [v for v in prod if sku_colour(v["sku"]) == hits[0]]
            reason = f"colour '{entry['colour']}' = '{hits[0]}'"

        entry["variants"] = [{"id": v["productVariantId"], "sku": v["sku"], "name": v["productVariantName"],
                              "productId": v["productId"], "hasAsset": bool(v["productVariantAsset"])}
                             for v in sorted(targets, key=lambda v: v["sku"])]
        doubts = [fl for fl in entry["flags"] if fl.split(" (")[0] not in HARMLESS_FLAGS]
        if design:
            doubts.append(f"print design {design} photo, not the plain hat")
        if dup:
            doubts.append("duplicate photo of the same code+colour")
        if doubts:
            entry.update(status="review", reason=reason + " | " + "; ".join(doubts))
        else:
            entry.update(status="confident", reason=reason)

    # several confident images claiming the same variant -> all to review
    claims = defaultdict(list)
    for e in plan:
        if e["status"] == "confident":
            for v in e["variants"]:
                claims[v["id"]].append(e)
    for es in claims.values():
        if len(es) > 1:
            for e in es:
                e["status"] = "review"
                e["reason"] += " | another photo targets the same variant"

    plan_path = Path(OPT.plan) if OPT.plan else IMG_DIR / "_work" / "plan.json"
    plan_path.parent.mkdir(parents=True, exist_ok=True)
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
    write_html(plan)
    st = Counter(e["status"] for e in plan)
    nv = {s: sum(len(e["variants"]) for e in plan if e["status"] == s) for s in st}
    print("images:", dict(st), "| variants:", nv)
    print("products in prod touched:", len({e["variants"][0]["productId"] for e in plan if e["variants"]}),
          "| existing images replaced:", sum(v["hasAsset"] for e in plan if e["status"] == "confident" for v in e["variants"]))


def write_html(plan):
    esc = html.escape
    groups = [("confident", "Confident - will be uploaded after your approval"),
              ("review", "Needs review - NOT uploaded unless you approve individually"),
              ("nomatch", "No match in production - not uploaded")]
    mapping = Counter((e["colour"], sku_colour(e["variants"][0]["sku"])) for e in plan if e["variants"] and e["colour"])
    out = ["""<!doctype html><html lang="el"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Catalogue match review</title><style>
:root{--bg:#f6f6f4;--card:#fff;--ink:#1d1d1b;--mut:#6b6b66;--ok:#1f7a3d;--warn:#a15c00;--bad:#a12622;--line:#e2e2dd}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--card:#20201e;--ink:#ecebe6;--mut:#a3a29c;--line:#34342f}}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.4 system-ui,sans-serif;padding:16px}
h1{font-size:22px;margin:0 0 4px} h2{margin:28px 0 8px;font-size:18px;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:1}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.c{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:4px}
.c img{width:100%;height:170px;object-fit:contain;background:repeating-conic-gradient(#0000000d 0 25%,#0000 0 50%) 0 0/16px 16px;border-radius:4px}
.f{font-weight:600;word-break:break-all}.p{color:var(--mut);font-size:12px}.r{font-size:12px}
.confident .r{color:var(--ok)}.review .r{color:var(--warn)}.nomatch .r{color:var(--bad)}
ul{margin:0;padding-left:16px;font-size:12px} table{border-collapse:collapse;font-size:13px} td,th{border:1px solid var(--line);padding:3px 8px;text-align:left}
nav a{margin-right:14px}</style></head><body>
<h1>Catalogue images &rarr; production variants</h1><p class="p">Read-only preview. Nothing has been uploaded. Checkerboard = transparent background.</p><nav>"""]
    for key, title in groups:
        out.append(f'<a href="#{key}">{esc(key)} ({sum(e["status"] == key for e in plan)})</a>')
    out.append('<a href="#map">colour mapping</a></nav>')
    for key, title in groups:
        items = [e for e in plan if e["status"] == key]
        out.append(f'<h2 id="{key}">{esc(title)} ({len(items)})</h2><div class="grid">')
        for e in sorted(items, key=lambda e: e["file"]):
            vs = "".join(f"<li>{esc(v['sku'])}{' <b>(replaces image)</b>' if v['hasAsset'] else ''}</li>" for v in e["variants"])
            out.append(f'<div class="c {key}"><img loading="lazy" src="{esc(e["file"])}" alt="">'
                       f'<div class="f">{esc(e["file"])}</div><div class="p">{esc(e["product"])} {esc(e["page"])}</div>'
                       f'<div class="r">{esc(e["reason"])}</div>{"<ul>" + vs + "</ul>" if vs else ""}</div>')
        out.append("</div>")
    out.append('<h2 id="map">Colour mapping used (catalogue &rarr; production)</h2><table><tr><th>Catalogue</th><th>Production</th><th>Images</th></tr>')
    for (cat, prod), n in sorted(mapping.items()):
        out.append(f"<tr><td>{esc(cat)}</td><td>{esc(prod)}</td><td>{n}</td></tr>")
    out.append("</table></body></html>")
    (IMG_DIR / "_MATCH_REVIEW.html").write_text("\n".join(out), encoding="utf-8")


if __name__ == "__main__":
    main()
