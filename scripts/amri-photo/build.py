"""
Builds the Amri photo-cards pack from the designer's print PDFs:

  * print PDFs with a real QR code on every card front — card n opens
    <BASE>/ecoute/amri-photo-80/<n>. Same files and split as the input
    (AMRI_cards_print_ready.pdf, AMRI_cards_9_to_16_print_ready.pdf, ...),
    one card face per page, front then back;
  * the site's card images, public/pack/amri-photo/cards/<nnn>.webp.

The designs are 768x1024 AI renders with a fake QR code; they are upscaled
x4 with Real-ESRGAN first (sharp at print size), then printed at 1536x2048
(~430 dpi on the 90x120 mm card). The fake QR is painted white and the real
one drawn on top as vectors. Cards drawn without a QR get an "Écoute" badge
in the same style.

  pip install pymupdf qrcode pillow numpy opencv-python-headless
  python scripts/amri-photo/build.py faces   IN_DIR WORK_DIR
  realesrgan-ncnn-vulkan -n realesrgan-x4plus -i WORK_DIR/faces -o WORK_DIR/x4
  python scripts/amri-photo/build.py build   IN_DIR WORK_DIR OUT_DIR [BASE_URL]
  python scripts/amri-photo/photos.py WORK_DIR   # the shop photos
"""
import glob
import io
import os
import re
import sys

import cv2
import numpy as np
import pymupdf
import qrcode
from PIL import Image, ImageDraw, ImageFont

SLUG = "amri-photo-80"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUBLIC = os.path.join(ROOT, "public", "pack", "amri-photo")

W, H = 768, 1024  # a design, as delivered
F = 2  # print scale: x4 upscale, halved
RED = (230, 8, 7)
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"

# Page geometry of the delivered PDFs: 100x120 mm page, 90 mm wide card.
PAGE = pymupdf.Rect(0, 0, 283.4646, 340.1575)
CARD = pymupdf.Rect(14.1732, 0, 269.2913, 340.1575)

# AMRI_cards_65_to_72 has 67 printed after 70; its pages hold, in order:
PAGE_ORDER = {65: [65, 66, 68, 69, 70, 67, 71, 72]}

# QR holes find_qr() can't see: card 2's frame is open at the side.
QR_HOLES = {2: (419, 201, 304, 319)}


def pdf_start(path):
    m = re.search(r"cards_(\d+)_to", path)
    return int(m.group(1)) if m else 1


def pdfs(in_dir):
    return sorted(glob.glob(os.path.join(in_dir, "AMRI_cards_*print_ready.pdf")), key=pdf_start)


