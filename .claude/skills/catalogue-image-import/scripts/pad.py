"""Make upload-ready copies of extracted photos: product centred on a transparent square canvas.

Why: the storefront shows images in square boxes with object-cover, and extract.py trims photos
tight to the product, so unpadded uploads look zoomed in and get cut off.

Usage: python pad.py <out_dir> <file.png> [...]
"""
import sys
from pathlib import Path
from PIL import Image

FILL = 0.82  # product's longer side as a share of the canvas side (matches existing store images)


def pad(src: Path, out_dir: Path) -> Path:
    im = Image.open(src)
    im = im.convert("RGBA") if im.mode != "RGBA" else im
    # photos stored without transparency (white background) get a white canvas, otherwise the
    # storefront shows a white box floating on its grey tile
    opaque = im.getchannel("A").getextrema()[0] >= 250
    if opaque:
        box = im.convert("L").point(lambda g: 255 if g < 235 else 0).getbbox() or (0, 0, *im.size)
    else:
        box = im.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox() or (0, 0, *im.size)
    im = im.crop(box)
    side = round(max(im.size) / FILL)
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 255 if opaque else 0))
    canvas.alpha_composite(im, ((side - im.width) // 2, (side - im.height) // 2))
    out_dir.mkdir(parents=True, exist_ok=True)
    dst = out_dir / src.name
    canvas.save(dst)
    return dst


if __name__ == "__main__":
    out = Path(sys.argv[1])
    for f in sys.argv[2:]:
        d = pad(Path(f), out)
        print(d.name, Image.open(d).size)
