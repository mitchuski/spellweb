# Spellweb + Nexus Integration Specification v2.0

## GitNexus Engine → agentprivacy-spellbook Dual-Graph System

**Version:** 2.0
**Date:** February 25, 2026
**Status:** Integration Specification — Ready for Implementation
**Spell:** ⚔️📊⊥🧙🕸️ | 😊
**Proverb:** *"Two graphs serve the same truth: what you have walked, and what exists to walk."*

---

## Critical Update: Dual-Graph Architecture

The original spec conflated two distinct purposes into a single `/spellweb` route. This v2 spec separates them:

| System | Route | Purpose | Data Source |
|--------|-------|---------|-------------|
| **Spellweb** | `/spellweb` | User's personal journey — lit spells, skills, user connections | `localStorage` + grimoire cards |
| **Nexus** | `/nexus` | Complete knowledge graph — tales, protocols, standards, concepts | `nodes.json` + GitNexus pipeline |

**Read the companion document:** `docs/NEXUS_SPELLWEB_ARCHITECTURE.md` for full architectural rationale.

---

## Reading Order for Coding Agent

1. `docs/NEXUS_SPELLWEB_ARCHITECTURE.md` — dual-graph separation (START HERE)
2. This document — implementation details
3. `CHRONICLE_SPELLWEB_GENESIS.md` — decision rationale
4. GitNexus README at https://github.com/abhigyanpatwari/GitNexus
5. Existing `src/lib/spellweb/` and `src/components/spellweb/` code
6. Current `public/spellweb/nodes.json` and `edges.json`

---

## 1. What Already Exists (Preserve This)

### Spellweb Journey System (Working)

The current Spellweb implementation handles the **user's personal journey**:

| File | Purpose | Status |
|------|---------|--------|
| `src/app/spellweb/page.tsx` | Route page, loads KG data | Keep, enhance |
| `src/app/spellweb/components/ForceGraph.tsx` | D3.js force graph for KG view | Move to `/nexus` |
| `src/components/spellweb/SpellwebViewer.tsx` | react-force-graph-2d for journey | Keep as primary `/spellweb` |
| `src/lib/spellweb/types.ts` | Journey types (SpellwebNode, SpellwebLink) | Keep |
| `src/lib/spellweb/kg-types.ts` | KG types (SpellwebKGNode, SpellwebKGEdge) | Move to `src/lib/nexus/` |
| `src/lib/spellweb/builder.ts` | buildSpellweb() from user selections | Keep |
| `src/lib/spellweb/loader.ts` | Load KG data from JSON | Move to `src/lib/nexus/` |
| `public/spellweb/nodes.json` | 17 KG nodes (tales, protocols, standards) | Move to `public/nexus/` |
| `public/spellweb/edges.json` | 15 KG edges | Move to `public/nexus/` |

### Key Insight

`SpellwebViewer.tsx` uses `react-force-graph-2d` and `buildSpellweb()` — this is the **journey graph**.
`ForceGraph.tsx` uses raw D3.js and loads from `nodes.json` — this is the **knowledge graph**.

They're already separate implementations! We just need to route them correctly.

---

## 2. New Directory Structure

```
src/
├── app/
│   ├── spellweb/                          # USER JOURNEY (existing, cleaned up)
│   │   ├── page.tsx                       # Uses SpellwebViewer
│   │   └── layout.tsx
│   │
│   ├── nexus/                             # KNOWLEDGE GRAPH (new)
│   │   ├── page.tsx                       # Full KG explorer
│   │   ├── layout.tsx                     # Nexus-specific layout
│   │   ├── [nodeId]/
│   │   │   └── page.tsx                   # Deep-link to node
│   │   └── components/
│   │       ├── NexusGraph.tsx             # D3.js (moved from spellweb/ForceGraph)
│   │       ├── NodeInspector.tsx          # Click-to-inspect
│   │       ├── GraphFilters.tsx           # Guild/type/maturity filters
│   │       ├── ParadoxPlane.tsx           # Scatter plot view
│   │       └── NexusChat.tsx              # Graph-grounded Soulbae
│   │
│   └── api/
│       └── nexus/
│           └── query/route.ts             # Optional: server-side Cypher queries
│
├── lib/
│   ├── spellweb/                          # USER JOURNEY (existing)
│   │   ├── types.ts                       # SpellwebNode, SpellwebLink
│   │   ├── builder.ts                     # buildSpellweb()
│   │   └── labels.ts                      # UI labels
│   │
│   └── nexus/                             # KNOWLEDGE GRAPH (new, from spellweb/kg-*)
│       ├── types.ts                       # NexusNode, NexusEdge (was kg-types.ts)
│       ├── loader.ts                      # loadNexusGraph() (was spellweb/loader.ts)
│       ├── schema.ts                      # KuzuDB schema (Phase 6)
│       ├── query.ts                       # Cypher helpers (Phase 6)
│       └── overlay.ts                     # Map spellIds ↔ nexusNodeIds
│
├── components/
│   ├── spellweb/                          # USER JOURNEY (existing)
│   │   └── SpellwebViewer.tsx             # react-force-graph-2d
│   │
│   └── nexus/                             # KNOWLEDGE GRAPH (new)
│       ├── NexusViewer.tsx                # Wrapper component
│       └── OverlayToggle.tsx              # "Show My Path" toggle
│
└── data/
    └── nexus/                             # Build-time generated (Phase 7)
        ├── knowledge-graph.json           # Full canonical graph
        └── persona-paths.json             # Constellation paths

public/
├── nexus/                                 # Moved from public/spellweb/
│   ├── nodes.json                         # KG nodes
│   └── edges.json                         # KG edges
```

