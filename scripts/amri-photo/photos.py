"""
The shop photos for the Amri photo-cards pack, in the same style as the
first Amri pack's (public/pack/amri/photos): 1200x1200, soft cream-pink
background, cut-out cards with soft shadows.

Run after build.py (it uses the card images build.py wrote to public/ and
the upscaled backs in WORK_DIR/x4):

  python scripts/amri-photo/photos.py WORK_DIR
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUBLIC = os.path.join(ROOT, "public", "pack", "amri-photo")
SIZE = 1200
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
RED, BLUE = (220, 38, 38), (37, 56, 186)


def background():
    """Cream at the top fading to a light blush, like the first pack's."""
    t = np.linspace(0, 1, SIZE)[:, None, None]
    top, bottom = np.array([253, 246, 240]), np.array([249, 228, 226])
    grad = (top * (1 - t) + bottom * t).repeat(SIZE, axis=1)
    return Image.fromarray(grad.astype(np.uint8), "RGB").convert("RGBA")


def cut_out(im):
    """The card alone: cropped to its blue frame, corners rounded off."""
    arr = np.asarray(im.convert("HSV"))
    h, s, v = arr[..., 0].astype(int), arr[..., 1], arr[..., 2]
    blue = (h > 140) & (h < 185) & (s > 110) & (v > 90)  # PIL hue is 0-255
    cols = np.nonzero(blue.mean(axis=0) > 0.15)[0]
    rows = np.nonzero(blue.mean(axis=1) > 0.15)[0]
    box = (cols.min(), rows.min(), cols.max() + 1, rows.max() + 1)
    card = im.convert("RGBA").crop(box)
    mask = Image.new("L", (card.width * 4, card.height * 4), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, mask.width - 1, mask.height - 1], radius=int(card.width * 0.055) * 4, fill=255
    )
    card.putalpha(mask.resize(card.size, Image.LANCZOS))
    return card


def place(canvas, card, width, center, angle=0.0, shadow=True):
    card = card.resize((width, round(card.height * width / card.width)), Image.LANCZOS)
    card = card.rotate(angle, resample=Image.BICUBIC, expand=True)
    x, y = round(center[0] - card.width / 2), round(center[1] - card.height / 2)
    if shadow:
        alpha = card.getchannel("A").point(lambda a: a * 0.32)
        sh = Image.new("RGBA", card.size, (90, 40, 40, 0))
        sh.putalpha(alpha)
        pad = 60
        layer = Image.new("RGBA", (card.width + 2 * pad, card.height + 2 * pad), (0, 0, 0, 0))
        layer.paste(sh, (pad, pad))
        layer = layer.filter(ImageFilter.GaussianBlur(18))
        canvas.alpha_composite(layer, (x - pad + 6, y - pad + 16))
    canvas.alpha_composite(card, (x, y))


def pill(canvas, text, center, color, size):
    d = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(FONT, size)
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    w, h = r - l + size * 1.3, b - t + size * 0.7
    x, y = center[0] - w / 2, center[1] - h / 2
    d.rounded_rectangle([x, y, x + w, y + h], radius=h / 2, fill=color)
    d.text(center, text, font=font, fill="white", anchor="mm")


def front(n):
    return cut_out(Image.open(f"{PUBLIC}/cards/{n:03d}.webp"))


def save(canvas, name):
    canvas.convert("RGB").save(f"{PUBLIC}/photos/{name}.webp", quality=88, method=6)


def main(work):
    # Cover: a fan of cards from different themes, the apple on top.
    c = background()
    for n, dx, angle in [(12, -350, 16), (41, 350, -16), (56, -190, 8), (71, 190, -8)]:
        place(c, front(n), 380, (SIZE / 2 + dx, 620 + abs(dx) * 0.12), angle)
    place(c, front(21), 470, (SIZE / 2, 600))
    pill(c, "80", (SIZE / 2, 125), RED, 74)
    pill(c, "AR  |  FR  |  EN", (SIZE / 2, 1105), BLUE, 46)
    save(c, "cover")

    # Front and back of the apple card.
    c = background()
    back = cut_out(Image.open(f"{work}/x4/021-back.png").resize((768, 1024), Image.LANCZOS))
    place(c, back, 560, (765, 640), -6)
    place(c, front(21), 560, (430, 560), 5)
    save(c, "recto-verso")

    # A grid across the themes.
    c = background()
    grid = [12, 18, 24, 29, 39, 45, 55, 62, 73]
    for i, n in enumerate(grid):
        place(c, front(n), 270, (240 + (i % 3) * 360, 215 + (i // 3) * 385))
    save(c, "themes")


if __name__ == "__main__":
    main(sys.argv[1])
