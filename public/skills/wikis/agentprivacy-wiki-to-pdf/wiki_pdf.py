#!/usr/bin/env python
"""
wiki-to-pdf : pull FedWiki timeline pages -> formal executive-brief PDFs.

Outputs (into --out, default ./wiki_pdf_out):
  <sub>-brief.pdf          one executive brief per timeline
  timeline-dossier.pdf     combined dossier: cover + contents + UNIFIED SUMMARY
                           (all In-briefs) + every timeline's full section

Usage:
  python wiki_pdf.py                      # all 12 timelines + dossier
  python wiki_pdf.py --sub agm            # one timeline brief
  python wiki_pdf.py --no-dossier         # briefs only
  python wiki_pdf.py --model model.json   # render from a saved model (offline)
  python wiki_pdf.py --dump model.json    # pull + save model, then render

Source of truth = the live *.timeline.ide.earth subdomains (public GET, no auth).
"""
import json, re, os, sys, argparse, urllib.request, datetime

# ----- config: the timeline family (chronological order; date shown is each page's real date) -----
TIMELINES = [
    # key,       video-slug,            display title
    ("launch",        "declaration-launch",   "Declaration & Brand Launch"),
    ("building",      "infrastructure-build",  "Infrastructure Build"),
    ("web",           "web-summit",            "Web Summit"),
    ("groundhog",     "groundhog-day",         "Groundhog Day"),
    ("panic",         "dont-panic-festival",   "Don't Panic Festival"),
    ("tour",          "dont-panic-tour",       "Don't Panic Tour"),
    ("gamejam",       "game-jam",              "Game Jam"),
    ("agm",           "agm-2027",              "AGM 2027"),
    ("sovereign",     "sovereign-compute",     "Sovereign Compute"),
    ("unsingularity", "the-unsingularity",     "The Unsingularity"),
    ("deep",          "deep-thought-realized",  "Deep Thought Realized"),
    ("myspace",       "myspace-rewilded",      "Myspace Rewilded"),
]
QUESTIONS = [
    ("who-cares",       "Who Cares?"),
    ("who-is-involved", "Who is Involved?"),
    ("what-changes",    "What Changes?"),
    ("proof--realness", "Proof & Realness?"),
    ("becoming-real",   "Becoming Real?"),
]
HOST = "{sub}.timeline.ide.earth"

# --------------------------------------------------------------------------- fetch + parse
def fetch(sub, slug):
    url = "https://" + HOST.format(sub=sub) + "/" + slug + ".json"
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)

def md_items(page):
    return [it.get("text", "") for it in page.get("story", []) if it.get("type") == "markdown"]

def first_date(page):
    for it in page.get("story", []):
        if it.get("type") == "date":
            return it.get("text", "").split("\n")[0].strip()
    # fallback: look for a "# Date" markdown followed by text
    return ""

def video_url(page):
    for it in page.get("story", []):
        if it.get("type") == "video":
            m = re.search(r"https?://\S+", it.get("text", ""))
            return m.group(0) if m else ""
    return ""

def strip_heading(t):
    return re.sub(r"^#{1,6}[^\n]*\n+", "", t).strip()

def parse_question(page):
    items = md_items(page)
    in_brief = ""
    answer_parts = []
    for t in items:
        s = t.strip()
        if "Below we summarise" in t:           # intro chrome
            continue
        if s.startswith("## In brief"):
            in_brief = strip_heading(t)
            continue
        if s.startswith("# See"):                # nav chrome
            continue
        answer_parts.append(t)
    return in_brief, "\n\n".join(answer_parts).strip()

def parse_video(page):
    items = md_items(page)
    detail, keypoints, actions, framing = "", "", "", ""
    for t in items:
        s = t.strip()
        if s.startswith("## Key points"):   keypoints = t
        elif s.startswith("## Action items"): actions = t
    # framing = first non-heading markdown item; detail = longest body that isn't KP/AI/heading
    body = [t for t in items if t.strip() and not t.strip().startswith("#")
            and not t.strip().startswith("## Key points") and not t.strip().startswith("## Action items")]
    if body:
        framing = body[0]
        detail = max(body, key=len)
    return {"framing": framing, "detail": detail, "keypoints": keypoints, "actions": actions}

def build_model():
    model = []
    for sub, vslug, title in TIMELINES:
        sys.stderr.write("pulling %s ...\n" % sub)
        vpage = fetch(sub, vslug)
        rec = {"sub": sub, "title": title, "date": first_date(vpage),
               "video": video_url(vpage), "questions": []}
        rec.update(parse_video(vpage))
        for qslug, qlabel in QUESTIONS:
            try:
                qp = fetch(sub, qslug)
                ib, ans = parse_question(qp)
            except Exception as e:
                ib, ans = "", "(missing: %s)" % e
            rec["questions"].append({"label": qlabel, "in_brief": ib, "answer": ans})
        model.append(rec)
    return model

