"""
Swaps the placeholder QR codes on the Amri print PDF for real ones: card n
gets a QR that opens <BASE>/amri/<n> (the site redirects to the visitor's
language). Rerun if the domain changes.

  pip install pymupdf qrcode pillow
  python scripts/amri/add-qr-codes.py SOURCE.pdf OUT.pdf [BASE_URL]
"""
import io
import sys

import pymupdf
import qrcode

src, out = sys.argv[1], sys.argv[2]
base = (sys.argv[3] if len(sys.argv) > 3 else "https://kalimat-theta.vercel.app").rstrip("/")

doc = pymupdf.open(src)
done = []
for page in doc:
    # The design's QR is a ~12 mm square of black vector paths.
    qrs = [
        x["rect"]
        for x in page.get_drawings()
        if len(x["items"]) > 500 and x.get("fill") == (0.0, 0.0, 0.0) and 30 < x["rect"].width < 40
    ]
    if not qrs:
        continue  # a backs page
    numbers = [
        (int(s["text"].strip()), pymupdf.Rect(s["bbox"]))
        for b in page.get_text("dict")["blocks"]
        for line in b.get("lines", [])
        for s in line["spans"]
        if s["text"].strip().isdigit() and s["size"] > 10
    ]
    for r in qrs:
        # The card number sits in the same card's top-left corner.
        (n,) = [n for n, box in numbers if abs(box.y0 - r.y0) < 15 and 0 < r.x0 - box.x0 < 260]
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=20, border=1)
        qr.add_data(f"{base}/amri/{n}")
        qr.make(fit=True)
        png = io.BytesIO()
        qr.make_image(fill_color="black", back_color="white").save(png, "PNG")
        page.draw_rect(r + (-0.5, -0.5, 0.5, 0.5), color=None, fill=(1, 1, 1), overlay=True)
        page.insert_image(r, stream=png.getvalue(), overlay=True)
        done.append(n)

assert sorted(done) == list(range(1, len(done) + 1)), sorted(done)
doc.save(out, garbage=3, deflate=True)
print(f"{len(done)} QR codes -> {base}/amri/<n>  ({out})")