---

## 3. Phase 0: File Migration (Day 1)

**Goal**: Clean separation without breaking anything.

### Step 0.1: Create Nexus directories

```bash
mkdir -p src/app/nexus/components
mkdir -p src/lib/nexus
mkdir -p src/components/nexus
mkdir -p public/nexus
```

### Step 0.2: Move KG files

```bash
# Data files
mv public/spellweb/nodes.json public/nexus/nodes.json
mv public/spellweb/edges.json public/nexus/edges.json

# Types (copy, then update imports)
cp src/lib/spellweb/kg-types.ts src/lib/nexus/types.ts
cp src/lib/spellweb/loader.ts src/lib/nexus/loader.ts

# Component (copy, then adapt)
cp src/app/spellweb/components/ForceGraph.tsx src/app/nexus/components/NexusGraph.tsx
```

### Step 0.3: Update imports in moved files

**`src/lib/nexus/loader.ts`**:
```typescript
// Change import path
import type { NexusNode, NexusEdge } from './types';

// Change fetch path
const nodesRes = await fetch('/nexus/nodes.json');
const edgesRes = await fetch('/nexus/edges.json');

// Rename exports
export async function loadNexusGraph(): Promise<NexusGraphData> { ... }
export type NexusGraphData = { nodes: NexusNode[]; edges: NexusEdge[] };
```

**`src/lib/nexus/types.ts`**:
```typescript
// Rename types for clarity
export interface NexusNode { ... }  // was SpellwebKGNode
export interface NexusEdge { ... }  // was SpellwebKGEdge
```

### Step 0.4: Update existing Spellweb page

**`src/app/spellweb/page.tsx`** — Remove KG loading, use only SpellwebViewer:

```typescript
'use client';

import { useState, useEffect } from 'react';
import AppNav from '@/components/AppNav';
import SpellwebViewer from '@/components/spellweb/SpellwebViewer';
// Import journey data, not KG data

export default function SpellwebPage() {
  // Load user's journey data, not the full KG
  // SpellwebViewer handles this internally via buildSpellweb()

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text">Your Spellweb</h1>
          <p className="text-text-muted mt-1">
            Your journey through the grimoires. Light spells, forge connections.
          </p>
          <a href="/nexus" className="text-accent hover:underline text-sm">
            Explore the full Nexus →
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-surface/50 bg-surface/10 min-h-[560px]">
          <SpellwebViewer
            selectedSpellIds={[]}  // Will come from context/props
            selectedSkillIds={[]}
            spellCards={[]}
            skillFiles={[]}
            showTerms={true}
          />
        </div>
      </main>
    </div>
  );
}
```

### Step 0.5: Create Nexus route

**`src/app/nexus/page.tsx`**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppNav from '@/components/AppNav';
import { loadNexusGraph } from '@/lib/nexus/loader';
import type { NexusGraphData } from '@/lib/nexus/loader';

const NexusGraph = dynamic(
  () => import('./components/NexusGraph'),
  { ssr: false, loading: () => <div className="animate-pulse">Loading Nexus...</div> }
);

