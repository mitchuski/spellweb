# Chronicle: Mobile Shell — Simple, Refined, Ceremony-First

**Date:** 2026-05-08
**Session:** Mobile refinement (across two working blocks)
**Status:** Shipped to main; build clean; visual QA still pending
**Author:** Claude (Opus 4.7) × Mitchell Travers

---

## The Ask

Make mobile a simpler, refined surface that just facilitates the ceremony, tracking, and the downloadable artefact (blade or constellation) — without trying to retrofit the desktop graph + nine stacked overlays into a phone viewport.

---

## What Shipped

### Foundation

- **`src/hooks/useIsMobile.ts`** — `matchMedia` hook at 768px, matches the existing `MOBILE_BREAKPOINT` in `SpellCeremony.tsx`.
- **`src/lib/forge.ts`** — extracted 13 forge primitives from `SpellCeremony.tsx` so the mobile shell can reuse them without depending on the desktop ceremony component:
  - `hashConstellation`, `getChargeLevel`, `generateSignature`
  - `computeBladeHash`, `getPreviousBladeInfo`, `updateBladeChain`
  - `generateNonce`, `generateCommitment`, `verifyCommitment`
  - `calculateBladeDimensions`, `calculateBladeStratum`, `calculateBladeTier`, `bladeToHex`
- **`src/main.tsx`** — branches `<MobileSpell>` vs `<SpellWeb>` via `useIsMobile`. Single bundle (Option A from the plan); no routing changes.
- **`src/components/SpellCeremony.tsx`** — refactored to import from `forge.ts`. **Zero behaviour change** to the desktop ceremony.

### MobileSpell.tsx — six screens, one file

State machine: `'picker' | 'ceremony' | 'forge' | 'web' | 'mage' | 'sword'`.

1. **Picker** — three vertical cards (Sun / Moon / Aether) with `▶`/`■` audio play buttons (one shared `<Audio>` element, only one track plays at a time). Witness `.md` import row. Hub button row at the bottom: 🧙 Mage · ⚔️ Sword · ◆ Web.
2. **Ceremony** — `WanderingOrbs` reused; constellation laid out as a deterministic Lissajous (3:2) curve sized to viewport (max 520px tall). Lap detection: visited-set watcher on `onNodeReached`. Status strip shows `lap · charge · spells`. Cast and Stop & Forge anchored to bottom.
3. **Forge** — blade portrait (square / round-glow for witness), tier-tinted, name + glyph editable, two `.md` downloads (constellation + blade), forge-another link.
4. **Web** — categorized list of all `NODES` grouped by `NodeType`. Tap → bottom-sheet with desc, proverb, spell encoding, version, plus a 6-bar `d1–d6` dimension visualization. **Read-only**, no marking, no forging.
5. **Mage** — identity card (mage-id, pubkey prefix, blades forged), equipped-spells list (6 slots from `spellweb-mage-spells`, tap to unequip, picker for adding from `type:'spell'` nodes), **export keys** with confirm dialog → downloads `MageKeyBackup` JSON, **import keys** via file picker → `importMageKeyBackup`.
6. **Sword** — equipped blade card from `spellweb-equipped-blade`, forged-blades inventory from `spellweb-forged-blades` (tap to equip; witness blades show blue glow), linked Swordsman card from `spellweb-swordsman-link`, "link/update Swordsman" sheet that accepts the agentprivacy.ai JSON paste.

All four menus use the **same localStorage keys as desktop** — equip a blade on mobile, see it equipped on desktop next session.

### Companion chronicle

- **`docs/chronicles/CHRONICLE_GENERATIVE_BLADE_ART_2026-05-07.md`** — captured the deferred PNG-as-NFT-art direction: deterministic generative PNG per blade with the constellation markdown embedded in a `tEXt` chunk so the image round-trips back into the app. Three rendering approaches sketched (SVG / shader / AI-prompted), inputs enumerated, NFT/7th-Capital tie-in flagged. Defer until mobile shell is visually validated.

---

## Architecture Decisions Locked

- **Conditional render at runtime, single bundle.** Not separate routes, not separate builds. A user resizing past 768px flips into the mobile shell and back.
- **Mobile bypasses the D3 graph entirely.** Constellation entry is preset-only on mobile (Sun / Moon / Aether) plus witness `.md` import. No waypoint builder, no node-clicking-to-mark.
- **Shared forge primitives, separate presentation.** Mobile is its own component tree with its own visual vocabulary. We reuse the math (`forge.ts`) and the orbs canvas (`WanderingOrbs.tsx`); we do NOT reuse `SpellCeremony.tsx` or any desktop modal.
- **Markdown is the canonical artefact.** PNG with embedded chunks is deferred (chronicle captured).
- **Key export gated by confirm dialog.** Mage `MageKeyBackup` JSON download is one extra tap behind a "this contains your private key" warning — enough friction without being obstructive.