# --------------------------------------------------------------------------- render (ReportLab)
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                HRFlowable, ListFlowable, ListItem)

ACCENT = colors.HexColor("#1a5276")
GREY = colors.HexColor("#566573")

def styles():
    ss = getSampleStyleSheet()
    S = {}
    S["cover_kicker"] = ParagraphStyle("ck", parent=ss["Normal"], fontName="Helvetica-Bold",
        fontSize=10, textColor=ACCENT, leading=14, spaceAfter=6, alignment=TA_CENTER)
    S["cover_title"] = ParagraphStyle("ct", parent=ss["Title"], fontName="Helvetica-Bold",
        fontSize=30, leading=34, textColor=colors.HexColor("#1c2833"), alignment=TA_CENTER, spaceAfter=10)
    S["cover_meta"] = ParagraphStyle("cm", parent=ss["Normal"], fontSize=11, textColor=GREY,
        alignment=TA_CENTER, leading=16)
    S["h1"] = ParagraphStyle("h1", parent=ss["Heading1"], fontName="Helvetica-Bold",
        fontSize=17, leading=21, textColor=ACCENT, spaceBefore=18, spaceAfter=8)
    S["h2"] = ParagraphStyle("h2", parent=ss["Heading2"], fontName="Helvetica-Bold",
        fontSize=12.5, leading=16, textColor=colors.HexColor("#1c2833"), spaceBefore=12, spaceAfter=5)
    S["h3"] = ParagraphStyle("h3", parent=ss["Heading3"], fontName="Helvetica-BoldOblique",
        fontSize=11, leading=14, textColor=GREY, spaceBefore=8, spaceAfter=3)
    S["body"] = ParagraphStyle("body", parent=ss["Normal"], fontName="Helvetica",
        fontSize=10.3, leading=15, spaceAfter=6, alignment=TA_LEFT)
    S["bullet"] = ParagraphStyle("bullet", parent=S["body"], leftIndent=16, bulletIndent=2,
        bulletFontName="Helvetica", bulletColor=ACCENT, spaceAfter=3)
    S["brief"] = ParagraphStyle("brief", parent=S["body"], fontName="Helvetica-Oblique",
        fontSize=10.3, leading=15, textColor=colors.HexColor("#34495e"), spaceAfter=6)
    S["meta"] = ParagraphStyle("meta", parent=ss["Normal"], fontSize=9, textColor=GREY,
        leading=12, spaceAfter=2)
    S["toc"] = ParagraphStyle("toc", parent=S["body"], spaceAfter=4)
    return S

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def inline(s):
    s = esc(s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r'<font color="#1a5276">\1</font>', s)   # wiki link
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w*])\*([^*\n]+?)\*(?![\w*])", r"<i>\1</i>", s)
    s = re.sub(r"`([^`]+)`", r'<font face="Courier">\1</font>', s)
    return s

def md_flow(text, S, body_style="body"):
    """minimal markdown -> reportlab flowables."""
    flow = []
    bullets = []
    def flush_bullets():
        nonlocal bullets
        for b in bullets:
            flow.append(Paragraph(inline(b), S["bullet"], bulletText=u"•"))
        bullets = []
    for raw in text.split("\n"):
        line = raw.rstrip()
        if not line.strip():
            flush_bullets(); continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            flush_bullets()
            lvl = len(m.group(1))
            st = "h1" if lvl == 1 else ("h2" if lvl == 2 else "h3")
            flow.append(Paragraph(inline(m.group(2)), S[st])); continue
        mb = re.match(r"^[-*]\s+(\[[ x]\]\s+)?(.*)$", line)
        if mb:
            bullets.append(mb.group(2)); continue
        mn = re.match(r"^(\d+)[.)]\s+(.*)$", line)
        if mn:
            flush_bullets()
            flow.append(Paragraph(inline(mn.group(2)), S["bullet"], bulletText=mn.group(1) + ".")); continue
        flush_bullets()
        flow.append(Paragraph(inline(line), S[body_style]))
    flush_bullets()
    return flow

def rule(c=ACCENT, w=1):
    return HRFlowable(width="100%", thickness=w, color=c, spaceBefore=4, spaceAfter=8)

def cover(flow, S, kicker, title, meta_lines):
    flow.append(Spacer(1, 5*cm))
    flow.append(Paragraph(kicker, S["cover_kicker"]))
    flow.append(Paragraph(esc(title), S["cover_title"]))
    flow.append(Spacer(1, 0.3*cm))
    flow.append(rule(ACCENT, 1.5))
    flow.append(Spacer(1, 0.3*cm))
    for ln in meta_lines:
        flow.append(Paragraph(ln, S["cover_meta"]))

