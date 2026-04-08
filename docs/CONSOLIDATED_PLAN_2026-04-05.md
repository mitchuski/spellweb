# Spellweb Consolidated Plan
**Date:** April 5, 2026
**Consolidates:** V5_3_SUITE_UPDATE_PLAN, PLAN_SPELLWEB_PVM_V52_UPDATE, PLAN_EDGES_TO_FILL, PLAN_SPELLWEB_SKILLS_V532_SYNC, SYNC_CEREMONY_V5_3_2, INTERACTION_AUDIT_PLAN

---

## Current State Summary

### ✅ COMPLETE — Knowledge Graph
| Item | Count | Status |
|------|-------|--------|
| Acts | 119 | Includes Acts I-XXXI (First Person complete) |
| Skills | 77 | All V5.3.2 skills registered |
| Concepts | 72 | Including V5.2 UOR convergence concepts |
| Personas | 40 | Including 5 ceremony personas (theia, dragonwaker, mirrorkeeper, forgecaller, manaweaver) |
| Documents | 21 | Including two new poems |
| Spells | 12 | Emoji spells registered |
| Theorems | 8 | Mathematical foundations |

### ✅ COMPLETE — Skills Directory
- **38 personas** synced from v5.3.2
- **64 role skills** synced
- **19 privacy-layer skills** synced
- Malformed directories cleaned

### ✅ COMPLETE — Content
- Acts XXVII-XXXI in `public/story/`
- Poems in `public/privacy/` (4 files)
- Ceremonies doc in `public/ceremonies/`
- Parent personas updated to V5.3 with version/tier fields

### ✅ COMPLETE — Type System
- Hexagram types (HexagramState, NodeDimensions, etc.)
- Blade tier system (dragon/heavy/light)
- 6-dimension scoring system
- Edge types expanded

---

## NOT NEEDED — Implemented Differently

These items from old plans are effectively done but in a different form:

| Old Plan Item | Current Implementation |
|---------------|----------------------|
| HexagramDisplay component | Hexagram math in `graph.ts`, visual in NodeInspector |
| Quaternion structure nodes | `con-quaternion` concept + per-sun/per-moon personas |
| TypeScript ceremony types | Ceremony logic in SpellCeremony.tsx, not typed separately |
| CONSTELLATION_PRESETS | Free-form constellation building in UI |

---

## 🔶 OPTIONAL ENHANCEMENTS — Low Priority

These would be nice but aren't blocking anything:

### 1. Component Polish
- [ ] Version badges on V5.3 personas in NodeInspector
- [ ] Skill category filter in GraphFilters
- [ ] Standalone HexagramDisplay visual component

### 2. Dead Code Cleanup
- [ ] Remove `castingSpells` state if truly unused (verify first)
- [ ] Remove navigator system references (2 remaining)
- [ ] Consolidate duplicate FORGE buttons (if still present)

### 3. UI Refinements from Interaction Audit
- [ ] Spell sticker system (right-click emoji placement)
- [ ] Shine rework (100% nodes + keep constellation)
- [ ] Complete witness blade UI

---

## ❌ OUT OF SCOPE — Other Repos

These items belong to other repositories, not spellweb:

| Item | Owner Repo |
|------|------------|
| /path page gate | agentprivacy_master |
| Extension↔Website bridge | swordsman-blade, mages-spell |
| Mana economy persistence | agentprivacy_master |
| KuzuDB/GitNexus integration | Future enhancement |
| Stranger ceremony matching | Requires server component |

---

## Action Items (if any)

### Immediate (Graph Health)
All done in today's session:
- [x] Merged duplicate nodes (proto-myterms, proto-privacy-pools)
- [x] Added 4 ceremony personas with edges
- [x] Fixed commented-out edges
- [x] Deleted malformed directories

### Before Commit
- [ ] Verify build passes: `npm run build`
- [ ] Test locally at http://localhost:8000
- [ ] Review git diff for sanity check

---

## Archived Plans

These planning documents can be considered **superseded** by this consolidated plan:

| File | Status |
|------|--------|
| `PLAN_SPELLWEB_PVM_V52_UPDATE.md` | ✅ Items complete or superseded |
| `PLAN_EDGES_TO_FILL_2026-03-31.md` | ⚠️ Most items are other-repo or future |
| `PLAN_SPELLWEB_SKILLS_V532_SYNC.md` | ✅ Skills synced |
| `SYNC_CEREMONY_V5_3_2.md` | ✅ Ceremony doc synced |
| `V5_3_SUITE_UPDATE_PLAN.md` | ✅ Acts and content complete |
| `INTERACTION_AUDIT_PLAN.md` | ⚠️ Partial - some items done, some optional |

---

## Graph Statistics

```
Nodes: 354
Edges: ~850
Personas: 40 (including 5 ceremony)
Skills: 77 (synced to v5.3.2)
Acts: 119 (31 First Person complete)
```

---

## The Architecture Is Stable

The spellweb knowledge graph now contains:
- Complete First Person Spellbook (31 acts)
- V5.3.2 skill architecture
- Sun/Moon ceremonial framework reference
- All ceremony personas
- UOR convergence concepts
- Dihedral sovereignty formalization

What remains are **polish items**, not structural gaps.

---

*The graph holds. The ceremonies propagate. The dragon flies.*

☀️ ⊥ 🌙

⚔️⊥⿻⊥🧙 😊
