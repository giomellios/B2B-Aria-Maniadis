"""Prepare one upload+assign batch from plan.json.

1. Pads the selected photos (pad.py) into <upload_dir>.
2. Prints the padded file paths in chunks of --chunk for the dashboard file chooser.
3. Writes a Playwright script (for browser_run_code_unsafe, filename=...) that, inside the logged-in
   dashboard page, finds the freshly uploaded assets (id > --min-asset-id, matched by file name,
   ignoring Vendure's __02 suffix), re-checks every variant id/SKU/product, backs up the current
   images and then assigns: variant featured+gallery = new photo (replaces old), product featured =
   black (μαυρο) photo if any, product gallery = new photos first, previous product images kept after.

Usage:
  python make_assign.py <plan.json> <upload_dir> <out.js> --min-asset-id N (--codes A1008,A1004 | --all)
                        [--status confident] [--dry-run] [--chunk 25]
"""
import argparse, json, sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from pad import pad  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("plan"); ap.add_argument("upload_dir"); ap.add_argument("out_js")
ap.add_argument("--min-asset-id", type=int, required=True, help="highest asset id BEFORE uploading this batch")
ap.add_argument("--codes", default="", help="comma-separated product codes")
ap.add_argument("--all", action="store_true", help="every product in the plan with a matching status")
ap.add_argument("--exclude-codes", default="", help="comma-separated product codes to skip (e.g. already done)")
ap.add_argument("--status", default="confident", help="comma-separated plan statuses to include")
ap.add_argument("--dry-run", action="store_true", help="verify only, write nothing")
ap.add_argument("--chunk", type=int, default=25)
a = ap.parse_args()

plan = json.loads(Path(a.plan).read_text(encoding="utf-8"))
statuses = set(a.status.split(","))
codes = {c.strip().upper() for c in a.codes.split(",") if c.strip()}
excluded = {c.strip().upper() for c in a.exclude_codes.split(",") if c.strip()}
if not codes and not a.all:
    sys.exit("give --codes or --all")
images_dir = Path(a.plan).resolve().parent.parent  # plan lives in <images>/_work/

products = defaultdict(lambda: {"items": []})
for e in plan:
    if (e["status"] not in statuses or not e["variants"] or (codes and e["code"] not in codes)
            or e["code"] in excluded):
        continue
    pid = e["variants"][0]["productId"]
    products[pid]["code"] = e["code"]
    products[pid]["items"].append({"file": e["file"], "variants": [{"id": v["id"], "sku": v["sku"]} for v in e["variants"]]})

upload = []
for pid, p in products.items():
    files = [i["file"] for i in p["items"]]
    p["featured"] = next((f for f in files if f.endswith("-μαυρο.png")), sorted(files)[0])
    for f in files:
        upload.append(str(pad(images_dir / f, Path(a.upload_dir)).resolve()))

payload = {"minAssetId": a.min_asset_id, "dryRun": a.dry_run,
           "products": [{"productId": pid, **p} for pid, p in products.items()]}

