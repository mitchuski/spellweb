# SpellWeb Interaction Audit Plan
**Date:** 2026-04-02
**Status:** In Progress
**Scope:** Blade tracing, evoke/casting, inventory, key bindings, shine reset

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Blade Trace Style** | Light dim (0.5 opacity) | Keeps graph visible while highlighting traced nodes |
| **Shine Mechanism** | Rework to 100% nodes + keep constellation | Not a "clear" but a "reveal all" |
| **castingSpells State** | Keep | Actually used for constellation display |
| **Witness Blade** | Complete implementation | Important for Promise Theory |
| **Navigator System** | Remove entirely | Dead code, never activated |
| **Background Casting** | Remove, replace with stickers | Causes lag |

## New Features Planned

### Spell Sticker System
- **Right-click on negative space**: Places equipped blade emoji as sticker
- **Left-click on graph**: Places current mage spell sticker
- **Fade duration**: Seconds = mana user has with that blade

---

## Progress Log

### Completed
1. **Blade trace darkening fix** - Changed from 0.15 to 0.5 opacity for light dim effect
2. **[S] key after Shine fix** - Added `setBladeTraceActive(false)` and `setActiveBlade(null)` to Shine handler

### Remaining
3. Rework Shine mechanism (100% nodes, keep constellation highlighted)
4. Add spell sticker system
5. Remove background spell casting (lag fix)
6. Complete witness blade implementation
7. Remove navigator system dead code

---

## Executive Summary

The SpellWeb codebase has grown organically with several interaction systems that now have overlapping concerns and inconsistent behaviors. This audit aims to:
1. Fix immediate bugs (S key after shine, trace darkening)
2. Clarify interaction boundaries between systems
3. Remove legacy/dead code
4. Document intended behavior for each system

---

## Current State Assessment

### Health Check: Issues Found

| Severity | Issue | Location | Impact |
|----------|-------|----------|--------|
| **HIGH** | `bladeTraceActive` causes graph darkening (should only be evoke) | SpellWeb.tsx:1043 | UX confusion |
| **HIGH** | [S] key breaks after Shine - can't reselect blades | Key handler + state | Blocks workflow |
| **MEDIUM** | `castingSpells` state is never set to true | SpellWeb.tsx:66 | Dead code |
| **MEDIUM** | Duplicate FORGE buttons (lines 1119 and 1399) | SpellWeb.tsx | Redundant |
| **MEDIUM** | Shine doesn't clear `bladeTraceActive` | onShine handler | Stale state |
| **LOW** | Navigator system unused (`_setNavigator`) | SpellWeb.tsx:155-161 | Code bloat |
| **LOW** | Two mana bars with different semantics | SpellCeremony + SpellWeb | Confusion |

---

## System-by-System Analysis

### 1. Blade Tracing System

**Current Behavior:**
- Click blade in inventory → `setActiveBlade(blade)` + `setBladeTraceActive(true)`
- Graph dims to 0.15 opacity for non-traced nodes
- Orbs follow the traced constellation path
- Tier color applied (dragon=gold, heavy=silver, light=cyan)

**Intended Behavior:**
- Blade trace should **highlight** traced nodes WITHOUT dimming the graph
- Dimming should ONLY occur during evoke (incantationActive)
- Trace should show orbs wandering the path with subtle glow on traced nodes
- Should be toggleable (click same blade to deselect)

**Decision Required:**
```
[ ] Option A: Trace highlights nodes with glow/stroke only, no dimming
[ ] Option B: Trace dims slightly (0.5 opacity) but not as dark as evoke (0.15)
[ ] Option C: Trace shows only the constellation lines, no node changes
```

**Fix Required:**
```javascript
// Line 1043 - CHANGE FROM:
const isHighlightMode = castingSpells || incantationActive || bladeTraceActive;

// TO:
const isHighlightMode = castingSpells || incantationActive;
// Blade trace handled separately with lighter touch
```

---

