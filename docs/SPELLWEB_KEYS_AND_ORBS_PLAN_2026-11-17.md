# spellweb · keys in the ceremony, orbs like agentprivacy

2026-11-17 · plan for review · nothing built yet. Follows `SPELLWEB_STAR_SYNC_PLAN_2026-11-16.md`.

Mitch's choices (17 Nov):

- **Keys:** one "Your key" section inside the main ceremony panel.
- **Orbs:** match agentprivacy.
- **Approach:** plan first, then build in slices, locally, for review.
- **Keep:** artefact creation and tracing as trust tasks, and the ceremony with the recorded poems.

## Where things are today

| What | Where (file:line) | What it says |
|---|---|---|
| ✦ Star sheet, top right | `StarConnection.tsx`, mounted in `main.tsx:11` | Import City Key JSON or journey bundle · Customise on Star · "VTA signer not connected" |
| City Key.json button | `SpellWeb.tsx:5888`, `ItemLatticeView.tsx:2169` | Exports the key |
| Link Swordsman | `SpellWeb.tsx:5951–6006`, `MobileSpell.tsx:3034`, `SwordsmanImport.tsx` | The old "link your agentprivacy Swordsman identity" pop-up, needed to enable runecraft (`SpellWeb.tsx:6379`) |
| City Key & signing routes | Items catalogue header | A second key entry point |
| Orb stage | `SpellCeremony.tsx:1803–1916` | The ceremony canvas. When idle it shows as an empty dark box with the two orbs in it |
| Status strip | `SpellCeremony.tsx:2116–2230` | ⚔️ NO BLADE · mana · NO SPELLS |
| Wandering orbs | `WanderingOrbs.tsx`, mounted at `SpellWeb.tsx:5250` and `MobileSpell.tsx:813/1792` | |
| Recorded poems | `SpellCeremony.tsx:182,438` (R2 narrations; sun / moon / aether long-press) and the phone path cards ("play narration") | **Unchanged** |

agentprivacy now describes the keys this way:

- **The orb:** an emoji and a proverb unlock it.
- **Swordsman Key:** drawn from the orb, a composite of ed25519 and ML-DSA-65.
- **City Key:** where you stand on the lattice.
- **Moon keys:** sign each season.
- **Star Key:** the one browser extension (your VTA) that carries all of them.

spellweb's wording predates all of this. Underneath, the key format and journey bundle are already shared and tested: on 2026-11-17 the round trip across agentprivacy, soulbis, spellweb and mages.city passed, and `scripts/star-sync-check.mjs` passes.

## Slice 1 · Your key, in the ceremony panel

1. **A "🗝️ Your key" section in the ceremony panel's resting state**, above Evoke. It shows:
   - **Status line:** your key's Sigil seal and κ prefix, its colours as four dots, and "N stars · loadout synced / not synced". With no key it reads "Bring your City Key".
   - **Actions:**
     - Bring a key: JSON, journey bundle, or soulbis PNG. Adds the PNG reader, as agentprivacy and mages.city now have.
     - Sync my loadout: the existing `syncStarLoadout`.
     - Export key.
     - Carry journey: the existing `downloadJourney`.
   - **Star Key status:** "Star Key connected · your VTA signs" or "Get the Star Key ↗", linking to mages.city/star-key.html. It is worded as on agentprivacy.ai/city#keys: the orb unlocks, the Swordsman Key says who you are, the City Key says where you stand, the Star Key carries them.
2. **Retire the duplicate entry points.**
   - The Sword panel's City Key.json button and the Items "City Key & signing routes" each become a one-line "your key →" that opens the ceremony panel at this section.
   - The ✦ Star button becomes a shortcut to the same section, or is removed.
3. **Link Swordsman:** retire the pop-up as an entry point.
   - Runecraft's "Link Swordsman to enable runecraft" becomes "Bring your City Key to enable runecraft". The Swordsman identity already rides in the City Key's `identity` field.
   - `SwordsmanImport` stays reachable from the key section as "older: link a Swordsman card" until we know nobody needs it.
4. **Phones:** the same section sits in MobileSpell's ceremony sheet.

**Check:** star-sync-check, plus the cross-site round trip (scratchpad `ckrt_roundtrip.mjs`), plus a headless upload of JSON, PNG and bundle into the new section.

## Slice 2 · Orbs like agentprivacy

