"""SPDX-License-Identifier: Apache-2.0 (agentprivacy-skills scripts)

Export every <figure> of a chronicle page as its own PNG (light theme), for letters, slides or chat.

    python export_figures.py note.html OUT_DIR [--browser PATH] [--width 900]

A figure's file name comes from its data-name attribute (<figure data-name="fig2-e8">), else figN. The page's
<style> block is carried over so the figures render exactly as in the note. Needs Pillow for trimming.
"""
import argparse, pathlib, re, subprocess
from render import find_browser


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("out_dir")
    ap.add_argument("--browser")
    ap.add_argument("--width", type=int, default=900)
    a = ap.parse_args()
    src = pathlib.Path(a.html).resolve()
    out = pathlib.Path(a.out_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    html = src.read_text(encoding="utf-8")
    style = "\n".join(re.findall(r"<style>.*?</style>", html, re.S))
    browser = find_browser(a.browser)
    from PIL import Image
    for k, m in enumerate(re.finditer(r"<figure([^>]*)>(.*?)</figure>", html, re.S), 1):
        name = (re.search(r'data-name="([^"]+)"', m.group(1)) or [None, f"fig{k}"])[1]
        body = re.sub(r"<figcaption>.*?</figcaption>", "", m.group(2), flags=re.S)
        page = src.with_name(f"_fig_{name}.html")
        page.write_text(f'<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8">{style}'
                        '<style>body{background:#fff;margin:0}figure{margin:0;border:0;border-radius:0}</style></head>'
                        f'<body><figure style="width:{a.width}px">{body}</figure></body></html>',
                        encoding="utf-8", newline="\n")
        png = out / f"{name}.png"
        try:
            subprocess.run([browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                            "--force-device-scale-factor=2", f"--window-size={a.width},1200",
                            f"--screenshot={png}", page.as_uri()], check=True, timeout=120)
        finally:
            page.unlink(missing_ok=True)
        im = Image.open(png).convert("RGB")
        px, h = im.load(), im.height
        while h > 1 and all(px[x, h - 1] == (255, 255, 255) for x in range(0, im.width, 5)):
            h -= 1
        im.crop((0, 0, im.width, min(im.height, h + 24))).save(png, optimize=True)
        print(png)


if __name__ == "__main__":
    main()
