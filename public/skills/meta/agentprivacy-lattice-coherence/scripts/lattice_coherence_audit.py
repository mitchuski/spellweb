#!/usr/bin/env python3
"""
agentprivacy_encoding_audit.py
==============================

A coherence linter for the *semantic roots* of the agentprivacy / City of Mages
suite. It checks that every repo agrees on the canonical encodings — starting
with the one that bit us: the 6-dimension sovereignty-lattice bit-order.

WHY THIS EXISTS
---------------
The canonical encoding lives in the model itself:
  agentprivacy_master/src/data/privacy-value-model-v5.4.json  ("sovereignty_dimensions")
  agentprivacy_master/src/lib/lattice-vertex.ts               (vertexToBits)

  bit 0 (MSB · weight 32) = Protection
  bit 1 (weight 16)       = Delegation
  bit 2 (weight 8)        = Memory
  bit 3 (weight 4)        = Connection
  bit 4 (weight 2)        = Computation
  bit 5 (LSB · weight 1)  = Value

  => V35 = 100011 = Protection + Computation + Value.

But cityofmages/tomes/specs/04-vertex-naming-audit.md drifted: its single-bit
table swapped Memory<->Connection and Delegation<->Computation, which corrupts
every vertex *reading* derived from it. This tool finds that class of drift
automatically, anywhere in the suite, with file:line precision.

It is built as a REGISTRY of checks so you can add new "significant encodings"
(gems-per-keeper, sigils, conjecture-id uniqueness, grimoire pins, ...) over time.

USAGE
-----
  python agentprivacy_encoding_audit.py                # audit default suite roots
  python agentprivacy_encoding_audit.py PATH [PATH...] # audit specific paths
  python agentprivacy_encoding_audit.py --only vertex  # run one check by id
  python agentprivacy_encoding_audit.py --verbose      # show files scanned / passes
  python agentprivacy_encoding_audit.py --list         # list registered checks

Exit code 0 = coherent, 1 = at least one incoherence found (CI-friendly).
No third-party dependencies; pure stdlib; Windows/macOS/Linux.
"""

from __future__ import annotations
import argparse
import os
import re
import sys
from dataclasses import dataclass, field
from typing import Callable, Iterable

# --------------------------------------------------------------------------- #
#  CANONICAL ENCODINGS — the single source of truth. Edit HERE, nowhere else.  #
# --------------------------------------------------------------------------- #

# 6-dimension sovereignty lattice. (weight, name) in MSB->LSB order.
# Source: privacy-value-model-v5.4.json "sovereignty_dimensions" + lattice-vertex.ts.
CANON_DIMENSIONS = [
    (32, "Protection"),
    (16, "Delegation"),
    (8,  "Memory"),
    (4,  "Connection"),
    (2,  "Computation"),
    (1,  "Value"),
]
DIM_BY_WEIGHT = {w: n for w, n in CANON_DIMENSIONS}
ALL_DIM_NAMES = {n for _, n in CANON_DIMENSIONS}


def vertex_dimensions(n: int) -> set[str]:
    """Canonical active-dimension set for vertex n (0..63)."""
    return {name for weight, name in CANON_DIMENSIONS if n & weight}


def vertex_binary(n: int) -> str:
    """Canonical 6-bit MSB->LSB binary string for vertex n."""
    return format(n, "06b")


def dims_to_vertex(dims: Iterable[str]) -> int:
    """Vertex number for a set of dimension names under the canonical encoding."""
    weight = {n: w for w, n in CANON_DIMENSIONS}
    return sum(weight[d] for d in dims)


# --------------------------------------------------------------------------- #
#  CANONICAL PERSONA -> VERTEX REGISTRY                                         #
#  The "compression of meaning": each persona's lore-invariant dimension-set,   #
#  and the MODEL vertex that expresses it. Edit a persona's `dims` and the      #
#  canonical vertex recomputes automatically. The `persona` check flags any     #
#  file that places a persona at a NON-canonical vertex (its old CORPUS seat).   #
#                                                                               #
#  status: 'moved'  = relocated 2026-06-09 under the MODEL lock (edit targets)   #
#          'stable' = same vertex under both encodings (no change)              #
#          'pending'= dimension-set not yet lore-confirmed (audit, do not edit)  #
# --------------------------------------------------------------------------- #

