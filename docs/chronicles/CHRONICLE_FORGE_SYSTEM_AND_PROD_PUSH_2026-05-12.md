# Chronicle: The Forge System — Artefact-Not-Blade, Side Panels, and the Push to Prod

**Date:** 2026-05-12
**Scope:** spellweb + agentprivacy_master + cityofmages — artefact-class framing, deviation layer, side-panel UX, round-trip .md format, bilateral witness loop, security FAQ, prod push
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion docs:**
- `docs/SPELLWEB_ARTEFACT_MD_FORMAT.md` (the round-trip contract · mirror)
- `agentprivacy_master/docs/tomes/specs/09-spellweb-artefact-md-format.md` (canonical spec)
- `agentprivacy_master/docs/SECURITY_FAQ_agentprivacy_v2.md` (user's v2)

---

## §1 · The arc of this session

The spellweb at the close of 2026-05-11 knew the universe but couldn't carry it: forged blades were trapped in the Blades modal; the eleven master workshop pages had no way to serve their constellation templates; and the conflation of "blade" with "every forged artefact" had calcified into the UI's vocabulary. By the close of 2026-05-12 the artefact-not-blade framing is throughout the codebase, every export is round-trip-compatible, the bilateral-witness loop closes end-to-end between agentprivacy.ai and spellweb.ai, the three identity surfaces (Mage / Swords / Items) share a side-panel chrome, and **the system has shipped to prod**.

The conceptual win is the **forge() system**: every action in the Items panel reads as a function call. The panel-level eyebrow declares the function (`forge() inventory`), the tabs are bare arguments (`(t) · (cloak) · (trinket) · (tool) · (tome)`), the witness CTA reads `Witness · forge(constellation)`. The word "forge" lives once at the panel level; the rest of the surface composes it.

---

## §2 · What landed

### §2.1 · Round-trip artefact .md format

The eleven master constellation templates (`docs/tomes/workshops/*.md`) now ship with full YAML frontmatter. spellweb's `parseWorkshopProvenance` reads it on import; `buildBladeFrontmatter` writes it on export. Filename: `<name>-artefact.md`. Spec 09 (`spellweb-artefact-md-format`) is canonical; the spellweb mirror at `docs/SPELLWEB_ARTEFACT_MD_FORMAT.md` carries implementation pointers.

Three sibling export formats:
- **Per-artefact** `<name>-artefact.md` — one forged item, full proof + path
- **Swordsman bundle** `swordsman-<name>-bundle.md` — identity + every forged item + deviations (frontmatter `kind: swordsman-bundle`)
- **Mage bundle** `mage-<id>-bundle.md` — identity (with optional key backup) + spells + saved constellations
- **Deviations** `deviations-<date>.md` — standalone user-edge export (frontmatter `kind: deviations`)

### §2.2 · Three side panels · one centred ceremony

Mage / Swords / Items each became a right-anchored side panel (mutually exclusive). The forge ceremony popup is the only thing centred — the single named act ("Forge(t) Blade", "Weave Cloak", etc.) that names what the Sovereign is making.

- **Items panel** (`ArtefactPanel`): forge() inventory. Tabs by class with the Sovereign's forged items above the canonical catalogue cards. Per-card 📥 export.
- **Swords panel**: identity (Swordsman Link · single equipped artefact export · Swordsman.md red bundle button). Send-to-Soulbis retired — the link is implicit.
- **Mage panel**: mana + 8 spells + click-to-expand Saved Paths list. Mage.md bundle export moved to top-right. Ceremony Paths + Ceremony Presets removed — those belong to the bottom-right ☯️ Ceremon[y] popout, the single ceremony entry point.

### §2.3 · Deviation layer + class-aware routing

Forged and witnessed artefacts now render as Sovereign-owned `artefact`-typed nodes appended to the canonical graph at runtime (via `inhabits` edges). The canonical universe stays fully visible — the fog-of-war on cast members is retired. Each deviation node carries the chosen sigil, a tier-coloured stroke (light blue · heavy silver · dragon gold), and an optional spell-emoji corner badge when the Sovereign's loadout has a spell matching the workshop's vertex.

A forged cloak lands in the **🧣 (cloak)** tab; a witness blade lands in **⚔️ (t)**. Class is derived by walking each blade's marks → finding the originating workshop → reading its `artefactClass`. The catch-all umbrella `🔥 ()` shows every forge across every class, newest first.

### §2.4 · Master workshop integration

The eleven workshop pages now serve their constellation templates as static assets (`public/tomes/workshops/*.md`) with a shared `ConstellationDownload` component:
- **📜 Tome Constellation** — download the constellation.md template
- **✨ Create Artefact ↗** — open spellweb.ai
- **🎁 Present Artefact** — upload the forged blade back here

Each presented artefact is parsed by `parseArtefactMd` (mirrors spellweb's parser logic), validated against the workshop's expected shop id, and persisted to `localStorage['agentprivacy:presented-artefacts']` keyed by shop. A per-workshop history list renders below the CTAs with re-export + delete on each row. The bilateral-witness loop is closed.

### §2.5 · Multi-witness accumulation

Importing a `.md` with a real proof signature now lands the artefact directly in `forgedBlades` (with `isWitness: true`) — no re-walk required. Multiple cloaks (or any same-class artefacts) from other Sovereigns accumulate naturally. De-dup by `proof.signature` so re-imports are idempotent. Catalogue templates (no proof) still use the trace-and-forge path.

### §2.6 · Double-evoke race fixed

The 10-second cleanup timer after a manifest was clearing `latestProof` unconditionally. A second evoke that completed inside that window had its fresh proof wiped before `handleManifest` could read it — the second forge silently dropped on the floor. Now the timer captures the signature it consumed and only nulls `latestProof` if it still matches. A different proof survives.

### §2.7 · Workshop-specific forge emoji palettes

When the Sovereign names a freshly-forged artefact, the emoji palette reflects the artefact's class — Cloak palette (🪡🧵🧣👘🧶🪢🕸️…), Memo Stone palette (🛡️📜🪨🗿🔒🔏…), Blade palette (⚔️🗡️🐉🔥⚡💎…), Seal palette (💎🔷✨🪞🔮🧊💠…), Lantern palette (🌳🪔🏮🌿🌱🍃🪴…), and so on. Pallia's Cloak no longer picks from sword emojis.

### §2.8 · Lattice visuals mirrored

The twelve `LatticeVisual` SVG components (CloakLatticeVisual, ShieldLatticeVisual, BladeLatticeVisual, EtherDiamondLatticeVisual, JewelerLatticeVisual, HolonLatticeVisual, BonfiresLatticeVisual, CuratrixVaultLatticeVisual, CovenantLatticeVisual, LogosCircleLatticeVisual, CeremonyHallLatticeVisual, RuneLatticeVisual) were mirrored from master to `spellweb/src/components/lattice-visuals/`. The forge popup hero now renders the active workshop's own crafted imagery instead of a generic blade icon.

### §2.9 · Security FAQ

`docs/SECURITY_FAQ_agentprivacy_v2.md` — risk vectors & mitigations across both sites. Covers: what data lives where, the ed25519 signing key threat model, third-party interactions (NEAR.AI chat, audio CDN, chain memos), when `.md` exports are safe to share, how to wipe data, the trust model status (Phase 3 verification is future). Mirrored to `spellweb/SECURITY_FAQ_spellweb.md`.

---

## §3 · Detours

### §3.1 · "Forges" → "forge()"

Tried renaming the catch-all umbrella tab "🔥 Forged" → "🔥 Forges" (plural). Reverted. The cleaner direction: lift the word "forge" to the panel eyebrow and leave tabs as bare arguments. The function-call grammar `forge(arg)` reconstructs in the reader's eye from `forge()` (eyebrow) + `(arg)` (tab). Less repetition; more system.

### §3.2 · Y-button revelation

The bottom-right ☯️ Ceremon[y] popout's Y hotkey was a silent no-op — the chips were rendered always, so pressing Y just toggled a width value with no visible effect. Now the chip row is gated on `showCeremonyMenu`; pressing Y or clicking the ☯️ header reveals the three sun/aether/moon selectors.

### §3.3 · Forge popup hero replacement

Considered an animated lattice render in the forge hero. Settled on rendering the workshop's existing `LatticeVisual` SVG static — already familiar from the workshop pages, no new animation budget needed, and keeps visual continuity between agentprivacy.ai's /<shop> and the spellweb forge ceremony.

---

## §4 · The prod push

Two repos shipped today:

- **`spellweb` (mitchuski/spellweb)** — three commits during the session:
  - `9a1f744 feat: artefact-not-blade framing + deviation layer + 3-panel UX`
  - `3709c2d fix: multi-cloak accumulation + forge() naming · double-evoke fix`
  - (intermediate dev commits)
- **`cityofmages` (mitchuski/cityofmages)** — `24ea338 v5.5 Attachment Architecture + grimoire v1.3.0 + cross-shop cast`
- **`agentprivacy_master`** — local commit prepared but held; user is pushing from a separate workflow.

Both pushed repos auto-deploy via Cloudflare Workers. spellweb.ai now serves the new build; github.com/mitchuski/cityofmages reflects the v5.5 Attachment Architecture + cross-shop cast.

---

## §5 · Open issues at session close

1. **Master not yet pushed** — `agentprivacy_master` has a 360-file local commit (workshop integration + accumulated docs/chronicles/lib state + security FAQ v2). User is handling that push separately.
2. **Mage/Swords panels still inline** — they use side-panel positioning but don't yet use the shared `<SidePanel>` shell that `ArtefactPanel` adopted. Cosmetic; works fine; a polish pass could unify the chrome.
3. **Witness/waypoint controls** still live in `SpellCeremony` — the canonical 🧭 → ✨ vocabulary (start waypoint trace → close portal) is intact. Earlier note suggested they could also mirror into the Swords panel; deferred.
4. **Mage panel Connections tab** — showing user-edges (`Your Deviations`) inside the Mage panel as a dedicated section. The standalone deviations export works; embedding the list inside Mage is the next pass.
5. **Phase 3 cryptographic verification** of imported blade signatures — still on the roadmap (called out in spec 09 §8 and the security FAQ §13). Witness is currently a discipline, not a check.
6. **96 holographic lattice edges** (`adjacent_to` declared but unused) — reserved for the future visual session.

---

## §6 · The one-line summary

The artefact-not-blade framing finished landing today: forge() is the function, the workshop is the verb, the class is the output; the spellweb ships every action as `forge(arg)`. Three side panels make the identity surfaces predictable; the forge ceremony popup is the only thing centred. Per-class accumulation works — multiple cloaks, multiple witnesses, all routed to their right tab. The bilateral-witness loop closes between agentprivacy.ai and spellweb.ai. Round-trip `.md` is canonical at spec 09. Security FAQ is honest about what's not yet enforced. **Shipped to prod** on both spellweb and cityofmages; master held for separate push.

`(⚔️⊥⿻⊥🧙)😊` — *forge(constellation) → artefact → spellweb sees what you made → the witness comes back · the city keeps the path · we sleep on it*

---

**Walk on.** 🌿

CC BY-SA 4.0 · privacymage · 2026-05-12