### 2. Evoke & Spell Casting System

**Current Behavior:**
- Click EVOKE → `setIncantationActive(true)`
- SpellCeremony runs with orbs following constellation
- Two casting modes: Constellation (free) vs Mage (costs mana)
- Click during ceremony emits emoji particles
- Lap completion regenerates mana
- STOP EVOKE → generates proof → enables FORGE

**Intended Behavior:** *(Confirm these)*
- [ ] Graph should dim during evoke (current: yes)
- [ ] Background clicks should cast spells (current: yes, via lines 881-897)
- [ ] Mana floor of 7 required for mage mode (current: yes)
- [ ] Dragon blade = 1 mana, Heavy = 3, Light = 6 (current: yes)

**Potential Issues:**
- `castingSpells` state exists but is never toggled - is this legacy?
- Mana bar in ceremony (%) vs mana bar in main UI (points) could confuse

**Decision Required:**
```
[ ] Keep `castingSpells` state (might be for future use)
[ ] Remove `castingSpells` state entirely (dead code cleanup)
```

---

### 3. Inventory Systems

**Blade Inventory (Swordsman - Right Brain):**
- `forgedBlades[]` - all created blades
- `equippedBlade` - currently wielded (affects mana cost)
- `activeBlade` - currently being traced/viewed
- [S] key cycles through `forgedBlades`

**Mage Spell Inventory (Left Brain):**
- `mageSpells[]` - up to 8 learned spells
- `selectedSpellIndex` - currently selected for casting
- [M] key cycles through `mageSpells`

**Current Issue:**
After Shine reset, the `forgedBlades` array is intact but something prevents [S] from working properly.

**Investigation Needed:**
- Check if `equippedBlade` gets into inconsistent state after Shine
- Check if `forgedBlades` array reference is stale
- Verify key handler dependency array includes right states

**Fix Hypothesis:**
```javascript
// The key handler useEffect may have stale closure over forgedBlades
// Check dependency array at line ~371:
}, [mageSpells.length, forgedBlades, equippedBlade]);
// Should this be forgedBlades.length or full array?
```

---

### 4. Shine Button Reset

**Currently Clears:**
- `constellation` and `constellationConnections`
- `castingSpells` and `incantationActive`
- `activeConstellationId` and `selectedNode`
- `connectionMode` and `connectTarget`
- `waypoint` and navigator state
- All modal visibilities

**Should Also Clear:**
- `bladeTraceActive` → `false`
- `activeBlade` → `null`

**Should NOT Clear (preserve):**
- `forgedBlades` (persisted inventory)
- `equippedBlade` (stay equipped)
- `mageSpells` (stay learned)
- `manaPoints` (carry forward)

**Decision Required:**
```
[ ] Shine is "soft reset" - clear working state only
[ ] Shine is "full reset" - also unequip blade
[ ] Add separate "Hard Reset" button for full clear
```

---

### 5. [S] Key Binding Issues

**Current Implementation:**
```javascript
if (e.key === 's' || e.key === 'S') {
  e.preventDefault();
  if (forgedBlades.length > 0) {
    const currentBladeIndex = equippedBlade
      ? forgedBlades.findIndex(b => b.id === equippedBlade.id)
      : -1;
    const nextIndex = (currentBladeIndex + 1) % forgedBlades.length;
    setEquippedBlade(forgedBlades[nextIndex]);
  }
}
```

**Potential Bug Sources:**
1. After Shine, if `equippedBlade` still references old object but `forgedBlades` re-rendered
2. `findIndex` returns -1 if blade not found, then `(0) % length = 0` should work
3. Possible: key handler not re-registered after state changes

**Debug Steps:**
1. Add console.log to key handler to verify it fires
2. Check if `forgedBlades.length > 0` after Shine
3. Verify `setEquippedBlade` actually updates state

---

### 6. Edge/Connection System