PERSONA_VERTICES = {
    # ---- moved 2026-06-09 (MODEL lock; lore-confirmed) ----
    # Canonical dimension-sets per First-Person Spellbook Tale 31 / aletheia-and-lethe.md.
    # The City of Mages had these MISASSIGNED (Aletheia@V25, Lethe@V38); under MODEL the
    # correct seats are the SWAP: Aletheia→V38, Lethe→V25. ('was' = 7/56 only for the
    # one-off correction pass that undoes the earlier mistaken V7/V56 apply; reset to 25/38
    # afterward.)
    "aletheia": {"aliases": ["Aletheia"], "dims": {"Protection", "Connection", "Computation"},
                 "was": 25, "status": "moved",
                 "note": "bright medium / proof-transmission / Fiat-Shamir; ⊥ Lethe; V25 ⊕ V38 = V63"},
    "lethe":    {"aliases": ["Lethe", "Lethae"], "dims": {"Delegation", "Memory", "Value"},
                 "was": 38, "status": "moved",
                 "note": "dark substrate / forgetting / binds delegated terms / holds value; ⊥ Aletheia"},
    "memora":   {"aliases": ["Memora"], "dims": {"Protection", "Memory", "Value"},
                 "was": 5, "status": "moved",
                 "note": "zShields shielded memo = protect value + remember (lean alt: {Protection,Value}=V33)"},
    # ---- stable under MODEL (both mirror-bits set; same set under either encoding) ----
    "vulcana":  {"aliases": ["Vulcana"], "dims": {"Delegation", "Computation", "Value"}, "status": "stable"},
    "adamantia":{"aliases": ["Adamantia"], "dims": {"Protection", "Delegation", "Computation", "Value"}, "status": "stable"},
    "helia":    {"aliases": ["Helia"], "dims": {"Protection", "Delegation", "Computation", "Value"}, "status": "stable"},
    "pleione":  {"aliases": ["Pleione"], "dims": {"Protection", "Memory", "Connection"}, "status": "stable"},
    "vagari":   {"aliases": ["Vagari"], "dims": {"Delegation", "Memory", "Connection", "Computation", "Value"}, "status": "stable"},
    # ---- seated 2026-07-12 (Tome IX Act 8 · the three fleet workshops; meaning→derive→verify) ----
    "skeva":    {"aliases": ["Skeva"], "dims": {"Delegation", "Connection", "Computation"}, "status": "stable",
                 "note": "the Quartermaster's · the harness rig: issued (Delegation), connects the two agents (Connection), runs (Computation); keeps no Memory/Value/Protection. V22 ⊕ V41 = V63 (Memora's Chronicle)"},
    "nomia":    {"aliases": ["Nomia"], "dims": {"Delegation", "Memory", "Computation", "Value"}, "status": "stable",
                 "note": "the Chancery · law-as-code: authorizes (Delegation), remembers precedent (Memory), executes (Computation), settles obligation (Value) = Vulcana's Forge V19 + Memory. V27 ⊕ V36 = V63"},
    "limnia":   {"aliases": ["Limnia"], "dims": {"Protection", "Delegation", "Connection", "Value"}, "status": "stable",
                 "note": "the Wellpool · the mana pools: protected (Protection), membership-gated (Delegation), the anonymity set (Connection), pooled value (Value). V53 ⊕ V10 = V63"},
    # ---- pending lore-confirmation (do NOT edit yet) ----
    "mnemosyne":{"aliases": ["Mnemosyne"], "dims": {"Memory"}, "was": 4, "status": "pending"},
    "iris":     {"aliases": ["Iris"], "dims": {"Connection"}, "was": 8, "status": "pending"},
    "pythia":   {"aliases": ["Pythia", "Logos"], "dims": {"Computation"}, "was": 16, "status": "pending"},
    "custos":   {"aliases": ["Custos"], "dims": {"Protection", "Computation", "Value"}, "was": 49, "status": "pending"},
    "lampyra":  {"aliases": ["Lampyra"], "dims": {"Protection", "Computation", "Value"}, "was": 49, "status": "pending"},
    "pallia":   {"aliases": ["Pallia"], "dims": None, "was": 28, "status": "pending"},
    "manifestia":{"aliases": ["Manifestia"], "dims": None, "was": 55, "status": "pending"},
    "aria":     {"aliases": ["Aria Silverhue", "Aria"], "dims": None, "was": 57, "status": "pending"},
}


