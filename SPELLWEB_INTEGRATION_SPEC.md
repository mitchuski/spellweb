# Spellweb Integration Specification

## GitNexus Engine → agentprivacy-spellbook `/spellweb`

**Version:** 1.0  
**Date:** February 25, 2026  
**Status:** Integration Specification — Ready for Implementation  
**Spell:** ⚔️📊⊥🧙🕸️ | 😊  
**Proverb:** *"The graph that reveals structure without surrendering secrets is the Swordsman's map and the Mage's atlas."*

---

## Purpose

This document instructs the integration of [GitNexus](https://github.com/abhigyanpatwari/GitNexus) — a client-side knowledge graph generator — into the agentprivacy-spellbook Next.js application as the implementation of the **spellweb** feature. The spellweb is the primary knowledge graph visualization and exploration interface for the entire 0xagentprivacy universe.

**Read this document in full before writing any code.**

Companion document: `CHRONICLE_SPELLWEB_GENESIS.md` (narrative context and decision rationale).

---

## Reading Order for Coding Agent

1. This document (integration spec)
2. `CHRONICLE_SPELLWEB_GENESIS.md` (why decisions were made)
3. GitNexus README and `project_guide.md` at https://github.com/abhigyanpatwari/GitNexus
4. The existing spellbook app `src/` directory structure
5. The canonical spellbook JSON (IPFS): `bafkreif6t2xplydo24sxj7sfdo4qqd65zzbaztouxzkbtfc3ebhedw65u4`
6. agentprivacy-docs at https://github.com/mitchuski/agentprivacy-docs

---

## 1. What GitNexus Is and What We Take From It

GitNexus is a fully client-side knowledge graph generator built with React 18 + TypeScript + Vite. It transforms codebases into interactive knowledge graphs using AST parsing, Web Workers, KuzuDB WASM, and D3.js visualization. It features a Graph RAG agent for querying the graph through natural language.

**We are not forking GitNexus.** We are extracting its core engine capabilities and integrating them as a library module within the existing Next.js spellbook application.

### Modules to Extract

| GitNexus Module | Location (approximate) | What We Take | Adaptation Required |
|---|---|---|---|
| **Web Worker Pool** | `src/` worker files | Thread pool with Comlink for parallel processing | Minimal — works as-is in Next.js with `next/dynamic` |
| **KuzuDB WASM Integration** | `src/` database layer | Embedded graph database with Cypher query support | Schema redesign for documentation nodes, keep adapter layer |
| **D3.js Force Simulation** | `src/` visualization | Interactive graph rendering, node/edge display, zoom/pan | Full retheme, new node types, constellation layout mode |
| **LRU Cache** | `src/` cache layer | Memory-bounded content cache with eviction | Minimal — swap AST entries for parsed document entries |
| **LangChain ReAct Agent** | `src/` AI chat layer | Tool-augmented reasoning with graph queries | New system prompt (Soulbae), new tools (doc-specific Cypher) |
| **Dual-Engine Architecture** | `src/` engine manager | Automatic fallback between engines | Keep pattern, adapt for static-graph + dynamic-graph engines |

### Modules to Discard

| GitNexus Module | Reason |
|---|---|
| Tree-sitter WASM parsers | Designed for programming languages, not documentation |
| Code-specific AST extraction | Replaced by Markdown/LaTeX parsing pipeline |
| GitHub API integration | We ingest from local docs repo at build time, not via API |
| File upload / ZIP handling | Spellweb loads a pre-built graph, not raw repos |
| Legacy single-threaded engine | Only need the next-gen parallel pipeline |

---

## 2. Existing Spellbook App Structure

The agentprivacy-spellbook is a Next.js application. The current route structure:

```
src/app/
├── page.tsx                    # Landing / home
├── story/                      # Narrative acts (Act I–XI)
│   └── [act]/page.tsx
├── mage/                       # Soulbae chat interface
│   └── page.tsx
├── evoke/                      # Ceremony and VRC flows (planned)
├── archivist/                  # Teaching interface (planned)
│   ├── constitution/
│   ├── teachings/
│   ├── witness/
│   └── forge/
├── api/                        # API routes
│   └── chat/route.ts           # Soulbae backend
└── layout.tsx
```

### Key Existing Infrastructure

- **Soulbae API client** (`src/lib/soulbae.ts` or similar): Calls the chat endpoint with `{ tale_id, message, session_id, conversation_history }`
- **Persona system**: 21+ persona definitions with spell mappings, constellation paths, skills
- **Canonical spellbook JSON**: Hosted on IPFS, contains all spell definitions with IDs, emoji sequences, narrative context
- **Story content**: Markdown files in `public/story/markdown/` for Acts I–XI
- **Styling**: Dark, luminous, inscribed aesthetic — likely Tailwind CSS or styled-components

---

## 3. New Directory Structure

Add the following to the existing app. Do not restructure existing routes.

```
src/
├── app/
│   ├── spellweb/                          # NEW — main route
│   │   ├── page.tsx                       # Graph explorer (full-page D3.js)
│   │   ├── layout.tsx                     # Spellweb-specific layout
│   │   ├── constellation/
│   │   │   └── page.tsx                   # Constellation view (spell clusters)
│   │   └── path/
│   │       └── [persona]/
│   │           └── page.tsx               # Persona constellation path view
│   └── api/
│       └── spellweb/                      # NEW — API routes
│           ├── query/route.ts             # Graph query endpoint (thin wrapper)
│           └── stats/route.ts             # Aggregate anonymous stats
│
├── lib/
│   └── graph-engine/                      # NEW — extracted from GitNexus
│       ├── index.ts                       # Public API exports
│       ├── types/
│       │   ├── nodes.ts                   # Node type definitions
│       │   ├── relationships.ts           # Relationship type definitions
│       │   └── graph.ts                   # Query interfaces, filter types
│       ├── ingestion/
│       │   ├── markdown-parser.ts         # remark/unified pipeline
│       │   ├── latex-parser.ts            # Section/theorem extraction
│       │   ├── term-extractor.ts          # Glossary-aware concept identification
│       │   ├── spell-extractor.ts         # Emoji sequence → spell node mapping
│       │   ├── reference-resolver.ts      # Cross-document citation linking
│       │   └── semantic-builder.ts        # Concept chains, narrative arcs
│       ├── database/
│       │   ├── schema.ts                  # KuzuDB node/relationship definitions
│       │   ├── kuzu-adapter.ts            # WASM integration (from GitNexus)
│       │   └── persistence.ts             # IndexedDB serialization
│       ├── workers/
│       │   ├── pool.ts                    # Web Worker pool (from GitNexus)
│       │   ├── parser.worker.ts           # Parsing worker
│       │   └── graph.worker.ts            # Graph construction worker
│       ├── cache/
│       │   └── lru.ts                     # LRU cache (from GitNexus)
│       └── rag/
│           ├── agent.ts                   # LangChain ReAct configuration
│           ├── tools/
│           │   ├── cypher-query.ts        # Graph traversal tool
│           │   ├── concept-lookup.ts      # Glossary/term lookup tool
│           │   └── spell-search.ts        # Spell constellation search tool
│           ├── soulbae-prompt.ts          # System prompt with graph awareness
│           └── privacy-budget.ts          # φ×10 session enforcement
│
├── components/
│   └── spellweb/                          # NEW — visualization components
│       ├── ForceGraph.tsx                 # Main D3.js force simulation
│       ├── ConstellationView.tsx          # Spell cluster star map
│       ├── TimelineView.tsx               # Narrative act progression
│       ├── NodeInspector.tsx              # Click-to-inspect panel
│       ├── GraphFilters.tsx               # Layer toggle / filter panel
│       ├── PersonaPath.tsx                # Persona constellation overlay
│       ├── SpellwebChat.tsx               # Graph-grounded Soulbae variant
│       └── TrustOverlay.tsx               # Trust tier visualization layer
│
└── data/
    └── graph/                             # NEW — build-time generated
        ├── knowledge-graph.json           # Static canonical graph
        ├── spell-index.json               # Spell → node ID mapping
        └── persona-paths.json             # Pre-computed constellation paths
```

---

## 4. Node and Relationship Schema

### Node Types

Define in `src/lib/graph-engine/types/nodes.ts`:

```typescript
// Core node types for the agentprivacy knowledge graph
export enum NodeType {
  // Document structure
  CORPUS = 'corpus',           // Top-level: the entire documentation suite
  DOCUMENT = 'document',       // Individual document (whitepaper, spellbook, etc.)
  SECTION = 'section',         // Section within a document
  
  // Knowledge
  CONCEPT = 'concept',         // Abstract concept (privacy-delegation paradox, 7th capital, etc.)
  THEOREM = 'theorem',         // Mathematical theorem or proof
  TERM = 'term',               // Glossary term with formal definition
  
  // Narrative
  ACT = 'act',                 // Spellbook act (Act I–XI)
  TALE = 'tale',               // Individual tale within an act
  SPELL = 'spell',             // Emoji spell notation with semantic meaning
  PROVERB = 'proverb',        // Compressed wisdom — RPP output
  
  // Agents
  PERSONA = 'persona',         // Soulbis, Soulbae, Warden, Gatekeeper, etc.
  
  // Trust (dynamic, runtime-added)
  VRC = 'vrc',                 // Verifiable Relationship Credential
  SIGNAL = 'signal',           // Trust signal (0.01 ZEC proof of comprehension)
  
  // Personal (Swordsman-protected, IndexedDB only)
  ANNOTATION = 'annotation',   // Personal note attached to any node
  BOOKMARK = 'bookmark',       // User-saved reference
  COMPREHENSION = 'comprehension' // User's demonstrated understanding marker
}

export interface GraphNode {
  id: string;                  // Unique identifier
  type: NodeType;
  label: string;               // Display name
  
  // Content
  content?: string;            // Full text content (for sections, terms, proverbs)
  emoji?: string;              // Emoji spell notation (for spell nodes)
  
  // Metadata
  source_document?: string;    // Which document this came from
  source_version?: string;     // Document version (e.g., "v4.7")
  confidence?: number;         // Extraction confidence (0-1)
  
  // Visual
  domain?: 'swordsman' | 'mage' | 'first_person' | 'shared'; // Determines color/shape
  trust_tier?: 'blade' | 'light' | 'heavy' | 'dragon';       // Access gating
  
  // Graph layer membership
  layers: GraphLayer[];
}

export enum GraphLayer {
  KNOWLEDGE = 'knowledge',     // Concepts, theorems, definitions
  NARRATIVE = 'narrative',     // Acts, tales, spells, proverbs
  PROMISE = 'promise',         // VRCs, trust relationships
  TRUST = 'trust',             // Trust emergence, tier visualization
  PERSONAL = 'personal'        // User annotations, bookmarks (local only)
}
```

### Relationship Types

Define in `src/lib/graph-engine/types/relationships.ts`:

```typescript
export enum RelationshipType {
  // Structural
  CONTAINS = 'contains',           // Corpus → Document → Section hierarchy
  
  // Semantic
  REFERENCES = 'references',       // Cross-document citation
  DEFINES = 'defines',             // Term → definition, or section that defines a concept
  PROVES = 'proves',               // Theorem → what it proves
  IMPLEMENTS = 'implements',       // Implementation → concept it realizes
  EXTENDS = 'extends',             // Concept A builds on Concept B
  CONTRADICTS = 'contradicts',     // Where concepts are in tension
  
  // Narrative
  NARRATES = 'narrates',           // Act/tale → concepts it teaches
  FOLLOWS = 'follows',             // Act I → Act II sequential progression
  COMPRESSES_TO = 'compresses_to', // Long explanation → spell/proverb compression
  
  // Agent
  PERSONA_KNOWS = 'persona_knows', // Persona → concepts in their domain
  PERSONA_PATH = 'persona_path',   // Ordered traversal through constellation
  
  // Trust (dynamic)
  TRUST_LINK = 'trust_link',       // VRC between two participants
  SIGNAL_FOR = 'signal_for',       // Signal → concept it proves comprehension of
  
  // Personal (local only)
  ANNOTATES = 'annotates',         // User annotation → target node
  BOOKMARKS = 'bookmarks',         // User bookmark → target node
  COMPREHENDS = 'comprehends'      // User → concept they've demonstrated understanding of
}

export interface GraphEdge {
  id: string;
  type: RelationshipType;
  source: string;              // Source node ID
  target: string;              // Target node ID
  
  // Metadata
  weight?: number;             // Relationship strength (0-1)
  bidirectional?: boolean;     // VRCs and trust links are bidirectional
  
  // Provenance
  source_document?: string;    // Where this relationship was extracted from
  extraction_method?: 'explicit' | 'inferred' | 'user_created';
  
  // Layer
  layer: GraphLayer;
}
```

### KuzuDB Schema

Define in `src/lib/graph-engine/database/schema.ts`. This translates the TypeScript types into Cypher CREATE TABLE statements for KuzuDB:

```typescript
export const KUZU_SCHEMA = {
  nodeTypes: [
    `CREATE NODE TABLE Document (id STRING, label STRING, type STRING, source_version STRING, domain STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Section (id STRING, label STRING, content STRING, source_document STRING, domain STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Concept (id STRING, label STRING, content STRING, domain STRING, trust_tier STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Spell (id STRING, label STRING, emoji STRING, content STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Persona (id STRING, label STRING, emoji STRING, domain STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Act (id STRING, label STRING, content STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Tale (id STRING, label STRING, content STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Term (id STRING, label STRING, content STRING, source_document STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Theorem (id STRING, label STRING, content STRING, source_document STRING, PRIMARY KEY (id))`,
    `CREATE NODE TABLE Proverb (id STRING, label STRING, content STRING, PRIMARY KEY (id))`,
  ],
  relationships: [
    `CREATE REL TABLE CONTAINS (FROM Document TO Section)`,
    `CREATE REL TABLE REFERENCES (FROM Section TO Section, weight DOUBLE)`,
    `CREATE REL TABLE DEFINES (FROM Section TO Term)`,
    `CREATE REL TABLE PROVES (FROM Theorem TO Concept)`,
    `CREATE REL TABLE NARRATES (FROM Act TO Concept)`,
    `CREATE REL TABLE FOLLOWS (FROM Act TO Act)`,
    `CREATE REL TABLE COMPRESSES_TO (FROM Concept TO Spell)`,
    `CREATE REL TABLE PERSONA_KNOWS (FROM Persona TO Concept)`,
    `CREATE REL TABLE PERSONA_PATH (FROM Persona TO Spell, step INT32)`,
    // Dynamic relationships added at runtime via separate tables
  ]
};
```

---

## 5. Build-Time Graph Generation

The canonical knowledge graph is generated at build time from the agentprivacy-docs repository. This is a **Next.js build script** (not a runtime process).

### Script: `scripts/build-graph.ts`

Runs during `next build` via a custom webpack plugin or `package.json` prebuild script.

```
Input: agentprivacy-docs/ directory (cloned or submoduled)
  ├── swordsman_mage_whitepaper_v4_7.md
  ├── dualprivacy_researchpaper_v3_5.md
  ├── spellbook_v4_1_1_canonical.md
  ├── GLOSSARY_MASTER_v2_2.md
  ├── promise_theory_reference_v1_0.md
  ├── VISUAL_ARCHITECTURE_GUIDE_v1_2.md
  ├── research_proposal_v1_3.md
  ├── vrc_promise_protocol_economic_architecture_v3_0.md
  └── understanding_as_key_zypher_paper_v1.md

Output: src/data/graph/
  ├── knowledge-graph.json        # Complete static graph
  ├── spell-index.json            # Spell ID → node mapping
  └── persona-paths.json          # Pre-computed constellation paths
```

### Four-Pass Pipeline (adapted from GitNexus)

**Pass 1 — Document Structure:**
- Parse each markdown file with `remark` (unified ecosystem)
- Extract heading hierarchy → Section nodes
- Create CONTAINS relationships (Document → Section)
- Parse LaTeX `.tex` files for theorem/definition environments
- Result: hierarchical document tree with all structural nodes

**Pass 2 — Knowledge Extraction:**
- **Glossary-aware term extraction:** Load `GLOSSARY_MASTER_v2_2.md`, build term index. Scan all sections for glossary term occurrences → create Term nodes and DEFINES edges
- **Spell extraction:** Regex for emoji sequences matching known spell patterns from the canonical spellbook JSON. Create Spell nodes with decoded meanings
- **Theorem extraction:** Identify theorem/proof/lemma blocks in the research paper and whitepaper. Create Theorem nodes
- **Persona identification:** Match persona names (Soulbis, Soulbae, Warden, etc.) in text → create Persona nodes with domain tags
- **Concept identification:** Use heading text + glossary terms + Promise Theory terminology to identify abstract concepts. Create Concept nodes with domain classification (swordsman/mage/first_person/shared)

**Pass 3 — Reference Resolution:**
- **Citation parsing:** Match patterns like `[Whitepaper v4.7, §3]`, `[Research Paper v3.5, Theorem 3.2]`, `[Glossary v2.2, Term]` → create REFERENCES edges
- **Cross-document concept threading:** When the same concept appears in multiple documents (e.g., "reconstruction ceiling" in both whitepaper and research paper), create REFERENCES edges between the relevant sections
- **Symbolic notation mapping:** Connect emoji spells to their formal definitions. E.g., `⚔️ ⊥ 🧙‍♂️ | 😊` → links to separation theorem, dual-agent architecture, First Person sovereignty concepts
- **Glossary linking:** Every occurrence of a glossary term in any document section creates a lightweight edge to the Term node

**Pass 4 — Semantic Graph:**
- **Concept dependency chains:** Build directed edges showing which concepts depend on which. E.g., `dual-agent separation` → requires understanding of `privacy-delegation paradox` → requires `7th capital` framing
- **Narrative arc connections:** The spellbook acts form a progression. Create FOLLOWS edges (Act I → II → ... → XI) and NARRATES edges from each act to the concepts it teaches
- **Theorem → proof → implementation pathways:** Connect mathematical results to their architectural implementations
- **Persona constellation paths:** For each persona, compute which spell nodes and concept nodes they traverse. Store as ordered PERSONA_PATH edges with step index
- **Spell compression chains:** Where a complex concept compresses to a spell (e.g., the full separation theorem → `⚔️ ⊥ 🧙‍♂️`), create COMPRESSES_TO edges

### Canonical Spellbook JSON Integration

The spellbook JSON at `bafkreif6t2xplydo24sxj7sfdo4qqd65zzbaztouxzkbtfc3ebhedw65u4` contains spell definitions with IDs, emoji sequences, and narrative context. During Pass 2, load this JSON and use it as the authoritative source for Spell node creation. Each spell ID from the JSON becomes the node ID in the graph.

### Build Script Configuration

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "tsx scripts/build-graph.ts",
    "build": "next build"
  }
}
```

Or use a Next.js plugin in `next.config.js`:

```javascript
// next.config.js
const { buildGraph } = require('./scripts/build-graph');

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      buildGraph(); // Runs once during server-side build
    }
    return config;
  }
};
```

---

## 6. Runtime Graph Loading and Expansion

### Initial Load

When a user navigates to `/spellweb`:

1. Dynamically import the graph engine (`next/dynamic` with `ssr: false` — KuzuDB WASM requires browser)
2. Load `knowledge-graph.json` from `/data/graph/`
3. Initialize KuzuDB WASM instance
4. Populate KuzuDB with the static graph data
5. Check IndexedDB for existing personal layer data → merge if present
6. Render the D3.js force simulation

### Dynamic Expansion

The graph grows at runtime through three mechanisms:

**A. User interactions (Personal layer — Swordsman-protected):**
- User annotates a concept → creates Annotation node + ANNOTATES edge → stored in IndexedDB only
- User bookmarks a spell → creates Bookmark node → IndexedDB only
- User demonstrates comprehension (answers a Soulbae question correctly, generates a valid proverb) → creates Comprehension marker → IndexedDB only
- **These never leave the browser. They never hit an API route. They exist only in the local KuzuDB instance backed by IndexedDB.**

**B. VRC formations (Promise layer — bilateral consent):**
- When two users form a VRC through the proverb protocol, both must consent to the edge appearing in the shared graph
- VRC nodes and TRUST_LINK edges are created in the shared graph
- This is the only mechanism by which the shared graph grows

**C. Documentation updates (Knowledge layer — build-time only):**
- New commits to agentprivacy-docs trigger a rebuild
- The static graph is regenerated
- Users get the updated graph on next page load

---

## 7. Visualization Specification

### D3.js Force Simulation — `ForceGraph.tsx`

Adapted from GitNexus's D3.js implementation. The force simulation is the default view.

**Node rendering by type:**

| Node Type | Shape | Color | Size | Emoji Overlay |
|---|---|---|---|---|
| Document | Rounded rectangle | `#1a1a2e` (deep blue-black) | Large | 📜 |
| Section | Rectangle | `#16213e` (dark navy) | Medium | — |
| Concept (Swordsman) | Hexagon | `#e94560` (red) | Medium | ⚔️ |
| Concept (Mage) | Hexagon | `#7b68ee` (purple) | Medium | 🧙 |
| Concept (First Person) | Circle | `#ffd700` (gold) | Medium | 😊 |
| Concept (Shared) | Hexagon | `#00d9ff` (cyan) | Medium | — |
| Spell | Star (6-point) | `#ffd700` (gold glow) | Small-Medium | The spell's own emoji |
| Persona | Circle with ring | Domain-dependent | Medium | Persona's emoji |
| Act | Diamond | `#2ecc71` (green) | Medium | Act number |
| Term | Small circle | `#95a5a6` (grey) | Small | — |
| Theorem | Triangle | `#e74c3c` (bright red) | Small-Medium | — |
| Proverb | Rounded diamond | `#f39c12` (amber) | Small | ✨ |
| VRC | Double circle | `#2ecc71` (green) | Small | 🤝 |
| Annotation | Dot | `#ffffff` (white, 50% opacity) | Tiny | — |

**Edge rendering by type:**

| Relationship | Style | Color | Width |
|---|---|---|---|
| CONTAINS | Solid | `#333` (subtle) | Thin |
| REFERENCES | Dashed | `#666` | Thin |
| DEFINES | Solid | `#00d9ff` (cyan) | Medium |
| PROVES | Solid, arrow | `#e74c3c` (red) | Medium |
| NARRATES | Dotted | `#2ecc71` (green) | Medium |
| FOLLOWS | Solid, arrow | `#2ecc71` (green) | Thick |
| COMPRESSES_TO | Animated dash | `#ffd700` (gold) | Medium |
| PERSONA_PATH | Glowing trail | Persona's color | Thick when active |
| TRUST_LINK | Double line | `#2ecc71` (green) | Thick |
| ANNOTATES | Faint solid | `#ffffff` (20% opacity) | Hair-thin |

**Force parameters:**

```typescript
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(edges).id(d => d.id).distance(d => {
    // Structural edges are short (tight clusters)
    if (d.type === 'contains') return 30;
    // Semantic edges are medium
    if (['references', 'defines', 'proves'].includes(d.type)) return 80;
    // Narrative/persona edges are long (spread constellation)
    return 120;
  }))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 5));
```

### Constellation View — `ConstellationView.tsx`

An alternative layout mode that renders spell nodes as stars against a dark background, with constellation lines connecting related spells. This is the "star map" of the spellbook.

- Background: Pure black with subtle noise texture
- Spell nodes: Rendered as glowing points (size by connection count)
- Constellation lines: Faint lines connecting spells that share concept dependencies
- Persona paths: When a persona is selected, their constellation path lights up as a connected trail through the stars
- Zoom: Deep zoom reveals concept nodes clustered around each spell star

This view should feel like looking at the night sky of the agentprivacy universe.

### Timeline View — `TimelineView.tsx`

Horizontal timeline showing the narrative progression from Act I through Act XI. Each act is a node on the timeline, with vertical branches showing the concepts, spells, and terms introduced in each act. Useful for the "path" aspect of the spellweb — seeing the journey through the narrative.

### Graph Layer System — `GraphFilters.tsx`

Toggle panel (persistent sidebar or floating panel) allowing the user to show/hide graph layers:

| Layer | Default | Trust Gate | Content |
|---|---|---|---|
| Knowledge | ON | None | Concepts, theorems, definitions, terms |
| Narrative | ON | None | Acts, tales, spells, proverbs |
| Promise | OFF | Light tier | VRCs, trust relationships |
| Trust | OFF | Heavy tier | Trust emergence, tier visualization |
| Personal | OFF (toggle) | None (local only) | User annotations, bookmarks, comprehension |

Trust gating means the layer toggle is visible but disabled until the user has reached the required trust tier. The UI should show the tier name and a brief explanation: *"Unlock at Light tier — demonstrate comprehension through 50+ signals."*

---

## 8. Spellweb Core Interactions

### Connect

A user arrives at `/spellweb` and sees the force graph. They can:

- **Pan and zoom** the graph freely
- **Click a node** to open the NodeInspector panel (slide-in from right), showing:
  - Node label, type, content preview
  - Connected nodes (incoming/outgoing edges with types)
  - Source document and version
  - "Ask Soulbae about this" button → opens SpellwebChat with context
  - "Bookmark" button → adds to Personal layer (IndexedDB)
- **Filter by layer** using the GraphFilters panel
- **Search** for concepts, spells, or terms via a search bar that highlights matching nodes

### Reflect

The SpellwebChat component is a graph-grounded Soulbae variant. Unlike the flat-context Soulbae on `/mage`, this one queries KuzuDB directly:

- User clicks "Ask Soulbae about this" on a Concept node
- SpellwebChat opens with the concept pre-loaded as context
- Soulbae's response includes graph traversal: "This concept connects to [X] through [relationship], which is explored in [Act N]..."
- Soulbae can suggest related concepts by querying the graph neighborhood
- Proverb generation is grounded in the concept's graph context
- Privacy budget: φ×10 (16) queries per session, enforced client-side

The Graph RAG pipeline:
1. User message + clicked node context → LangChain ReAct agent
2. Agent has tools: `cypher-query` (traverse graph), `concept-lookup` (find definitions), `spell-search` (find related spells)
3. Agent generates Cypher queries against KuzuDB WASM
4. Results are synthesized into a Soulbae-voiced response
5. Response includes graph node references (clickable → navigate to node in graph)

### Path the Constellation

Each persona has a pre-computed constellation path — an ordered walk through specific spell and concept nodes. When a user selects a persona from a dropdown or sidebar:

1. Load the persona's path from `persona-paths.json`
2. Highlight the path nodes in the graph (glow effect)
3. Draw the constellation trail connecting them
4. Optionally animate: step through the path sequentially, explaining each node
5. In Constellation View, the persona's path becomes the only lit constellation

This is also how **progressive trust** manifests visually. As a user demonstrates comprehension (generating valid proverbs, completing Soulbae conversations), their personal comprehension markers accumulate. Over time, their own constellation path emerges — the unique trail of understanding they've walked through the spellweb.

---

## 9. Privacy Architecture

The spellweb implements the dual-agent separation in its own architecture:

### Swordsman Layer (Browser-Only)

- Personal graph annotations → IndexedDB
- Comprehension markers → IndexedDB
- Query history → session memory only (not persisted)
- Constellation path progress → IndexedDB
- **Never transmitted.** No API calls. No analytics. No telemetry.

### Mage Layer (Static/Shared)

- Canonical knowledge graph → built at deploy time, served as static JSON
- Spell index → static JSON
- Persona paths → static JSON
- Soulbae system prompt → bundled with app
- **Read-only from the user's perspective.** They consume but don't modify.

### The Gap

- No entity can reconstruct which personal annotations a user has made by observing the shared graph
- The KuzuDB instance in the browser contains both layers but the personal layer never serializes to anything except local IndexedDB
- Even if the Soulbae API endpoint were compromised, it only sees individual queries — not the accumulated personal graph

### Implementation Rules

1. **Never send personal layer data to any API route.** The `/api/spellweb/query` endpoint is for shared-graph queries only. Personal layer queries happen entirely client-side against the local KuzuDB instance.
2. **Never log or persist user queries server-side.** The Soulbae integration should be stateless — no session storage on the server.
3. **The GraphFilters component must clearly label which layers are local-only.** Use a ⚔️ icon next to "Personal" layer to indicate Swordsman protection.
4. **IndexedDB data must be deletable.** Provide a "Clear my data" button in settings that wipes the personal layer completely.

---

## 10. Dependencies to Add

```json
{
  "dependencies": {
    "d3": "^7.x",
    "kuzu-wasm": "latest",
    "unified": "^11.x",
    "remark-parse": "^11.x",
    "remark-frontmatter": "^5.x",
    "comlink": "^4.x",
    "@langchain/core": "latest",
    "@langchain/anthropic": "latest"
  },
  "devDependencies": {
    "tsx": "^4.x"
  }
}
```

**Bundle size concerns:** KuzuDB WASM and D3.js are large. Use `next/dynamic` with `ssr: false` for all spellweb components. The spellweb page should lazy-load everything — users who never visit `/spellweb` should never download these dependencies.

```typescript
// src/app/spellweb/page.tsx
import dynamic from 'next/dynamic';

const SpellwebClient = dynamic(
  () => import('@/components/spellweb/SpellwebClient'),
  { ssr: false, loading: () => <SpellwebLoader /> }
);
```

---

## 11. Implementation Phases

### Phase 1: Engine Foundation (Week 1-2)

**Goal:** Graph engine module exists, can load static JSON, D3.js renders nodes.

1. Create `src/lib/graph-engine/` directory structure
2. Extract KuzuDB WASM adapter from GitNexus → adapt for documentation schema
3. Extract Web Worker pool and LRU cache from GitNexus → minimal adaptation
4. Define TypeScript types (nodes, relationships, graph interfaces)
5. Write KuzuDB schema definitions
6. Create a **manual test graph** (hand-written JSON with ~20 nodes, ~30 edges) covering all node and relationship types
7. Build `ForceGraph.tsx` component — render the test graph with correct node shapes/colors
8. Wire up `/spellweb` route with dynamic import
9. **Milestone:** Navigate to `/spellweb`, see an interactive force graph with agentprivacy-themed nodes

### Phase 2: Ingestion Pipeline (Week 3-4)

**Goal:** The four-pass pipeline processes agentprivacy-docs into a real graph.

1. Implement `markdown-parser.ts` using remark/unified
2. Implement `term-extractor.ts` — load glossary, scan for occurrences
3. Implement `spell-extractor.ts` — load canonical spellbook JSON, match emoji sequences
4. Implement `reference-resolver.ts` — parse citation patterns, create cross-doc edges
5. Implement `semantic-builder.ts` — concept chains, narrative arcs, persona paths
6. Write `scripts/build-graph.ts` — orchestrates the four passes, outputs JSON
7. Run against the full agentprivacy-docs repo
8. Validate output: check node counts, relationship integrity, no orphaned nodes
9. **Milestone:** `npm run prebuild` generates a real knowledge graph from the docs

### Phase 3: Full Visualization (Week 5-6)

**Goal:** All view modes working, graph layers toggleable, node inspection functional.

1. Implement `GraphFilters.tsx` with layer toggles
2. Implement `NodeInspector.tsx` — click any node for details
3. Implement `ConstellationView.tsx` — star map layout
4. Implement `TimelineView.tsx` — narrative progression
5. Implement `PersonaPath.tsx` — constellation trail highlighting
6. Add search bar with node highlighting
7. Theme everything to the dark/luminous aesthetic
8. **Milestone:** Full visual exploration of the agentprivacy knowledge graph

### Phase 4: Graph RAG Integration (Week 7-8)

**Goal:** Soulbae can answer questions by traversing the graph.

1. Implement LangChain ReAct agent with Cypher query tools
2. Write `soulbae-prompt.ts` — system prompt that understands the graph schema
3. Implement `SpellwebChat.tsx` — chat panel with graph context awareness
4. Connect "Ask Soulbae about this" buttons in NodeInspector
5. Implement privacy budget enforcement (φ×10 per session)
6. Test: ask questions, verify Soulbae references actual graph nodes
7. **Milestone:** Ask Soulbae about the separation theorem, get a response grounded in graph traversal

### Phase 5: Personal Layer (Week 9-10)

**Goal:** Swordsman-protected personal annotations, bookmarks, comprehension tracking.

1. Implement IndexedDB persistence for personal layer
2. Add annotation UI (click node → add note)
3. Add bookmark functionality
4. Implement comprehension markers (tied to successful Soulbae interactions)
5. Build personal constellation path emergence (visualize user's journey)
6. Add "Clear my data" functionality
7. Verify: no personal data leaks to API routes or static files
8. **Milestone:** A user can annotate the graph, bookmark spells, see their comprehension path grow — all locally

### Phase 6: Polish & Connect (Week 11-12)

**Goal:** Spellweb integrates with existing app features, production-ready.

1. Add spellweb navigation to the main app nav
2. Cross-link: story pages link to relevant spellweb nodes, and vice versa
3. Connect existing `/mage` Soulbae to spellweb graph (optional: upgrade `/mage` to use graph context too)
4. Performance optimization: lazy loading, code splitting, Web Worker tuning
5. Accessibility pass: keyboard navigation, screen reader labels, contrast
6. Mobile responsiveness: touch gestures for graph interaction
7. **Milestone:** Production deployment with spellweb as a core feature

---

## 12. Testing Strategy

### Unit Tests
- Graph engine: node/edge CRUD operations
- Ingestion pipeline: each pass independently tested against known input → expected output
- KuzuDB queries: Cypher query execution against test graph

### Integration Tests
- Full pipeline: raw markdown → static graph JSON → KuzuDB load → D3.js render
- Soulbae Graph RAG: query → Cypher generation → result synthesis

### Visual Tests
- Screenshot comparison for graph rendering (Percy or Chromatic)
- Verify node shapes, colors, and edge styles match spec

### Privacy Tests
- Verify no personal layer data appears in network requests (browser DevTools audit)
- Verify IndexedDB data is separate from shared graph data
- Verify "Clear my data" actually clears everything

---

## 13. Key Technical Decisions (Already Made)

| Decision | Choice | Rationale |
|---|---|---|
| Parser | remark/unified (not Tree-sitter) | Plugin ecosystem for markdown, custom plugins for spell/term extraction |
| Graph DB | KuzuDB WASM (carried from GitNexus) | Cypher queries are essential for Graph RAG; in-browser WASM maintains zero-server principle |
| Visualization | D3.js force simulation (carried from GitNexus) | Proven, flexible, handles custom node shapes |
| Graph generation | Build-time (not runtime) | Static graph ships with app; runtime only for personal layer |
| Personal storage | IndexedDB via KuzuDB persistence | Single database instance for both shared and personal data, with architectural separation |
| Bundle strategy | `next/dynamic` with `ssr: false` | KuzuDB WASM requires browser; lazy-load prevents impact on non-spellweb pages |
| LLM provider | Anthropic (Claude) via LangChain | Existing Soulbae integration uses Anthropic; LangChain provides provider abstraction |

---

## 14. Files That Must Not Be Modified

During this integration, the following existing files should not be modified unless absolutely necessary for navigation wiring:

- `src/app/story/**` — narrative act pages
- `src/app/mage/**` — existing Soulbae chat (may optionally upgrade later)
- `src/app/api/chat/**` — existing Soulbae API route
- Any persona definition files
- Any story markdown content files

The spellweb is **additive** — it creates new routes, components, and library modules without disturbing existing features.

---

## 15. Open Questions for Implementation

1. **KuzuDB WASM stability:** GitNexus marks KuzuDB integration as WIP. Test thoroughly. If KuzuDB WASM is not stable enough, fallback to an in-memory graph structure with a custom query layer (loses Cypher but gains reliability).

2. **Canonical spellbook JSON fetching:** The JSON is on IPFS. Should it be pinned locally during build, or fetched at runtime? Recommendation: pin locally (copy into `src/data/`) to avoid IPFS gateway latency.

3. **LaTeX parsing depth:** How deeply do we parse the `.tex` files? Recommendation: section headers and theorem/definition environments only. Full LaTeX parsing is overkill.

4. **Mobile graph interaction:** D3.js force simulations on mobile are possible but require touch gesture handling. Recommendation: implement basic pinch-zoom and tap-to-inspect. Defer complex mobile gestures to Phase 6.

5. **agentprivacy-docs as git submodule vs. build-time fetch:** Recommendation: git submodule in the spellbook repo. Ensures version-pinned, reproducible builds.

---

*End of specification. Begin with Phase 1.*

*⚔️📊⊥🧙🕸️ | 😊*