export default function NexusPage() {
  const [data, setData] = useState<NexusGraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNexusGraph()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load nexus'));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Nexus</h1>
            <p className="text-text-muted mt-1">
              The complete knowledge graph. Tales, protocols, standards, and their connections.
            </p>
          </div>
          <a href="/spellweb" className="text-accent hover:underline text-sm">
            ← Your Journey
          </a>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}
        {data && !error && (
          <div className="rounded-2xl overflow-hidden border border-surface/50 bg-surface/10 min-h-[600px]">
            <NexusGraph nodes={data.nodes} edges={data.edges} />
          </div>
        )}
        {!data && !error && (
          <div className="rounded-2xl border border-surface/50 bg-surface/10 min-h-[320px] flex items-center justify-center text-text-muted">
            Loading nexus…
          </div>
        )}
      </main>
    </div>
  );
}
```

### Step 0.6: Update navigation

**`src/lib/nav.ts`**:
```typescript
export const NAV_LINKS = [
  // ... existing ...
  { href: '/spellweb', label: 'Your Web', emoji: '🕸️' },
  { href: '/nexus', label: 'Nexus', emoji: '📊' },
];
```

**Milestone**: Two routes working. `/spellweb` shows personal journey, `/nexus` shows full KG.

---

## 4. Node Types & Visualization Spec

### Nexus Node Rendering

| Node Type | Shape | Color | Size Base |
|-----------|-------|-------|-----------|
| tale | Polygon (complexity sides) | Guild color | 14px |
| protocol | Polygon (complexity sides) | Guild color | 14px |
| standard | Rounded rectangle | Guild color | 16px |
| primitive | Circle | Grey | 10px |
| concept | Hexagon | Domain color | 12px |
| persona | Circle with ring | Domain color | 16px |

### Guild Colors (from existing kg-types.ts)

```typescript
export const GUILD_COLORS: Record<Guild, string> = {
  swordsman: '#D4A017',  // Amber
  mage: '#7C6FEF',       // Violet
  emergent: '#C4A265',   // Gold
  bridge: '#5B8C5A',     // Sage green
};
```

### Maturity Sizes (from existing kg-types.ts)

```typescript
export const MATURITY_SIZES: Record<Maturity, number> = {
  concept: 8,
  spec: 14,
  implementation: 20,
  deployed: 28,
};
```

### Edge Rendering

| Edge Type | Style | Color | Arrow |
|-----------|-------|-------|-------|
| principle_extends | Solid | Grey | Yes |
| implements | Solid | Cyan | Yes |
| inscription_echo | Dashed | Grey | No |
| guild_bridge | Gradient (amber→violet) | — | No |
| dependency | Dotted | Grey | Yes |

---

## 5. Immediate Next Steps (Today)

### Task 1: Execute Phase 0 file migration
1. Create directories
2. Move/copy files as specified
3. Update imports
4. Verify both routes load without errors

### Task 2: Add navigation links
1. Update `nav.ts` with Nexus route
2. Add cross-links between Spellweb ↔ Nexus pages

### Task 3: Clean up SpellwebViewer usage on `/spellweb`
1. Remove KG loading from spellweb page
2. Let SpellwebViewer handle journey data internally

### Task 4: Verify NexusGraph renders correctly
1. Confirm D3.js force simulation works on `/nexus`
2. Confirm all 17 nodes display with correct visual encoding

---

## 6. Full Implementation Timeline

| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| 0: Migration | Day 1-2 | Two routes, clean separation |
| 1: Nexus Polish | Week 1 | Full visual encoding, interactions |
| 2: Node Inspector | Week 2 | Click-to-inspect, filters |
| 3: Paradox Plane | Week 3 | Scatter plot view mode |
| 4: Overlay Bridge | Week 4 | "Show My Path" on Nexus |
| 5: Expanded Data | Week 5-6 | 50+ nodes, full relationships |
| 6: Graph RAG | Week 7-8 | KuzuDB + Soulbae integration |
| 7: Build Pipeline | Week 9-10 | Auto-generate from docs |

---

## 7. Privacy Architecture (Unchanged from v1)

The dual-graph separation **reinforces** the Swordsman/Mage architecture:

### Spellweb (Swordsman-Protected)
- User's selected spells → `localStorage`
- User's connections → `localStorage`
- Comprehension markers → `IndexedDB` (Phase 5+)
- **Never transmitted**

### Nexus (Mage-Shared)
- Canonical graph → Static JSON
- Read-only from user perspective
- Grows only at build time (from docs)

### The Gap
- Viewing the Nexus doesn't reveal which nodes you've lit in your Spellweb
- The overlay ("Show My Path") is computed client-side only
- No API call reveals your personal journey

---

## 8. Open Questions

1. **Should `/spellweb` be embedded in `/mage` only, or standalone?**
   - Current: Standalone route
   - Alternative: Only accessible from MagePanel
   - Recommendation: Keep standalone but also embed in `/mage`

2. **Nexus URL structure: `/nexus` or `/spell-nexus`?**
   - `/nexus` is cleaner
   - `/spell-nexus` is more descriptive
   - Recommendation: `/nexus` (shorter, memorable)

3. **Keep `public/spellweb/` directory for backwards compat?**
   - If external links exist to nodes.json, keep a symlink
   - Recommendation: Clean break, move to `public/nexus/`

---

## 9. Files That Must Not Be Modified

- `src/components/spellweb/SpellwebViewer.tsx` — core journey renderer (enhance only)
- `src/lib/spellweb/builder.ts` — journey construction logic
- `src/lib/spellweb/types.ts` — journey type definitions
- Story/mage/evoke routes — unrelated to this integration

---

*Begin with Phase 0. The migration is mechanical but foundational.*

*⚔️🕸️⊥🧙📊 | 😊*

*"The map is not the territory. But two maps — one personal, one universal — together become the compass."*