def persona_canonical_vertex(key: str) -> int | None:
    p = PERSONA_VERTICES[key]
    return dims_to_vertex(p["dims"]) if p.get("dims") else None


# --------------------------------------------------------------------------- #
#  Suite roots — sibling repos under the user's home that form the suite.       #
# --------------------------------------------------------------------------- #

DEFAULT_SUITE_ROOTS = [
    "agentprivacy_master",
    "cityofmages",
    "spellweb",
    "agentprivacy-docs",
    "agentprivacy-skills",
    "privacymage_book",
    "agentprivacy_tomes",
    "agentprivacy-spellbook",
]

SCAN_EXTS = {".md", ".mdx", ".json", ".ts", ".tsx", ".js", ".jsx", ".py", ".txt"}
SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "build", "out",
             "__pycache__", ".venv", "venv", "target", "coverage"}
MAX_BYTES = 4_000_000  # skip files larger than this (built bundles, lockfiles)


@dataclass
class Finding:
    check: str
    path: str
    line: int
    message: str
    excerpt: str = ""

    def render(self, root: str) -> str:
        rel = os.path.relpath(self.path, root)
        head = f"  {rel}:{self.line}  [{self.check}]"
        body = f"      {self.message}"
        ex = f"      | {self.excerpt.strip()[:160]}" if self.excerpt else ""
        return "\n".join(x for x in (head, body, ex) if x)


@dataclass
class Check:
    id: str
    title: str
    # line-level scanner: (path, lineno, line) -> Iterable[Finding]
    scan_line: Callable[[str, int, str], Iterable[Finding]] | None = None
    # whole-file scanner: (path, text) -> Iterable[Finding]
    scan_file: Callable[[str, str], Iterable[Finding]] | None = None


REGISTRY: list[Check] = []


def register(check: Check) -> None:
    REGISTRY.append(check)


# --------------------------------------------------------------------------- #
#  CHECK 1 — vertex / dimension coherence (the one that bit us)                 #
# --------------------------------------------------------------------------- #

_V = r"V(\d{1,2})\b"
_BIN6 = r"\b([01]{6})\b"
# A "reading" = a vertex token near >=2 dimension words joined by + or middot.
_DIMWORD = r"(?:Protection|Delegation|Memory|Connection|Computation|Value)"
_READING = re.compile(
    rf"{_V}.{{0,80}}?((?:{_DIMWORD}\s*[+·,&]\s*){{1,}}{_DIMWORD})",
    re.IGNORECASE,
)
_V_NEAR_BIN = re.compile(rf"{_V}.{{0,40}}?{_BIN6}|{_BIN6}.{{0,40}}?{_V}")
# single-bit declarations: "V16 | 010000 | Computation" style or "V32 ... Protection"
_POW2 = {1, 2, 4, 8, 16, 32}


# A line only counts as a *lattice* statement (not a model-version mention like
# "PVM-V4" / "Model V6" / "v5.4") if it carries a 6-bit binary or a lattice word.
_LATTICE_CTX = re.compile(
    r"[01]{6}|\b(?:vertex|binary|stratum|lattice|burning|"
    r"dimension|bit-sign|active dimension)\b", re.IGNORECASE)
# A V-token is "versionish" (skip it) when it is part of PVM-V4 / Model V6 / -V5.
_VERSIONISH = re.compile(r"(?:PVM|MODEL|SPEC|VERSION|[A-Za-z])\s*-?\s*$", re.IGNORECASE)


def _is_lattice_line(line: str) -> bool:
    return bool(_LATTICE_CTX.search(line))


def _versionish_at(line: str, start: int) -> bool:
    """True if the V-token at `start` is preceded by a version-ish prefix."""
    return bool(_VERSIONISH.search(line[max(0, start - 8):start]))


def _dims_in(text: str) -> list[str]:
    found = []
    for _, name in CANON_DIMENSIONS:
        if re.search(rf"\b{name}\b", text, re.IGNORECASE):
            found.append(name)
    return found


def _norm(names: Iterable[str]) -> set[str]:
    canon = {n.lower(): n for n in ALL_DIM_NAMES}
    return {canon[x.lower()] for x in names if x.lower() in canon}