JS = r"""async (page) => page.evaluate(async (args) => {
  const strip = v => (v || '').replace(/^"|"$/g, '');
  const adm = async (query, variables) => {
    const r = await fetch('/admin-api', { method: 'POST', headers: { 'content-type': 'application/json',
      authorization: 'Bearer ' + strip(localStorage.getItem('vendure-session-token')),
      'vendure-token': strip(localStorage.getItem('vendure-selected-channel-token')) },
      body: JSON.stringify({ query, variables }) });
    const d = await r.json();
    if (d.errors) throw new Error(JSON.stringify(d.errors).slice(0, 500));
    return d.data;
  };
  const base = n => n.replace(/__\d+(?=\.[a-z]+$)/i, '');
  // newest asset per file name among the ones uploaded after minAssetId
  const fresh = {};
  for (let skip = 0; ; skip += 100) {
    const d = await adm('query($s:Int){ assets(options:{take:100, skip:$s, sort:{id:DESC}}){ items{ id name } } }', { s: skip });
    const items = d.assets.items;
    for (const x of items) if (+x.id > args.minAssetId && !(base(x.name) in fresh)) fresh[base(x.name)] = x.id;
    if (!items.length || items.some(x => +x.id <= args.minAssetId)) break;
  }
  const report = [];
  for (const p of args.products) {
    const r = { code: p.code, productId: p.productId, status: 'ok', missingAssets: [], badVariants: [] };
    report.push(r);
    try {
      const cur = (await adm('query($id:ID!){ product(id:$id){ id featuredAsset{id} assets{id} variants{ id sku featuredAsset{id} assets{id} } } }', { id: p.productId })).product;
      if (!cur) { r.status = 'skipped: product not found'; continue; }
      r.backup = { featured: cur.featuredAsset && cur.featuredAsset.id, assets: cur.assets.map(x => x.id),
                   variants: Object.fromEntries(cur.variants.map(v => [v.id, { featured: v.featuredAsset && v.featuredAsset.id, assets: v.assets.map(x => x.id) }])) };
      const bySku = Object.fromEntries(cur.variants.map(v => [v.id, v.sku]));
      const input = [];
      for (const it of p.items) {
        const asset = fresh[it.file];
        if (!asset) { r.missingAssets.push(it.file); continue; }
        it.asset = asset;
        for (const v of it.variants) {
          if (bySku[v.id] !== v.sku) r.badVariants.push(v.sku);
          else input.push({ id: v.id, featuredAssetId: asset, assetIds: [asset] });
        }
      }
      if (r.missingAssets.length || r.badVariants.length) { r.status = 'skipped: verification failed'; continue; }
      r.variants = input.length;
      if (args.dryRun) { r.status = 'dry-run ok'; continue; }
      await adm('mutation($input:[UpdateProductVariantInput!]!){ updateProductVariants(input:$input){ id } }', { input });
      const newIds = p.items.map(it => it.asset);
      const featured = fresh[p.featured];
      const gallery = [featured, ...newIds.filter(id => id !== featured), ...r.backup.assets.filter(id => !newIds.includes(id))];
      await adm('mutation($input:UpdateProductInput!){ updateProduct(input:$input){ id } }', { input: { id: p.productId, featuredAssetId: featured, assetIds: gallery } });
      r.status = 'done';
    } catch (e) { r.status = 'error: ' + String(e.message || e).slice(0, 300); }
  }
  // full report (incl. backup of previous image ids) is kept in localStorage; save it to a file with
  // browser_evaluate(filename=...) reading localStorage.getItem(<reportKey>)
  const reportKey = 'catalogue-import-report-' + (args.dryRun ? 'dry' : 'real') + '-' + Date.now();
  localStorage.setItem(reportKey, JSON.stringify(report));
  const counts = {};
  for (const r of report) { const k = r.status.split(':')[0]; counts[k] = (counts[k] || 0) + 1; }
  return { reportKey, products: report.length, variants: report.reduce((n, r) => n + (r.variants || 0), 0), counts,
           problems: report.filter(r => !['dry-run ok', 'done'].includes(r.status))
                           .map(r => ({ code: r.code, status: r.status, missingAssets: r.missingAssets, badVariants: r.badVariants })) };
}, ARGS)
"""
Path(a.out_js).write_text(JS.replace("ARGS", json.dumps(payload, ensure_ascii=False)), encoding="utf-8")

print(f"products: {len(products)}  photos: {len(upload)}  variants: {sum(len(i['variants']) for p in products.values() for i in p['items'])}")
print(f"script: {Path(a.out_js).resolve()}  (dry-run={a.dry_run})")
for n in range(0, len(upload), a.chunk):
    print(f"--- upload chunk {n // a.chunk + 1}")
    print(json.dumps(upload[n:n + a.chunk], ensure_ascii=False))
