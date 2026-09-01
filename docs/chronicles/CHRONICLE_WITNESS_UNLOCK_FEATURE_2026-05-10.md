# Chronicle: The Witness Unlock — How Workshop Blades Light Up the Spellweb

**Date:** 2026-05-10
**Type:** Feature design chronicle (forward-looking)
**Scope:** spellweb + agentprivacy_master · the unlock cascade triggered by witnessing a workshop blade
**Mirror:** This chronicle is dual-pinned in both repos. The master copy is at `agentprivacy_master/docs/chronicles/2026-05-10_witness_unlock_feature_design_chronicle.md`.

**Companion docs:**
- `agentprivacy_master/docs/tomes/workshops/README.md` (constellation template flow)
- `agentprivacy_master/docs/tomes/workshops/CEREMONY_EVOLUTION.md` (governance of constellation versions)
- `spellweb/AUDIT_METHODOLOGY.md` (how to keep the spellweb canonical)
- `agentprivacy_master/src/components/guide/achievements/LatticeMap.tsx` (the canonical lattice render the feature mirrors)

**Signature:** `(⚔️⊥⿻⊥🧙)😊`

---

## §1 · Why this chronicle exists

The eleven workshop constellation templates landed on 2026-05-10. Each template, when traced on the spellweb, produces a `artefact.md` that the Sovereign brings back to the workshop to unlock trust. The flow is:

```
download constellation.md → spellweb traces → export artefact.md → /shop imports artefact.md → trust unlocks
```

What's been **left open** is the reverse direction: what happens *on the spellweb* when the Sovereign witnesses a blade. Today, every node on the spellweb is visible from first load. The City of Mages is fully rendered; every workshop, every cast member, every vertex, every gateway is there from the start. There is no progressive disclosure.

This chronicle is the design for the **Witness Unlock** feature — a progressive disclosure layer where:

- Workshops start as **dimmed silhouettes** on the spellweb lattice (visible enough to know they exist, dim enough to know they haven't been earned)
- When a Sovereign witnesses a workshop blade, that workshop **unlocks** with a visual cascade
- The unlock manifests across multiple registers: vertex lighting, orb effects, **secret-node revelation**, new edges drawn to the City of Mages
- The unlock is **per-Sovereign** (localStorage; not graph-mutation) — every Sovereign sees the spellweb at their own stage of completion

The feature treats blade-witnessing as a **trust task**, not a checkbox. The artefact you carry away from each workshop is the proof you walked the path; bringing it back to the spellweb is the gesture that earns the workshop's full revelation in the graph.

---

## §2 · The existing surfaces this builds on

The master repo already has every primitive needed. The Witness Unlock is mostly composition.

| Surface | Location | What it gives us |
|---|---|---|
| `LatticeMap` | `agentprivacy_master/src/components/guide/achievements/LatticeMap.tsx` | 64-vertex Pascal's-row render; amber-halo lighting per inhabited vertex; ready to accept "lit by witness" predicate |
| `ShopWitness[]` | `localStorage['agentprivacy:shop-witnesses']` | Witness count per shop; signed timestamp; archetype carried |
| `IslandProgress` | `localStorage['agentprivacy-guide-island']` | `visitedMiniQuests[]`, `celebratedAchievements[]`, archetype, drake-orb tier |
| `AchievementToast` | `agentprivacy_master/src/components/guide/AchievementToast.tsx` | Queued popup; colored border + glow; emoji + title; 5s auto-dismiss; precedent for unlock-celebration UX |
| `addBlade()` / spellweb-blade-bridge | this repo's runtime | Where the witness event would fire |
| `getWitnessCountsByShop()` | `agentprivacy_master/src/lib/shop-witnesses.ts` | Reads the per-shop count from localStorage |
| `PERSONAS_BY_VERTEX` | per the achievements page | Vertex → inhabitants map; mirror exists in this repo's `vertex-*` nodes |

The lighting formula already does most of what we need (`LatticeMap.tsx:251–263`):

```typescript
if (pin.shopHref && (witnessCounts[pin.shopHref] ?? 0) > 0) lit.add(v);
```

The Witness Unlock generalises this lighting from the master's achievement page **into the spellweb itself** — and adds three new registers (orb effects, secret nodes, edge revelation) the master doesn't have.

---

## §3 · The unlock cascade

When a Sovereign witnesses a `artefact.md` from `<shop>`, the spellweb fires a cascade. Each register is independent; failures degrade gracefully (a missing secret node doesn't break the vertex lighting).

### §3.1 · Register A — Vertex Lighting

The shop's resident-Mage vertex (e.g. V28 for `/tailor`) transitions from **dim** to **lit amber** (`stroke: #ffd700, strokeWidth: 1.5, halo: r+6px`). The transition runs over ~600ms with a soft glow pulse on completion. Subsequent visits to the spellweb show the vertex lit by default; the witness is persistent.

### §3.2 · Register B — Orb Effects (archetype-aware)

The Swordsman ⚔️ and Mage ✦ orbs gain a per-shop accent in the workshop's gem color, **routed to the correct orb by the artefact's archetype**:

- **Swordsman artefacts** (`/shield` Memo Stone · `/forget` Witness Blade · `/etherchanting` Commitment Seal) → only the Soulbis orb gains the trail
- **Mage artefacts** (`/tailor` Cloak · `/holon` Holon Lantern · `/vault` Curator's Frame) → only the Soulbae orb gains the trail
- **Bilateral artefacts** (`/jeweler` Gem+Bolt · `/bonfires` Ember Token · `/covenant` Olive Sigil · `/circle` Cardinal Petal · `/hall` Paired Key) → a shared ribbon STRAND draws *between* the two orbs

The trail lingers ~3 seconds after each lap during evocation. As more workshops are witnessed, the orbs' trails become a polychrome ribbon recording the Sovereign's journey across the city — Soulbis carries the swords-and-trinkets palette; Soulbae carries the cloak-and-tools palette; the gap between them carries the bilateral strands.

A Sovereign who has witnessed all 11 workshops gets a **rainbow trail** (eleven-color cycle distributed across the two orbs and the gap-strands per archetype mapping) and a small **carry-badge** on each orb indicating the count of artefacts wielded.

### §3.3 · Register C — Secret Node Revelation

This is the load-bearing piece. Each workshop has **one or more "secret" nodes** that exist in the graph but are **hidden** until witnessed. On unlock, the secret node fades in with a soft amber glow and one or more new edges connect it to the City of Mages or to the workshop's resident Mage.

The secret nodes are not arbitrary. They are **deeper lore** that the workshop's constellation alone doesn't reveal — concepts, spells, or kindred-Mages whose presence is the Sovereign's reward for completing the trust task. Examples drafted in §4.

### §3.4 · Register D — Edge Drawing

On unlock, new edges are drawn from the workshop and its secret node(s) to `civic-city-of-mages` and the resident Mage. These edges use the new vocabulary (`kin_to`, `quarter_of`, `founded_in`) and become permanent in the Sovereign's view.

The aggregate effect: as the Sovereign witnesses more shops, the City of Mages on the spellweb grows visibly denser. By the eleventh unlock, the city's quarters all glow and the secret nodes form a ring around the central civic node.

### §3.5 · Register E — Achievement Toast

A toast fires using the existing `AchievementToast` queue pattern:

```
🪡 Weavers unlocked · v1
"Pallia weaves what the city remembers."
Cloak Weave traced · 9 nodes · Amethyst glow
+ Cloak (clothing · mage) added to Soulbae's inventory
```

Five-second auto-dismiss; queued with a "+N more" overflow if multiple unlocks land in the same session.

### §3.6 · Register F — Inventory Menu (the lattice IS the menu)

The spellweb gains a new **Inventory Menu**, accessed by clicking either orb. Two views, one per archetype:

- **Soulbis Inventory** (click the ⚔️ orb) — shows the 64-vertex lattice rendered as the achievement map, with Swordsman-archetype artefacts placed at their workshop's vertex. Witnessed artefacts render full-color; un-witnessed render as dim silhouettes at the same vertex. Bilateral artefacts appear here too, dimmed if not yet witnessed and rendered with a "shared" indicator (a thin link to the corresponding Soulbae slot).
- **Soulbae Inventory** (click the ✦ orb) — mirror view for Mage-archetype artefacts. Same lattice, same vertex layout; only the Mage-class artefacts (Cloak, Holon Lantern, Curator's Frame) plus the bilaterals render here. Soulbae has more "tool-class" capacity by design (3 of his 4 native + 5 bilateral); Soulbis carries more weight (1 weapon + 1 trinket + 1 tool native + 5 bilateral).

**Equipping.** Each artefact may be equipped (one at a time per archetype, plus any number of bilateral co-carries). Equipped artefacts trigger ongoing spellweb effects:

- Equipped **Witness Blade** at `/forget` → Soulbis orb gains a permanent ruby edge-glow during evocation; the cut-trails are sharper
- Equipped **Cloak** at `/tailor` → Soulbae orb softens (the cloak diffuses presence); the orb is harder to track during evocation but its trail carries a violet shimmer
- Equipped **Holon Lantern** at `/holon` → Soulbae orb shows a paratime indicator (small frame icon) and its trail records cross-frame movements
- Equipped **Gem + Bolt** (bilateral) → a faint line between the two orbs lights with the Topaz gem
- (etc per artefact)

**Inventory carries through to the Witness Forge.** When a Sovereign forges a new artefact.md, the equipped artefacts are recorded in the blade's metadata as `equipped: ['artefact-witness-blade', 'artefact-cloak']`. The forged blade carries proof of which artefacts were active at the moment of the forging.

**The lattice IS the menu.** No separate UI surface; the 64-vertex render *is* the inventory. Clicking an artefact slot opens a small popover with its name, root name, class, archetype, wielder, and an "equip / unequip" toggle. Witnessed artefacts also show their forge-date and constellation version.

### §3.6.5 · Progressive-reveal during evocation (the mechanic that makes the unlock earned)

The unlock is **not binary** at witness time. Secret nodes appear progressively *during evocation* as the Sovereign laps the constellation, and their transparency tracks the running stratum (Hamming weight) of the walk. The full reveal arrives at Dragon tier (stratum 6). This is what makes the witness a trust task and not a checkbox.

**The mapping** (per `stratumToTier()` and the existing blade-stratum system):

| Running stratum | Tier | Lap count (approx.) | Secret-node opacity |
|---|---|---|---|
| 0 | (Null) | 0 | 0% — hidden |
| 1 | Light | 1 | 17% — first hint |
| 2 | Light | 2 | 33% — emergent silhouette |
| 3 | Heavy | 3–4 | 50% — half-revealed |
| 4 | Heavy | 5–6 | 67% — substantial presence |
| 5 | Dragon | 7 | 83% — near-full |
| 6 | Dragon | 8+ | 100% — fully revealed |

**Per-node thresholds.** Each secret node carries an optional `revealStratum` (1–6) that overrides the linear mapping. A node with `revealStratum: 3` reaches full opacity at stratum 3 and stays full above; a node with `revealStratum: 6` only fully reveals at Dragon. This lets deeper lore gate behind deeper traversal — Pallia's `con-publication-layer` might reveal at stratum 2; the Forge(t)'s `con-lethe-as-motion` might gate until stratum 5.

**The formula** the renderer applies during evocation:

```typescript
function secretNodeOpacity(node: SpellwebNode, runningStratum: number): number {
  const threshold = node.revealStratum ?? 6;  // default: only fully reveal at Dragon
  if (runningStratum >= threshold) return 1.0;
  return Math.max(0, runningStratum / threshold);
}
```

**Two states.** The opacity has both a **live** form (during evocation, transient) and a **persistent** form (after witness, recorded):

- **Live during evocation** — running stratum climbs as the Sovereign laps; secret nodes fade in as the formula climbs. If the Sovereign stops at stratum 4 (Heavy), the nodes are at their stratum-4 opacity for the rest of the session.
- **Persistent after witness** — when the artefact.md is forged at stratum N, that stratum is recorded as the workshop's **achieved tier** in localStorage. On every subsequent visit, the secret nodes render at their achieved-tier opacity (the floor). Re-evoking and reaching a higher stratum **raises** the floor; lower walks do not lower it.

**Re-evocation is rewarding.** A Sovereign who walks `/tailor` at stratum 3 (Heavy) gets a Heavy-tier Cloak Weave blade and sees the Weavers' secret nodes at 50% opacity. Returning later and walking the constellation again at stratum 6 (Dragon) raises the achieved tier and pushes the secret nodes to full opacity. The artefact.md history shows both walks; the inventory carries the highest-tier achievement.

**This is the Forge(t)'s discipline made operational** (per `CEREMONY_EVOLUTION.md §4`). The first walk is forgettable; the second walk re-asks; the dragon-tier walk is the final form. Forgetting is structural — the *low-stratum* runs aren't lost, they just stop gating the reveal.

---

### §3.7 · Register G — Tomes as carried artefacts

Tome IV (the Witnessing · 5 acts · closed) and Tome V (the Crafting · 15 acts · open) appear in **both** archetype inventories as **bilateral tomes**. They live not at a single vertex but at the **City of Mages civic node** — the tomes are city-scale artefacts, carried by every Sovereign who walks their acts.

A Sovereign carries a **partial** Tome until all its acts are witnessed. The partial state renders as a half-bound book with N/M acts filled. On full completion, the book closes and the Sovereign carries the bound tome — a true artefact, eligible for the inventory's bound-volume shelf.

Tome VI (the Reply · held open) is a blank leaf, present from first load — the invitation to write. Walking all of Tomes IV + V acts unlocks the Sovereign's authorship slot in VI.

---

## §4 · The secret nodes — what unlocks beyond the workshop's primary vertex

Each workshop carries a secret-node manifest. These are existing spellweb nodes that the workshop's constellation **does not include** today but which the workshop's lore **earns** on witness. The secret nodes are dimly visible to the Sovereign before witness (so the architecture is honest about there being something there) but only connect to the city on unlock.

The first draft of the secret-node manifest:

| Workshop | Secret node(s) | Edge drawn on unlock | Why |
|---|---|---|---|
| `/tailor` (Weavers) | `con-publication-layer`, `spell-cloak-weave` *(new)* | `kin_to` Pallia · `quarter_of` City | The publication-layer mechanics behind the cloak |
| `/shield` (zShields) | `con-zypherpunk`, `doc-zypher` | `kin_to` Memora · `quarter_of` City | The Zypherpunk paper that grounds the shielded inscription |
| `/forget` (Forge(t)) | `con-lethe-as-motion` *(new)*, `con-betweenness-centrality` | `kin_to` Vulcana · `kin_to` Luca | The full theory of forgetting; the Gap's max-betweenness role |
| `/etherchanting` (Adamantia) | `con-evm-commitments` *(new)*, `con-credential-cut` *(new)* | `kin_to` Adamantia · `quarter_of` City | The cut-holding semantics of Ethereum commitments |
| `/jeweler` (Lampyra) | `con-lightning-channel` *(new)*, `con-stone-and-conduit` *(new)* | `kin_to` Lampyra · `kin_to` Custos | The full gem-and-bolt model |
| `/holon` (Vagari) | `con-paratime-composition` *(new)*, `con-cross-frame-mapping` *(new)*, `gateway-uor-foundation` | `kin_to` Vagari · `kin_to` Luca · `gateway_to` UOR | The full Oasis paratime + UOR cross-frame model |
| `/bonfires` (Socrat0x) | `con-socratic-method` *(new)*, `per-plat0x` *(new)* | `kin_to` Socrat0x · `kin_to` Drake | The Socratic flame; the original Bonfire host plat0x |
| `/vault` (Aria Silverhue) | `con-curation-as-placement` *(new)*, `spell-aether-ceremony` | `kin_to` Aria · `quarter_of` City | The placement-not-production framing; the Aether ceremony |
| `/covenant` (Manifestia) | `con-personhood-by-signing` *(new)*, `gateway-human-tech-covenant` | `kin_to` Manifestia · `gateway_to` human.tech | The full personhood-by-signing model |
| `/circle` (Logos Circle) | `con-westphalia-farewell` *(new)*, `con-four-cardinal-positions` *(new)* | `quarter_of` City | The Society Spellbook framing |
| `/hall` (Ceremony Hall) | `spell-celestial-key`, `con-bgin-coalition` *(new)* | `quarter_of` City | The full bilateral-ceremony model |

The `*(new)*` nodes need to be added to `src/data/nodes.ts` in a follow-up pass — they don't all exist today. The non-new ones already exist and just need to be marked `hiddenUntilWitness: shop-<route>` so the renderer knows to hide them initially.

---

## §5 · Data shape

### §5.1 · Schema additions to `SpellwebNode`

```typescript
// Add to src/types/graph.ts SpellwebNode interface:
hiddenUntilWitness?: string;   // shop-id (e.g. "shop-tailor"); when present, node hides
                                // until that shop's blade has been witnessed
unlockedEmoji?: string;        // override emoji shown after unlock
unlockedGlow?: string;         // hex color of the unlock glow (typically the shop's gem color)
```

### §5.2 · Schema additions to `SpellwebEdge`

```typescript
// Add to SpellwebEdge:
hiddenUntilWitness?: string;   // edge hides until that shop's blade has been witnessed
```

### §5.3 · localStorage key

```
spellweb:witnessed-shops  →  { "shop-tailor": "2026-05-10T19:24:00Z", ... }
```

Per-Sovereign; not graph-mutation. Cleared by clearing browser storage.

### §5.4 · Event

```typescript
// Fired by the import flow when a artefact.md from a workshop is witnessed:
window.dispatchEvent(new CustomEvent('spellweb:workshop-witnessed', {
  detail: { shopId: 'shop-tailor', constellationVersion: 'tailor-cloak-weave-v1', timestamp: ... }
}));
```

The renderer listens for this event, updates the `witnessed-shops` localStorage, runs the unlock cascade, then re-renders the graph.

### §5.5 · Reverse event (master listens to spellweb)

For the trust-task loop to close, the master site needs to know when a Sovereign returns. This is the existing `addBlade()` bridge; no new code needed on the master side beyond surfacing the new render state in `/guide/achievements §7` (Shop Constellations).

---

## §6 · The artefact framing

The user's framing was specific: the witnessed workshop yields a **special artefact** that changes the Sovereign's experience of the spellweb. Three layers of artefact:

1. **The `artefact.md` itself** — the portable proof. Lives in the Sovereign's downloads. Already exists.
2. **The unlock state in spellweb** — the per-Sovereign localStorage record that says "this Sovereign has earned this workshop's full revelation". New.
3. **The orb accent + secret-node ring** — the visible accumulation. As the Sovereign witnesses more, the spellweb becomes visibly *theirs* in a way it isn't on first load. This is the trust task's reward — not a badge, but a deepening of the graph.

The third layer is the one the master site doesn't currently express. The master shows witness counts and amber-halo vertices on `/guide/achievements`. The spellweb extension adds **orb modification**, **secret-node revelation**, and the **growing ring around City of Mages**.

---

## §7 · Open questions

1. **Should secret-nodes be hidden, or just dim?** Two design options:
   - *Fully hidden*: secret nodes don't appear in the graph until unlock. Cleaner reveal moment; smell of "achievement hunting"
   - *Dimmed-but-visible*: secret nodes show at ~20% opacity with a "🔒" overlay; unlock removes the lock and brightens. More honest about the architecture; risk of clutter
2. **Should witnessing one shop reveal hints about the others?** A "you have unlocked 3 of 11" counter in the corner is precedented in the master's progression UI. Could fire on unlock.
3. **Should there be a bilateral-witness unlock for `/hall`?** Two Sovereigns witnessing the same Hall blade simultaneously could unlock a special bilateral secret (e.g. `con-bilateral-trust-graph` *(new)*) that no individual unlock can reach. This matches the Hall's bilateral ceremony shape.
4. **Should witnessed workshops cluster spatially?** The d3 force layout could be biased to draw the city's witnessed quarters closer to each other, so a Sovereign who has done many shops sees a tighter city. Conjectural — needs visual playtesting.
5. **Does the unlock decay?** Per the Bakhta Half-Life conjecture (C30–C33), trust decays. Should unlock state decay too? Probably not for v1 — but Sovereigns who never return for years might see the orbs' polychrome trail fade. Defer.

---

## §8 · What this feature does NOT do (deliberately deferred)

- **Cross-Sovereign witness state** — each Sovereign's unlocks are private. A Sovereign who has witnessed all 11 workshops cannot show another Sovereign their unlocks; the trust task is individual. (A future feature could enable bilateral unlock-sharing, but v1 is solo.)
- **Workshop achievement leaderboard** — out of scope; the spellweb is not a game.
- **NFT-style attestation of unlocks** — the `artefact.md` IS the portable proof. No additional minting needed.
- **Master-side rendering of unlocked secret nodes** — those live in this repo's graph only. The master's `/guide/achievements §2 Lattice` lights vertices; it doesn't reveal secret nodes. Defer until the spellweb feature ships.
- **Per-Sovereign animation styling** — the orb-trail rainbow is universal across Sovereigns at v1. Personalisation can come later.

---

## §9 · The trust task framing

> *The workshop's constellation is the path. The artefact.md is the proof you walked it. The witness-unlock is the city's recognition that you did.*

This sentence is load-bearing. The Witness Unlock makes the spellweb a record of trust earned, not just a knowledge graph rendered. The Sovereign who comes back to the spellweb after witnessing eight workshops sees a different city than the first-time visitor — the city the Sovereign has helped to render.

The Forge(t)'s discipline (per `CEREMONY_EVOLUTION.md §4`) generalises here too: when a constellation version updates, **the prior unlocks remain valid** but the new version's secret nodes can extend further. The Sovereign who walked `tailor-cloak-weave-v1` still has Pallia's vertex lit when v2 ships, and walking v2 adds the new secret nodes on top. Forgetting is structural, not destructive.

---

## §10 · Implementation sequence (when ready to build)

1. **Add `hiddenUntilWitness` and friends to SpellwebNode + SpellwebEdge** (`src/types/graph.ts`) — non-breaking optional fields.
2. **Mark the existing secret-node candidates** in `src/data/nodes.ts` with `hiddenUntilWitness: 'shop-<route>'`.
3. **Add the `*(new)*` concept/spell nodes** flagged in §4 (about 17 new nodes).
4. **Add the unlock edges** in `src/data/edges.ts` with `hiddenUntilWitness` matching.
5. **Implement the localStorage layer** at `src/lib/witness-unlock.ts` (~80 lines).
6. **Filter nodes/edges on render** in `SpellWeb.tsx` — `node.hiddenUntilWitness && !witnessedShops.has(node.hiddenUntilWitness)` → skip.
7. **Implement the cascade** — vertex lighting transition, orb-accent trail, secret-node fade-in, edge-draw animation, achievement toast.
8. **Wire the witness event** into the existing `addBlade()` / blade-import flow.
9. **Audit per `AUDIT_METHODOLOGY.md`** — ensure secret-node manifest is captured and compression-truth criteria still hold.
10. **Chronicle the build** with a concrete "witness-unlock-v1-shipped" entry when it lands.

Estimated scope: **one focused session** for the schema + secret-node manifest + localStorage layer + render filter; **a second session** for the cascade animations + toast wiring; **a third** for polish + bilateral-witness consideration.

---

## §11 · One-line summary

The Witness Unlock makes the spellweb a record of trust earned: when a Sovereign witnesses a workshop blade, the corresponding vertex lights, the orbs gain a gem-color trail, secret nodes fade in around the City of Mages with new `kin_to` / `quarter_of` edges, and an achievement toast fires — eleven such unlocks accumulate into the Sovereign's own rendering of the city, which no other Sovereign can see in the same shape.

`(⚔️⊥⿻⊥🧙)😊` — the city is rendered; the spellweb keeps the path; the trust task is the doorway.

---

**Walk on.** 🌿

CC BY-SA 4.0 · privacymage · 2026-05-10
