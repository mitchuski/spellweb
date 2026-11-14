"""SPDX-License-Identifier: Apache-2.0 (agentprivacy-skills scripts)

Render a chronicle HTML page to an A4 PDF and a full-page PNG with a headless Chromium browser.

    python render.py note.html --out sig_mage_chronicle [--browser PATH] [--width 900] [--scale 2]

Forces the light theme (adds data-theme="light" on a temporary copy), refuses to report success when the PDF was not
rewritten (a PDF open in a Windows viewer cannot be overwritten and the browser fails silently), and trims the PNG's
empty tail. Needs Pillow for the PNG trim.
"""
import argparse, os, pathlib, shutil, subprocess, sys, time

CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome", "chromium", "chromium-browser", "msedge",
]


def find_browser(explicit):
    for c in ([explicit] if explicit else []) + CANDIDATES:
        if c and (os.path.exists(c) or shutil.which(c)):
            return shutil.which(c) or c
    sys.exit("no Chromium-family browser found; pass --browser")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--out", required=True, help="output stem (writes STEM.pdf and STEM.png)")
    ap.add_argument("--browser")
    ap.add_argument("--width", type=int, default=900)
    ap.add_argument("--scale", type=int, default=2)
    ap.add_argument("--max-height", type=int, default=12000)
    a = ap.parse_args()

    src = pathlib.Path(a.html).resolve()
    stem = pathlib.Path(a.out).resolve()
    pdf, png = stem.with_suffix(".pdf"), stem.with_suffix(".png")
    tmp = src.with_name("_render_" + src.name)
    html = src.read_text(encoding="utf-8")
    tmp.write_text(html.replace("<html", '<html data-theme="light"', 1) if 'data-theme=' not in html[:400] else html,
                   encoding="utf-8", newline="\n")
    browser = find_browser(a.browser)
    common = [browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run"]
    try:
        t0 = time.time()
        subprocess.run(common + ["--no-pdf-header-footer", f"--print-to-pdf={pdf}", tmp.as_uri()], check=True, timeout=180)
        if not pdf.exists() or pdf.stat().st_mtime < t0 - 1:
            sys.exit(f"{pdf} was not rewritten (open in a viewer?); close it or use another --out")
        subprocess.run(common + [f"--force-device-scale-factor={a.scale}", f"--window-size={a.width},{a.max_height}",
                                 f"--screenshot={png}", tmp.as_uri()], check=True, timeout=180)
    finally:
        tmp.unlink(missing_ok=True)
    try:
        from PIL import Image
        im = Image.open(png).convert("RGB")
        bg, px, h = im.getpixel((2, im.height - 2)), im.load(), im.height
        while h > 1 and all(px[x, h - 1] == bg for x in range(0, im.width, 7)):
            h -= 1
        if h >= im.height - 2:
            print("warning: page may be taller than --max-height; raise it", file=sys.stderr)
        im.crop((0, 0, im.width, min(im.height, h + 40))).save(png, optimize=True)
    except ImportError:
        print("Pillow not installed: PNG left untrimmed", file=sys.stderr)
    print(pdf)
    print(png)


if __name__ == "__main__":
    main()
