"""Dump every product variant from the public Shop API search index (read-only, no login).

Usage: python fetch_variants.py <out.json> [shop_api_url]
Default URL: https://b2b-aria-maniadis.onrender.com/shop-api
"""
import json, sys, urllib.request

URL = sys.argv[2] if len(sys.argv) > 2 else "https://b2b-aria-maniadis.onrender.com/shop-api"
QUERY = """query($skip:Int){ search(input:{groupByProduct:false, take:100, skip:$skip}){ totalItems
  items{ sku productVariantId productVariantName productId productName productAsset{id} productVariantAsset{id} } } }"""


def post(variables):
    req = urllib.request.Request(URL, json.dumps({"query": QUERY, "variables": variables}).encode(),
                                 {"content-type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=120))


out, skip = [], 0
while True:
    d = post({"skip": skip})
    if "errors" in d:
        sys.exit(d["errors"])
    s = d["data"]["search"]
    out += s["items"]
    skip += 100
    if skip >= s["totalItems"]:
        break
json.dump(out, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("variants", len(out), "products", len({i["productId"] for i in out}))
