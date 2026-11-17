# spellweb ↔ agentprivacy.ai: the star, the orbs, the artefacts (tracking, 2026-11-16)

Companion to `agentprivacy_master/docs/RESYNC_PLAN_2026-11-16.md` (the master site resync + evidence star).
Purpose: keep track of what the master update changes in **trust tasks** and **artefacts**, and what spellweb
should change in step: its style, the floating orbs, and artefacts adding to a personal star.
Nothing built yet. Local only; no pushes without Mitch's word.

## 1. Where spellweb stands (read today)

| piece | file | state |
|---|---|---|
| forge → artefacts (11 classes) | `components/SpellWeb.tsx` (7,338 lines), `lib/forge.ts`, `lib/workshop-artefact.ts` | forged items kept in `localStorage[forgedBlades]`, drawn as `artefact` deviation nodes (`inhabits` → workshop) |
| .md round-trip | `docs/SPELLWEB_ARTEFACT_MD_FORMAT.md` ↔ master `docs/tomes/specs/09` | per-item `<name>-artefact.md`, `swordsman-<name>-bundle.md` |
| City Key + Star | `lib/cityKey.ts`, `lib/starLoadout.ts`, `lib/starAppearance.ts`, `components/StarConnection.tsx` | key imported/exported, star geometry (ε, m, n, core, ⚔️:🧙) + palette equipped |
| floating orbs | `components/WanderingOrbs.tsx` (507 lines) | ⚔️/🧙 pair orbits shaped by the equipped star's geometry; orbit emojis = equipped blade + mage spells; return to ceremony on evoke; trace a blade's constellation |
| journey | `lib/journey-core.js`, `journey-store.ts`, `cityKeyJourney.ts` | journey bundles fold into the City Key |
| last commit | 5974e05, 14 Nov | 1 untracked DREAM record |

So spellweb is already halfway there: the orbs read the Star, the forge makes artefacts, the key carries a journey.
What it lacks is the **star evidence chain**: no mark, no leaves, no "your stars".

## 2. What the master update changes that spellweb must follow

| master change (plan §) | effect on spellweb |
|---|---|
| trust task types `agentprivacy.ai/tt/…/0.1` (§3) | spellweb emits the same shapes, its own family: `artefact/forge`, `artefact/witness`, `spell/cast`, `constellation/trace`, `familiar/bind`, `chart/hold` |
| `artefact/present` on master consumes spellweb's .md (§3) | the exported artefact .md carries its **leaf hash** (`star_leaf:` in frontmatter, additive to spec 09) so presenting on master links to the forge star instead of minting an unrelated one |
| one mark across sites via City Key `mark` + `root` (§3, "bring your towel") | spellweb is its own origin, so its own mark unless the key is brought; `cityKey.ts` gains the same optional fields; `StarConnection` import/export carries them; v1 keys without them still load |
| Worker chain, one Durable Object per chain (§3) | spellweb writes to `chain=spellweb` on the same Worker; stays device-only until that exists |
| workshop restyle, artefact class per card (§2) | spellweb's 11 class names + verbs stay the shared vocabulary; any rename on master is mirrored in `workshop-artefact.ts` and spec 09 in one pass |
| orb game, next (§5d) | master's `DualOrbs.tsx` (1,731 lines) and spellweb's `WanderingOrbs.tsx` are two orb engines; one shared behaviour spec, two renderers (see §3) |

Rulings carried: stars are records, not credentials; content never in the clear (hash + sealed box); veil
(hashes show, results behind); the unpublished paper name stays off public pages; types are ours, not trusttasks.org specs.

## 3. Proposals for spellweb

**A. Artefacts add to your star.** Forging, witnessing, binding a familiar, holding a chart each append a leaf
(`sha256(type | content-hash | time)`), kept on the device first (port of HH `mark.js`, same module as master's
planned `lib/mark.ts`, ideally one shared file). Root = `sha256(root | leaf)` from 64 zeros, as on the HH guide.
On the graph: each artefact deviation node gets a small star mark when its leaf exists; the Items panel shows
"your stars: n · root ab12…".

**B. The orbs carry your stars.** The orbs' trail becomes your constellation: the leaves you made this visit
stay as faint points along the path, joined when you trace. A forge or cast flashes a new point as it lands.
Above a few hundred stars, a glow per lattice state instead of every point (master plan §4.4 rule).

**C. The orbs are dressed by artefacts.** Today only the blade and spells orbit. Extend by class: a garment
(Cloak) changes the orb's outline, a tool its orbit pattern (Lantern = slow halo, Seal = locked ring), a
trinket the orbiting emoji. Rule: one artefact per slot per orb, chosen in the Items panel, saved with the key.

**D. Orbs as navigation.** Clicking an orb offers "carry me": to your latest star, your next unlit workshop
vertex, or (with the key brought) across to the master workshop or mages.city. Same playful-navigation
intent as master §5d, so the two orb engines should share the behaviour spec.

**E. Style.** Bring the front-layer rule into the side panels: one figure + a few lines + the doors, detail
under "Read more"; use the equipped star's palette for panel chrome (already in `starAppearance`).

## 4. Order (suggested)

1. Agree the trust task family names with the master slice A (no build until master's `mark.ts` shape is fixed).
2. A on spellweb, device-only; `star_leaf` in the .md export; spec 09 updated on both sides.
3. City Key `mark`/`root` fields in both `cityKey.ts` copies (round-trip test with star-key + soulbis parsers).
4. B + C (orbs), after the master orb review (§5d) gates.
5. Worker chain write (`chain=spellweb`) once the Durable Object exists.
6. D + E.

## 5. Open for Mitch

- One shared orb behaviour across master and spellweb, or let spellweb's orbs diverge as the graph's own?
- Does spellweb get its own chain, or fold into agentprivacy.ai's chain as a type family?
- Artefacts dressing the orbs: by class slot (C), or free choice of any earned artefact?