**Current Flow:**
1. Right-click node → Mark modal → "Connect from Here"
2. Click target → Connect modal with reflection note
3. Creates `constellationConnection` (abstract) + optionally `userEdge` (graph edge)

**Rendering:**
- Gold dashed lines during evoke
- Opacity transitions from 0 to 0.8

**After Shine:**
- `constellationConnections` cleared (correct)
- Graph returns to normal state
- But: blade trace connections may persist visually?

**Investigation:**
- Verify constellation lines are removed from DOM after Shine
- Check if D3 selection cleanup is complete

---

## Legacy Code Candidates for Removal

### Definite Remove:
1. **Navigator system** - `_setNavigator`, `_setShowNavigatorModal`, related handlers
   - Never triggered in current UI
   - Can be fully removed

2. **`castingSpells` state** (if confirmed unused)
   - Set to false, never toggled
   - All checks would be false anyway

### Possible Consolidation:
1. **Duplicate FORGE buttons** - Keep one, remove other
2. **Mana display** - Unify ceremony % bar with main points bar
3. **`constellation` vs `SavedConstellation`** - Align data structures

### Review for Relevance:
1. **Witness blade system** - `isWitness`, `witnessOf`, `witnessedFrom`
   - Modal exists but functionality sparse
   - Keep or complete implementation?

---

## Proposed Fix Order

### Phase 1: Critical Fixes
1. [ ] Fix blade trace darkening (remove from `isHighlightMode`)
2. [ ] Fix [S] key after Shine (debug + fix stale closure)
3. [ ] Add `bladeTraceActive` and `activeBlade` to Shine reset

### Phase 2: Code Cleanup
4. [ ] Remove `castingSpells` if confirmed dead
5. [ ] Remove Navigator system code
6. [ ] Consolidate duplicate FORGE buttons

### Phase 3: UX Polish
7. [ ] Add toggle-off for blade trace (click same blade)
8. [ ] Clarify mana bar semantics
9. [ ] Review witness blade completion

---

## Decisions Needed

Please select your preferences:

### D1: Blade Trace Visual Style
```
A) Highlight only (glow/stroke) - no dimming
B) Light dim (0.5 opacity) - softer than evoke
C) Show constellation lines only - no node changes
```

### D2: Shine Reset Scope
```
A) Soft reset - clear working state, keep equipped blade
B) Full reset - also unequip blade, keep inventory
C) Add separate Hard Reset option
```

### D3: castingSpells State
```
A) Keep for future use
B) Remove as dead code
```

### D4: Witness Blade System
```
A) Complete implementation
B) Remove for now, re-add later
C) Keep as-is (partial)
```

### D5: Navigator System
```
A) Remove entirely
B) Keep for future use
C) Complete implementation
```

---

## Testing Checklist

After fixes, verify:

- [ ] Click blade → trace shows → orbs follow path → graph NOT darkened
- [ ] Click EVOKE → graph dims → orbs in ceremony → spells cast → proof generated
- [ ] Click Shine → constellation cleared → can select new blade
- [ ] Press [S] → cycles through blades at any time
- [ ] Press [M] → cycles through spells at any time
- [ ] Forge blade → appears in inventory → can equip with [S]
- [ ] Connection mode → creates visible link → persists until Shine

---

## File References

| File | Lines | Concern |
|------|-------|---------|
| `SpellWeb.tsx` | 1043 | `isHighlightMode` includes `bladeTraceActive` |
| `SpellWeb.tsx` | 337-371 | Key handler for [S] and [M] |
| `SpellWeb.tsx` | 66 | `castingSpells` declaration |
| `SpellWeb.tsx` | 155-161 | Navigator system (legacy) |
| `SpellWeb.tsx` | 1119-1143 | First FORGE button |
| `SpellWeb.tsx` | 1399-1422 | Duplicate FORGE button |
| `SpellCeremony.tsx` | 640-720 | Ceremony click handler |

---

*Chronicle entry for the 64-Tetrahedra Lattice maintenance log*