1. **At rest, the stage folds away.** The empty dark box goes. The two orbs wander over the web, using the same three modes as agentprivacy: 🌀 wander · 🏠 follow you · 👁️‍🗨️ put away. The setting is shared through the hotbar's orb button, which replaces Orbs Home / Wander in the 4-emoji box.
2. **On Evoke, the stage opens.** The orbs fly into it and the ceremony plays as now: proof bar, mana, the spell and proverb above, Forge.
3. **Spells on the orbs.** Each orb carries its equipped blade or spells as small emoji circling it, as agentprivacy's `DualOrbs` does. The "NO BLADE · NO SPELLS" strip shrinks into the hotbar as two small chips (⚔️ blade · 🧙 spells) that open the Sword or Mage panel.
4. **Colours** follow the City Key's palette, which the key already sets.

**Check:** desktop and phone screenshots at rest and mid-Evoke; Evoke → Forge still produces a blade and a witness .md.

## Optional · slice 3 · lighten the big files

`SpellWeb.tsx` is 7,338 lines and `MobileSpell.tsx` is 3,549. Move the hotbar, the key section and the orb modes into shared components both screens use, so one change lands on desktop and phone alike. No behaviour change. Only on Mitch's word.

## Not touched

- Artefact creation, the witness `.md` export, and tracing through the web as trust tasks (the Items catalogue and quest log).
- The ceremony with the recorded poems (R2 narrations).
- The graph, layers and filters.
- spellweb's own `cityKey.ts` format, which is already shared.

## Open questions for Mitch

- Remove the ✦ Star button, or keep it as a shortcut?
- Retire `SwordsmanImport` completely after slice 1, or keep it in "older"?

## Status · 2026-11-17 (slice 1 built, local, uncommitted)

Mitch: the ✦ Star button goes; the old Swordsman pop-up goes; make the key and artefact side compatible with trust tasks.

- Key card opens from the ceremony hotbar (🗝️ Key) and the phone hub (🗝️ Key tile). It takes JSON, journey bundle or soulbis PNG. The floating ✦ Star button is gone.
- Sword panel, runecraft and Items now say "Your key" and open the card. The Swordsman identity is read from the City Key (`lib/keyIdentity.ts`). `SwordsmanImport` is no longer mounted on desktop; the phone sheet is removed.
- Artefacts as Trust Tasks (`lib/artefactTask.ts`): each blade forged or witnessed becomes an `artefact/present` document, carried in the City Key journey when a key is held. The spec is at `agentprivacy_master/trust-tasks/spec/artefact/present/0.1`.
- `journey-core.js` (identical in both repos) now accepts `agentprivacy.ai/trust-tasks/spec/…` types as well as `trusttasks.org`.
- Checks:
  - agentprivacy `tests/artefact-task.test.mjs` 12/12, `chain-face` 24/24
  - spellweb `journey-roundtrip-check` PASS, `star-sync-check` PASS
  - cross-site round trip 27 OK
  - headless UI: PNG key loaded, Sword panel identity shown
- Next: slice 2 (orbs).

## Status · 2026-11-17 later (panel cleanup: one side drawer)

Mitch: "looking jarring … the items page is too popup detailed … cleaned significantly". He chose one side drawer, Items = lattice plus a slim list, and build straight away.

- **Drawer (`DrawerTabs.tsx`):** Key · Sword · Mage · Items share one 420px drawer on the right, below the header, one open at a time. Tabs sit at the top, and Esc closes it. Opening it closes the node inspector. The ceremony bar re-centres to the left of it (`--sw-drawer`).
- **Key** now renders inline in the drawer. The floating card is kept only for phones.
- **Items** is docked (`ItemLatticeView` `docked`): the lattice fills the main area, and the drawer holds the counts, Import/Evoke, a search list, and the picked item's detail. The pop-up layout code is still there.
- **The ceremony stage** folds at rest on desktop and opens once a constellation is traced or the evoke runs.
- **Layers and legend** fold into one ☰ Layers corner, folded by default.
- **Checked:** tsc clean, and a headless functional check (no screenshots, per Mitch) — one drawer at a time, Esc, ☰, no page errors.

## Status · 2026-11-17 night (the star everywhere)

- **Key tab:** shows the live Privacy Star (`KeyStar.tsx`) in the key's colours and shape, with the key name and a κ fingerprint. Mitch chose this.
- **Between the orbs:** the same star, with a faint manifold ring that ripples with the key's ε, m, n. It is a touch smaller.
- **Items** opens on the Privacy Star (`ItemStar.tsx`). The 64 vertices sit where agentprivacy.ai/stars puts them. Artefacts sit at their vertices, dim until brought back, then glow, and flare when first lit. Equipped artefacts get a ring. Click opens the item in the drawer.
- **Shared drawing:** `lib/starDraw.ts`.
- **Checked:** tsc clean, and headless checks of the star drawing, clicking a vertex to open its detail in the drawer, and the Key star. No page errors.