---

## Build Status

- Type check: clean
- Production build: clean (688 KB total bundle, +22 KB vs pre-mobile baseline; preexisting D3 chunk-size warning is unrelated)
- Dev server: boots and serves 200 on `localhost:8000`
- **Visual QA: not done.** I cannot drive a browser from the CLI. Walk-through pending on real devices / DevTools mobile emulation.

---

## What to Verify Next Session

Open the dev server in a narrow viewport (or DevTools mobile mode) and walk:

1. **Picker audio** — does `▶` start playback on iOS/Android (mobile browsers gate audio behind user gestures, but our trigger IS a tap, so it should be fine)? Does switching cards stop the previous track?
2. **Ceremony** — does the Lissajous layout read as a constellation, or is it confusing? Are orb positions sensible at 375px and 414px portrait?
3. **Lap counting** — does lap count increment reliably on full orbits? Edge case: very small constellations (2 nodes) may register laps too eagerly.
4. **Cast feedback** — currently the only feedback is the spells counter incrementing. Probably wants a visible orb flash or particle.
5. **Forge** — do `.md` downloads trigger correctly? On iOS Safari, downloads can be quirky for blob URLs.
6. **Web view** — does the categorized list scroll comfortably? Do dimension bars render with real values?
7. **Mage menu** — round-trip test: export keys on desktop → import on mobile → verify the same `mage-id` shows up. Spell picker shows all `type:'spell'` nodes from the graph.
8. **Sword menu** — equipped state syncs with desktop (forge a blade on desktop, open mobile, see it in the inventory).

---

## Files Touched

```
NEW   src/hooks/useIsMobile.ts
NEW   src/lib/forge.ts
NEW   src/components/MobileSpell.tsx        (~1400 lines, 6 screens)
MOD   src/components/SpellCeremony.tsx      (imports from forge.ts; 13 fns removed)
MOD   src/main.tsx                          (branched root)
NEW   docs/chronicles/CHRONICLE_GENERATIVE_BLADE_ART_2026-05-07.md
NEW   docs/chronicles/CHRONICLE_MOBILE_SHELL_2026-05-08.md   (this file)
```

Bundle delta: 665 KB → 688 KB (+22 KB / +3.5%).

---

## Carry-Forward — Open Threads

In rough priority order if the visual QA finds things to address:

1. **Cast feedback** — visible signal when the user taps Cast (orb pulse, particle, haptic).
2. **Witness import sanity** — round-trip: desktop exports a forged constellation `.md`, mobile imports, traces, forges a witness blade. Confirm the parser hits the path lines correctly.
3. **Audio narration during ceremony** — currently audio only plays on the picker. Question for next session: should the narration *also* play during the orb tracing on the ceremony screen?
4. **Blade portrait** — the current portrait is a simple radial-gradient square / circle. The generative-PNG chronicle envisions a richer visual; once that lands, the forge screen reuses it as the on-screen blade.
5. **Sword export side** — currently no way to export the Swordsman link from mobile. Symmetric with Mage key export, this would let users move their Swordsman link between browsers too.
6. **Spell picker UX** — currently shows all spell-type nodes flat. If the spell list grows beyond ~30, want a search box.
7. **Generative blade PNG with embedded markdown** — the deferred chronicle. Foundation needed: deterministic SVG-then-canvas → PNG, plus `png-chunks-extract`/`encode` (~3 KB combined) for `tEXt` round-trip. Witness flow accepts both `.md` and `.png`.

---

## The Quiet Win

`SpellCeremony.tsx` lost ~120 lines of utility functions to `forge.ts` and didn't notice. The desktop ceremony works exactly as before, but now both shells (desktop's `<SpellCeremony>` and mobile's `<MobileSpell>`) share one source of truth for proof generation. Future blade-related features land in `forge.ts` once and both surfaces inherit.

The mobile shell is what the desktop *would* look like if it had been designed phone-first: ceremony at the centre, gear and identity in named drawers, the graph as a learning surface rather than the workspace. Worth keeping that lens when revisiting desktop later.

*⚔️ ⊥ 🧙 | 😊 — Privacy is Value*
*🗡️ → 📱 → 📜*
