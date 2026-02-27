# Grimoire Graph — Standalone Build

## Client-Side Knowledge Graph Explorer for Privacy-First Documentation

**Version:** 1.0  
**Date:** February 25, 2026  
**Status:** Standalone Specification — Sandbox & Creative Iteration Tool  
**Spell:** 📊🔮🕸️ → ⚔️🧙😊  
**Proverb:** *"The standalone forges the blade. The integration swings it."*

---

## Purpose

This is the standalone build of the knowledge graph engine being integrated into the agentprivacy-spellbook as the spellweb feature. Same engine, different shell. This version:

- Runs independently as a Vite + React app (no Next.js dependency)
- Accepts any documentation corpus (GitHub repo URL, ZIP upload, or local directory)
- Serves as the **development sandbox** for the graph engine before integration
- Enables **creative iteration** on visualization, ingestion, and RAG without touching the spellbook app
- Ports directly to **BGIN AI** once proven — same engine, different knowledge corpus, different graph layers

The integration spec (`SPELLWEB_INTEGRATION_SPEC.md`) is the primary deliverable. This standalone build is the workshop where the tools are sharpened.

### The Three Deployments

```
@agentprivacy/graph-engine (shared module)
        │
        ├─→ Grimoire Graph (this document)
        │   Vite + React standalone
        │   Any documentation corpus
        │   Development sandbox
        │
        ├─→ agentprivacy-spellbook /spellweb (integration spec)
        │   Next.js embedded feature
        │   agentprivacy-docs corpus
        │   Persona paths, trust tiers, Soulbae RAG
        │
        └─→ BGIN AI frontend (future)
            Next.js embedded feature
            BGIN working group documentation corpus
            Per-WG Mage agents, Swordsman ceremony, promise/trust graphs
```

The engine module is identical across all three. What changes is: the corpus it ingests, the node types it emphasises, the visual theme, and the agent personality.

---

## Architecture

