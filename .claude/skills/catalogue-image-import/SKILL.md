---
name: catalogue-image-import
description: Extract product photos from the Maniadis catalogue PDFs, match them to Vendure product variants by code + colour, and upload/assign them on the store through the logged-in dashboard (Playwright). Use when the user wants catalogue images extracted, matched to variants, uploaded, or assigned as variant/product images, or asks to redo/fix product images from a catalogue.
---

# Catalogue image import (PDF → Vendure variants)

End-to-end, proven on production with product A1008. Scripts are in `scripts/` next to this file.
Work folder convention: `catalogue-images/` in the repo root (images, `_REVIEW.md`, `_upload/`, `_work/`).

## Hard rules

- **Never commit** the work folder (≈1 GB of images). Make sure `catalogue-images/.gitignore` contains `*`
  (ask the user to create it if writing it is blocked). The user commits/pushes themselves.
- **Never ask for, store or print credentials or session tokens.** The user logs into the dashboard in the
  Playwright browser; all Admin API calls run *inside* that page.
- **Every production write needs the user's go-ahead for that step**: pilot one product first, show it on the
  storefront, then batches. Always dry-run (`--dry-run`) a generated batch before the real run.
- **Never delete assets** (not even our own unused uploads) without explicit confirmation.
- Serving local files to the page via a local HTTP server is blocked by the permission checker — don't try;
  upload through the dashboard file chooser (step 6).

## Workflow

Requirements: `pip install pymupdf pillow rapidocr-onnxruntime`. Paths below assume repo root as cwd.
Set `PYTHONIOENCODING=utf-8` for all scripts (Greek file names on Windows).

