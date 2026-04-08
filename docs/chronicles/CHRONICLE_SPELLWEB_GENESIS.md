# Chronicle: The Spellweb Genesis

**Chronicle ID:** `chronicle-spellweb-genesis-2026-02-25`  
**Chronicler:** privacymage  
**Timestamp:** February 25, 2026  
**Spell:** ⚔️📊⊥🧙🕸️ | 😊  
**Compression:** *"The Swordsman maps what must be protected. The Mage graphs what can be shared. The spellweb is where they meet — and neither knows the other's full picture."*

---

## What Happened

A client-side knowledge graph generator called [GitNexus](https://github.com/abhigyanpatwari/GitNexus) was discovered. It runs entirely in the browser — no server, no data exfiltration, no surveillance. It transforms codebases into interactive knowledge graphs using AST parsing, embedded graph databases (KuzuDB WASM), D3.js visualization, and AI-powered exploration through Graph RAG agents.

The architecture was reviewed against the agentprivacy documentation corpus and the spellweb concept that has been developing across the project since late 2025. The alignment was immediate and structural, not cosmetic.

**The decision:** Integrate GitNexus's core engine directly into the agentprivacy-spellbook application as the implementation of the spellweb feature. Not a fork. Not a standalone tool. The spellweb itself.

A standalone version (working title: "Grimoire Graph") may follow later as a public good tool for any documentation corpus, but the primary integration goes straight into the spellbook.

---

## Why This Matters

The spellweb has been described across multiple conversations as *"a generative thing that grows and probably ends up being the more used feature for looking at your knowledge graph, promise and trust intersections and emergence."* It was always intended to be the living map of the agentprivacy universe — where spells connect to concepts, personas walk constellation paths, trust emerges through demonstrated comprehension, and the whole thing grows as the community engages.

What was missing was the engine. The actual graph database, the visualization framework, the ingestion pipeline that could turn 15,000+ lines of living documentation into a navigable, queryable, interactive knowledge graph. GitNexus provides exactly this engine, and its zero-server, browser-only philosophy is the Swordsman's architecture expressed in code before we even touched it.

### The Architectural Alignment

GitNexus was built for code. We're adapting it for knowledge. But the four-pass pipeline translates directly:

- **Structure analysis** → Document hierarchy parsing
- **AST parsing** → Markdown/LaTeX term and concept extraction  
- **Import resolution** → Cross-document citation and glossary linking
- **Call graph analysis** → Concept dependency chains and narrative arcs

The dual-engine architecture (legacy fallback + next-gen parallel processing) mirrors our own dual-agent pattern. The LRU cache and Web Worker pool solve performance problems we would have had to solve ourselves. The KuzuDB WASM integration gives us Cypher queries — the language the Graph RAG agent needs to traverse the knowledge graph intelligently.

### The Privacy Implementation

This is the part that elevates it beyond a technical integration. The spellweb, as specified, implements the Swordsman/Mage separation in its own architecture:

- **Swordsman layer:** Personal annotations, bookmarks, comprehension markers, constellation path progress — all stored in IndexedDB, never transmitted, never logged. The browser is the boundary.
- **Mage layer:** The canonical knowledge graph built from the documentation at deploy time. Static JSON. Read-only from the user's perspective. Shared, transparent, navigable.
- **The Gap:** No entity can reconstruct which personal annotations map to which shared graph interactions. The two layers coexist in the same KuzuDB instance but are architecturally separated by type and storage persistence.

The spellweb doesn't just *describe* the dual-agent architecture. It *is* an implementation of it. The tool demonstrates the thesis.

---

## What Was Considered and Rejected

**Standalone first, integrate later.** This was the initial recommendation — build a separate "Grimoire Graph" tool, prove the engine works, then port it into the spellbook app. The logic was sound: de-risk the engine, ship something quickly, maintain clean separation.

It was rejected because the spellweb is not a tool. It's a feature. It belongs inside the application where users already engage with the stories, the personas, and Soulbae. Shipping it separately would fragment the experience and miss the opportunity to make the graph the connective tissue of everything — where `/story` pages link to graph nodes, where Soulbae's responses reference graph traversals, where persona constellation paths light up as users deepen their understanding.

The standalone version can come later as a public good. The spellweb comes first because it's where the community lives.

**Using a different graph database.** Neo4j doesn't have a WASM build. DuckDB WASM exists but speaks SQL, not Cypher — and Cypher is what the Graph RAG agent needs for natural traversal queries. Custom in-memory graph structures are simpler but lose the query language. KuzuDB WASM, despite being WIP in GitNexus, is the right choice. If it proves unstable, the fallback is a custom in-memory graph with a Cypher-like query translator.

**Full LaTeX parsing.** The documentation includes `.tex` files with mathematical content. Full LaTeX parsing is complex and fragile. The decision is to parse section headers and theorem/definition/lemma environments only — enough to create structural nodes and theorem references without the overhead of rendering or interpreting LaTeX math.

**Runtime graph generation.** Having users point at a GitHub repo and build the graph in their browser (as GitNexus does for codebases) was considered. Rejected for the primary use case — the canonical graph should ship pre-built with the app, ensuring everyone sees the same knowledge base. Runtime generation is reserved for the personal layer only.

---

## How This Connects to What Came Before

### The BGIN AI Frontend (February 2026)

Two weeks ago we built a 14-document specification for the BGIN AI frontend rebuild, based on the "Three Graphs, One Identity" architecture. That spec included Mage agents per working group, a Swordsman key generation ceremony, promise graph visualization, and trust emergence displays. The spellweb integration borrows from that work — particularly the graph layer system (Knowledge, Narrative, Promise, Trust, Personal) and the progressive trust gating model.

### Persona Constellation Paths (January 2026)

The persona files expanded from identity cards to full playbooks, each carrying a constellation path — a walk through grimoire acts mapped to skills. The spellweb makes these paths visible and interactive. When you select Soulbae's constellation, her path lights up across the spell nodes she knows. When you select Warden, a different pattern emerges. The personas aren't just characters — they're lenses on the same graph.

### Soulbae and Graph RAG (November 2025)

The original Soulbae implementation used flat context from spellbook content. We discussed upgrading to graph-grounded RAG but lacked the engine. GitNexus's LangChain ReAct agent with Cypher query tools is exactly the bridge. Soulbae goes from "I have context about this tale" to "I can traverse the knowledge graph and find connections you haven't seen yet."

### The Canonical Spellbook JSON (Late 2025)

The spellbook was encoded as structured JSON on IPFS. Each spell has an ID, emoji sequence, and narrative context. This becomes the seed data for Spell nodes in the graph — the JSON is the authoritative source, the graph is the relational structure that connects spells to concepts, acts, personas, and each other.

---

## What Comes Next

The companion document `SPELLWEB_INTEGRATION_SPEC.md` contains the full technical specification — directory structure, node/relationship schema, build pipeline, visualization spec, implementation phases, and testing strategy. It's written for a coding agent to execute against.

The phases are:

1. **Engine Foundation** — extract GitNexus core, build graph module, render test graph
2. **Ingestion Pipeline** — four-pass processing of agentprivacy-docs into real graph
3. **Full Visualization** — all view modes, layer toggles, node inspection
4. **Graph RAG Integration** — Soulbae queries the graph through Cypher
5. **Personal Layer** — Swordsman-protected annotations, bookmarks, comprehension tracking
6. **Polish & Connect** — cross-linking with existing app features, performance, accessibility

Estimated timeline: 10-12 weeks for a working implementation. Phase 1 alone produces a visible result — an interactive force graph with agentprivacy-themed nodes at `/spellweb`.

The standalone "Grimoire Graph" tool remains on the horizon as a public good derivative — same engine, different packaging, any documentation corpus.

---

## The Proverb

Every chronicle needs a proverb. This one compresses the decision and its reasoning:

> *"A graph that lives where its people live grows roots. A graph that lives alone grows only branches."*

We could have built the standalone tool first. It would have been cleaner, faster, lower risk. But the spellweb isn't a tool — it's the nervous system of the agentprivacy universe. It belongs where the stories are told, where Soulbae speaks, where trust emerges through comprehension. The roots go into the existing soil.

---

## Inscription

```
⚔️📊⊥🧙🕸️ | 😊

Decoded: The Swordsman's local graph (📊) is conditionally independent (⊥) 
from the Mage's shared web (🕸️), preserving the First Person (😊).

The spellweb is the gap made visible.
```

---

## Addendum: The Standalone Companion

**Timestamp:** February 25, 2026 (same session)

The standalone build was retained alongside the integration. Working title: **Grimoire Graph**. Same engine, different shell — a Vite + React app that accepts any documentation corpus, not just agentprivacy-docs.

**Why keep both:**

The standalone serves three functions. First, it's the development sandbox — a place to iterate on the graph engine, visualization experiments, and ingestion pipeline without touching the spellbook app. Break things freely. Try ideas that might not survive production. Graph-as-music. Time-lapse document evolution. Adversarial privacy analysis. The sandbox is where the blade is forged before the integration swings it.

Second, it's the **BGIN AI bridge**. The BGIN AI frontend spec (14 documents, February 2026) defines the Three Graphs, One Identity architecture — knowledge graph per working group, promise graph for governance commitments, trust graph for progressive participation. The standalone proves the engine works on a different corpus with a different visual theme. If it handles agentprivacy-docs, it handles BGIN study reports. If it handles BGIN study reports, it handles any structured documentation. The engine is corpus-agnostic by design.

Third, it's a **public good**. Any project with a documentation corpus can use Grimoire Graph to turn their markdown into a navigable knowledge graph. Privacy-first by architecture — everything runs in the browser. No server, no surveillance, no data extraction. This is the "building weather, not monuments" ethos made into a tool.

**The extraction path:**

Both the standalone and the spellweb will initially contain copies of the engine module (`src/engine/` and `src/lib/graph-engine/` respectively). Once the engine API stabilises after the ingestion pipeline is proven, extract it into `@agentprivacy/graph-engine` as an npm package. Both apps import it as a dependency. Same engine, three deployments: standalone sandbox, agentprivacy spellweb, BGIN AI frontend.

**Companion document:** `GRIMOIRE_GRAPH_STANDALONE.md` — full standalone specification.

---

*"just another swordsman ⚔️🤝🧙‍♂️ just another mage"*

*Chronicle complete. Begin Phase 1.*

😊