def timeline_section(flow, S, rec, heading_style="h1"):
    flow.append(Paragraph(esc(rec["title"]), S[heading_style]))
    flow.append(rule())
    meta = []
    if rec["date"]:  meta.append("<b>Date:</b> " + esc(rec["date"]))
    if rec["video"]: meta.append('<b>Video:</b> <font color="#1a5276">%s</font>' % esc(rec["video"]))
    for m in meta: flow.append(Paragraph(m, S["meta"]))
    flow.append(Spacer(1, 0.2*cm))
    if rec.get("detail"):
        flow.append(Paragraph("Overview", S["h2"]))
        flow.extend(md_flow(strip_heading(rec["detail"]) if rec["detail"].strip().startswith("#") else rec["detail"], S))
    # unified in-brief block
    flow.append(Paragraph("In Brief", S["h2"]))
    for q in rec["questions"]:
        if q["in_brief"]:
            flow.append(Paragraph("<b>%s</b> %s" % (esc(q["label"]), inline(q["in_brief"])), S["brief"]))
    # key points / actions
    for key, lbl in (("keypoints", "Key Points"), ("actions", "Action Items")):
        if rec.get(key):
            flow.append(Paragraph(lbl, S["h2"]))
            flow.extend(md_flow(strip_heading(rec[key]), S))
    # detailed answers
    flow.append(Paragraph("The Five Questions", S["h2"]))
    for q in rec["questions"]:
        flow.append(Paragraph(esc(q["label"]), S["h3"]))
        flow.extend(md_flow(q["answer"], S))

def render_brief(rec, out):
    S = styles()
    doc = SimpleDocTemplate(out, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2.2*cm, rightMargin=2.2*cm, title=rec["title"] + " - Executive Brief")
    flow = []
    cover(flow, S, "HITCHHIKER TIMELINE - EXECUTIVE BRIEF", rec["title"],
          [l for l in [rec["date"] and ("Date: " + rec["date"]), "timeline.ide.earth"] if l])
    flow.append(PageBreak())
    timeline_section(flow, S, rec, heading_style="h1")
    doc.build(flow)

def render_dossier(model, out):
    S = styles()
    doc = SimpleDocTemplate(out, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2.2*cm, rightMargin=2.2*cm, title="Hitchhiker Timeline - Executive Dossier")
    flow = []
    today = datetime.date.today().isoformat()
    cover(flow, S, "EXECUTIVE DOSSIER", "The Hitchhiker Timeline",
          ["A milestone-by-milestone brief of the Hitchhiker / Game of 42 project",
           "%d milestones - generated %s - timeline.ide.earth" % (len(model), today)])
    flow.append(PageBreak())
    # contents
    flow.append(Paragraph("Contents", S["h1"])); flow.append(rule())
    for i, rec in enumerate(model, 1):
        d = (" - " + rec["date"]) if rec["date"] else ""
        flow.append(Paragraph("%d.&nbsp; <b>%s</b>%s" % (i, esc(rec["title"]), esc(d)), S["toc"]))
    flow.append(PageBreak())
    # UNIFIED SUMMARY LAYER (all In-briefs)
    flow.append(Paragraph("Unified Summary", S["h1"])); flow.append(rule())
    flow.append(Paragraph("Each milestone, compressed to its five answers. This is the shared core "
                          "from which the detailed sections - and any community-specific retelling - expand.",
                          S["brief"]))
    for rec in model:
        flow.append(Paragraph(esc(rec["title"]) + ("  -  " + esc(rec["date"]) if rec["date"] else ""), S["h2"]))
        any_ib = False
        for q in rec["questions"]:
            if q["in_brief"]:
                any_ib = True
                flow.append(Paragraph("<b>%s</b> %s" % (esc(q["label"]), inline(q["in_brief"])), S["brief"]))
        if not any_ib:
            flow.append(Paragraph("(summaries pending)", S["meta"]))
    flow.append(PageBreak())
    # full sections
    flow.append(Paragraph("Milestones in Detail", S["h1"])); flow.append(rule())
    for i, rec in enumerate(model):
        timeline_section(flow, S, rec, heading_style="h1")
        if i != len(model) - 1:
            flow.append(PageBreak())
    doc.build(flow)

# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "out"))
    ap.add_argument("--sub", help="only this timeline key")
    ap.add_argument("--no-dossier", action="store_true")
    ap.add_argument("--model", help="render from saved model json (skip network)")
    ap.add_argument("--dump", help="write pulled model to this json")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    if args.model:
        model = json.load(open(args.model, encoding="utf-8"))
    else:
        model = build_model()
        if args.dump:
            json.dump(model, open(args.dump, "w", encoding="utf-8"), indent=2)

    sel = [r for r in model if (not args.sub or r["sub"] == args.sub)]
    for rec in sel:
        out = os.path.join(args.out, rec["sub"] + "-brief.pdf")
        render_brief(rec, out)
        print("wrote", out)
    if not args.sub and not args.no_dossier:
        out = os.path.join(args.out, "timeline-dossier.pdf")
        render_dossier(model, out)
        print("wrote", out)

if __name__ == "__main__":
    main()