def _scan_vertex(path: str, lineno: int, line: str):
    findings = []
    lattice = _is_lattice_line(line)

    # (a) binary <-> vertex-number coherence (binary already implies lattice ctx)
    for m in _V_NEAR_BIN.finditer(line):
        g = m.groups()
        # one of the two alternations matched: (Vnum, bin) or (bin, Vnum)
        if g[0] is not None:
            vnum, b, vstart = g[0], g[1], m.start(1)
        else:
            vnum, b, vstart = g[3], g[2], m.start(3)
        if vnum is None or b is None or _versionish_at(line, vstart):
            continue
        n = int(vnum)
        if 0 <= n <= 63 and int(b, 2) != n:
            findings.append(Finding(
                "vertex", path, lineno,
                f"V{n} paired with binary {b} (={int(b, 2)}); "
                f"canonical V{n} = {vertex_binary(n)}.",
                line))

    if not lattice:
        return findings  # readings/single-bit claims only count in lattice context

    # (b) dimension-set reading coherence
    for m in _READING.finditer(line):
        if _versionish_at(line, m.start(1)):
            continue
        n = int(m.group(1))
        if not (0 <= n <= 63):
            continue
        claimed = _norm(re.findall(_DIMWORD, m.group(2), re.IGNORECASE))
        if len(claimed) < 2:
            continue
        canon = vertex_dimensions(n)
        if claimed != canon:
            missing = canon - claimed
            extra = claimed - canon
            parts = []
            if extra:
                parts.append(f"claims {sorted(extra)} not canonical")
            if missing:
                parts.append(f"missing {sorted(missing)}")
            findings.append(Finding(
                "vertex", path, lineno,
                f"V{n} reading {sorted(claimed)} != canonical "
                f"{sorted(canon)} ({vertex_binary(n)}); " + "; ".join(parts) + ".",
                line))

    # (c) single-bit declaration coherence (catches the specs/04 swap directly)
    for m in re.finditer(_V, line):
        if _versionish_at(line, m.start()):
            continue
        n = int(m.group(1))
        if n in _POW2:
            dims = _dims_in(line)
            if len(dims) == 1:
                expect = DIM_BY_WEIGHT[n]
                if _norm(dims) != {expect}:
                    findings.append(Finding(
                        "vertex", path, lineno,
                        f"V{n} (single bit, weight {n}) labelled '{dims[0]}'; "
                        f"canonical = '{expect}'.",
                        line))
            break
    return findings


register(Check(
    id="vertex",
    title="Sovereignty-lattice vertex/dimension bit-order coherence",
    scan_line=_scan_vertex,
))


# --------------------------------------------------------------------------- #
#  CHECK 1b — persona ↔ vertex reidentification                                #
#  Flags any line that places a known persona at a vertex other than its        #
#  canonical (MODEL) seat. This is the reusable "reidentification and mapping    #
#  of vertex positions" pass: edit PERSONA_VERTICES, re-run, fix what it flags.  #
# --------------------------------------------------------------------------- #

# precompute alias -> (key, canonical_vertex, old_vertex) for the moved set
_PERSONA_INDEX = {}
for _k, _p in PERSONA_VERTICES.items():
    if _p["status"] != "moved":
        continue
    _canon = persona_canonical_vertex(_k)
    for _alias in _p["aliases"]:
        _PERSONA_INDEX[_alias.lower()] = (_k, _canon, _p.get("was"))


def _scan_persona(path: str, lineno: int, line: str):
    findings = []
    low = line.lower()
    # vertex tokens with positions (version-noise gated)
    verts = [(m.start(), int(m.group(1))) for m in re.finditer(_V, line)
             if not _versionish_at(line, m.start()) and 0 <= int(m.group(1)) <= 63]
    if not verts:
        return findings
    for alias, (key, canon, was) in _PERSONA_INDEX.items():
        if was is None or was == canon:
            continue
        # word-boundary match: "lethe" must not match inside "a-lethe-ia"
        for am in re.finditer(rf"\b{re.escape(alias)}\b", low):
            # flag only if the vertex NEAREST this name is the old (mis)seat —
            # so complement-pair lines naming both sisters at both seats don't trip.
            _, nearest = min(verts, key=lambda pv: abs(pv[0] - am.start()))
            if nearest == was:
                findings.append(Finding(
                    "persona", path, lineno,
                    f"{PERSONA_VERTICES[key]['aliases'][0]} at old vertex V{was}; "
                    f"canonical seat is V{canon} "
                    f"({'+'.join(sorted(PERSONA_VERTICES[key]['dims']))}).",
                    line))
                break
    return findings