def split_pair(im):
    """Front and back from a side-by-side render, each fitted to W x H.

    The two cards don't meet at the middle, so cut in the gap between their
    blue frames; a side wider than W is scaled down and the rest filled by
    mirroring the background.
    """
    hsv = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2HSV)
    blue = (hsv[..., 0] > 100) & (hsv[..., 0] < 130) & (hsv[..., 1] > 110) & (hsv[..., 2] > 90)
    framed = blue[100 : H - 100].mean(axis=0) > 0.5
    # Near the middle: the front's right frame, a gap, the back's left frame.
    xs = [x for x in range(W - 80, W + 80) if framed[x]]
    (gap_start, gap_end), *_ = [(a, b) for a, b in zip(xs, xs[1:]) if b - a > 1]
    mid = (gap_start + gap_end + 1) // 2
    out = []
    for box in ((0, 0, mid, H), (mid, 0, 2 * W, H)):
        side = np.asarray(im.crop(box))
        k = min(1.0, W / side.shape[1])
        side = cv2.resize(side, (round(side.shape[1] * k), round(H * k)), interpolation=cv2.INTER_AREA)
        dx, dy = W - side.shape[1], H - side.shape[0]
        side = cv2.copyMakeBorder(side, dy // 2, dy - dy // 2, dx // 2, dx - dx // 2, cv2.BORDER_REFLECT)
        out.append(Image.fromarray(side))
    return out


def extract_faces(in_dir, work):
    out = os.path.join(work, "faces")
    os.makedirs(out, exist_ok=True)
    for path in pdfs(in_dir):
        start = pdf_start(path)
        doc = pymupdf.open(path)
        faces = []
        for page in doc:
            ((xref, *_),) = page.get_images(full=True)
            im = Image.open(io.BytesIO(doc.extract_image(xref)["image"])).convert("RGB")
            if im.size == (2 * W, H):
                # The 1-8 file squeezes front|back onto one page.
                faces += split_pair(im)
            else:
                faces.append(im)
        order = PAGE_ORDER.get(start, range(start, start + len(faces) // 2))
        for i, n in enumerate(order):
            faces[2 * i].save(f"{out}/{n:03d}-front.png")
            faces[2 * i + 1].save(f"{out}/{n:03d}-back.png")
        print(f"{os.path.basename(path)}: cards {list(order)}")


def find_qr(front):
    """The white square inside the red QR frame, as (x, y, w, h), or None."""
    hsv = cv2.cvtColor(front, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    red = (((h < 10) | (h > 170)) & (s > 120) & (v > 120)).astype(np.uint8)
    # Some frames have a gap; close it a bit more until the hole appears.
    for k in (5, 11, 21):
        closed = cv2.morphologyEx(red, cv2.MORPH_CLOSE, np.ones((k, k), np.uint8))
        cnts, hier = cv2.findContours(closed, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        best = None
        for i, c in enumerate(cnts):
            if hier[0][i][3] < 0:
                continue  # only holes in the red
            x, y, w, hh = cv2.boundingRect(c)
            # Skip the number badge (top), the Arabic band (bottom) and the
            # headphones icon under the QR.
            if w < 120 or hh < 120 or not 0.75 < w / hh < 1.33 or x < W * 0.3 or not H * 0.12 < y < H * 0.85:
                continue
            roi = cv2.cvtColor(front[y : y + hh, x : x + w], cv2.COLOR_BGR2GRAY)
            if not (0.2 < (roi < 90).mean() < 0.7 and (roi > 190).mean() > 0.25):
                continue  # not a QR's black and white
            if best is None or w * hh > best[2] * best[3]:
                best = (x, y, w, hh)
        if best:
            return best
    return None


def label_top(front):
    """Top of the yellow French word band."""
    hsv = cv2.cvtColor(front, cv2.COLOR_BGR2HSV)
    yellow = (hsv[..., 0] > 18) & (hsv[..., 0] < 35) & (hsv[..., 1] > 150) & (hsv[..., 2] > 180)
    rows = np.nonzero(yellow[:, 100 : W - 100].mean(axis=1) > 0.6)[0]
    return int(rows[rows > H * 0.5].min())


def draw_badge(img, front):
    """Paints an "Écoute" QR frame like the designer's; returns its hole."""
    side = 150
    x1 = W - 32 - 9 - side
    y1 = label_top(front) - 14 - 48 - side
    d = ImageDraw.Draw(img)
    s = lambda *v: [round(a * F) for a in v]
    d.rounded_rectangle(s(x1 - 9, y1 - 11, x1 + side + 9, y1 + side + 48), radius=16 * F, fill=RED)
    d.rounded_rectangle(s(x1, y1, x1 + side, y1 + side), radius=9 * F, fill="white")
    # Band: headphones · Écoute · speaker
    cy = y1 + side + 24
    font = ImageFont.truetype(FONT, 17 * F)
    text = "Écoute"
    tw = d.textlength(text, font=font) / F
    cx = x1 + side / 2 + 2
    d.text((cx * F, cy * F), text, font=font, fill="white", anchor="mm")
    hx = cx - tw / 2 - 18  # headphones
    d.arc(s(hx - 10, cy - 12, hx + 10, cy + 8), 180, 360, fill="white", width=3 * F)
    d.rounded_rectangle(s(hx - 12, cy - 2, hx - 6, cy + 10), radius=2 * F, fill="white")
    d.rounded_rectangle(s(hx + 6, cy - 2, hx + 12, cy + 10), radius=2 * F, fill="white")
    sx = cx + tw / 2 + 8  # speaker
    d.rectangle(s(sx, cy - 4, sx + 4, cy + 4), fill="white")
    d.polygon(s(sx + 4, cy - 4, sx + 11, cy - 10, sx + 11, cy + 10, sx + 4, cy + 4), fill="white")
    d.arc(s(sx + 9, cy - 6, sx + 19, cy + 6), 300, 60, fill="white", width=2 * F)
    return (x1, y1, side, side)


def qr_matrix(url):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=1)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.get_matrix()


def qr_square(hole):
    x, y, w, h = hole
    side = min(w, h) * 0.96
    return (x + (w - side) / 2, y + (h - side) / 2, side)


def paint_qr(img, hole, matrix):
    """Draws the QR into a raster image (for the web)."""
    x, y, side = qr_square(hole)
    n = len(matrix)
    m = side * F / n
    d = ImageDraw.Draw(img)
    for r, row in enumerate(matrix):
        for c, dark in enumerate(row):
            if dark:
                x0, y0 = x * F + c * m, y * F + r * m
                d.rectangle([round(x0), round(y0), round(x0 + m) - 1, round(y0 + m) - 1], fill="black")


def vector_qr(page, hole, matrix):
    """Draws the QR on a PDF page as black rectangles, one per run of modules."""
    k = CARD.width / W
    x, y, side = qr_square(hole)
    x, y, m = CARD.x0 + x * k, CARD.y0 + y * k, side * k / len(matrix)
    shape = page.new_shape()
    for r, row in enumerate(matrix):
        c = 0
        while c < len(row):
            if row[c]:
                e = c
                while e + 1 < len(row) and row[e + 1]:
                    e += 1
                # A hair of overlap so no seam shows between rows.
                shape.draw_rect(pymupdf.Rect(x + c * m, y + r * m, x + (e + 1) * m, y + (r + 1) * m + 0.02))
                c = e + 1
            else:
                c += 1
    shape.finish(color=None, fill=(0, 0, 0), width=0)
    shape.commit()


def jpeg(img):
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=93, subsampling=0, dpi=(433, 433))
    return buf.getvalue()


def build(in_dir, work, out_dir, base):
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(f"{PUBLIC}/cards", exist_ok=True)
    added = []
    for path in pdfs(in_dir):
        start = pdf_start(path)
        order = PAGE_ORDER.get(start, range(start, start + 8))
        doc = pymupdf.open()
        for n in sorted(order):
            front_1x = cv2.imread(f"{work}/faces/{n:03d}-front.png")
            sides = {}
            for side in ("front", "back"):
                im = Image.open(f"{work}/x4/{n:03d}-{side}.png").convert("RGB")
                sides[side] = im.resize((W * F, H * F), Image.LANCZOS)
            front = sides["front"]
            hole = QR_HOLES.get(n) or find_qr(front_1x)
            if hole:
                x, y, w, h = hole
                ImageDraw.Draw(front).rounded_rectangle(
                    [(x + 1) * F, (y + 1) * F, (x + w - 1) * F, (y + h - 1) * F], radius=7 * F, fill="white"
                )
            else:
                hole = draw_badge(front, front_1x)
                added.append(n)
            matrix = qr_matrix(f"{base}/ecoute/{SLUG}/{n}")

            for side in ("front", "back"):
                page = doc.new_page(width=PAGE.width, height=PAGE.height)
                page.insert_image(CARD, stream=jpeg(sides[side]))
                if side == "front":
                    vector_qr(page, hole, matrix)

            web = front.copy()
            paint_qr(web, hole, matrix)
            web.resize((600, 800), Image.LANCZOS).save(f"{PUBLIC}/cards/{n:03d}.webp", quality=86, method=6)
        doc.save(os.path.join(out_dir, os.path.basename(path)), garbage=3, deflate=True)
        print(f"{os.path.basename(path)}: cards {sorted(order)}")
    print(f"QR badge added to cards without one: {added}")


if __name__ == "__main__":
    cmd, in_dir, work = sys.argv[1:4]
    if cmd == "faces":
        extract_faces(in_dir, work)
    else:
        base = (sys.argv[5] if len(sys.argv) > 5 else "https://kalimat-theta.vercel.app").rstrip("/")
        build(in_dir, work, sys.argv[4], base)
