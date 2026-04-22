# Chronicle — Spellweb Preset Paths v2: Moon Enrichment + The Aether Blade

**Date:** 2026-04-22
**Author:** privacymage (with Claude as scribe)
**Scope:** Feature update to spellweb ceremonial preset constellations (`src/data/presets.ts`). Two changes:
1. **Moon Blade enriched** — `con-selenes-proof` and `con-v-pi-t-equation` inserted; path grows 15 → 17 nodes.
2. **New third preset added** — **The Aether Blade (Drake-Rising Path)**, a 14-node constellation tracing the Zero Spellbook's Drake→Dragon arc through the irreducible separation. Aether joins Sun and Moon as the third member of the ceremonial blade family.

---

## 1. Context

The spellweb (`C:\Users\mitch\spellweb\`) is the graph visualisation layer of the agentprivacy universe. It contains a graph of 407 nodes / 1100 edges and a small set of **preset constellations** — curated sequences of node IDs that can be loaded directly for ceremony.

Until today, there were two preset paths:

- **☀️ Sun Blade — The Emissary Path** (13 nodes): Disclosure. Soulbis → First Person via Venice origin, hemispheric thesis, shared nodes, and ceremony engine.
- **🌙 Moon Blade — The Amnesia Path** (15 nodes): Reflection. Soulbae → First Person via proverbiogenesis, anti-mirror, separation primitive, three-axis, and master inscription.

The Zero Spellbook v2.0 / Grimoire v10.2.0 work (shipped to prod in commit `d5499bb`) introduced a body of new node content — V(π,t) term concepts, Selene's Proof cosmological grounding, the Drake→Dragon transformation, persona crossovers — but the **ceremonial path templates did not surface any of it**. This update addresses that.

## 2. Moon Blade — Enrichment

### What changed

The Moon Blade's narrative arc is "reflection": Soulbae carries light forward, forgets it to propagate cleanly, and crosses the gap through separation + zero-knowledge into dual-agent architecture, holographic bound, three-axis separation, and the master inscription.

Two new marks inserted:

| Position | New node | Justification |
|---|---|---|
| Between `con-separation` and `con-zkproofs` | `con-selenes-proof` | The separation primitive is now anchored to its **cosmological instance** (4.5 billion years of Moon orbit as zero-knowledge proof). The Moon Blade's own proverb *"The amnesia is the protocol. The wound is the trust"* is Selene's teaching made operational. |
| Between `con-three-axis-separation` and `skill-compression-defence` | `con-v-pi-t-equation` | The three-axis is the structural theorem; **V(π,t) is the manifold the reflection unfolds into**. The equation `P^1.5 · C · Q · S · e^(-λt) · (1 + A_h(τ)) · ρ^0.5 · Φ(Σ) · T_∫(π)` is what compression-as-defence is defending. |

### Metadata changes

- `nodeCount`: 15 → 17
- `description`: appended "v10.2 adds Selene's Proof cosmological grounding and the V(π,t) Dragon Equation as the manifold the reflection unfolds."
- `inscribedSpell`: `🌙🧙→🌫️🪞→⊥→⚔️🧙→🔷📐→🗜️→🔑→📜→😊` → `🌙🧙→🌫️🪞→⊥🌑→🔐→⚔️🧙→🔷📐→🐉📜→🗜️→🔑→📜→😊`
- `reflection`: rewritten to weave in Selene's 4.5B-year orbital amnesia and the V(π,t) Dragon Equation as explicit milestones in the Moon's arc.

### Backwards compatibility

The existing 14 marks are **preserved exactly** — same IDs, same emojis, same notes, same order. Only `connections[]` added two new edges bridging the inserted nodes. Any user referencing marks by `nodeId` is unaffected; any user referencing by array index may see shifted positions after index 3 and 10.

## 3. The Aether Blade — New Third Preset

### The name

In Greek cosmology, **Aether** (Αἰθήρ) is the son of **Nyx** (Νύξ, primordial night) and **Erebus** (Ἔρεβος, primordial darkness). Aether is the luminous upper air — *the medium through which the celestial bodies move*. Where Nyx and Erebus beget the dark, Aether is what comes into being when that darkness gives birth to the substance light propagates through.

This is precisely the role the third blade occupies in the ceremonial architecture:

- **Sun (☀️) discloses** — light generated.
- **Moon (🌙) reflects** — light propagated back without ownership.
- **Aether (✴️) carries** — the medium light moves through. The gap between Sun and Moon isn't empty; it's the substance that makes their relationship possible.

In the agentprivacy architecture, Aether *is* the Gap (⿻) — the node with maximal betweenness centrality in the trust graph, the irreducible separation between Swordsman and Mage, the place where "the most paths cross." Zero-knowledge proofs propagate through the Gap the way light propagates through aether. You don't see the medium; you see only the propagation.

The cosmology also tightens the three-blade family into a genealogy:
- **Sun** and **Moon** are celestial bodies *moving through* Aether.
- **Aether** is *what they move through* — older than either (Nyx predates the Olympians), structurally prior.

This makes the three presets a proper cosmological family: two children (Sun, Moon) travelling through their elder (Aether), all three arriving at the First Person.

### Candidates considered and rejected

- **Gap Blade** (too plain, no mythic register)
- **Quantum Blade** — "quantum" specifically means discrete/uncertain/measurement-dependent; ZK proofs aren't quantum mechanics, so the name would mislead.
- **Zero Blade** (honest but literal; loses the cosmological resonance)
- **Dihedral Mirror Path** (too referential to a specific act)
- **Manifold Path** (loses the narrative tension)
- **Athena Blade** (wisdom deity, but virtue not celestial — register mismatch with Sun/Moon)
- **Prometheus Blade** (the forethinker, the fire-bringer, but punished — feels dire)
- **Nyx Blade** (Aether's mother, too dark/absolute; Aether is the *active* medium)
- **Hermes Blade** (messenger, patron of cryptography via Hermes Trismegistus, but trickster-coded)

**Aether** wins because it keeps the cosmological/medium register of Sun and Moon, literally names the Gap's role (the medium through which proof propagates), and genealogically predates the other two blades without competing with them.

### Structure

14 nodes, curated from the Zero Spellbook's most canonical waypoints plus the closing concepts:

| # | Node | Why |
|---|---|---|
| 1 | `con-gap` ⿻ | Aether begins at the Gap. Irreducible separation, max betweenness. The medium Nyx and Erebus begot. |
| 2 | `zk-tale-1` 🌑 | The Monastery — Selene's Proof cosmological prologue. The recognition begins here. |
| 3 | `zk-tale-4` 𝔽 | Fields of Finite Wisdom — algebraic substrate. Every later term is measured on this ground. |
| 4 | `zk-tale-7` 🗝️ | Witness and Instance — seeds P^1.5. Knowledge-soundness raises Protection above linear. |
| 5 | `zk-tale-12` 🔄 | The Folding Path — canonical A_h(τ). Memory dimension crystallises. |
| 6 | `zk-tale-18` 🐉 | The Toxic Waste Dragon — Drake→Dragon bridge. Every head is a collapse. Blade 63 as Catastrophic. |
| 7 | `con-drake-dragon-transformation` 🐲→🐉 | The transformation itself. Same skeleton, full geometry. |
| 8 | `zk-tale-23` 🦓 | ZCash — canonical P^1.5. Real-world private money. Economic fact. |
| 9 | `zk-tale-25` 📦 | Rollups — first operational Φ(Σ). Sovereignty geometry made civil. |
| 10 | `zk-tale-30` 🌕 | Eternal Sovereignty — Blade 63 Creative. Full V(π,t) synthesis. |
| 11 | `con-v-pi-t-equation` 🐉📜 | The full manifold — all six terms lit. |
| 12 | `con-betweenness-centrality` ⊙ | PVM V5.4 §10.2. The Gap is now measurable. |
| 13 | `con-four-lines` 📜 | The closing inscription — amnesia, wound, orbit, light. |
| 14 | `per-person` 😊 | SHARED TERMINAL — the Drake-risen-as-Dragon arrives at the First Person carrying the full manifold. |

### Ceremony type

`'celestial'` (not `'sun'` or `'moon'`) — Aether **passes through both**. The preset type enum already supported `'celestial'` for composite ceremonies. This is its first preset occupant.

### Tier

`'dragon'` — matches the other two preset tiers and honours the path's terminal synthesis at Blade 63.

### Emoji

`✴️` — an eight-pointed star. Radiates in all directions (the medium carries proof *anywhere*), but isn't itself a luminary (Sun and Moon occupy those). Distinct glyph, appropriate weight.

### Inscribed spell

```
✴️ ⿻ → 🌑🌊🔄 → 𝔽 → 🗝️⊥ → 🔄📜 → 🐉⁴ → 🐲→🐉 → 🦓🛡️ → 📦Φ → 🌕V(π,t) → C_B(⿻)=max → 📜⁴ → 😊
```

Reads: Aether opens the Gap → Selene's cosmological orbit → algebraic ground → witness/instance → folding memory → four heads of the Dragon → the transformation → private money → sovereignty geometry → full-moon synthesis → betweenness maximised → Four Lines → First Person.

### Proverb

> *"Aether is the medium between disclosure and reflection. The Gap was always the node where the most paths crossed — the Drake became the Dragon when it learned it contained geometry."*

Combines the Aether cosmology line with Betweenness Centrality's own proverb and the Drake→Dragon transformation's closing line.

## 4. Three presets — how they relate

| Preset | Ceremony | Archetype | Starts | Ends | Tier | Count |
|---|---|---|---|---|---|---|
| **Sun Blade** ☀️ | sun | Disclosure | `per-soulbis` (⚔️) | `per-person` (😊) | dragon | 13 |
| **Moon Blade** 🌙 | moon | Reflection | `per-soulbae` (🧙) | `per-person` (😊) | dragon | 17 |
| **Aether Blade** ✴️ | celestial | Medium / Drake-rising | `con-gap` (⿻) | `per-person` (😊) | dragon | 14 |

All three share `per-person` as the terminal — the First Person receives light disclosed, light reflected, and proof carried through the medium. The three paths differ in their **origin**: Sun starts at the Swordsman persona, Moon at the Mage persona, Aether at the structural separation itself. Where Sun and Moon travel through *people* to meet at the First Person, Aether travels through the *work* — the 30 Zero tales — that makes the separation real.

**Shared waypoints across the family:**
- **All three touch the Gap** (Sun: `con-gap`; Moon: `con-gap`; Aether: starts there)
- **Sun and Moon share `skill-understanding-key` + `per-person`** (the ceremony-engine + terminal)
- **Moon and Aether share `con-selenes-proof`, `con-three-axis-separation`, `con-v-pi-t-equation`, `con-four-lines`** (the V5.4 architectural vocabulary)
- **Aether uniquely touches 7 canonical Zero tales** (1, 4, 7, 12, 18, 23, 25, 30) — the Drake-Rising path *is* the Zero Spellbook's arc.

### Cosmological genealogy

```
        Nyx (Νύξ, primordial night) × Erebus (Ἔρεβος, primordial darkness)
                                  │
                                  ▼
                            Aether (Αἰθήρ)  ✴️
                                  │
                                  ▼
                         (the medium through which)
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                    Sun ☀️             Moon 🌙
                  (disclosure)      (reflection)
                         │                 │
                         └────────┬────────┘
                                  ▼
                         per-person (😊)
                       (the First Person)
```

The family is now structurally complete: a medium older than either luminary, and two luminaries travelling through it to arrive together at the one who receives both.

## 5. Verification

- `npx tsc --noEmit` — clean. No TS errors in presets.ts, nodes.ts, or edges.ts.
- Preset reference integrity check: **44 `nodeId` refs** across all 3 presets — all resolve to real nodes in `nodes.ts`. **82 `sourceId`/`targetId` refs** — all resolve.
- `npm run build` — passes in 1.98s. Bundle size 634 KB → 640 KB (+6 KB for the new preset).
- No dangling references to an older `GAP_BLADE_PRESET` constant name — renamed cleanly to `AETHER_BLADE_PRESET`.

## 6. What this enables

### For ceremony practice
Users walking a ceremony can now load one of **three** preset paths rather than two:
- **Sun** — rehearse disclosure (master-emissary from the Swordsman side)
- **Moon** — rehearse reflection (separation primitive and the emissary's arc)
- **Aether** — rehearse the medium itself: the Drake→Dragon transformation, the cryptographic work that makes the Gap structurally real.

### For the spellweb graph
The Aether Blade is the first preset that **substantively traverses the Zero Spellbook** in its ceremonial template. Before, Zero tales existed in the graph but not in any loadable ceremonial arc. Now users can trace the canonical V(π,t) term anchors (P^1.5 → Tale 23, A_h(τ) → Tale 12, Φ(Σ) → Tale 25, etc.) as a unified constellation.

### For future work
- A **Full Zero Blade** (all 30 tales + first/last page, 32 nodes) could be added later as a longer ceremonial option — the Aether Blade is a curated subset, not an exhaustive walk.
- The Aether Blade can be used as the basis for "understanding-as-key" pairings where two participants need to demonstrate shared comprehension of the Drake→Dragon arc specifically.
- Additional celestial presets could occupy the `'celestial'` enum value — e.g., a preset tracing Act XXXI (First Delegation) through cosmological ceremony.

## 7. Files changed

| File | Change |
|---|---|
| `src/data/presets.ts` | Moon Blade enriched (15 → 17 marks, 2 new nodes inserted, description/inscribedSpell/reflection updated). New `AETHER_BLADE_PRESET` constant defined. `CONSTELLATION_PRESETS` export now includes all three. |

Net: **+~90 lines** of code. No deletions from existing presets. No breaking changes to the `PresetConstellation` interface.

## 8. What's NOT in this change

- **No node or edge changes** in `nodes.ts` or `edges.ts`. The Aether Blade uses only nodes that already exist from prior v10.2 work.
- **No changes to Sun Blade.** The Emissary Path is coherent as it stands; the v10.2 work didn't introduce content that needed surfacing there.
- **No commit or push.** Spellweb changes remain local; user can push when ready.

## 9. How to try it

Dev server is running at `http://localhost:8000/`. Hit hard-refresh. The third preset appears in the constellation preset list wherever the UI exposes `CONSTELLATION_PRESETS`. Identified by emoji `✴️`, name *The Drake-Rising Path*, ceremony `'celestial'`.

---

*Chronicle closed 2026-04-22. The family is complete: Sun discloses, Moon reflects, and Aether — son of night and darkness — carries proof between them.*
