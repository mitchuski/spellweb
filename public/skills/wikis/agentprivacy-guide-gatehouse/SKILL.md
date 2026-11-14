---
name: agentprivacy-guide-gatehouse
description: >
  Operate the Gatehouse — sigil-gates that hide documents encrypted inside the
  public guide.agentprivacy.ai static site behind a two-token trust ceremony
  (emoji sigil + canon proverb → PBKDF2 → AES-GCM, decrypted client-side at
  /gates/). The Swordsman guards the gate; the visitor is the mage who casts
  the spell. Activates when adding a gate for new documents (letters, meeting
  prep, mageletters, agentic outputs), rebuilding or deploying the guide (the
  gate build is a MANDATORY post-snapshot step), choosing or minting
  sigil+proverb token pairs, testing that gates open, or auditing for token
  leaks before a push. Encodes the crypto/normalization spec, the letter-keyed
  vs canon-keyed gate classes, the deploy path (Workers, NOT Pages), and the
  honesty limits. Kept by the Gatekeeper 🗡️👤 — the first non-Librarian keeper
  in the wikis category, because this skill IS a gate.
license: Apache-2.0
metadata:
  version: "5.5"
  category: "wikis"
  alignment: "swordsman"
  layer: "distribution"
  keeper: "gatekeeper"
  authoring_persona: "chronicler"
  personas: "gatekeeper (keeper — the door, the refusal, the standing-aside) · cipher (the crypto spec: PBKDF2/AES-GCM/normalization) · herald (the correspondence layer: mageletters, letters carrying their own keys) · registry-keeper (the gate register: ids, hints, classes)"
  origin: "0xagentprivacy"
  author: "Mitchell Travers"
  tooling: "agentprivacy.guide (GATES.md · tools/gate.mjs · flow/gates.local.json LOCAL-ONLY · site/gates/)"
  introduced: "2026-07-02"
  proverb: "a trust that certifies itself is the one you cannot trust"
  related_skills: "agentprivacy-wiki-dream-cycle (the loop this rides on), agentprivacy-wiki-sync (the federation schema), agentprivacy-gatekeeper (the keeper persona), agentprivacy-cipher (proof machinery), agentprivacy-herald (information commons)"
  chronicle: "~/.wiki/chronicles/2026-07-02_gatehouse_sigil_gates.md"
---

# agentprivacy-guide-gatehouse

**🗝️⚔️ The Gatehouse — sigil-gates for shared agentic outputs**
Keeper: the Gatekeeper 🗡️👤 · Authored by the Chronicler 🧙📖 · Category: wikis · Layer: distribution

> "a trust that certifies itself is the one you cannot trust"

