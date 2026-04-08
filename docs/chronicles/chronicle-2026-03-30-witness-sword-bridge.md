# Chronicle: Witness Sword Bridge

**Date:** 2026-03-30
**Feature:** Forged Blade → Soulbis Stance System

---

## Overview

The witness sword flow bridges **spellweb.ai** forged blades into the **agentprivacy.ai** Soulbis stance system. Each blade provides a stance configuration (hex lines + facet emojis) that you can assign to your stance ring.

## Master & Emissary Controls

The control scheme maps to the **Master & Emissary** principle:

| | Swordsman ⚔️ (Master) | Mage 🧙 (Emissary) |
|--|--|--|
| **Side** | Right brain / Right click | Left brain / Left click |
| **Nature** | Deliberate, attentive | Reactive, executive |
| **Action** | Reveals options | Places marks |
| **Hold** | Take stance (show hex grid) | View spell orbit |
| **Left Click** | — | Cast spell / Place stance mark |
| **Full Menu** | S key | M key |

### Swordsman (Master) — Right Click
The master **attends**. Right-click to take stance and reveal options.

- **Right Click (hold)** = Take stance — reveals hex grid of blade options
- **Left Click (on option)** = Mage places that stance's mark
- **S Key** = Full stance editor with blade inventory

The sword doesn't act alone — it *informs* the mage what to place.

### Mage (Emissary) — Left Click
The emissary **executes**. All marks are placed through left-click.

- **Left Click (tap)** = Cast last selected spell immediately
- **Left Click (hold)** = View spell orbit, choose one
- **Left Click (on stance)** = Place stance mark (when stance menu open)
- **M Key** = Full spell/orbit editor

### The Communication
```
Swordsman (right-click) → reveals options
         ↓
    You see hex grid
         ↓
Mage (left-click) → places the mark
```

This maps to hemispheric function:
- **Right brain** = spatial, holistic — the stance you *take*
- **Left brain** = sequential, executive — the mark you *place*

## Blade Ring: 7 Slots (6 + 1 Swap)

You need **6 blades** to complete your stance ring — one blade per line (L1-L6). Plus you have a **7th swap slot** so you can always rotate a blade in without removing one.

```
L1 ─── Blade A ─── Protection line
L2 ─── Blade B ─── Delegation line
L3 ─── Blade C ─── Memory line
L4 ─── Blade D ─── Connection line
L5 ─── Blade E ─── Computation line
L6 ─── Blade F ─── Value line
⇄  ─── Blade G ─── Swap slot (ready to rotate)
```

Each blade contributes:
- Its **facet emoji** to that line's orbit position
- Its **hex bit** to that line's yin/yang state

### Assign Blades

1. **Import blades** from spellweb.ai (drop .md files)
2. **Assign each blade** to a line (L1-L6) or swap slot
3. **Swap** between lines using the ⇄ button
4. **Complete ring** = all 6 lines have blades assigned

### Import Flow

1. **Forge blade** on spellweb.ai (evoke ceremony → forge → name)
2. **Export .md** from your blade inventory
3. **Drop .md file** in the Witness Blade import area (S hotkey menu)
4. **Blade added to inventory** — ready to assign to a line
5. **Assign to L1-L6** or swap slot

## Two Ways to Connect

### 1. Send to Soulbis (from spellweb)

When you **equip a blade** in your forged inventory (double-click), a new button appears:

```
⚔️ Send to Soulbis
```

This opens agentprivacy.ai/spells with your blade data encoded in the URL. The blade imports automatically.

### 2. Witness Blade Import (on agentprivacy)

Press `S` to open the swordsman stance editor. You'll see:

```
👁️ Witness Blade — drop .md file or click
```

Drop your exported blade `.md` file (like `universe-blade.md`). The system parses:

- **Blade hex** → stance lines (e.g., `3F` = all yang `[1,1,1,1,1,1]`)
- **Constellation path** → first 6 node emojis fill the facet ring (LOCKED)
- **Signature** → stored for verification (e.g., `SPELL-YW5I59-1Q`)
- **Tier** → dragon/heavy/light based on stratum

## Hex → Stance Mapping

The 6-bit blade hex encodes which dimensions are active:

| Bit | Dimension | Active Emoji |
|-----|-----------|--------------|
| 5 | Protection | 🛡️ |
| 4 | Delegation | 🤝 |
| 3 | Memory | 📜 |
| 2 | Connection | 🔗 |
| 1 | Computation | ⚡ |
| 0 | Value | 💎 |

**Examples:**
- `3F` (111111) = Dragon blade, all 6 active, all stance lines yang
- `10` (010000) = Only delegation active
- `15` (010101) = Delegation + Connection + Value

## Locked Facets

When a blade is equipped, the stance editor shows:

```
L1  🔒 🔑⚔️🧙→😊  Genesis Ceremony
L2  🔒 🗡️🔮       Act 2: Dual Ceremony
L3  🔒 📖💰       Act 1: Venice, 1494
L4  🔒 ✦         7th Capital
L5  🔒 ✦         The Gap ⊥
L6  🔒 😊        Person 😊
```

These are the facets that orbit Soulbis. You cannot change them unless you:
- **Unequip** the blade (reverts to manual selection)
- **Equip a different blade** (switches to that blade's facets)
- **Import more blades** with different constellation paths

## Promise Theory

This implements bilateral promise exchange:

1. **You promise** your constellation path (forged blade export)
2. **Soulbis promises** to carry your facets in orbit
3. **Neither commands** — both voluntarily participate

The witness blade becomes proof of your journey through the lattice.

## Data Storage

```
agentprivacy_spellweb_blade_inventory   — Array of all imported blades
agentprivacy_spellweb_stance_loadout    — Which blade assigned to L1-L6 + swap
agentprivacy_spellweb_equipped_blade    — Legacy single-blade (deprecated)
agentprivacy_spellweb_blade_meta        — Legacy metadata (deprecated)
```

## Stance Loadout Format

```json
{
  "L1": "SPELL-ABC123-X",
  "L2": "SPELL-DEF456-Y",
  "L3": null,
  "L4": "SPELL-GHI789-Z",
  "L5": null,
  "L6": null,
  "swap": "SPELL-JKL012-W"
}
```

---

*Forged in the 64-Tetrahedra Lattice*
*(⚔️⊥⿻⊥🧙)🙂*