register(Check(
    id="persona",
    title="Persona↔vertex reidentification (canonical seat under MODEL)",
    scan_line=_scan_persona,
))


# --------------------------------------------------------------------------- #
#  CHECK 2 — conjecture id uniqueness / collisions (Cnn defined twice)         #
# --------------------------------------------------------------------------- #
# Different repos number conjectures differently (PVM-native vs Tome-V). This
# check flags the same Cnn id being *defined* with two different one-liners in
# the SAME file, and reports the global id span so you can see gaps/overlaps.

_CONJ_DEF = re.compile(r"\bC(\d{1,3})\s*[:\-]\s*", re.IGNORECASE)


def _scan_conj(path: str, text: str):
    # only consider obvious conjecture-registry files
    base = os.path.basename(path).lower()
    if "conjecture" not in base and "conjecture" not in text[:2000].lower():
        return []
    seen: dict[int, int] = {}
    findings = []
    for i, line in enumerate(text.splitlines(), 1):
        m = _CONJ_DEF.search(line)
        if m:
            cid = int(m.group(1))
            if cid in seen:
                findings.append(Finding(
                    "conjecture", path, i,
                    f"C{cid} defined again (first at line {seen[cid]}).",
                    line))
            else:
                seen[cid] = i
    return findings


register(Check(
    id="conjecture",
    title="Conjecture-id duplicate definitions within a registry file",
    scan_file=_scan_conj,
))


# --------------------------------------------------------------------------- #
#  CHECK 3 — grimoire IPFS pin consistency (one head CID across the suite)      #
# --------------------------------------------------------------------------- #
# The "current"/"head" grimoire pin should be one CID. This collects every
# bafy... CID that appears next to a vX.Y.Z version tag and reports the set,
# so a stale pin in one repo is visible. (Reports, does not hard-fail by default.)

_PIN = re.compile(r"(v\d+\.\d+\.\d+)[^\n]{0,80}?\b(bafy[a-z0-9]{20,})", re.IGNORECASE)


def _scan_pin(path: str, text: str):
    findings = []
    for i, line in enumerate(text.splitlines(), 1):
        for m in _PIN.finditer(line):
            findings.append(Finding(
                "pin", path, i,
                f"grimoire pin {m.group(1)} -> {m.group(2)[:14]}…",
                line))
    return findings


# Pin check is informational: registered but reports as INFO (see run()).
register(Check(
    id="pin",
    title="Grimoire version<->IPFS pin sightings (informational)",
    scan_file=_scan_pin,
))


# --------------------------------------------------------------------------- #
#  Engine                                                                       #
# --------------------------------------------------------------------------- #

INFO_CHECKS = {"pin"}  # reported but never cause a non-zero exit


def iter_files(roots: list[str]):
    for root in roots:
        if os.path.isfile(root):
            yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for fn in filenames:
                if os.path.splitext(fn)[1].lower() in SCAN_EXTS:
                    yield os.path.join(dirpath, fn)