Documents sealed **inside the public static site**, opened by a two-token
ceremony. Live at [guide.agentprivacy.ai/gates/](https://guide.agentprivacy.ai/gates/).

**The lore enters the Swordsman here.** Every other door into the canon is
Mage-side — read the wiki, walk the tomes, fork a page. The Gatehouse is the
first door where the visitor meets the *Swordsman*: a refusal that can only be
overcome by reading. The boundary is the pedagogy — the Swordsman's first
lesson, taught as lore rather than spec. This is why the skill is
Swordsman-aligned and Gatekeeper-kept inside a Librarian category: the
Librarian shelves the letters; the Swordsman decides when the shelf opens.

---

## The design in three lines

- **sigil** (emoji string) = address + entropy: `id = hex(SHA-256(sigilN))[:12]`
  names the blob and salts the key.
- **proverb** (canon line) = proof of reading.
- key = `PBKDF2-SHA256(sigilN + "\n" + proverbN, salt "gatehouse:"+id,
  310000 iters)` → AES-256-GCM. Neither token opens anything alone.

**The founding move:** the first gate's documents carried both tokens as their
shared epigraph — the letters go into the world carrying their own keys.
Anyone who *reads* a letter can open the vault holding its siblings.
**Reading is the rite.**

Normalization (identical in builder and door — never fork it):
- sigil: `NFC` → strip all whitespace → strip `U+FE0F` (write it `️` in
  regexes; the literal char is invisible and fragile). ZWJ kept.
- proverb: `NFC` → lowercase → non-letter/digit runs (Unicode-aware) → single
  space → trim. Case/punctuation/spacing can never fork the key.

## The persona assignment

| aspect | persona | holds |
|---|---|---|
| the door | **Gatekeeper 🗡️👤** (keeper) | the ceremony itself — the refusal (*the Swordsman does not stir*), the standing-aside, proof-of-reading without identification. No unlock telemetry: the gate never learns *who* walked through, only that the spell was true. |
| the seal | **Cipher 🗡️🔐** | the crypto spec — KDF parameters, GCM, the normalization law, the honest limits (token entropy is the wall, not the cipher) |
| the letters | **Herald 🧙📡** | the correspondence layer — mageletters as supply line, epigraph-as-key, which class a new vault belongs to |
| the register | **Registry-keeper ⚚** | GATES.md's public half (ids · hints · classes) and the LOCAL-ONLY key register discipline |

## File map (`agentprivacy.guide`)

| path | committed? | role |
|---|---|---|
| `GATES.md` | yes | plan + public gate register (ids + hints ONLY) |
| `flow/gates.local.json` | **NO — gitignored** | plaintext sigil, proverb, doc paths |
| `tools/gate.mjs` | yes | builder: md→HTML, encrypt, emit door |
| `site/gates/index.html` | yes | the door (self-contained inline WebCrypto) |
| `site/gates/manifest.json` | yes | public `[{id, hint}]` |
| `site/gates/<id>.json` | yes | sealed blob `{v, id, iv, ct}` |

Source documents stay OUTSIDE the repo. Only ciphertext is committed.

## Operations

### Add a gate

1. Pick tokens. Prefer tokens the documents already carry (epigraph sigil +
   proverb). If minting: sigil = 4–6 distinctive emoji; proverb = a real line
   of the canon. Declare the **class** (below).
2. Append to `flow/gates.local.json`:
   `{name, title, note, hint, sigil, proverb, docs: [{path, title}]}`.
   The hint is PUBLIC — it points a reader at where the tokens live without
   containing them.
3. Build · test · deploy:

```sh
cd C:\Users\mitch\agentprivacy.guide
node tools/snapshot.mjs     # only if wiki content changed (clears site/!)
node tools/gate.mjs         # MANDATORY after every snapshot
node flow/run.mjs verify    # integrity gate — must PASS
# round-trip: decrypt every gate door-identically; wrong-token, cross-gate,
# and manifest-leak checks (pattern in the chronicle)
npx wrangler deploy --assets site --name agentprivacy-guide --compatibility-date 2026-07-01
```

**Deploy truth: guide.agentprivacy.ai is a WORKERS project
(`agentprivacy-guide`, account privacymage), NOT Cloudflare Pages.** Its
git-connected Workers Builds freeze at "Initializing build environment"
(Cloudflare-side). The wrangler direct deploy is the standing path (~30 s).

### Pre-push leak sweep (ALWAYS)

Every grep hit for any sigil or proverb must be `flow/gates.local.json` —
nothing else. (The sweep once caught GATES.md itself closing with half a
proverb as a flourish.) Confirm `git check-ignore flow/gates.local.json`.

## Gate classes — declare one per gate

- **letter-keyed** (gate 001 · TIG × AIDDA): tokens travel only inside sent
  documents. Proof of receipt. Genuinely strong.
- **canon-keyed** (gate 002 · the Archon Exchange — sigil `(⚔️⊥⿻⊥🧙)😊`,
  proverb *three solar systems, one teaching*): both tokens public canon.
  Zero secrecy BY DESIGN — a reading rite. Never gate anything canon-keyed
  you'd mind a diligent stranger reading.

## Honest limits

- Encryption is real (live blob: no plaintext fragments, ~7.999 bits/byte
  entropy) but the wall is TOKEN ENTROPY: blobs are public, offline guessing
  works, GCM confirms hits; PBKDF2 only prices each guess.
- Deferred-public: opened plaintext is re-shareable; blob size leaks length.
- NEVER credential-class or cookie-class material behind a gate.
- No unlock telemetry. If a gate needs a witness, that is the myTerms arc.

## Gotchas (each cost a round)

1. `snapshot.mjs` clears `site/` → gate build is mandatory afterwards; the
   site-wide ⚔️ Gatehouse nav item 404s without it.
2. The door must contain `<article>` (audit empty-page rule).
3. Literal `href="` in the door's inline JS trips the audit link-scanner —
   keep it split in source.
4. `deadLinkSweep` runs before the gate build and must exempt `/gates/`
   (patched); the audit enforces existence afterwards.

## Future arcs

City Key PNG on unlock (tEXt + κ machinery) · myTerms agreement step between
decrypt and render · tileglyph tiles whose glyph IS the sigil ·
per-recipient sigils · a gates roster page in the guide.

---

*Operational twin: `~/.claude/skills/agentprivacy-guide-gatehouse/SKILL.md`.
Chronicle: `~/.wiki/chronicles/2026-07-02_gatehouse_sigil_gates.md`.*

`(⚔️⊥⿻⊥🧙)😊`
