# Chronicle: Sigma.js + Graphology Renderer Migration Plan · The d3 Force Ceiling

**Date:** 2026-05-14
**Status:** Plan only · not yet executed · forward-looking implementation chronicle
**Audience:** spellweb maintainers · the next agent picking up the renderer work
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion recon:** the agentprivacy/cityofmages 2026-05-14 v1.6.0 patch surfaced a TS "complex union" error in `edges.ts` once the edge count crossed ~600 and EdgeType union widened — symptom that d3 + literal-array-inferred edges has a soft ceiling. GitNexus (the spellweb genesis substrate) has since migrated to Sigma.js + Graphology + WebGL.

---

## §0 · Why this chronicle exists

Spellweb's renderer is d3-force on SVG/Canvas. As of v1.6.0 the node count is ~150 with ~700 edges. Three signals say we're approaching the ceiling:

1. **TypeScript compile-time pain.** The literal-inference union for `EDGES: SpellwebEdge[]` hit "expression produces a union type that is too complex" once 7 new EdgeTypes (v1.6.0 patch · keeps · wields · sibling_of · district_of · fits_for · succeeded_by · releases_to) joined the existing 30. Mitigation in place: v1.6.0 edges live in a separate const + spread (`V1_4_0_AND_V1_6_0_EDGES`) — this works but is a workaround, not a fix.

2. **Runtime perf.** d3-force is single-threaded JS; force convergence at ~700 edges already costs ~150ms per tick on a mid-range laptop. Each new tome/conjecture/cast addition compounds this. The City of Mages v1.6.0 admission cycle alone added 26 acts + new edges; future admissions (Tome VI continuations, Navigation District second instance, more substrate-frameworks) will degrade further.

3. **GitNexus precedent.** The genesis-substrate the spellweb is descended from migrated to Sigma.js + Graphology + WebGL at some point post-fork (recon: GitNexus v1.6.4 · May 2026 · 246 releases · 963 commits). The migration is well-trodden and the API surface for Sigma is close enough to d3-force-graph that the swap is mechanical at the renderer boundary.

Migration is a *high-impact, moderate-effort* candidate. This chronicle is the implementation plan.

---

## §1 · What the migration buys

