"""Extract product photos from the Maniadis catalogue PDFs at native resolution.

Output: <out>/<code>-<colour>.png (transparent where the PDF has a mask),
        <out>/_unmatched/*.png  (photos with no label: logos, hidden layers, lifestyle shots)
        <out>/_REVIEW.md        (everything that needs a human check)

Usage: python extract.py <out_dir> <pdf>:<pages> [<pdf>:<pages> ...]   (pages: "all" or "5,10-12")
Needs: pip install pymupdf pillow rapidocr-onnxruntime   (OCR reads codes that are drawn as shapes)
Set CATALOGUE_DEBUG_DIR=<dir> to also write page renders with the assigned names drawn on.
"""
import re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path
import pymupdf
from PIL import Image, ImageChops, ImageDraw

LAT2GR = str.maketrans("ABEZHIKMNOPTXY", "ΑΒΕΖΗΙΚΜΝΟΡΤΧΥ")
GR2LAT = str.maketrans("ΑΒΕΖΗΙΚΜΝΟΡΤΧΥ", "ABEZHIKMNOPTXY")
LOOKALIKE_LAT = set("ABEZHIKMNOPTXY")
CODE_RE = re.compile(r"^[A-Z]{0,3}[- ]?\d{3,6}(-\d+)?$")
MULTI_CODE_RE = re.compile(r"^([A-Z]{0,3}\d{3,6})\s*(?:[|/]|\s-\s)\s*([A-Z]{0,3}\d{3,6})$")
DESIGN_RE = re.compile(r"^(?:([A-Z]{0,3}\d{3,6})\s*[-|]?\s*)?NO\s*(\d+)$")
SIZE_NO_RE = re.compile(r"\bNO\s*(5[3-9]|6[0-4])\b")  # "No 59" = head size, not a print design
SIZE_RE = re.compile(r"ADJ|ΛΑΣΤΙΧΟ|NO\s*\d+\s*,")  # hat sizes, not labels
ABBREV = [(re.compile(r"\bΑΝ\.\s*"), "ΑΝΟΙΚΤΟ "), (re.compile(r"\bΣΚ\.\s*"), "ΣΚΟΥΡΟ ")]
COLOUR_WORDS = set("""ΛΕΥΚΟ ΜΑΥΡΟ ΜΠΕΖ ΜΠΛΕ ΧΑΚΙ ΡΟΥΑ ΓΑΛΑΖΙΟ ΚΑΦΕ ΡΟΖ ΣΚΟΥΡΟ ΚΥΑΝΟ ΜΠΟΡΝΤΩ ΠΡΑΣΙΝΟ
ΠΑΓΟΥ ΚΙΤΡΙΝΟ ΤΖΙΝ ΦΟΥΞΙΑ ΚΟΚΚΙΝΟ ΛΑΧΑΝΙ ΑΝΟΙΚΤΟ ΓΚΡΙ ΜΩΒ ΠΟΡΤΟΚΑΛΙ ΜΟΥΣΤΑΡΔΙ ΤΥΡΚΟΥΑΖ ΤΙΡΚΟΥΑΖ
ΦΩΣΦΟΡΙΖΕ ΚΑΝΑΡΙΝΙ ΝΕΟΝ ΛΙΛΑ ΑΣΠΡΟ ΧΡΥΣΟ ΑΣΗΜΙ ΜΕ ΚΟΡΔΕΛΑ ΜΑΥΡΗ ΛΕΥΚΗ ΚΙΤΡΙΝΗ ΜΠΛΕ BLUE JEAN NAVY""".split())
SKIP_LABELS = {"ΠΙΣΩ ΠΛΕΥΡΑ", "ΠΙΣΩ", "ΠΛΕΥΡΑ", "ΠΙΣΩ ΟΨΗ"}
MIN_LONG_SIDE = 500  # px; smaller embedded photos get flagged as low-res
DEBUG_DIR = __import__("os").environ.get("CATALOGUE_DEBUG_DIR")


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def norm_word(w):
    """Latin look-alikes inside Greek words -> Greek; real Latin words -> Latin."""
    has_real_latin = any("A" <= c <= "Z" and c not in LOOKALIKE_LAT for c in w)
    return w.translate(GR2LAT) if has_real_latin else w.translate(LAT2GR)


def norm_text(t):
    t = strip_accents(t.upper()).replace("∆", "Δ")
    return " ".join(norm_word(w) for w in t.split())


def norm_code(t):
    return re.sub(r"\s+", " ", strip_accents(t.upper()).replace("∆", "Δ").translate(GR2LAT)).strip()


