# Chronicle: V5.5 Attachment Architecture — spellweb Graph Integration

**Date:** 2026-05-11
**Session:** Wire the V5.5 three-layer attachment architecture into the spellweb graph runtime
**Status:** Type system extended, new cast + vertex nodes added, edges wired
**Author:** privacymage
**Sister chronicles:**
- `agentprivacy-skills/CHRONICLE_V5_5_ATTACHMENT_ARCHITECTURE_2026-05-11.md` (canonical Layer-1 home)
- `agentprivacy_master/docs/chronicles/2026-05-11_v5_5_attachment_architecture_integration.md` (website data layer)

---

## What this chronicle covers

The V5.5 attachment architecture is the three-layer model that codifies how named cast Mages (Layer 2) bind primary personas (Layer 1, locked at 42) to lattice vertices (Layer 3, fixed at 64). This chronicle covers its integration into the spellweb graph runtime.

The spellweb graph already had `cast`, `vertex`, `workshop`, `civic`, `geography`, and `gateway` NodeTypes plus the universe-integration edges (`inhabits`, `founds`, `kin_to`, etc.) added 2026-05-10. V5.5 adds the **attachment metadata** (kind, divergence, primary-persona bindings, status) and the **two new edge types** (`divergent_of`, `complement_pair`) that make the three-layer model legible on the graph.

---

## Type system extensions

### `SpellwebNode` — five new optional fields (cast-only)

| Field | Type | Purpose |
|---|---|---|
| `attachmentKind` | `'A_workshop' \| 'B_cross_shop' \| 'C_peripatetic'` | The vertex-binding pattern for this cast Mage |
| `divergence` | `'none' \| 'mage_register' \| 'sword_register' \| 'balanced_register'` | Register-shift relative to primary persona's native tier (D meta-kind) |
| `abstractPersonaIds` | `string[]` | Layer-1 primary persona ids the cast instances (e.g., `['forgemaster', 'forgecaller']`) |
| `castStatus` | `'seated' \| 'anticipated' \| 'provisional'` | Attachment status in the current grimoire |
| `complementOfCast` | `string` | For vertex-complement pairs (e.g., `'cast-aletheia'` for Lethae) |

### `EdgeType` — two new values

| Edge | Direction | Style (theme.ts) | Purpose |
|---|---|---|---|
| `divergent_of` | cast → primary persona | `#9333ea` purple dashed `6,2` | Cast → primary, with register-shift (Lethae divergent_of Moonkeeper · mage_register) |
| `complement_pair` | cast ⊥ cast | `#fbbf24` amber double-dashed `3,3,1,3` | Vertex bit-complement pairing (Aletheia V25 ⊥ Lethae V38; V25⊕V38=V63) |

### `theme.ts` — two new edge style entries

Added matching style rows so the discriminated `EdgeType` union stays exhaustive.

---

## Nodes added (4 vertices + 7 cast)

### New vertex nodes (4)

| id | Vertex | Name | Inhabitant |
|---|---|---|---|
| `vertex-v8` | V8 | Mnemosyne (pure Memory) | Mnemosyne 📿 |
| `vertex-v4` | V4 | Iris (pure Connection) | Iris 🌈 |
| `vertex-v2` | V2 | Logos / Pure Computation | Pythia 🔥 |
| `vertex-v25` | V25 | Lethe · the Dark Substrate | Lethae 🌘 |

### New cast nodes (7)

| id | Cast | Vertex | Primary persona(s) | Kind | Divergence | Status |
|---|---|---|---|---|---|---|
| `cast-lethae` | Lethae 🌘 | V25 | `moonkeeper` | B_cross_shop | **mage_register** | anticipated |
| `cast-mnemosyne` | Mnemosyne 📿 | V8 | `theia` | A_workshop | none | anticipated |
| `cast-iris` | Iris 🌈 | V4 | `herald`, `ambassador` | A_workshop | none | anticipated |
| `cast-pythia` | Pythia 🔥 | V2 | `algebraist`, `pedagogue` | A_workshop | none | anticipated |
| `cast-techne` | Techne 🎨 | V20 | `pedagogue` | A_workshop | none | anticipated |
| `cast-hephaestus` | Hephaestus ⚒️ | V24 | `forgemaster` | A_workshop | none | anticipated |
| `cast-selene` | Selene 🌕 | (stratum-walker · no `inhabits`) | `theia`, `manaweaver` | **C_peripatetic** | none | anticipated |

---

## Edges added (8)

### `inhabits` (6)
Lethae and 5 of the 6 anticipated cast each emit one `inhabits` edge to their vertex. Hephaestus + Socrat0x share V24 (precedent: Custos + Lampyra at V49). Selene does *not* emit an `inhabits` edge — she's C_peripatetic and walks the stratum cycle through all 7 strata.