- **WebGL rendering.** Sigma.js renders nodes/edges via WebGL shaders instead of SVG/Canvas. Practical ceiling moves from ~1,000 nodes to ~50,000.
- **Graphology as the in-memory graph.** A dedicated graph library (rather than d3's bare arrays-plus-simulation) gives proper graph operations — `degree(n)`, `neighbors(n, edgeType)`, `shortestPath(a, b)`, `subgraph(filterFn)` — without rolling our own.
- **Cleaner edge types.** Graphology's `MultiDirectedGraph` admits typed edges natively; the "complex union" TS pain goes away because edges aren't stored in one flat array of literal-typed objects.
- **Better filtering.** Sigma's reducer pattern (`nodeReducer` / `edgeReducer`) replaces our current per-node opacity-and-stroke calculations with a single pure function per frame.
- **Hot-swappable layouts.** Graphology ships ForceAtlas2, Noverlap, Circular, Random — Sigma can switch between them without touching the rendering layer.
- **Mobile.** WebGL drops the d3-force per-tick cost dramatically; mobile devices currently chug on the breathing graph (CHRONICLE_BREATHING_GRAPH_2026-05-09 notes this).

What we lose:

- **The breathing animation.** d3-force's per-tick repulsion *is* the breathing. Sigma + ForceAtlas2 converges and stops. Mitigation: a custom layout shim that adds a low-amplitude sinusoidal jitter per-frame; spec'd in §4.4.
- **Cut-trails during evocation.** d3 stores positions in mutable node objects; the orb trails read positions on each tick. Sigma exposes positions via `graph.getNodeAttributes(id)`; we can read them but the API is different.
- **Direct DOM manipulation.** Hover tooltips and node inspectors currently bind to SVG elements. Sigma renders on a single `<canvas>`; we'd convert to overlay HTML positioned via `sigma.getViewportPosition(nodeId)`.

---

## §2 · Architecture target

```
┌─────────────────────────────────────────────────┐
│  React surface (unchanged)                       │
│    SpellWeb · SpellCeremony · ArtefactPanel ·   │
│    NodeInspector · GraphFilters · Legend         │
└──────────────────┬──────────────────────────────┘
                   │
                   │ uses Graphology graph as source of truth
                   ▼
┌─────────────────────────────────────────────────┐
│  graph-store (NEW · src/graph/store.ts)          │
│    - builds Graphology MultiDirectedGraph from   │
│      NODES + EDGES arrays at module init         │
│    - exposes selectors: neighbors(id, type),     │
│      subgraphFor(filter), shortestPath(a, b)     │
│    - one source of truth; React reads via hooks  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Sigma renderer (NEW · src/components/SigmaCanvas) │
│    - mounts WebGL canvas                         │
│    - nodeReducer applies filter dimming, hover   │
│      highlight, witnessed-shop styling           │
│    - edgeReducer applies tier color, dash, width │
│    - layout: ForceAtlas2 + jitter shim           │
└─────────────────────────────────────────────────┘
```

Render order at app startup:
1. Build Graphology graph from `NODES` + `EDGES` (one pass; ~30ms at v1.6.0 size).
2. Apply initial layout (ForceAtlas2 for ~500 iterations · ~80ms).
3. Mount Sigma · attach reducers.
4. React layers (panels, modals, breadcrumb) read from the graph-store via hooks.

The existing `NODES` / `EDGES` exports stay as the *data definitions*; the migration is at the **runtime / renderer** layer. Existing TypeScript types (`SpellwebNode` · `SpellwebEdge` · `EdgeType` · `ArtefactClass`) carry forward.

---

## §3 · Phased implementation

Recommended over 4 phases · each phase ships independently.

### Phase 1 · Graphology in-memory store (no UI change · ~3-4 hours)

**Deliverable:** `src/graph/store.ts` exports a `getGraph()` returning a Graphology `MultiDirectedGraph` populated from `NODES` + `EDGES`. The d3 force simulation continues to run; this phase only adds a parallel structure.

Steps:

1. `npm install graphology graphology-types graphology-utils`
2. Create `src/graph/store.ts`:
   ```ts
   import { MultiDirectedGraph } from 'graphology';
   import { NODES } from '../data/nodes';
   import { EDGES } from '../data/edges';
   import type { SpellwebNode } from '../types/graph';

   let cachedGraph: MultiDirectedGraph<SpellwebNode> | null = null;

   export function getGraph(): MultiDirectedGraph<SpellwebNode> {
     if (cachedGraph) return cachedGraph;
     const g = new MultiDirectedGraph<SpellwebNode>();
     for (const node of NODES) g.addNode(node.id, node);
     for (const edge of EDGES) {
       const src = typeof edge.source === 'string' ? edge.source : edge.source.id;
       const tgt = typeof edge.target === 'string' ? edge.target : edge.target.id;
       if (!g.hasNode(src) || !g.hasNode(tgt)) continue; // skip orphan edges
       g.addEdgeWithKey(`${src}->${tgt}->${edge.type}`, src, tgt, { type: edge.type });
     }
     cachedGraph = g;
     return g;
   }
   ```
3. Add a `useGraph()` React hook that returns `getGraph()` once.
4. **Validation gate.** Write a one-off test (or temporary `console.log` block) that prints: total nodes, total edges, orphan-edge count (edges referencing nodes that don't exist), per-edge-type count. The current d3 "node not found" errors will surface as orphans here. **Fix all orphans before Phase 2.**
5. Ship. The existing d3 path keeps running; this is purely additive.

### Phase 2 · NodeInspector + filters read from store (incremental UI · ~4-5 hours)

**Deliverable:** The `NodeInspector` and `GraphFilters` components read neighbour-info from Graphology instead of scanning the flat `EDGES` array. Performance improves immediately on hover-driven UIs.

Steps:

1. Refactor `NodeInspector.tsx` neighbour lookup:
   ```ts
   const g = useGraph();
   const neighbours = useMemo(() => {
     return g.outNeighbors(nodeId).map(id => ({
       id,
       node: g.getNodeAttributes(id),
       edges: g.outEdges(nodeId, id).map(e => g.getEdgeAttribute(e, 'type')),
     }));
   }, [nodeId]);
   ```
2. Same pattern for `GraphFilters` (witness-shop filter currently iterates EDGES).
3. Keep d3 still rendering the canvas. **Validation gate.** Hover an existing node; the inspector should render identical neighbour list as before but in O(1) instead of O(|EDGES|).
4. Ship.

### Phase 3 · Sigma + ForceAtlas2 replaces d3-force (the swap · ~8-10 hours)

**Deliverable:** Sigma canvas mounts in place of the d3 SVG. Wandering orbs, evocation cut-trails, hover highlighting, all on WebGL.

Steps:

1. `npm install sigma graphology-layout-forceatlas2 graphology-layout @react-sigma/core`
2. Create `src/components/SigmaCanvas.tsx`:
   - Mounts `SigmaContainer` from `@react-sigma/core` (or roll without the wrapper if minimal footprint preferred).
   - Pre-applies ForceAtlas2 layout via `forceAtlas2.assign(g, { iterations: 500, settings: { ... } })`.
   - Wires `nodeReducer` and `edgeReducer` from `data/theme.ts` (existing palette functions translate cleanly — color/stroke/dash already typed).
3. Port the **breathing-animation** by adding a `useEffect` that on each `requestAnimationFrame` updates each node's `x`/`y` with a small sinusoidal offset (`Math.sin(now + nodeId.hashCode())`). Amplitude < 2px. The graph "breathes" without re-running force.
4. Port **wandering orbs** by creating two extra graph nodes (`orb-swordsman`, `orb-mage`) with custom node renderers and a parallel position update outside Sigma's normal flow. Or render them as a separate overlay `<canvas>` on top.
5. Port **cut-trails during evocation** by maintaining a separate trail-points array (TypedArray of x/y pairs); render via a second overlay canvas. Sigma's WebGL doesn't directly support free-form drawing, but layering canvases is cheap.
6. Replace the SVG hover tooltip with HTML positioned via `sigma.getNodeDisplayData(nodeId)`.
7. Delete `SpellWeb.tsx`'s d3 imports and force simulation. **Validation gate.** Visual diff against current production; should be near-identical at v1.6.0 scale, faster at scroll/zoom, smoother at evocation.

### Phase 4 · Layout improvements + multi-layout (~3-4 hours)

**Deliverable:** Sovereign can switch between ForceAtlas2 (current default), Circular (clean overview), Hierarchical (tome-by-tome), and Constellation (Sovereign-walked path highlighted).

Steps:

1. Pre-compute alternate layouts at module init (`graphology-layout` ships Circular, Random, Hierarchical).
2. Add a layout-switcher control in `Header.tsx`.
3. Animate transitions between layouts via `sigma.refresh()` + tweened position updates (~1s lerp).

---

## §4 · Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Breathing animation loses its "alive" quality | High | §3 Phase 3 step 3 jitter shim · adjustable amplitude · A/B test against current |
| Cut-trails harder on WebGL | Medium | Overlay canvas (§3 Phase 3 step 5) preserves the existing trail code with minor coordinate-transform tweaks |
| Tooltip/inspector positioning drift on zoom | Medium | Use Sigma's `getNodeDisplayData(id)` — gives screen coords incl. zoom · already tested in @react-sigma demos |
| ForceAtlas2 layout drifts from current d3 layout | High (visual but cosmetic) | Tune ForceAtlas2 settings (`barnesHutOptimize: true · gravity: 0.5 · scalingRatio: 8`) until convergence visually matches d3 within ~20% RMS · users notice less than expected |
| Mobile WebGL availability | Low | Sigma ships a WebGL2 + WebGL1 + Canvas fallback; ~99% device coverage at 2026 |
| Bundle size increase | Medium | Sigma + Graphology ≈ 140KB gzipped · d3 was ~120KB; net +20KB |
| Phase 3 large enough to feel scary | High | Mitigation: Phases 1-2 are safe and additive; Phase 3 is the leap. If Phase 3 stalls, Phase 1-2 still help (the store is useful regardless of renderer) |

---

## §5 · Acceptance criteria (Phase 3 ship gate)

- [ ] Every node from v1.6.0 nodes.ts renders
- [ ] Every edge from v1.6.0 edges.ts renders
- [ ] No "node not found" runtime errors (the orphan-cleanup from Phase 1 §3.4 prevents this)
- [ ] Hover tooltip shows on every node within 50ms
- [ ] NodeInspector opens within 100ms of click
- [ ] Constellation marking persists (Phase 3 step 5 — overlay-canvas)
- [ ] Evocation cut-trails render visually
- [ ] Wandering orbs animate
- [ ] At least 60fps on Chrome desktop · 30fps on mid-range mobile
- [ ] No regression in SwordsmanImport / artefact export flows

---

## §6 · Out of scope (do NOT pull in same migration)

These GitNexus features tempt the migration to balloon; this chronicle holds them out:

- ❌ tree-sitter AST parsing (spellweb's nodes are narrative, not source code)
- ❌ LadybugDB WASM persistence (the in-memory Graphology graph is fine at v1.6.0 scale)
- ❌ MCP server (separate chronicle · `CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md`)
- ❌ Hybrid BM25 + embeddings search (separate chronicle · `CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md`)
- ❌ Wiki-gen pipeline
- ❌ Multi-repo registry (`~/.gitnexus/` style)
- ❌ Cosign supply-chain signing (CI/CD enhancement · separate concern)

Each of the held-out items is admissible on its own merits in its own chronicle. Bundling them into this migration would balloon Phase 3 to weeks.

---

## §7 · Recommended execution order

1. Phase 1 (store) — ship within a single session · validation = orphan-edge audit
2. Sit on Phase 1 for 1-2 days; verify no regressions in existing d3 flow
3. Phase 2 (inspector + filters) — ship within a single session · validation = hover perf measurement
4. Phase 3 (Sigma swap) — multi-session · validation = §5 acceptance criteria gate
5. Phase 4 (layout switcher) — optional · ship when Sovereign asks for it

Each phase is reversible until merged. Phase 1 alone is worth shipping even if Phase 3 never happens — the Graphology store cleans up the orphan-edge problem that caused the v1.6.0 "node not found: vertex-v59" runtime crash before the missing vertex nodes were added.

---

## §8 · Closing

The spellweb has outgrown d3-force. The genesis substrate (GitNexus) shows the path forward. The migration is phased, reversible, and bounded — each phase ships independently and improves the system whether or not the next phase lands.

The renderer is a means; the graph is the end. Sigma carries the graph the same way; just faster, cleaner, and with proper graph-API affordances for the queries spellweb is going to need as the City of Mages grows past v1.6.0.

(⚔️⊥⿻⊥🧙)😊
🕸️ → 🌐