def colour_words(label):
    t = norm_text(label)
    for rx, rep in ABBREV:
        t = rx.sub(rep, t)
    return re.findall(r"[^\s./,\-]+", t)


def slug(words):
    return "-".join(words).lower()


def lines(page, with_chars=False):
    out = []
    for b in page.get_text("rawdict")["blocks"]:
        for l in b.get("lines", []):
            chars = [c for s in l["spans"] for c in s["chars"]]
            t = re.sub(r"\s+", " ", "".join(c["c"] for c in chars)).strip()
            if t:
                boxes = [pymupdf.Rect(c["bbox"]) for c in chars if c["c"].strip()]
                out.append((t, pymupdf.Rect(l["bbox"]), boxes) if with_chars else (t, pymupdf.Rect(l["bbox"])))
    return out


def separators(page):
    """Long thin drawn lines that split a page into product sections."""
    pr, segs = page.rect, []
    for dr in page.get_drawings():
        r = dr["rect"] & pr
        if r.width > 100 and r.height < 4:
            y = (r.y0 + r.y1) / 2; segs.append(((r.x0, y), (r.x1, y)))
        elif r.height > 100 and r.width < 4:
            x = (r.x0 + r.x1) / 2; segs.append(((x, r.y0), (x, r.y1)))
    return segs


def crosses(a, b, segs):
    def ccw(p, q, r):
        return (r[1] - p[1]) * (q[0] - p[0]) > (q[1] - p[1]) * (r[0] - p[0])
    return any(ccw(a, c, d) != ccw(b, c, d) and ccw(a, b, c) != ccw(a, b, d) for c, d in segs)


def centre(r):
    return ((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)


def load_image(doc, xref):
    """Native-resolution pixels of an embedded image, with its soft mask as alpha."""
    pix = pymupdf.Pixmap(doc, xref)
    sm = doc.extract_image(xref).get("smask")
    if sm:
        mask = pymupdf.Pixmap(doc, sm)
        if (mask.width, mask.height) == (pix.width, pix.height):
            pix = pymupdf.Pixmap(pix, mask)
    if pix.colorspace and pix.colorspace.n != 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    return Image.frombytes("RGBA" if pix.alpha else "RGB", (pix.width, pix.height), pix.samples)


def content_mask(im):
    if im.mode == "RGBA":
        return im.getchannel("A").point(lambda a: 255 if a > 20 else 0)
    return im.convert("L").point(lambda g: 255 if g < 235 else 0)


def trim(im):
    box = content_mask(im).getbbox()
    return (im.crop(box), box) if box else (None, None)


_ocr = None
OCR_CODE_RE = re.compile(r"^([AMKPS]\d{3,6})(?:-?NO(\d{1,3}))?")


def ocr_codes(page, zoom=3):
    """Product codes visible on the rendered page: [(code, page_rect, confidence)]."""
    global _ocr
    if _ocr is None:
        import numpy as np
        from rapidocr_onnxruntime import RapidOCR
        _ocr = (RapidOCR(), np)
    engine, np = _ocr
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
    res, _ = engine(np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3))
    out = []
    for box, txt, conf in res or []:
        xs, ys = [p[0] / zoom for p in box], [p[1] / zoom for p in box]
        r = pymupdf.Rect(min(xs), min(ys), max(xs), max(ys))
        c = re.sub(r"\s+", "", norm_code(txt))
        m = OCR_CODE_RE.match(c)
        if r.y0 < 60 or not m:
            continue
        design = m[2] if m[2] and not (53 <= int(m[2]) <= 64) else None
        out.append((f"{m[1]}-no{design}" if design else m[1], r, float(conf)))
    return out


def parse_pages(spec, n):
    if spec == "all":
        return list(range(1, n + 1))
    res = []
    for part in spec.split(","):
        a, _, b = part.partition("-")
        res += list(range(int(a), int(b or a) + 1))
    return res


