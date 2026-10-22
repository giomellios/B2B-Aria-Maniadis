ROUND 1 (home, first full build)
Seen in one second: a big white two-line title over a strip of real caps on warm black.
Idea (one sentence): the 2026 catalogue's island-by-island runs of caps become the contact sheet, and each run is the way into that island's stock.
Live thing: point at (or tap) an island run → the others dim, the fixed panel names the island, its catalogue pages and its live count on the store; every frame links to that island in the catalogue.
Layout words by section: hero=title + small band + sheet / town=photo cut across tiles / range=three columns of two-ended rows / steps=drag row of moments / about=side facts + wide paragraph / faq=reading text in two columns / apply=strip + three-cell bar / footer=tiles + wordmark
Scores: design 7 · usability 7 · creativity 8 · content 7 → overall 7.2
Caps applied: inspector FAILs (eyebrow over h1, 768 overflow, edge text, off-centre phone) → 6.0
Top three problems:
1. The range list sat directly over the h1 and read as an eyebrow (desktop-fold) → title first, then one row of lead / range / contact.
2. Mosaic at 768 crammed three facts into 120px tiles, text ran to the tile edge (tablet-page-01) → phone/tablet board with full-width fact bands.
3. Apply strip kept 80svh with an empty white field under the form, then a 200px dark gap before the footer (desktop-page-02) → height from content, footer padding reduced.

ROUND 2 (home, about, contact)
Seen in one second: same, plus About opens on a row of the catalogue's location shots and Contact on a Heraklion street clip.
Idea: unchanged; carried into About (the printed "your own cap" and stand pages shown as the artefacts) and Contact (1858 Admiralty chart, Megalo Kastro view).
Live thing: unchanged.
Scores: design 7.5 · usability 8 · creativity 8 · content 7.5 → overall 7.7
Caps applied: inspector reported blank stretches → traced to a stale CSS chunk in the dev server still carrying an earlier scroll-driven reveal; fixed by a rebuild. Footer clock overflowing its 2/12 tile at 768 (covered-text) → board starts at lg.
Top three problems:
1. Header crest invisible on black: the logo's inside is transparent (desktop-fold) → crest on its white plaque.
2. "Contact E. / Maniadis" broke after the initial (contact desktop-fold) → non-breaking space.
3. Greek title ran to three lines at 390 (home-el mobile-fold) → shorter Greek title and a 36px phone floor.

ROUND 3 (final, all pages + app screens)
Seen in one second: what it is (wholesale island caps & bags), who it is for (tourist shops) and the gold "Apply for an account" button.
Scores: design 8 · usability 8 · creativity 8 · content 7.5 → overall 7.95 (home). About/Contact: design capped at 7 (still-page WARN: only ~10 elements move) → overall ~7.5.
Caps applied: none on home; still-page cap on About/Contact.
Top three problems still open:
1. No product photographs in the local database: every catalogue card and product page shows the code tile ("Photo to follow") instead of a picture (app-catalogue desktop-fold). Fix: run the catalogue-image-import skill against the 2026 catalogue.
2. Collection names come from data: "tsantes" in Latin lower case sits next to "Καπέλα" in the nav (every header). Fix in the Dashboard (name + Greek/English translations).
3. About and Contact move little below the first screen; the steps row on phones is a swipe row whose last card is cut at the edge by design (side-scroll WARN).