1. **Extract** (5–10 min for ~150 pages):
   `python .claude/skills/catalogue-image-import/scripts/extract.py catalogue-images "catalogue-images/KATALOGOS 1.pdf:all" "catalogue-images/KATALOGOS 2.pdf:all"`
   (keep the PDFs inside the git-ignored `catalogue-images/` — they are 160–370 MB, over GitHub's file limit)
   → `<code>-<colour>.png` (native resolution, transparent), `_unmatched/`, `_REVIEW.md` (flags by reason).
   Debug overlays: set `CATALOGUE_DEBUG_DIR=<dir>` → page renders with assigned names drawn on. **Look at
   overlays for a sample of pages** (promo/design pages, pages with many flags) before trusting the output.
2. **Fetch variants** (read-only, public): `python …/scripts/fetch_variants.py catalogue-images/_work/prod_variants.json`
3. **Match**: `python …/scripts/match.py catalogue-images catalogue-images/_work/prod_variants.json [--exclude-page "K1 p.83"]`
   → `_work/plan.json` + `catalogue-images/_MATCH_REVIEW.html`. Statuses: `confident` (upload), `review`
   (only if the user approves individually), `nomatch` (code/colour not in prod — list for the client).
   **Have the user open `_MATCH_REVIEW.html` and approve** before any upload. Check the colour-mapping table.
4. **Login**: `browser_navigate` to `https://b2b-aria-maniadis.onrender.com/dashboard/product-variants`; if not
   logged in, ask the user to log in in that browser window.
5. **Record the highest asset id** (before uploading) with `browser_evaluate`:
   ```js
   async () => { const s = v => (v||'').replace(/^"|"$/g,''); const r = await fetch('/admin-api',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+s(localStorage.getItem('vendure-session-token')),'vendure-token':s(localStorage.getItem('vendure-selected-channel-token'))},body:JSON.stringify({query:'{ assets(options:{take:1,sort:{createdAt:DESC}}){ items{ id name } } }'})}); return r.json(); }
   ```
6. **Prepare the batch** (pads images → `_upload/`, prints upload chunks, writes the assign script):
   `python …/scripts/make_assign.py catalogue-images/_work/plan.json catalogue-images/_upload catalogue-images/_work/assign.js --min-asset-id <N> --codes A1008` (or `--all`)
   Then **upload each printed chunk**: dashboard `/dashboard/assets` → wait for "Upload" → `browser_click`
   `button:has-text("Upload")` → `browser_file_upload` with the chunk's paths. After each chunk, confirm the
   new asset count via the Admin API.
   - A chunk is sent as ONE request: the count jumps only when the whole chunk is stored (can take ~60 s).
     **Never navigate/reload before the count equals `previous + chunk size`** — that aborts the upload
     (lost a whole chunk once). Wait for the exact expected total, then open the next chooser.
   - Playwright MCP intercepts the file chooser: a `browser_run_code_unsafe` script can click Upload but
     must NOT call `setFiles` itself; hand the paths over with `browser_file_upload`.
   - An open chooser blocks other browser tools — cancel it with `browser_file_upload` (no paths).
   - If the tools report "Browser is already in use", the user must close the old Playwright Chrome window.
7. **Dry run, then assign**: regenerate with `--dry-run`, run `browser_run_code_unsafe` with
   `filename=<assign.js>` on a dashboard page; every product must report `dry-run ok` (no `missingAssets`,
   no `badVariants`). The tool echoes the whole script, so its output lands in a tool-results file — read
   only the first 2 lines (the summary). The full report (with the backup of previous image ids) is in
   localStorage under `reportKey`: save it with `browser_evaluate(filename="catalogue-images/_work/backup_….json",
   function="() => JSON.parse(localStorage.getItem('<reportKey>'))")`. Then generate without `--dry-run`
   and run again → `done` per product (129 products took ~5 min).
   Use `--exclude-codes` for products already done.
8. **Verify on the storefront**: `https://b2b-aria-maniadis.vercel.app/search?q=<CODE>` (card thumbnail) and
   `/product/<slug>` (gallery). Also check the Shop API returns the new `featuredAsset` per variant.

## What the assign step does

Variant: featured + gallery = the new photo (old image unlinked, stays in the asset library).
Product: featured = the black (`-μαυρο`) photo if present, else the first; gallery = new photos first
(featured first), previous product images kept after. One colour photo → all decoration variants of that
colour (ΣΚΕΤΟ / ΚΕΝΤΗΜΑ / ΣΤΑΜΠΑ / PVC ΣΤΑΜΠΑ). Rollback: re-apply the `backup` ids from the report.

## Pitfalls already solved (don't rediscover them)

- **Images must be padded** (`pad.py`, square transparent canvas, product at 82%). The storefront uses
  `aspect-square` + `object-cover`; tight crops look zoomed in and get cut off.
- PDFs are not flattened but contain **stale hidden layers — images and text**. extract.py only trusts text
  whose removal changes the rendered page (per character box) and drops photos covered by later photos.
- Some **codes are vector outlines, not text** → OCR (rapidocr) reads them; OCR prefixes restricted to A/M/K/P/S.
  One page (K1 p.83) had no text at all and sliced photos → exclude such pages and do them by hand.
- Greek/Latin look-alike letters are mixed in codes and labels → normalised. Abbreviations `ΑΝ.`/`ΣΚ.` expanded.
- `No 53–64` = head size; other `No N` = print design (`a1004-no5-μπλε.png`) → never auto-assigned.
- One embedded image can hold several products → split at the emptiest column between labels (flagged if touching).
- Production colour names are abbreviated (`ΚΟΚΚΝ`, `ΑΝΠΟΡΤ`, `Σ ΜΠΛ`, `ΓΑΛΑΖ`…) → `PROD_EXPAND` + prefix match
  in match.py. Unclear cases (e.g. prod `ΜΠΛΕ` vs catalogue `ΣΚΟΥΡΟ ΜΠΛΕ`) are left alone, not guessed.
- Vendure renames duplicate uploads `name__02.png` → assets are matched by id > min-asset-id + base name.
- Admin API from the page: `Authorization: Bearer <localStorage vendure-session-token>` +
  `vendure-token: <vendure-selected-channel-token>`. `window` globals vanish on navigation — define helpers per call.
- The storefront product page does **not** switch image when a variant is selected (issue #44); the data is
  still correct — verify variants through the Shop API.