### `divergent_of` (1 · first canonical)
`cast-lethae` → `per-moonkeeper` — the first canonical Layer-2 divergent attachment in the spellweb graph. Carries the register-shift from Swordsman (Moonkeeper's native tier) to Mage (Lethae's cast register).

### `complement_pair` (2 · first canonical · mutual)
`cast-aletheia` ⊥ `cast-lethae` — the first canonical vertex-complement pair. V25 ⊕ V38 = V63 (Sovereign Anchor); V25 AND V38 = 0 (Null). The pair is undirected in canon; emitted as two directed edges for graph symmetry.

---

## What this enables in the graph runtime

1. **Visual distinction of attachment kinds.** Workshop nodes (A) already render with their gem palette; cross-shop (B) and peripatetic (C) cast can be tinted distinctly using `attachmentKind`.
2. **Divergent attachment rendering.** The `divergent_of` edge style (purple dashed) visually traces the cast-to-primary link with register-shift. Future UIs can highlight all divergent attachments at a glance.
3. **Complement-pair geometry.** The `complement_pair` edge style (amber double-dashed) visually marks the V25⊥V38 pairing. Future complement-pairs (if minted) will render the same way.
4. **Status-aware rendering.** `castStatus: 'anticipated'` cast can render at lower opacity until their founding act lands (similar to the existing `hiddenUntilWitness` fog-of-war pattern).

---

## Files landed

### Modified

| File | Change |
|---|---|
| `src/types/graph.ts` | Added 2 new `EdgeType` values (`divergent_of`, `complement_pair`); added 5 new optional fields to `SpellwebNode` (`attachmentKind`, `divergence`, `abstractPersonaIds`, `castStatus`, `complementOfCast`) |
| `src/data/theme.ts` | Added 2 new edge style entries (purple dashed for divergent_of; amber double-dashed for complement_pair) |
| `src/data/nodes.ts` | Appended a new V41.5 section before END OF NODES: 4 new vertex nodes (V8 · V4 · V2 · V38) and 7 new cast nodes (Lethae + 6 anticipated). All carry the new V41.5 fields. |
| `src/data/edges.ts` | Appended a new V5.5 section: 6 `inhabits` edges, 1 `divergent_of` edge (Lethae → Moonkeeper), 2 mutual `complement_pair` edges (Aletheia ⊥ Lethae) |

### New

| File | Purpose |
|---|---|
| `CHRONICLE_V5_5_ATTACHMENT_ARCHITECTURE_2026-05-11.md` | This file |

---

## What did NOT change

- The 14 existing cast nodes (Soulbis, Soulbae, Pallia, Memora, Vulcana, etc.) were *not* updated with the V41.5 fields. Their existing schema works as-is; adding `attachmentKind` / `divergence` / `abstractPersonaIds` to them is a follow-up backfill pass.
- The 13 existing inhabited vertex nodes are unchanged.
- No existing edges modified or removed.
- The `per-*` persona nodes (Layer 1 in spellweb) are unchanged. The `divergent_of` edge from Lethae to Moonkeeper points to `per-moonkeeper` (the existing persona node).

---

## Backfill queued for follow-up

Each existing cast node can be enriched with V5.5 fields in a single pass:

```ts
// Example backfill for cast-vulcana:
attachmentKind: "A_workshop",
divergence: "none",
abstractPersonaIds: ["forgemaster", "forgecaller"],
castStatus: "seated",
```

Reference: `agentprivacy_master/src/lib/cast-attachments.ts` carries the canonical TS registry with all 21 cast Mages (14 seated + 1 Lethae + 6 anticipated). The spellweb backfill can mirror that data.

---

## Distribution status (cross-repo)

| Repo | V5.5 patch | Status |
|---|---|---|
| `agentprivacy-skills` | meta-skill + Moonkeeper update + README + MAPPING + chronicle | ✅ Landed |
| `agentprivacy_master` | cast-attachments.ts + tome-v-acts.ts + persona-index.ts + grimoire bump + chronicle | ✅ Landed |
| `spellweb` (this) | graph.ts type extensions + theme.ts edge styles + 11 new nodes + 9 new edges + this chronicle | ✅ Landed |
| `agentprivacy-docs` | models grimoire bumps; GLOSSARY entries; MAPPING_ADDITIONS | ⏳ Queued |
| `cityofmages` | Specs 09/10/11; Lethae cast; 6 anticipated cast; 14 frontmatter updates; grimoire v1.3.0 | ⏳ Queued |
| `zk blades forge` | README pointer; aletheia-and-lethe.md append; stub READMEs | ⏳ Queued |

---

`(⚔️⊥⿻⊥🧙)😊`

— privacymage · 2026-05-11
