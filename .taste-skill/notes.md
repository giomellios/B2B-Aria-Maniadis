# ARIA redesign — notes

## Direction
contact-sheet, seed 1881846705 (ecommerce, --have product-photo).
Redraw: type General Sans → Geologica (Google, Greek subset). Reason: General Sans has no Greek glyphs; the site
is bilingual and product names are Greek (brand constraint, CLAUDE.md rule 16).
Palette kept as dealt (warm black #0c0a08 / white / gold #c9a45a), plus a light variant for the existing theme switch.

## Inventory (only ARIA has these)
1. ARIA · E. Maniadis, "from 1965"; crest with laurel and a figure (logo.png).
2. Based Ελ. Βενιζέλου 129, Γάζι, Ηράκλειο Κρήτης. Tel (2810) 319618 / 319702 / 824111, fax 255525, maniadibags@gmail.com.
3. The 2026 catalogue: 378 pages, ordered island by island (Ελλάς p15, Κρήτη p20, Σαντορίνη p30, Μύκονος p47,
   Ρόδος p60, Κέρκυρα p63, Κεφαλονιά/Πάρος/Τήνος p65, Κως p66, Νάξος p71), then women's hats, panama, bags…
4. Every product carries a code (A1034 caps, K1206 canvas bags, M… hats, 9xxx beach bags), tagged on the photos
   as "A1004 · Σελ. 4". The back of the catalogue is a code → page index (p367–376).
5. SKU = <code>-<colour>-<finish>; finishes ΣΚΕΤΟ / ΚΕΝΤΗΜΑ / ΣΤΑΜΠΑ / PVC ΣΤΑΜΠΑ.
6. "Create your own cap": any place name, embroidered or as a PVC patch, choose the font (p14, p30, p47, p60).
7. Free display stands (ΔΩΡΕΑΝ ΣΤΑΝΤ) for caps, bags, wallets (p14, p236, p262, p358–366).
8. Asterisked designs registered with Ο.Β.Ι. to Evangelos Maniadis (p2).
9. Customers: tourist shops on the islands; trade accounts approved by hand.

## Idea
On this page, **the 2026 catalogue's island-by-island runs of caps and bags** becomes **the contact sheet**:
each destination is a strip of real frames headed by its name and catalogue page, and the strip is the way in.
Competitor test: Karfil and Hatpoint hide their range in a PDF; no competitor shows destinations as a browsable sheet
or links a run straight to orderable stock.

Live thing: point at (or tap) an island run → the fixed preview shows that island, its catalogue pages and the live
number of designs on the store (destination facet count), with "See all <island>" into the filtered catalogue.
Fallback without JS: every run title is a plain link.

## Argument (home)
- hero: what it is (wholesale island caps & bags), for whom (tourist shops), proof = the sheet itself.
- showcase/mosaic: your own town name on the cap + free stands + registered designs → catalogue p4 photo.
- list: the whole range with catalogue page ranges (contents page, p2) → each row opens the flipbook at that page.
- how-it-works: from application to shelf → catalogue location shots.
- about: Heraklion since 1965, destinations index.
- faq: trade terms.
- contact: apply for a trade account (bar form → /register).
- footer: tiles, wordmark.

## Sample content to confirm with the client
- Approval time, minimum order, payment terms, delivery coverage/times, conditions for free display stands.
