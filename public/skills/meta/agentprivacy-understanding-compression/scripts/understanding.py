#!/usr/bin/env python
"""
understanding-compression : take a unified semantic core and re-express it for a
plurality of communities, while proving every re-expression compresses back to the
SAME invariant.

Two modes, in recursion:
  COMPRESS  ->  maths | principles | actions      (strip to the invariant)
  EXPAND    ->  markets | plurality | intents      (re-tell for audiences)
The loop closes with a re-compression check: take an expansion, compress it again,
assert the recovered invariant matches the original. That round-trip IS the coherence
test for meaning - the semantic sibling of fedwiki-cohere-sync's page-level checker.

Commands:
  python understanding.py seed   --model M [--out cards.json]
        Build blank "understanding cards" from a wiki-to-pdf model.json. Each card is
        pre-seeded with an `invariant_seed` (the milestone's In-briefs) for an agent to
        distill into the axes. Compressions/expansions left empty to fill.

  python understanding.py cohere --cards cards.json
        Validate filled cards: all six axes present, plurality has >=2 communities, each
        card carries a recheck whose recovered invariant overlaps the stated invariant.
        FAILs (non-zero exit) on any gap - use before publishing.

  python understanding.py render --cards cards.json [--out understanding.pdf]
        Render the cards to a formal PDF: per milestone, the Invariant, the three
        Compressions, the three Expansions (plurality fanned by community), and the
        round-trip check.

The AUTHORING of the axes (the maths/principles/actions and the community tellings) is a
judgement task done by the agent guided by SKILL.md; this tool seeds, checks, and renders.
"""
import json, os, sys, argparse, re

AXES_C = ["maths", "principles", "actions"]      # compressions
AXES_E = ["markets", "plurality", "intents"]     # expansions

# --------------------------------------------------------------------------- seed
def seed(model_path, out_path):
    model = json.load(open(model_path, encoding="utf-8"))
    cards = []
    for rec in model:
        briefs = [q.get("in_brief", "") for q in rec.get("questions", []) if q.get("in_brief")]
        cards.append({
            "key": rec["sub"], "title": rec["title"], "date": rec.get("date", ""),
            "invariant_seed": " ".join(briefs),         # raw material for the agent
            "invariant": "",                            # <- distill: one sentence that survives every re-telling
            "compressions": {"maths": "", "principles": "", "actions": ""},
            "expansions": {
                "markets": "",
                "plurality": [   # >=2 communities, same invariant, different telling
                    {"community": "", "telling": ""},
                    {"community": "", "telling": ""},
                ],
                "intents": "",
            },
            "recheck": {"from": "", "recovered_invariant": "", "matches": None},
        })
    json.dump(cards, open(out_path, "w", encoding="utf-8"), indent=2)
    print("seeded %d cards -> %s" % (len(cards), out_path))

# --------------------------------------------------------------------------- cohere
def _words(s):
    return set(re.findall(r"[a-z0-9]{4,}", (s or "").lower()))

def cohere(cards_path):
    cards = json.load(open(cards_path, encoding="utf-8"))
    fails = []
    for c in cards:
        k = c.get("key", "?")
        if not c.get("invariant", "").strip():
            fails.append("%s: empty invariant" % k)
        for a in AXES_C:
            if not c.get("compressions", {}).get(a, "").strip():
                fails.append("%s: empty compression '%s'" % (k, a))
        ex = c.get("expansions", {})
        if not ex.get("markets", "").strip(): fails.append("%s: empty expansion 'markets'" % k)
        if not ex.get("intents", "").strip(): fails.append("%s: empty expansion 'intents'" % k)
        plur = [p for p in ex.get("plurality", []) if p.get("community", "").strip() and p.get("telling", "").strip()]
        if len(plur) < 2:
            fails.append("%s: plurality needs >=2 filled communities (has %d)" % (k, len(plur)))
        # round-trip: recovered invariant must overlap the stated invariant
        rc = c.get("recheck", {})
        if not rc.get("from", "").strip() or not rc.get("recovered_invariant", "").strip():
            fails.append("%s: recheck not done (need 'from' + 'recovered_invariant')" % k)
        else:
            inv_w, rec_w = _words(c.get("invariant")), _words(rc.get("recovered_invariant"))
            overlap = len(inv_w & rec_w) / max(1, len(inv_w))
            if overlap < 0.25:
                fails.append("%s: round-trip drift - recovered invariant shares only %.0f%% of key terms" % (k, overlap*100))
            if rc.get("matches") is not True:
                fails.append("%s: recheck.matches is not true" % k)
    if fails:
        print("COHERENCE FAIL (%d):" % len(fails))
        for f in fails: print("  -", f)
        sys.exit(1)
    print("COHERENCE OK - %d cards, all axes present, round-trips close." % len(cards))