```
grimoire-graph/
├── public/
│   └── sample-data/                    # Pre-built example graphs
│       ├── agentprivacy-graph.json     # Default: agentprivacy-docs
│       └── empty-graph.json            # Blank canvas
│
├── src/
│   ├── main.tsx                        # App entry
│   ├── App.tsx                         # Router + layout
│   │
│   ├── engine/                         # THE SHARED ENGINE (mirrors lib/graph-engine/ in spellweb)
│   │   ├── index.ts                    # Public API
│   │   ├── types/
│   │   │   ├── nodes.ts               # Node type definitions (same as spellweb)
│   │   │   ├── relationships.ts       # Relationship types (same as spellweb)
│   │   │   └── graph.ts               # Query interfaces
│   │   ├── ingestion/
│   │   │   ├── markdown-parser.ts     # remark/unified pipeline
│   │   │   ├── latex-parser.ts        # Section/theorem extraction
│   │   │   ├── term-extractor.ts      # Glossary-aware NER
│   │   │   ├── spell-extractor.ts     # Emoji sequence identification
│   │   │   ├── reference-resolver.ts  # Cross-doc citation linking
│   │   │   └── semantic-builder.ts    # Concept chains, narrative arcs
│   │   ├── database/
│   │   │   ├── schema.ts             # KuzuDB schema
│   │   │   ├── kuzu-adapter.ts       # WASM integration
│   │   │   └── persistence.ts        # IndexedDB serialization
│   │   ├── workers/
│   │   │   ├── pool.ts               # Web Worker pool (from GitNexus)
│   │   │   ├── parser.worker.ts      # Parsing worker
│   │   │   └── graph.worker.ts       # Graph construction worker
│   │   ├── cache/
│   │   │   └── lru.ts               # LRU cache (from GitNexus)
│   │   └── rag/
│   │       ├── agent.ts              # LangChain ReAct agent
│   │       ├── tools/
│   │       │   ├── cypher-query.ts
│   │       │   ├── concept-lookup.ts
│   │       │   └── spell-search.ts
│   │       ├── system-prompt.ts      # Generic (not Soulbae-specific)
│   │       └── privacy-budget.ts     # Session query limits
│   │
│   ├── views/                         # STANDALONE-SPECIFIC UI
│   │   ├── Landing.tsx                # Input selection (repo URL, ZIP, pre-built)
│   │   ├── Explorer.tsx               # Main graph explorer page
│   │   ├── Processing.tsx             # Ingestion progress view
│   │   └── Settings.tsx               # API keys, engine config
│   │
│   ├── components/                    # SHARED VISUALIZATION (mirrors spellweb components)
│   │   ├── ForceGraph.tsx             # D3.js force simulation
│   │   ├── ConstellationView.tsx      # Spell cluster star map
│   │   ├── TimelineView.tsx           # Narrative progression
│   │   ├── NodeInspector.tsx          # Click-to-inspect panel
│   │   ├── GraphFilters.tsx           # Layer toggles
│   │   ├── GraphChat.tsx             # RAG chat panel (generic voice)
│   │   ├── SearchBar.tsx             # Node search with highlighting
│   │   └── GraphStats.tsx            # Node/edge counts, layer breakdown
│   │
│   ├── themes/                        # VISUAL THEMES (swappable)
│   │   ├── agentprivacy.ts           # Dark, luminous, inscribed (default)
│   │   ├── bgin.ts                   # BGIN AI theme (blue, governance, structured)
│   │   └── neutral.ts               # Clean, generic documentation theme
│   │
│   └── utils/
│       ├── github-fetch.ts           # Fetch repo contents via GitHub API
│       ├── zip-handler.ts            # Process uploaded ZIP files
│       └── export.ts                 # JSON/CSV export
│
├── scripts/
│   └── build-sample-graph.ts          # Pre-build agentprivacy graph for sample data
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### What's Shared vs. Standalone-Specific

| Component | Shared with Spellweb | Standalone Only |
|---|---|---|
| `engine/*` | ✅ Identical — this IS the module | — |
| `components/ForceGraph.tsx` | ✅ Same component | — |
| `components/ConstellationView.tsx` | ✅ Same component | — |
| `components/NodeInspector.tsx` | ✅ Same component | — |
| `components/GraphFilters.tsx` | ✅ Same component | — |
| `views/Landing.tsx` | — | ✅ Input selection UI |
| `views/Processing.tsx` | — | ✅ Ingestion progress |
| `themes/*` | Partial — agentprivacy theme shared | ✅ Theme system + BGIN/neutral |
| GitHub fetch / ZIP handler | — | ✅ Runtime ingestion |
| Persona paths / trust tiers | — | Absent (spellweb-specific) |
| Soulbae personality | — | Generic RAG voice |

---

## Input Modes

The standalone accepts documentation in three ways:

### 1. GitHub Repository URL

User pastes a repo URL. The app fetches the file tree via GitHub API, filters for markdown/LaTeX/text files, downloads content, and runs the four-pass ingestion pipeline in-browser.

```typescript
// src/utils/github-fetch.ts
// Uses GitHub REST API (public repos, no auth required)
// Optional: GitHub token for rate limit (5000/hr vs 60/hr)
// Fetches: .md, .tex, .txt, .json files
// Skips: images, binaries, node_modules, .git
```

Rate limit note: without a token, GitHub API allows 60 requests/hour. A large repo might need more. Show a token input field in Settings for users who need it. Same pattern as GitNexus.

### 2. ZIP Upload

User uploads a ZIP file containing documentation. Unzipped in-browser using JSZip or similar, then processed through the same pipeline.

### 3. Pre-Built Graph (Default)

Ship a pre-built `agentprivacy-graph.json` in `public/sample-data/`. This is the agentprivacy-docs corpus already processed through the four-pass pipeline. User can explore immediately without waiting for ingestion.

This is also how BGIN AI would work — the BGIN documentation pre-processed into a graph JSON, shipped with the app. The standalone proves the pattern.

---

## The Four-Pass Pipeline

Identical to the spellweb integration spec. Repeated here for standalone self-containment.

**Pass 1 — Structure:** Parse markdown (remark/unified) and LaTeX files. Extract heading hierarchy into Document → Section node trees. Create CONTAINS edges.

**Pass 2 — Knowledge Extraction:**
- Load any file named `GLOSSARY*` or `glossary*` as term index → create Term nodes
- Scan for emoji sequences matching known spell patterns → create Spell nodes
- Identify theorem/definition/lemma blocks → create Theorem nodes
- Extract concepts from headings + glossary terms → create Concept nodes with domain tags

**Pass 3 — Reference Resolution:**
- Parse citation patterns (`[Document vX.Y, §N]`, `[Theorem N.M]`) → REFERENCES edges
- Thread same-concept occurrences across documents → cross-doc edges
- Link emoji spells to formal definitions → COMPRESSES_TO edges
- Connect glossary terms to every section that uses them → lightweight DEFINES edges

**Pass 4 — Semantic Graph:**
- Build concept dependency chains (which concepts require understanding of which others)
- Detect narrative progression (sequential sections/documents) → FOLLOWS edges
- Map theorem → proof → implementation pathways → PROVES/IMPLEMENTS edges
- If persona definitions are detected, compute constellation paths

### Pipeline Configuration

The standalone allows the user to tune pipeline behaviour via Settings:

```typescript
interface PipelineConfig {
  // Pass 2 options
  glossaryDetection: boolean;      // Auto-detect glossary files (default: true)
  spellExtraction: boolean;        // Look for emoji spell patterns (default: true)
  theoremExtraction: boolean;      // Detect theorem/proof blocks (default: true)
  
  // Pass 3 options
  citationParsing: boolean;        // Parse [Document, §Section] refs (default: true)
  crossDocThreading: boolean;      // Connect same concepts across docs (default: true)
  
  // Pass 4 options
  dependencyChains: boolean;       // Build concept dependency graph (default: true)
  narrativeProgression: boolean;   // Detect sequential document ordering (default: true)
  
  // Performance
  maxFiles: number;                // Limit file count (default: 200)
  maxFileSizeKB: number;           // Skip files larger than (default: 500)
  workerCount: number;             // Web Worker pool size (default: navigator.hardwareConcurrency || 4)
}
```

---

## Visualization

Same D3.js components as the spellweb spec, with one addition: **the theme system**.

### Theme System

The standalone ships with three themes. Themes control node colors, edge styles, background, fonts, and ambient effects.

```typescript
// src/themes/agentprivacy.ts
export const agentprivacyTheme: GraphTheme = {
  name: 'agentprivacy',
  background: '#0a0a0f',
  
  nodes: {
    document:    { shape: 'roundedRect', fill: '#1a1a2e', stroke: '#333', emoji: '📜' },
    section:     { shape: 'rect', fill: '#16213e', stroke: '#222' },
    concept_swordsman: { shape: 'hexagon', fill: '#e94560', stroke: '#ff6b81', emoji: '⚔️' },
    concept_mage:      { shape: 'hexagon', fill: '#7b68ee', stroke: '#9b8cf7', emoji: '🧙' },
    concept_firstperson: { shape: 'circle', fill: '#ffd700', stroke: '#ffe44d', emoji: '😊' },
    concept_shared:    { shape: 'hexagon', fill: '#00d9ff', stroke: '#33e5ff' },
    spell:       { shape: 'star6', fill: '#ffd700', glow: true },
    persona:     { shape: 'circleRing', fill: 'domain-dependent' },
    act:         { shape: 'diamond', fill: '#2ecc71', stroke: '#3ddc84' },
    term:        { shape: 'circle', fill: '#95a5a6', size: 'small' },
    theorem:     { shape: 'triangle', fill: '#e74c3c' },
    proverb:     { shape: 'roundedDiamond', fill: '#f39c12', emoji: '✨' },
  },
  
  edges: {
    contains:     { style: 'solid', color: '#333', width: 1 },
    references:   { style: 'dashed', color: '#666', width: 1 },
    defines:      { style: 'solid', color: '#00d9ff', width: 2 },
    proves:       { style: 'solid', color: '#e74c3c', width: 2, arrow: true },
    narrates:     { style: 'dotted', color: '#2ecc71', width: 2 },
    follows:      { style: 'solid', color: '#2ecc71', width: 3, arrow: true },
    compresses_to: { style: 'animatedDash', color: '#ffd700', width: 2 },
  },
  
  fonts: {
    heading: "'Space Mono', monospace",
    body: "'IBM Plex Sans', sans-serif",
    code: "'JetBrains Mono', monospace",
  },
  
  effects: {
    nodeGlow: true,
    edgeParticles: false,
    backgroundNoise: true,
    constellationStars: true,
  }
};

// src/themes/bgin.ts
export const bginTheme: GraphTheme = {
  name: 'bgin',
  background: '#0d1117',
  
  nodes: {
    document:    { shape: 'roundedRect', fill: '#161b22', stroke: '#30363d', emoji: '📋' },
    section:     { shape: 'rect', fill: '#0d1117', stroke: '#21262d' },
    concept_swordsman: { shape: 'hexagon', fill: '#da3633', stroke: '#f85149', emoji: '⚔️' },
    concept_mage:      { shape: 'hexagon', fill: '#8b5cf6', stroke: '#a78bfa', emoji: '🧙' },
    concept_shared:    { shape: 'hexagon', fill: '#58a6ff', stroke: '#79c0ff' },
    // BGIN-specific: Working Group nodes
    working_group:     { shape: 'octagon', fill: '#238636', stroke: '#3fb950', emoji: '🏛️' },
    meeting:           { shape: 'diamond', fill: '#1f6feb', stroke: '#388bfd', emoji: '📅' },
    study_report:      { shape: 'roundedRect', fill: '#f0883e', stroke: '#f7b955', emoji: '📄' },
    term:        { shape: 'circle', fill: '#8b949e', size: 'small' },
  },
  
  edges: {
    contains:     { style: 'solid', color: '#30363d', width: 1 },
    references:   { style: 'dashed', color: '#484f58', width: 1 },
    defines:      { style: 'solid', color: '#58a6ff', width: 2 },
    contributes:  { style: 'solid', color: '#238636', width: 2, arrow: true },
    promises:     { style: 'double', color: '#3fb950', width: 2 },
  },
  
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Source Sans Pro', sans-serif",
    code: "'Source Code Pro', monospace",
  },
  
  effects: {
    nodeGlow: false,
    edgeParticles: false,
    backgroundNoise: false,
    constellationStars: false,
  }
};
```

Theme selection is a dropdown in the Explorer view. The theme applies immediately — same graph, different visual language.

---

## The BGIN AI Bridge

This is why the standalone matters beyond being a sandbox. The BGIN AI frontend spec (14 documents built in February 2026) defines the Three Graphs, One Identity architecture:

| BGIN AI Concept | Graph Engine Mapping |
|---|---|
| Knowledge Graph (per Working Group) | Corpus ingested from WG documents → standard four-pass pipeline |
| Promise Graph | Dynamic layer — VRC/promise edges added at runtime |
| Trust Graph | Dynamic layer — trust tier progression visualized |
| Working Group Mage | Graph RAG agent with WG-specific system prompt |
| Swordsman Key Ceremony | Personal layer — key generation, privacy boundary config |
| Chatham House Compliance | Swordsman layer enforces what's attributable |
| Meeting Reports | Document nodes ingested through pipeline, with meeting-specific metadata |
| Study Reports | Document nodes with cross-WG reference edges |
| Collaborative Workspace | Promise graph interface with shared editing |

The standalone Grimoire Graph proves each of these pieces works independently:

- **Ingest BGIN docs** → knowledge graph ✓
- **Theme to BGIN visual language** → `bgin.ts` theme ✓
- **RAG agent per WG** → same engine, different system prompt per corpus subset ✓
- **Personal layer** → same IndexedDB architecture, different node types ✓

When it's time to integrate into the BGIN AI frontend, the engine module drops in the same way it drops into the spellweb — `src/lib/graph-engine/` with a BGIN-specific wrapper.

---

## Graph RAG Agent (Generic Voice)

The standalone uses a neutral RAG agent voice (not Soulbae). The agent is configurable:

```typescript
// src/engine/rag/system-prompt.ts
export function buildSystemPrompt(config: AgentConfig): string {
  const base = `You are a knowledge graph navigator. You help users explore documentation 
by traversing the graph database and finding connections between concepts.

You have access to the following tools:
- cypher_query: Execute Cypher queries against the KuzuDB graph database
- concept_lookup: Find definitions and related concepts by name
- spell_search: Find spells (compressed notations) related to a concept

When answering questions:
1. Use the graph to find relevant nodes and relationships
2. Reference specific documents and sections
3. Highlight connections the user might not have noticed
4. Keep responses grounded in what the graph actually contains`;

  if (config.persona) {
    return `${base}\n\nYou speak in the voice of: ${config.persona.name}\n${config.persona.description}`;
  }
  
  return base;
}

// Persona presets
export const AGENT_PERSONAS = {
  neutral: { name: 'Navigator', description: 'Clear, direct, helpful. No narrative flavour.' },
  soulbae: { name: 'Soulbae', description: 'The Mage of the Spellbook. Speaks in proverbs, guides through narrative...' },
  bgin_mage: { name: 'Working Group Mage', description: 'Formal, governance-aware, citations-heavy...' },
};
```

Users can select a persona in Settings or leave it on neutral. This is how the same engine serves different communities.

---

## Implementation Phases

### Phase 1: Scaffold (3-4 days)

1. `npm create vite@latest grimoire-graph -- --template react-ts`
2. Install dependencies: `d3`, `kuzu-wasm`, `unified`, `remark-parse`, `comlink`, `@langchain/core`, `jszip`
3. Create directory structure as specified above
4. Copy the `engine/` module structure (types, empty implementations)
5. Create `Landing.tsx` with three input options (repo URL, ZIP, pre-built)
6. Create `Explorer.tsx` shell with ForceGraph placeholder
7. Ship the pre-built `agentprivacy-graph.json` as sample data (hand-craft ~50 nodes initially)
8. **Milestone:** App loads, user selects pre-built graph, sees placeholder visualization

### Phase 2: Engine Core (1-2 weeks)

1. Extract KuzuDB WASM adapter from GitNexus — adapt schema
2. Extract Web Worker pool from GitNexus — test in Vite environment
3. Extract LRU cache from GitNexus
4. Implement `kuzu-adapter.ts` — initialize WASM, create tables, insert nodes/edges, execute queries
5. Implement `persistence.ts` — IndexedDB serialize/deserialize
6. Load the sample graph JSON → KuzuDB → verify queries work
7. **Milestone:** Cypher queries execute against loaded graph data in-browser

### Phase 3: Ingestion Pipeline (1-2 weeks)

1. Implement `markdown-parser.ts` — remark pipeline with section extraction
2. Implement `term-extractor.ts` — glossary detection and term matching
3. Implement `spell-extractor.ts` — emoji pattern matching against known spells
4. Implement `reference-resolver.ts` — citation pattern parsing
5. Implement `semantic-builder.ts` — concept chains, narrative arcs
6. Wire up `github-fetch.ts` for repo URL input
7. Wire up `zip-handler.ts` for ZIP upload
8. Create `Processing.tsx` — show ingestion progress (pass 1/4, pass 2/4, etc.)
9. Test: point at `mitchuski/agentprivacy-docs` → ingest → verify graph
10. **Milestone:** User pastes a GitHub repo URL, pipeline processes it, graph populates

### Phase 4: Visualization (1-2 weeks)

1. Implement `ForceGraph.tsx` with the theme system
2. Implement node shape rendering (hexagons, stars, diamonds, etc.)
3. Implement edge style rendering (solid, dashed, animated, arrows)
4. Implement `NodeInspector.tsx` — click-to-inspect panel
5. Implement `GraphFilters.tsx` — layer toggles
6. Implement `SearchBar.tsx` — node search with highlight
7. Implement `ConstellationView.tsx` — star map layout
8. Implement `TimelineView.tsx` — sequential progression
9. Apply agentprivacy theme as default
10. Create BGIN theme variant
11. **Milestone:** Full visual exploration with theme switching

### Phase 5: Graph RAG (1 week)

1. Implement LangChain ReAct agent with Cypher query tools
2. Implement `GraphChat.tsx` — chat panel in Explorer view
3. Wire up "Ask about this" from NodeInspector → GraphChat
4. Add persona selector (neutral / soulbae / bgin_mage)
5. Privacy budget enforcement
6. **Milestone:** Ask questions, get graph-grounded answers

### Phase 6: Export & Polish (3-4 days)

1. JSON export (full graph)
2. CSV export (node table + edge table)
3. Graph statistics panel
4. Performance tuning (large graphs)
5. Mobile responsiveness basics
6. README with usage instructions
7. **Milestone:** Production-ready standalone tool

---

## Package.json

```json
{
  "name": "grimoire-graph",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "build:sample": "tsx scripts/build-sample-graph.ts"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.x",
    "d3": "^7.x",
    "kuzu-wasm": "latest",
    "unified": "^11.x",
    "remark-parse": "^11.x",
    "remark-frontmatter": "^5.x",
    "remark-gfm": "^4.x",
    "comlink": "^4.x",
    "jszip": "^3.x",
    "@langchain/core": "latest",
    "@langchain/anthropic": "latest",
    "@langchain/openai": "latest"
  },
  "devDependencies": {
    "@types/d3": "^7.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "vite": "^5.x"
  }
}
```

---

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@engine': '/src/engine',
      '@components': '/src/components',
      '@themes': '/src/themes',
    }
  },
  worker: {
    format: 'es'  // Web Workers as ES modules
  },
  optimizeDeps: {
    exclude: ['kuzu-wasm']  // WASM modules need special handling
  },
  build: {
    target: 'esnext',  // Required for WASM + top-level await
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3'],
          'kuzu': ['kuzu-wasm'],
          'langchain': ['@langchain/core', '@langchain/anthropic'],
        }
      }
    }
  }
});
```

---

## Engine Module Extraction Path

When the standalone engine is stable, extract `src/engine/` into a shared module. Two options:

### Option A: npm Package

Publish `@agentprivacy/graph-engine` to npm. Both the standalone and the spellweb import it as a dependency. Clean separation, versioned releases.

```json
// grimoire-graph/package.json
{ "dependencies": { "@agentprivacy/graph-engine": "^0.1.0" } }

// agentprivacy-spellbook/package.json
{ "dependencies": { "@agentprivacy/graph-engine": "^0.1.0" } }
```

### Option B: Monorepo

Use a pnpm/turborepo workspace with the engine as a shared package:

```
agentprivacy/
├── packages/
│   ├── graph-engine/          # Shared module
│   ├── grimoire-graph/        # Standalone app
│   └── spellbook/             # Next.js app
├── pnpm-workspace.yaml
└── turbo.json
```

**Recommendation:** Start as copy-paste between the two repos (fastest). Once the engine API stabilizes after Phase 3, extract to npm package. Monorepo only if both apps are actively developed in parallel.

---

## Creative Iteration Ideas

This is the sandbox. Some things to try here before bringing to the spellweb:

**Graph-as-music:** Map node types to tones, edge traversals to melodies. Navigate the graph by listening. Spells have their own sound signatures.

**Time-lapse view:** Animate the graph growing as documents are added chronologically. Watch the agentprivacy knowledge base emerge from the first whitepaper through to today.

**Diff view:** Load two versions of the docs (e.g., whitepaper v4.6 vs v4.7). Highlight added/removed/changed nodes and edges. See how the knowledge graph evolves.

**Community graph merge:** Two users each build personal annotations independently. Export and merge their graphs (with consent). See where their understanding overlaps and diverges. Proto-VRC formation.

**Adversarial analysis:** Intentionally try to reconstruct private state from the shared graph. Document what's possible and what the separation theorem prevents. The tool becomes its own audit.

**Alternative corpus testing:** Feed in the Plurality book, or BGIN study reports, or W3C specifications. Stress-test the ingestion pipeline on documentation styles the agentprivacy corpus doesn't cover.

---

## Relationship to Other Documents

| Document | Relationship |
|---|---|
| `SPELLWEB_INTEGRATION_SPEC.md` | Primary. The spellweb spec is the production target. This standalone parallels it. |
| `CHRONICLE_SPELLWEB_GENESIS.md` | Narrative context for why this architecture was chosen. |
| `GITNEXUS_AGENTPRIVACY_PLAN.md` | The initial assessment (Plan A / Plan B). This document is the refined Plan A. |
| BGIN AI Frontend Package (14 docs) | Future integration target. The engine proven here ports to BGIN AI. |

---

*"The standalone forges the blade. The integration swings it. The BGIN deployment proves it cuts through any parchment."*

📊🔮🕸️ → ⚔️🧙😊