def run(roots: list[str], only: set[str], verbose: bool, base: str) -> int:
    checks = [c for c in REGISTRY if not only or c.id in only]
    line_checks = [c for c in checks if c.scan_line]
    file_checks = [c for c in checks if c.scan_file]

    findings: list[Finding] = []
    n_files = 0
    for path in iter_files(roots):
        try:
            if os.path.getsize(path) > MAX_BYTES:
                continue
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
        except OSError:
            continue
        n_files += 1
        if verbose and n_files % 500 == 0:
            print(f"  …scanned {n_files} files", file=sys.stderr)

        for c in file_checks:
            findings.extend(c.scan_file(path, text))  # type: ignore[arg-type]
        if line_checks:
            for i, line in enumerate(text.splitlines(), 1):
                for c in line_checks:
                    findings.extend(c.scan_line(path, i, line))  # type: ignore[arg-type]

    # ---- report ----
    real = [f for f in findings if f.check not in INFO_CHECKS]
    info = [f for f in findings if f.check in INFO_CHECKS]

    print("=" * 78)
    print("agentprivacy suite — semantic-root coherence audit")
    print("=" * 78)
    print(f"roots scanned : {', '.join(os.path.relpath(r, base) for r in roots)}")
    print(f"files scanned : {n_files}")
    print(f"checks run    : {', '.join(c.id for c in checks)}")
    print("canonical lattice: " +
          " · ".join(f"{w}={n}" for w, n in CANON_DIMENSIONS))
    print("-" * 78)

    by_check: dict[str, list[Finding]] = {}
    for f in real:
        by_check.setdefault(f.check, []).append(f)

    if not real:
        print("RESULT: ✔ COHERENT — no incoherences found.")
    else:
        print(f"RESULT: ✘ {len(real)} incoherence(s) found.\n")
        for cid, fs in by_check.items():
            title = next(c.title for c in REGISTRY if c.id == cid)
            print(f"### {cid} — {title}  ({len(fs)})")
            for f in fs:
                print(f.render(base))
            print()

    if info and (verbose or only & INFO_CHECKS):
        print("-" * 78)
        print(f"INFO — pin sightings ({len(info)}):")
        for f in info:
            print(f.render(base))

    print("=" * 78)
    return 1 if real else 0


# --------------------------------------------------------------------------- #
#  REMAP — apply a persona vertex move across the suite (dry-run by default)    #
# --------------------------------------------------------------------------- #

# Per-persona substitution rules, derived from PERSONA_VERTICES 'moved' entries.
# Each sub is (regex, replacement) applied ONLY on lines that mention the persona
# (its alias) or that carry the complement-pair co-occurrence. Word-boundary and
# unique-token gated to avoid collateral edits (e.g. \bV5\b never hits V51).
def _build_remap_rules():
    rules = {}
    for key, p in PERSONA_VERTICES.items():
        if p["status"] != "moved":
            continue
        old = p["was"]
        new = persona_canonical_vertex(key)
        old_bin, new_bin = format(old, "06b"), format(new, "06b")
        subs = [
            (re.compile(rf"\bV{old}\b"), f"V{new}"),
            (re.compile(rf"\b{old_bin}\b"), new_bin),
            (re.compile(rf"\bvertex-v{old}\b"), f"vertex-v{new}"),
            (re.compile(rf'("vertex"\s*:\s*")V{old}(")'), rf"\g<1>V{new}\g<2>"),
            (re.compile(rf"(\bvertex\s*:\s*){old}\b"), rf"\g<1>{new}"),
        ]
        # Memora's stratum rises 2->3 when she gains a third dimension
        if bin(new).count("1") != bin(old).count("1"):
            subs.append((re.compile(r"[Ss]tratum 2\b"), "Stratum 3"))
            subs.append((re.compile(rf"(hammingWeight\s*:\s*){bin(old).count('1')}\b"),
                         rf"\g<1>{bin(new).count('1')}"))
        rules[key] = {"aliases": [a.lower() for a in p["aliases"]],
                      "old": old, "new": new, "subs": subs}
    return rules