# --------------------------------------------------------------------------- render
def render(cards_path, out_path):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                    HRFlowable, Table, TableStyle)
    cards = json.load(open(cards_path, encoding="utf-8"))
    ACC = colors.HexColor("#6c3483")    # purple = "understanding" layer
    GREY = colors.HexColor("#566573")
    ss = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=ss["Heading1"], fontName="Helvetica-Bold", fontSize=17,
                        textColor=ACC, spaceBefore=16, spaceAfter=6)
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=12,
                        textColor=colors.HexColor("#1c2833"), spaceBefore=10, spaceAfter=4)
    inv = ParagraphStyle("inv", parent=ss["Normal"], fontName="Helvetica-BoldOblique", fontSize=12,
                         textColor=ACC, leading=16, spaceAfter=8, leftIndent=6)
    body = ParagraphStyle("body", parent=ss["Normal"], fontSize=10, leading=14, spaceAfter=3)
    lab = ParagraphStyle("lab", parent=body, fontName="Helvetica-Bold", textColor=GREY)
    meta = ParagraphStyle("meta", parent=body, fontSize=9, textColor=GREY)
    def esc(s): return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    def cell(label, text): return [Paragraph(label, lab), Paragraph(esc(text), body)]

    doc = SimpleDocTemplate(out_path, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2*cm, rightMargin=2*cm, title="Understanding Compressions")
    flow = [Paragraph("Understanding Compressions", h1),
            HRFlowable(width="100%", color=ACC, thickness=1.5, spaceAfter=8),
            Paragraph("Each milestone compressed to one invariant, then expressed three ways "
                      "(maths / principles / actions) and expanded three ways (markets / plurality "
                      "/ intents). The round-trip check confirms every re-telling compresses back "
                      "to the same invariant.", meta), Spacer(1, 0.3*cm)]
    for c in cards:
        flow.append(Paragraph(esc(c["title"]) + (("  -  " + esc(c["date"])) if c.get("date") else ""), h1))
        flow.append(HRFlowable(width="100%", color=ACC, thickness=0.7, spaceAfter=6))
        flow.append(Paragraph("Invariant", h2))
        flow.append(Paragraph(esc(c.get("invariant","")), inv))
        flow.append(Paragraph("Compressions", h2))
        cdata = [cell("Maths", c["compressions"].get("maths","")),
                 cell("Principles", c["compressions"].get("principles","")),
                 cell("Actions", c["compressions"].get("actions",""))]
        flow.append(Paragraph("Expansions", h2))
        ex = c.get("expansions", {})
        edata = [cell("Markets", ex.get("markets","")),
                 cell("Intents", ex.get("intents",""))]
        for p in ex.get("plurality", []):
            if p.get("community"): edata.append(cell("Plurality - " + p["community"], p.get("telling","")))
        t = Table([[Paragraph("COMPRESS", lab)]] + cdata + [[Paragraph("EXPAND", lab)]] + edata,
                  colWidths=[3.2*cm, 13.3*cm])
        t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),
            ("LINEBELOW",(0,0),(-1,-1),0.25,colors.HexColor("#d5d8dc")),
            ("BACKGROUND",(0,0),(0,0),colors.HexColor("#ebdef0")),
            ("SPAN",(0,len(cdata)+1),(-1,len(cdata)+1)),
            ("SPAN",(0,0),(-1,0)),
            ("BACKGROUND",(0,len(cdata)+1),(-1,len(cdata)+1),colors.HexColor("#ebdef0")),
            ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
        flow.append(t)
        rc = c.get("recheck", {})
        flow.append(Spacer(1,0.15*cm))
        flow.append(Paragraph("Round-trip: compressed <b>%s</b> back to &ldquo;%s&rdquo; - matches: <b>%s</b>"
                    % (esc(rc.get("from","")), esc(rc.get("recovered_invariant","")), rc.get("matches")), meta))
        flow.append(PageBreak())
    doc.build(flow)
    print("wrote", out_path)

# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    # Defaults resolve against the CURRENT directory, so cards and PDFs land in the
    # caller's project, never inside the skill folder.
    p = sub.add_parser("seed"); p.add_argument("--model", required=True, help="wiki-to-pdf model.json (or any list of {sub,title,date,questions:[{in_brief}]})"); p.add_argument("--out", default="cards.json")
    p = sub.add_parser("cohere"); p.add_argument("--cards", default="cards.json")
    p = sub.add_parser("render"); p.add_argument("--cards", default="cards.json"); p.add_argument("--out", default=os.path.join("out","understanding.pdf"))
    a = ap.parse_args()
    if a.cmd == "seed": seed(a.model, a.out)
    elif a.cmd == "cohere": cohere(a.cards)
    elif a.cmd == "render":
        os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True); render(a.cards, a.out)

if __name__ == "__main__":
    main()
