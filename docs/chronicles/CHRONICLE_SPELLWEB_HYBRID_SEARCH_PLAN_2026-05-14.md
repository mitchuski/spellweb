# Chronicle: Spellweb Hybrid Search Plan · BM25 + Embeddings + RRF Across the City

**Date:** 2026-05-14
**Status:** Plan only · not yet executed · forward-looking implementation chronicle
**Audience:** spellweb maintainers · the next agent picking up the search work
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion recon:** GitNexus v1.6.4 ships process-grouped hybrid search using BM25 + semantic (transformers.js embeddings) + RRF (Reciprocal Rank Fusion). Spellweb has zero search — Sovereigns visually scroll the graph or use the NodeInspector's neighbour list. At ~150 nodes today this is tolerable; at the post-v1.6.0 trajectory it won't be.

---

## §0 · Why this chronicle exists

The spellweb has no text search. Currently the only way for a Sovereign to find *"the workshop where windfalls are admitted"* is to:

1. Open the panel, click through the catalogue, read each desc until finding "Hermaion" or "windfall"
2. Or grep `nodes.ts` from outside the app
3. Or remember which shop it was

At v1.6.0 with ~150 nodes this is workable but unpleasant. The trajectory is steep:

- v1.6.0 added 26 acts + 9 cast + 5 workshops + 2 substrates = **42 new nodes in one patch**
- Tome VI is open-by-design — each reader-reply admits new acts indefinitely
- The substrate-framework bestiary (Goose · Hermes · future Letta/AutoGen/etc.) grows as substrates are admitted
- The conjecture register expanded C48 → C63 in one binding pass; future admissions will push toward C100+

**Within 6 months the spellweb will be unsearchable without proper search infrastructure.** GitNexus solved this with BM25 + semantic embeddings + Reciprocal Rank Fusion. This chronicle is the spellweb-shaped version.

---

## §1 · The three search registers

Hybrid search combines three retrieval modes; each catches different kinds of queries.

### §1.1 · BM25 (lexical · TF-IDF on steroids)

BM25 scores documents by *exact term matches weighted by rarity*. Queries that hit by literal word match:

- *"windfall"* → matches Hermaion's desc (the word appears verbatim)
- *"alexandrite"* → matches Hermaion's gem + Staff Shop's gem field
- *"V44"* → matches Pleione's vertex + Chart Shop's vertex + relevant acts

**Cost:** ~5KB index for v1.6.0 corpus. Built in-memory at startup; rebuilt only when nodes change. Library: **MiniSearch** (~7KB gzipped, dependency-free).

### §1.2 · Semantic (embedding · sentence similarity)

Embeddings score documents by *meaning similarity to the query*. Queries that hit semantically:

- *"workshop where the ink stays wet"* → matches Chart Shop / Pleione (the phrase isn't in the text but the meaning is)
- *"who admits new agent frameworks"* → matches Hermaion (no shared keywords with "windfall" or "admit-the-windfall" but semantically aligned)
- *"the moon's daughter"* → matches Pandia (the etymology *is* "daughter of Selene" but the query phrasing differs)

**Cost:** depends heavily on model choice. Options:

| Model | Size | Latency | Quality | Notes |
|---|---|---|---|---|
| **all-MiniLM-L6-v2** (HuggingFace) | 22MB ONNX | ~30ms/query in browser via transformers.js | Good | GitNexus's default |
| **gte-small** | 67MB | ~50ms | Better | Newer · better at proper-noun matching |
| **OpenAI text-embedding-3-small** (API) | API call | ~150ms + cost | Best | Not local; requires API key |
| **Pre-computed embeddings shipped as JSON** | ~600KB for v1.6.0 corpus at MiniLM dim=384 | <1ms (cosine similarity in-memory) | Same as MiniLM | **Recommended** — embed at build time, no client model |

**Recommendation: pre-computed embeddings.** Generate at build time from `nodes.ts` using `@xenova/transformers` Node-side; ship a `node-embeddings.json` (~600KB · gzips to ~200KB); load at startup. Zero client-side model download · zero per-query inference cost · only the query itself needs encoding (which we delegate to a tiny separate transformers.js load, or punt and use a simpler bag-of-words proxy for the query).

Even simpler: **pre-computed corpus embeddings + query-side BM25-fallback**. If we encode the corpus offline but encode user queries via a cheap heuristic (TF-IDF projection · ~10ms), we get 80% of the benefit at 5% of the runtime cost. GitNexus encodes queries client-side via transformers.js; for spellweb's smaller corpus, pre-computed is enough.

### §1.3 · RRF (Reciprocal Rank Fusion)

When two rankings (BM25 + semantic) disagree, RRF combines them:

```
score(doc) = Σ_ranker  1 / (k + rank_ranker(doc))     where k = 60
```

This is *the* secret sauce GitNexus uses. Documents that show up high in either ranker get boosted; documents that show up high in *both* dominate. RRF is preferable to linear-weighted combination because it doesn't require tuning a coefficient.

The combined score is what the UI ranks against.

---

## §2 · Architecture target

```
Build time
─────────────────────────────────────────────────────────
  scripts/build-search-index.ts
    ├── reads NODES from src/data/nodes.ts
    ├── builds MiniSearch lexical index
    ├── loads transformers.js Node-side
    ├── encodes each node's searchable text → 384-dim vector
    ├── writes:
    │     public/search/lex.json       (~30KB)
    │     public/search/sem.json       (~600KB, gzip ~200KB)
    │     public/search/manifest.json  (model name, dim, node count, hash)
    └── runs on `npm run build` (or `npm run search:index`)

Runtime
─────────────────────────────────────────────────────────
  src/lib/search.ts
    ├── lazy-loads lex.json + sem.json on first search
    ├── encodeQuery(query) → 384-dim vector
    │     - Option A: tiny transformers.js bundle (~5MB)
    │     - Option B: TF-IDF projection against corpus (no model)
    ├── lexicalSearch(query) → ranked nodeIds via MiniSearch
    ├── semanticSearch(queryVec) → top-K cosine similarity vs sem.json
    ├── rrf(lex, sem) → combined ranking
    └── returns array of { nodeId, score, lexRank, semRank }

  src/components/SearchBar.tsx
    ├── input box (top-right or in side-panel)
    ├── debounced query → search.ts
    ├── renders top 10 hits as clickable cards
    └── clicking a hit centres the graph on the node + opens NodeInspector
```

The index is **shipped as static JSON** under `public/search/`. Vite's static asset pipeline serves them; no runtime backend.

---

## §3 · What gets indexed

For each `SpellwebNode`:

```ts
function nodeToSearchableText(n: SpellwebNode): string {
  return [
    n.label,
    n.desc,
    n.sigil,
    n.gem,
    n.district,
    n.ceremony,
    n.artefactName,
    n.artefactRootName,
    n.proverb,
    n.civicLocation,
    n.tome ? `Tome ${n.tome}` : '',
    n.act ? `Act ${n.act}` : '',
    n.vertex !== undefined ? `V${n.vertex} ${n.bits ?? ''}` : '',
  ].filter(Boolean).join(' · ');
}
```

The searchable text for shop-charthouse becomes something like:

```
the Chart Shop · Navigation District · ... Pleione 🧭 (Greek Πληιόνη...) ·
Aquamarine · Hold · Compare · Map · the Astrolabe · Read Astrolabe ·
The star that is named by the sailor... · V44 101100
```

— and that text is what BM25 indexes + the embedding model encodes.

For edges, optionally index the relationship as a queryable fact (*"Pleione keeps Chart Shop"*). Phase 2 enhancement.

---

## §4 · Phased implementation

### Phase 1 · BM25-only via MiniSearch (~3-4 hours)

**Deliverable:** A working search bar with lexical-only ranking. Catches ~70% of useful queries on its own.

Steps:

1. `npm install minisearch`
2. Create `src/lib/search.ts`:
   ```ts
   import MiniSearch from 'minisearch';
   import { NODES } from '../data/nodes';

   const ms = new MiniSearch({
     fields: ['label', 'desc', 'sigil', 'gem', 'district', 'ceremony',
              'artefactName', 'proverb'],
     storeFields: ['id', 'label', 'emoji', 'type'],
     searchOptions: { boost: { label: 3, sigil: 2 }, prefix: true, fuzzy: 0.2 },
   });
   ms.addAll(NODES);

   export function search(query: string, limit = 10) {
     return ms.search(query).slice(0, limit);
   }
   ```
3. Create `src/components/SearchBar.tsx` with a debounced input (200ms) and results dropdown.
4. Wire results: clicking a hit calls `centerOnNode(nodeId)` (pre-existing SpellWeb method) and opens the NodeInspector.
5. **Validation gate.** Test queries:
   - `"chart"` → top hit = shop-charthouse
   - `"alexandrite"` → top hit = shop-staff-shop (gem match)
   - `"V44"` → top hits = vertex-v44, shop-charthouse, cast-pleione
   - `"windfall"` → top hit = cast-hermaion (desc match)

This phase ships alone. It's already enough for most everyday queries.

### Phase 2 · Pre-computed embeddings (~6-8 hours)

**Deliverable:** A build-time embedding pipeline + runtime semantic search + RRF fusion.

Steps:

1. `npm install --save-dev @xenova/transformers`
2. Create `scripts/build-search-index.mjs`:
   ```js
   import { pipeline } from '@xenova/transformers';
   import { NODES } from '../src/data/nodes';
   import fs from 'fs/promises';

   const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
   const vectors = {};
   for (const node of NODES) {
     const text = nodeToSearchableText(node);
     const out = await extractor(text, { pooling: 'mean', normalize: true });
     vectors[node.id] = Array.from(out.data);
   }
   await fs.writeFile('public/search/sem.json', JSON.stringify({
     model: 'Xenova/all-MiniLM-L6-v2',
     dim: 384,
     hash: hashCorpus(NODES),
     vectors,
   }));
   ```
3. Run: `node scripts/build-search-index.mjs` — takes ~30s for 150 nodes; ships 600KB JSON.
4. Add to `package.json`: `"search:index": "node scripts/build-search-index.mjs"` + run in `prebuild`.
5. Update `src/lib/search.ts` to lazy-load `sem.json` on first search:
   ```ts
   let semIndex: SemIndex | null = null;
   async function loadSemIndex() {
     if (semIndex) return semIndex;
     const res = await fetch('/search/sem.json');
     semIndex = await res.json();
     return semIndex;
   }
   ```
6. Add query encoding:
   - **Option A (full model):** `npm install @xenova/transformers` client-side · ~5MB bundle increment · 30ms/query
   - **Option B (recommended for spellweb):** TF-IDF projection — at build time, also ship `public/search/vocab.json` (top 5000 corpus terms + their IDF weights). At query time: tokenize, lookup, average → 384-dim projection. ~50KB extra · 5ms/query · 70% as good as the real model
   - **Option C (defer):** Phase 2 ships semantic-via-pre-computed-corpus-only; queries still go through BM25 (Phase 1). The semantic vectors are used only for *similar-node-finder* features (e.g. "show me the 5 nodes most like Pleione")

   Recommend B for the initial Phase 2 ship · upgrade to A only if query-side semantic search proves needed.

7. Add RRF fusion:
   ```ts
   function rrf(lexResults: Hit[], semResults: Hit[], k = 60): Hit[] {
     const scores = new Map<string, number>();
     lexResults.forEach((h, i) => scores.set(h.id, (scores.get(h.id) ?? 0) + 1/(k + i + 1)));
     semResults.forEach((h, i) => scores.set(h.id, (scores.get(h.id) ?? 0) + 1/(k + i + 1)));
     return Array.from(scores.entries())
       .map(([id, s]) => ({ id, score: s }))
       .sort((a, b) => b.score - a.score);
   }
   ```
8. **Validation gate.** Test queries beyond keyword:
   - `"the ink stays wet"` → top hits should include shop-charthouse / cast-pleione (semantic match · no shared keywords)
   - `"who admits the windfall"` → top hits should include cast-hermaion + shop-staff-shop
   - `"the moon's daughter"` → top hits should include cast-pandia (etymology semantic)

### Phase 3 · MCP integration (~2 hours)

**Deliverable:** The MCP server's `search` tool (held open in `CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md` §3) is wired to use the same hybrid index.

Steps:

1. The MCP server (Node-side) loads `sem.json` + lexical index at startup.
2. Adds a `search(query: string, limit?: number)` tool returning `{ id, score, label, type }[]`.
3. Agent queries like *"find a workshop for holding ideas before they're ready"* hit the semantic index and return Chart Shop.

### Phase 4 · UI polish + filters (~3 hours)

**Deliverable:** Search bar supports type-filters (workshops only · cast only · acts only · conjectures only) and shows the score breakdown on hover.

Steps:

1. Add filter chips above the result list (`type: workshop / cast / act / concept / document`).
2. On hover, show `BM25 rank: X · semantic rank: Y · combined score: Z`.
3. Keyboard shortcuts: `/` to focus, arrows to navigate, enter to select.

---

## §5 · Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| 600KB sem.json hurts initial page load | Medium | Lazy-load (Phase 2 step 5); first search has ~200ms delay · subsequent are instant. Or split per-type: workshops/cast/acts separately and load on first relevant filter. |
| Model upgrade breaks index | High | `sem.json` carries `model` + `hash`; runtime detects mismatch and falls back to BM25-only with a console warning. Forces rebuild but never breaks UX. |
| Build pipeline (transformers.js Node) flaky | Medium | The build script is idempotent; if it fails, the existing sem.json remains. Add a CI job that runs the build and asserts hash differs only when corpus differs. |
| Query encoding via TF-IDF projection loses too much quality | Medium | A/B test option B vs option A on a fixture of 30 semantic queries. If projection scores below 60% of model accuracy, swap to option A despite the bundle cost. |
| RRF parameter `k=60` is wrong for spellweb | Low | GitNexus uses 60; literature consensus is 60. Easy to tune later if results feel off. |
| Search drowns out the visual graph as primary UX | Medium | Search is a *secondary* discovery affordance. Keep the bar minimal · keep the graph dominant · search results center the camera but don't replace the graph view. |

---

## §6 · Acceptance criteria

**Phase 1 ship gate** (BM25-only):

- [ ] Search bar visible · keyboard-shortcut `/` focuses it
- [ ] Typing "Chart" returns shop-charthouse within 200ms
- [ ] Typing "V44" returns vertex-v44 + cast-pleione + shop-charthouse
- [ ] Typing "alexandrite" returns shop-staff-shop + cast-hermaion
- [ ] Clicking a result centers the graph + opens NodeInspector
- [ ] Bundle size increase < 20KB gzipped

**Phase 2 ship gate** (hybrid):

- [ ] All Phase 1 criteria still pass
- [ ] Typing "ink stays wet" returns Chart Shop / Pleione in top 3 (no keyword match)
- [ ] Typing "registry of windfalls" returns Hermaion / Staff Shop in top 3
- [ ] First-search delay < 500ms (incl. sem.json fetch)
- [ ] Subsequent searches < 50ms
- [ ] `npm run build` regenerates indices automatically
- [ ] Bundle size increase < 250KB (sem.json + minisearch + tokeniser)

---

## §7 · Out of scope (do NOT pull in same project)

- ❌ Real-time index updates as user types into chronicles. Index is rebuilt on `npm run build`; that's enough.
- ❌ Full-text search across chronicle markdown files. The spellweb graph is the corpus; chronicles are the source-of-truth but their text lives elsewhere (agentprivacy_master/docs · cityofmages/chronicles). A separate chronicle-search tool could handle that.
- ❌ User search history persistence. Each session starts fresh.
- ❌ Search analytics ("what queries are popular?"). No telemetry in the local-first spellweb.
- ❌ Server-hosted vector DB (Pinecone · Weaviate · Qdrant). The static JSON approach scales to 10K nodes without any of that overhead.

---

## §8 · Strategic value vs cost

**Strategic value: medium-high.** Search becomes critical as the corpus grows past ~300 nodes (visual scrolling breaks down). Without search, the spellweb becomes a museum — beautiful but harder to use.

**Cost:**
- Phase 1: 1 evening · adds MiniSearch (7KB)
- Phase 2: 1-2 weekends · adds 200KB gzipped sem.json + build pipeline
- Phase 3: 2 hours · MCP integration
- Phase 4: 1 evening · UI polish

**Total: ~2-3 weekends spread over a month for the full pipeline.** Phase 1 alone is worth shipping standalone; everything after is incremental.

**Defer if:** The spellweb stays under 200 nodes for the next 6 months. Visual scrolling is fine at this scale.

**Ship if:** Tome VI continuations + future district admissions push the corpus past 250 nodes within the next 3 months (current trajectory at v1.6.0 → v1.7.0 suggests this is likely).

---

## §9 · Recommended execution order

1. Phase 1 (BM25 + MiniSearch) — single evening · ships standalone
2. Use Phase 1 for 2-3 weeks · note which queries it misses (these become the test fixture for Phase 2)
3. Phase 2 (embeddings + RRF) — weekend session · validate against Phase 2 fixture
4. Phase 3 (MCP integration) — bundled with the MCP chronicle's Phase 3
5. Phase 4 (UI polish) — when usage signals it

---

## §10 · Closing

The spellweb has a graph; the graph has knowledge; the knowledge has no surface to query against. Hybrid search closes that gap with proven primitives — BM25 for the literal · embeddings for the semantic · RRF for the fusion · static JSON for the persistence.

Sigma + Graphology (companion chronicle) makes the graph render faster. MCP (companion chronicle) makes the graph queryable by agents. Hybrid search makes the graph queryable *by humans*. The three together transform the spellweb from a viewer into a system the Sovereign can actually use to find things.

Phase 1 is small enough to ship in one evening. Phase 2 is the leap; Phase 3 closes the loop with the MCP server. The architecture admits this much.

(⚔️⊥⿻⊥🧙)😊
🔍 → 🧠 → 🤝