def remap_personas(roots, apply: bool, base: str) -> int:
    rules = _build_remap_rules()
    moved_old = {r["old"] for r in rules.values()}
    edits = []  # (path, lineno, before, after)
    files_touched = set()

    for path in iter_files(roots):
        try:
            if os.path.getsize(path) > MAX_BYTES:
                continue
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()
        except OSError:
            continue
        changed = False
        for i, line in enumerate(lines):
            low = line.lower()
            new_line = line
            # which personas' rules fire on this line?
            for key, r in rules.items():
                named = any(a in low for a in r["aliases"])
                # complement-pair co-occurrence: both old vertices present
                co = (re.search(rf"\bV{r['old']}\b", new_line)
                      and len(moved_old & _vertices_on_line(new_line)) >= 2)
                if named or co:
                    for rx, rep in r["subs"]:
                        new_line = rx.sub(rep, new_line)
            if new_line != line:
                edits.append((path, i + 1, line.rstrip("\n"), new_line.rstrip("\n")))
                files_touched.add(path)
                lines[i] = new_line
                changed = True
        if changed and apply:
            with open(path, "w", encoding="utf-8") as fh:
                fh.writelines(lines)

    mode = "APPLIED" if apply else "DRY-RUN (no files written)"
    print("=" * 78)
    print(f"persona vertex remap — {mode}")
    print("=" * 78)
    for key, r in rules.items():
        print(f"  {key:9} V{r['old']} → V{r['new']}  ({format(r['new'],'06b')})")
    print(f"\nedits: {len(edits)}  ·  files: {len(files_touched)}")
    print("-" * 78)
    # group files into approvable buckets
    from collections import Counter
    groups: dict[str, list[str]] = {}
    for path in files_touched:
        groups.setdefault(_remap_group(path), []).append(path)
    fc = Counter(e[0] for e in edits)
    order = ["A grimoire-json-snapshots", "B privacymage-blade-grimoire",
             "C spellweb-data", "D live-code", "E tome-iii-acts",
             "F other-tome-acts", "G docs-readmes", "H chronicles",
             "I cast-files", "J agentprivacy-docs", "K agentprivacy-skills",
             "L bound-collection", "M other"]
    for g in order:
        fs = groups.get(g, [])
        if not fs:
            continue
        nedits = sum(fc[p] for p in fs)
        print(f"\n[{g}]  files: {len(fs)}  edits: {nedits}")
        for p in sorted(fs, key=lambda p: -fc[p])[:8]:
            print(f"    {fc[p]:4}  {os.path.relpath(p, base)}")
        if len(fs) > 8:
            print(f"    … +{len(fs) - 8} more files")
    print("=" * 78)
    if not apply:
        print("Re-run with --apply (optionally pass specific roots/paths to scope) "
              "to write. External surfaces (NFT/key/star) are NOT auto-edited.")
    return 0


def _remap_group(path: str) -> str:
    p = path.replace("\\", "/").lower()
    if "privacymage" in p and "grimoire" in p:
        return "B privacymage-blade-grimoire"
    if "grimoire" in p and p.endswith(".json"):
        return "A grimoire-json-snapshots"
    if "/spellweb/" in p and ("/src/data/" in p or "/src/types/" in p):
        return "C spellweb-data"
    if "/agentprivacy_master/src/" in p:
        return "D live-code"
    if "bound-collection" in p or "/agentprivacy_tomes/" in p:
        return "L bound-collection"
    if "tome-iii" in p:
        return "E tome-iii-acts"
    if "/tome-" in p or "tomes/tome" in p:
        return "F other-tome-acts"
    if "/chronicles/" in p:
        return "H chronicles"
    if "/cast/" in p or "cross-shop" in p:
        return "I cast-files"
    if "/agentprivacy-docs/" in p:
        return "J agentprivacy-docs"
    if "/agentprivacy-skills/" in p:
        return "K agentprivacy-skills"
    if "readme" in p or "_list" in p or "_audit" in p or "_guide" in p or "/docs/" in p:
        return "G docs-readmes"
    return "M other"


def _vertices_on_line(line: str) -> set:
    return {int(m.group(1)) for m in re.finditer(_V, line)
            if not _versionish_at(line, m.start()) and 0 <= int(m.group(1)) <= 63}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="*", help="paths to audit (default: suite roots)")
    ap.add_argument("--only", action="append", default=[],
                    help="run only this check id (repeatable)")
    ap.add_argument("--list", action="store_true", help="list checks and exit")
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--remap-personas", action="store_true",
                    help="rewrite moved personas' vertex refs across the suite (dry-run)")
    ap.add_argument("--apply", action="store_true",
                    help="with --remap-personas: actually write the edits")
    args = ap.parse_args()

    # Windows consoles default to cp1252; force UTF-8 so glyphs/middots render.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
        except (AttributeError, ValueError):
            pass

    if args.list:
        for c in REGISTRY:
            tag = " (info)" if c.id in INFO_CHECKS else ""
            print(f"{c.id:12} {c.title}{tag}")
        return 0

    base = os.path.dirname(os.path.abspath(__file__))
    if args.paths:
        roots = [os.path.abspath(p) for p in args.paths]
    else:
        roots = [os.path.join(base, r) for r in DEFAULT_SUITE_ROOTS
                 if os.path.isdir(os.path.join(base, r))]
        if not roots:
            print("No default suite roots found next to this script; "
                  "pass paths explicitly.", file=sys.stderr)
            return 2

    if args.remap_personas:
        return remap_personas(roots, args.apply, base)

    return run(roots, set(args.only), args.verbose, base)


if __name__ == "__main__":
    raise SystemExit(main())