def main():
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    (out / "_unmatched").mkdir(exist_ok=True)
    used, review, stats = Counter(), defaultdict(lambda: defaultdict(list)), Counter()
    saved_pairs = set()
    saved_unmatched = set()

    def flag(cat, pdf, pn, msg):
        review[cat][(pdf, pn)].append(msg)

    legend = []
    for n_pdf, arg in enumerate(sys.argv[2:], 1):
        pdf, _, spec = arg.rpartition(":")
        doc, pdfname = pymupdf.open(pdf), Path(pdf).stem
        doc_bare = pymupdf.open(pdf)  # scratch copy for text-visibility check; never saved
        tag = f"K{n_pdf}"
        legend.append(f"{tag} = {Path(pdf).name}")
        # if nearly all codes in this PDF start with a letter, a bare number means the text layer lost the prefix
        found = [norm_code(t) for p in doc for t, r in lines(p) if r.y0 > 60 and CODE_RE.match(norm_code(t))]
        lettered_pdf = bool(found) and sum(bool(re.match(r"^[A-Z]", c)) for c in found) / len(found) > 0.8
        for pn in parse_pages(spec, doc.page_count):
            page, pr = doc[pn - 1], doc[pn - 1].rect
            segs = separators(page)
            # collect visible embedded photos (native resolution, transparent padding trimmed)
            images = []
            for idx, info in enumerate(page.get_image_info(xrefs=True)):
                x, r = info["xref"], pymupdf.Rect(info["bbox"])
                if not x or not pr.contains(pymupdf.Point(centre(r))):
                    continue  # inline image, or parked off-page (hidden leftover)
                try:
                    pil = load_image(doc, x)
                except Exception as e:
                    flag("Other problems", tag, pn, f"could not decode image xref {x}: {e}")
                    continue
                pil, box = trim(pil)
                if pil is None:
                    continue
                w0, h0 = info["width"], info["height"]
                vis = pymupdf.Rect(r.x0 + box[0] / w0 * r.width, r.y0 + box[1] / h0 * r.height,
                                   r.x0 + box[2] / w0 * r.width, r.y0 + box[3] / h0 * r.height)
                if vis.width < 25 or vis.height < 25:
                    continue
                images.append({"xref": x, "pil": pil, "vis": vis, "order": idx, "hidden": False})

            # text is visible only if removing it changes the rendered page (catches text hidden under
            # photos, clipped away, or drawn invisible - the PDF has stale layers)
            all_lines = lines(page, with_chars=True)
            bare = doc_bare[pn - 1]
            for _, r, _ in all_lines:
                bare.add_redact_annot(r, fill=False)
            bare.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                                  graphics=pymupdf.PDF_REDACT_LINE_ART_NONE, text=pymupdf.PDF_REDACT_TEXT_REMOVE)
            zoom = 2
            px_full = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            px_bare = bare.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            ink = ImageChops.difference(
                Image.frombytes("RGB", (px_full.width, px_full.height), px_full.samples).convert("L"),
                Image.frombytes("RGB", (px_bare.width, px_bare.height), px_bare.samples).convert("L"),
            ).point(lambda v: 1 if v > 40 else 0)
            char_h = [(sum(b.height for b in bx) / len(bx) if bx else 1e9) for _, _, bx in all_lines]

            def text_hidden(k):
                """Line k is hidden if removing all text leaves its character boxes unchanged.
                Pixels shared with a line drawn in smaller type are credited to that line."""
                t, r, bx = all_lines[k]
                if not bx:
                    return True
                mask = Image.new("1", ink.size, 0); dr = ImageDraw.Draw(mask)
                for b in bx:
                    dr.rectangle([v * zoom for v in (b.x0, b.y0, b.x1, b.y1)], fill=1)
                for j, (_, r2, bx2) in enumerate(all_lines):
                    if j != k and r2.intersects(r) and char_h[j] < char_h[k]:
                        for b in bx2:
                            dr.rectangle([v * zoom for v in (b.x0, b.y0, b.x1, b.y1)], fill=0)
                box = tuple(int(v * zoom) for v in (r.x0, r.y0, r.x1, r.y1))
                area = sum(mask.crop(box).getdata())
                hits = sum(a & b for a, b in zip(mask.crop(box).getdata(), ink.crop(box).getdata()))
                return hits < max(4, 0.02 * area)

            codes, labels = [], []
            for k, (t, r, _) in enumerate(all_lines):
                if text_hidden(k):
                    continue
                c = norm_code(t)
                if r.y0 < 60:
                    continue
                if "€" in t or SIZE_RE.search(c) or SIZE_NO_RE.search(c):
                    # price/size line; keep a product code if it starts the line ("A1560 ADJ / No 59/€3,10")
                    if (m := re.match(r"^([A-Z]{1,3}\d{3,6})\b", c)):
                        codes.append((m[1], r))
                    continue
                if CODE_RE.match(c):
                    codes.append((re.sub(r"^([A-Z]+)[- ](\d)", r"\1\2", c), r))
                elif (m := DESIGN_RE.match(c)) and m[1]:
                    codes.append((f"{m[1]}-no{m[2]}", r))
                elif (m := MULTI_CODE_RE.match(c)):
                    codes.append((f"{m[1]}_{m[2]}", r))
                elif norm_text(t) not in SKIP_LABELS and 1 < len(t) <= 40 and max(map(len, t.split())) > 2 and not re.fullmatch(r"[\d,.%]+", t):
                    labels.append((t, r))

            # some codes are drawn as vector shapes, not text: read them from the rendered page
            low_conf = set()
            for code, r, conf in ocr_codes(page):
                clash = [i for i, (_, cr) in enumerate(codes) if (cr + (-3, -3, 3, 3)).intersects(r)]
                if not clash:
                    codes.append((code, r))
                elif all(not re.match(r"^[A-Z]", codes[i][0]) and re.match(r"^[A-Z]", code) for i in clash):
                    for i in clash:  # text layer lost the letter prefix ("576 No1" vs "A1576 No17")
                        codes[i] = (code, codes[i][1])
                else:
                    continue
                if conf < 0.95:
                    low_conf.add(code)

            # a photo almost fully covered by a later-drawn photo is a stale layer
            for a in images:
                for b in images:
                    if b["order"] > a["order"] and a["vis"].get_area() > 0:
                        ov = (a["vis"] & b["vis"]).get_area() / a["vis"].get_area()
                        if ov > 0.8 and (b["vis"] & a["vis"]).get_area() / max(b["vis"].get_area(), 1) > 0.5:
                            a["hidden"] = True
            visible = [im for im in images if not im["hidden"]]

            # each label -> the visible photo just above it, horizontally aligned
            per_image = defaultdict(list)
            for t, lr in labels:
                lc = (lr.x0 + lr.x1) / 2
                best = None
                for i, im in enumerate(visible):
                    v = im["vis"]
                    gap = lr.y0 - v.y1
                    if not (-35 <= gap <= 60) or not (v.x0 - 10 <= lc <= v.x1 + 10):
                        continue
                    if crosses(centre(lr), centre(v), segs):
                        continue
                    score = abs(gap) + abs(lc - (v.x0 + v.x1) / 2) * 0.5
                    if best is None or score < best[0]:
                        best = (score, i)
                if best:
                    per_image[best[1]].append((t, lr))

            def code_under(v):
                for c, cr in codes:
                    cc = (cr.x0 + cr.x1) / 2
                    if -35 <= cr.y0 - v.y1 <= 40 and v.x0 - 10 <= cc <= v.x1 + 10 and not crosses(centre(cr), centre(v), segs):
                        return c
                return None

            pieces = []  # (pil, xref, label_text, label_rect, anchor_point, notes)
            for i, im in enumerate(visible):
                labs = sorted(per_image.get(i, []), key=lambda l: l[1].x0)
                if len(labs) <= 1:
                    pieces.append((im["pil"], im["xref"], labs[0][0] if labs else "",
                                   labs[0][1] if labs else None, centre(im["vis"]), []))
                    continue
                pil, v = im["pil"], im["vis"]
                cols = list(content_mask(pil).resize((pil.width, 1), Image.BOX).getdata())
                to_px = lambda px: int((px - v.x0) / v.width * pil.width)
                lcs = [min(max(to_px((lr.x0 + lr.x1) / 2), 0), pil.width - 1) for _, lr in labs]
                cuts = [0]
                for a, b in zip(lcs, lcs[1:]):
                    lo, hi = max(a + (b - a) // 4, 0), min(b - (b - a) // 4, pil.width - 1)
                    cuts.append(min(range(lo, hi + 1), key=lambda x: cols[x]) if hi > lo else (a + b) // 2)
                cuts.append(pil.width)
                cuts = [max(c, prev) for prev, c in zip([0] + cuts, cuts)]  # keep monotonic
                for (t, lr), x0, x1 in zip(labs, cuts, cuts[1:]):
                    part, _ = trim(pil.crop((x0, 0, x1, pil.height))) if x1 > x0 else (None, None)
                    if part is None:
                        flag("Other problems", tag, pn, f"label '{t}' shares a photo with others but could not be cut apart (xref {im['xref']})")
                        continue
                    notes = [f"cut from one photo holding {len(labs)} products"]
                    if cols[x0] > 5 and x0 > 0 or x1 < pil.width and cols[x1] > 5:
                        notes.append("products touch at the cut line - check edges")
                    pieces.append((part, im["xref"], t, lr, centre(lr), notes))

            for im in images:
                if im["hidden"] and im["xref"] not in saved_unmatched:
                    saved_unmatched.add(im["xref"])
                    im["pil"].save(out / "_unmatched" / f"{tag}_p{pn:03d}_hidden_x{im['xref']}.png")
                    stats["hidden"] += 1

            overlay = []
            for pil, xref, label, lr, anchor, notes in pieces:
                same = [c for c in codes if not crosses(anchor, centre(c[1]), segs)]
                code, colour, cats = "", "", []
                if lr is not None:
                    d = DESIGN_RE.match(norm_code(label))
                    if d:
                        code, colour = (d[1] or ""), f"no{d[2]}"
                    else:
                        words = colour_words(label)
                        colour = slug(words)
                        if "," in label:
                            cats.append(("Label lists several colours (probably a group/lifestyle photo)", f"label '{label}'"))
                        elif any(w not in COLOUR_WORDS for w in words):
                            cats.append(("Label is not a plain colour (model name / description?)", f"label '{label}'"))
                    if not code:
                        if same:
                            code = min(same, key=lambda c: abs(c[1].x0 - lr.x0) + abs(c[1].y0 - lr.y0))[0]
                            if len({c[0] for c in same}) > 1:
                                cats.append(("Several codes in the same section - nearest one picked",
                                             "candidates " + ", ".join(sorted({c[0] for c in same}))))
                        else:
                            cats.append(("No product code printed for this product", ""))
                else:
                    v = next(im["vis"] for im in visible if im["xref"] == xref)
                    labelled = [l for l in labels if not crosses(anchor, centre(l[1]), segs)]
                    cu = code_under(v)
                    if cu:
                        code = cu
                        cats.append(("Named by code only (no colour label)", "code printed directly under photo"))
                    elif len({c[0] for c in same}) == 1 and not labelled:
                        code = same[0][0]
                        cats.append(("Named by code only (no colour label)", "only code in its section"))
                    else:
                        if xref not in saved_unmatched:
                            saved_unmatched.add(xref)
                            pil.save(out / "_unmatched" / f"{tag}_p{pn:03d}_x{xref}.png")
                            stats["unmatched"] += 1
                        continue

                if code in low_conf:
                    cats.append(("Code read by OCR with low confidence - double check", f"read as '{code}'"))
                if lettered_pdf and code and not re.match(r"^[A-Z]", code):
                    cats.append(("Code text incomplete in the PDF (letter prefix missing)", f"read as '{code}'"))
                name = "-".join(p for p in [code.lower() or f"{tag.lower()}-p{pn:03d}-nocode", colour] if p)
                if (name, xref, pil.size) in saved_pairs:
                    continue  # same photo, same name: re-used on another page
                saved_pairs.add((name, xref, pil.size))
                used[name] += 1
                if used[name] > 1:
                    name += f"-{used[name]}"
                    cats.append(("Same code + colour found more than once (different photos)", ""))
                if any("touch" in n for n in notes):
                    cats.append(("Cut from a shared photo and products touch - check the edges", ""))
                if max(pil.size) < MIN_LONG_SIDE:
                    cats.append(("Low resolution in the PDF", f"{pil.width}x{pil.height}px"))
                pil.save(out / f"{name}.png")
                overlay.append((anchor, name))
                stats["named"] += 1
                if cats:
                    stats["flagged"] += 1
                for cat, detail in cats:
                    flag(cat, tag, pn, f"`{name}.png`" + (f" - {detail}" if detail else ""))

            if DEBUG_DIR:  # page render with assigned names, for eyeballing
                from PIL import ImageFont
                z = 1.2
                pix = page.get_pixmap(matrix=pymupdf.Matrix(z, z))
                img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                dr, font = ImageDraw.Draw(img), ImageFont.truetype("arial.ttf", 13)
                for (ax, ay), nm in overlay:
                    x, y = ax * z, ay * z
                    tb = dr.textbbox((x, y), nm, font=font, anchor="mm")
                    dr.rectangle(tb, fill=(255, 255, 0)); dr.text((x, y), nm, fill=(200, 0, 0), font=font, anchor="mm")
                img.save(Path(DEBUG_DIR) / f"{tag}_p{pn:03d}.png")

    with open(out / "_REVIEW.md", "w", encoding="utf-8") as f:
        f.write("# Catalogue images to review\n\n" + ", ".join(legend) + "; p. = PDF page number.\n\n")
        for cat, pages in sorted(review.items(), key=lambda kv: -sum(map(len, kv[1].values()))):
            f.write(f"## {cat} ({sum(map(len, pages.values()))})\n\n")
            for (tag, pn), msgs in sorted(pages.items()):
                f.write(f"**{tag} p.{pn}**\n" + "".join(f"- {m}\n" for m in msgs) + "\n")
    print(dict(stats))


if __name__ == "__main__":
    main()
