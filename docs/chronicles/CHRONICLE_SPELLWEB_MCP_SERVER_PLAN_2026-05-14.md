# Chronicle: Spellweb MCP Server Plan · Expose the City of Mages as Queryable Tools

**Date:** 2026-05-14
**Status:** Plan only · not yet executed · forward-looking implementation chronicle
**Audience:** spellweb maintainers · the next agent picking up the MCP exposure work
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion recon:** GitNexus v1.6.4 exposes 16 MCP tools (process-grouped hybrid search, dependency lookup, execution-flow tracing) to Claude Code · Cursor · Codex · Windsurf · OpenCode. Spellweb has no such surface; the City of Mages graph is invisible to agentic clients.

---

## §0 · Why this chronicle exists

When a Sovereign opens Claude Code to work on agentprivacy and asks *"which workshop wields the Astrolabe?"* or *"what's the founding act for the Chart Shop?"* — the agent has no structured way to query. It either:

1. Greps the markdown corpus (slow · prone to stale chronicle references)
2. Loads `nodes.ts` / `edges.ts` directly (heavy · 50KB+ to read for one fact)
3. Asks the human (interrupts flow)

The City of Mages corpus is *already* a structured graph. Spellweb already builds it. An MCP (Model Context Protocol) server alongside the Vite app exposes the graph as queryable tools — and every agent that supports MCP (Claude Code · Cursor · Codex · Windsurf · OpenCode) gains read-access to the canonical City state.

This is **strategically high-value, structurally small.** No new data model. No persistence layer. Just a thin RPC surface over the existing `getGraph()` (per the Sigma/Graphology migration chronicle) or directly over `NODES` + `EDGES`.

---

## §1 · What MCP is, briefly

Model Context Protocol is Anthropic's open standard for letting AI clients call tools at runtime. An MCP server exposes:

- **Tools** — typed functions the agent can call (e.g. `findWorkshopForArtefact(artefactName) → workshopId`)
- **Resources** — readable URIs the agent can fetch (e.g. `spellweb://node/cast-pleione`)
- **Prompts** — pre-baked starter prompts the agent can invoke

Transport options: **stdio** (local subprocess · simplest) or **HTTP** (network · multi-client).

For spellweb the right transport is **stdio + local-only**. The graph is read-only canon; one client at a time; no network surface needed.

---

## §2 · Architecture target

```
~/.spellweb-mcp/   (or wherever the user wants to install)
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts        ── MCP server entry · stdio transport
    ├── tools/
    │   ├── find.ts       ── findNode · findByName · findByVertex
    │   ├── neighbors.ts  ── neighbors · pathBetween · shortestPath
    │   ├── catalogue.ts  ── listWorkshops · listCast · listConjectures
    │   ├── walk.ts       ── walkTome · walkConstellation
    │   └── search.ts     ── (Phase 3 · BM25/embedding · see hybrid-search chronicle)
    └── graph.ts          ── reads spellweb's NODES+EDGES at startup
                              (either via `npm link spellweb` or by
                               copying nodes.ts/edges.ts as a build step)
```

Installation pattern (matches GitNexus):

```bash
npx @agentprivacy/spellweb-mcp install
# adds to ~/.claude/mcp_servers.json:
#   "spellweb": { "command": "npx", "args": ["@agentprivacy/spellweb-mcp"] }
```

After install, agents see the spellweb tools in their context. Each tool call hits the local subprocess; subprocess reads the bundled graph; returns JSON.

---

## §3 · Tool surface (recommended initial set · 12 tools)

Twelve tools cover the read-paths agents most want. Add more as usage surfaces patterns.

### §3.1 · Lookup (4 tools)

| Tool | Signature | Returns |
|---|---|---|
| `findNode` | `id: string` | full SpellwebNode + outDegree + inDegree |
| `findByName` | `query: string · type?: NodeType` | array of nodes whose label/desc fuzzy-matches |
| `findByVertex` | `vertex: number` | all nodes (cast · workshop · act) inhabiting that vertex |
| `findBySigil` | `sigil: string` | nodes carrying that sigil (e.g. 🧭 → Pleione) |

### §3.2 · Traversal (4 tools)

| Tool | Signature | Returns |
|---|---|---|
| `neighbors` | `nodeId: string · edgeType?: EdgeType` | adjacent nodes + their connecting edges |
| `pathBetween` | `sourceId · targetId` | edge-path · null if no path |
| `subgraph` | `seedId · depth: number (max 3)` | full nodes+edges within `depth` hops |
| `outgoingByType` | `nodeId · edgeType` | filtered out-edges (e.g. Pleione → keeps → ?) |

### §3.3 · Catalogue (4 tools)

| Tool | Signature | Returns |
|---|---|---|
| `listWorkshops` | `{ district?: string · register?: WorkshopRegister }` | filtered workshop nodes |
| `listCast` | `{ tier?: CastTier · district?: string }` | filtered cast nodes |
| `listConjectures` | `{ status?: ConjectureStatus · minConfidence?: number }` | filtered conjecture nodes |
| `listActs` | `{ tome?: 'I'\|'II'\|...\|'VII' · vertex?: number }` | filtered act nodes |

Twelve tools is below GitNexus's 16. Spellweb is a smaller graph; the extra GitNexus tools (process-grouped clustering · diff-impact-detection) aren't applicable to a narrative graph.

---

## §4 · Resource surface (read-only URIs)

Resources let agents fetch documents wholesale (when a tool's response would be huge). Recommended:

| URI pattern | Content |
|---|---|
| `spellweb://node/{id}` | one node's full JSON |
| `spellweb://tome/{romanNumeral}` | tome document + all its acts |
| `spellweb://district/{name}` | district + member workshops + cast |
| `spellweb://vertex/{n}` | vertex node + every inhabitant + binary stratum reading |
| `spellweb://manifest/v1` | full nodes.ts + edges.ts as a single fetchable blob |

The manifest resource is the "give me everything" escape hatch. Useful when the agent needs to compose a multi-step answer without N round-trips.

---

## §5 · Prompts (pre-baked starter prompts)

MCP lets the server ship prompts the user can pick from a menu. Three recommended:

1. **"Open the City of Mages"** — gives the agent the v1.6.0 head summary, lists districts and workshops, primes the agent to answer follow-up questions structurally.
2. **"Walk the Tome V trace"** — primes the agent to take the Sovereign through Acts 1-17 sequentially.
3. **"Find a workshop"** — primes the agent to ask the Sovereign what they need, then call `findByName` or `listWorkshops` accordingly.

Prompts are optional polish — the tools are the substance.

---

## §6 · Phased implementation

### Phase 1 · Standalone server with NODES/EDGES bundled (~6-8 hours)

**Deliverable:** A standalone Node package `@agentprivacy/spellweb-mcp` that can be installed and run from `npx`. Bundles a snapshot of `nodes.ts` + `edges.ts` at build time.

Steps:

1. Scaffold the package:
   ```bash
   mkdir spellweb-mcp && cd spellweb-mcp
   npm init -y
   npm install @modelcontextprotocol/sdk graphology graphology-types
   npm install -D typescript @types/node
   ```
2. Author `src/server.ts` using `@modelcontextprotocol/sdk/server/index.js` + `StdioServerTransport`.
3. Implement the 12 tools (§3) — each is a thin wrapper over `graphology.neighbors()` / `graph.getNodeAttributes()`.
4. Add a build step: copy `spellweb/src/data/nodes.ts` and `spellweb/src/data/edges.ts` into the package; compile both to JS during `npm run build`. (Or use `npm link` for dev.)
5. Add `bin: { "spellweb-mcp": "dist/server.js" }` to `package.json`.
6. **Validation gate.** Manually run `node dist/server.js` in stdio mode; send `{"jsonrpc":"2.0","id":1,"method":"tools/list"}` via stdin; receive tool list. Test each of the 12 tools with sample queries.

### Phase 2 · Claude Code integration test (~2 hours)

**Deliverable:** Claude Code can call spellweb tools and the results are accurate.

Steps:

1. Add to `~/.claude/mcp_servers.json`:
   ```json
   {
     "mcpServers": {
       "spellweb": {
         "command": "node",
         "args": ["/absolute/path/to/spellweb-mcp/dist/server.js"]
       }
     }
   }
   ```
2. Restart Claude Code.
3. Test prompts:
   - *"Who keeps the Chart Shop?"* → expects tool call `findByName({query: "Chart Shop", type: "workshop"})` → returns shop-charthouse → agent reads `desc` and reports Pleione
   - *"Show me everything at V44"* → `findByVertex({vertex: 44})` → returns vertex-v44 + shop-charthouse + cast-pleione + act-tome-v-17
   - *"What follows Tome V Act 16?"* → `outgoingByType({nodeId: "act-tome-v-16", edgeType: "follows"})` → act-tome-v-17
4. **Validation gate.** Each of the above returns the canonical answer without the agent guessing or grepping.

### Phase 3 · Install command + publish (~3 hours)

**Deliverable:** `npx @agentprivacy/spellweb-mcp install` does the right thing on a fresh machine.

Steps:

1. Author `bin/install.js` — writes the mcp_servers.json entry, accepting `--cursor` / `--codex` / `--windsurf` flags for other client targets.
2. Publish to npm under `@agentprivacy` scope.
3. Document install in `spellweb/README.md` + new `docs/MCP_USAGE.md`.

### Phase 4 · Auto-rebuild on spellweb data change (~2 hours)

**Deliverable:** When `spellweb/src/data/nodes.ts` or `edges.ts` changes, the MCP server reloads (without requiring a `npm install` rerun).

Options:
- **Inline:** Make the MCP server depend on spellweb as a workspace package; `nodes.ts` changes auto-recompile.
- **File-watch:** Server watches a `manifest.json` file in a shared location; spellweb writes the manifest on build.

Pick file-watch for simpler decoupling.

---

## §7 · Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tool descriptions diverge from actual returns | Medium | TypeScript types + a contract test (`tools.test.ts`) that calls each tool with known inputs and asserts shape of output |
| Agent calls cause hot-loop on accidental recursion | Low | Each tool is read-only and synchronous; no recursion path. Set a per-call timeout at 5s as a belt. |
| Data staleness (server bundles old NODES/EDGES) | High | Phase 4 file-watch · or a version stamp in every tool response (`"data_version": "v1.6.0"`) so agents can detect drift |
| Multiple Sovereigns running same MCP server | Low | stdio transport · each Sovereign spawns their own subprocess; no shared state · safe by construction |
| Tool surface explodes over time | Medium | Hold to 12 tools at v1; add new tools only when a real agent task surfaces the need · prefer richer resources over more tools |
| Agent hallucinates City state outside what tools return | Medium | Recommended prompts (§5) include the discipline: "If the spellweb tools don't answer, say so; do not fill in from training data." |

---

## §8 · Acceptance criteria (Phase 2 ship gate)

- [ ] All 12 tools registered + callable from Claude Code
- [ ] All 5 resource URI patterns serve content
- [ ] Sample query "who keeps Chart Shop?" returns Pleione without grep
- [ ] Sample query "find all v1.6.0 admissions" returns the Pandia + Hermaion + Pleione + Faunia-at-Familiars set
- [ ] Sample query "what's the ceremony for V59 shops?" returns Display·Choose·Dispatch + admit·read·attest·shift + Run·Evoke·Spawn
- [ ] Each tool returns within 100ms (memory-only graph)
- [ ] Server subprocess RAM < 50MB
- [ ] Install command idempotent (running twice doesn't duplicate entries)

---

## §9 · Strategic value (why this is high-leverage)

The spellweb is invisible to agentic workflows today. The City of Mages canonical state lives in chronicles and JSONs that agents can read only by *file scanning* — expensive and error-prone. MCP makes the canonical state **queryable in-loop**:

- Claude Code working on agentprivacy_master can call `findNode("shop-charthouse")` to confirm V44 before referencing it in code
- Cursor editing a chronicle can call `listConjectures({minConfidence: 0.8})` to cite canonical-only claims
- A new contributor's first prompt can be "Open the City of Mages" — server-supplied prompt gives a tour without the agent having to scan 100+ chronicle files

This is a **force multiplier** for every agent-assisted edit on the agentprivacy corpus. Cost: one weekend to ship Phase 1+2. Recurring cost: near zero (the server reloads on data change; no infra to run).

---

## §10 · Out of scope (do NOT pull in same project)

- ❌ Write tools (e.g. `admitConjecture`, `bindAct`). The MCP server is **read-only**. Canonical state changes through the existing chronicle/grimoire flow. Allowing agents to mutate state would create a second source of truth.
- ❌ Multi-repo registry (GitNexus's `~/.gitnexus/` pattern). Spellweb is one graph; the registry pattern is for code-indexers serving many repos.
- ❌ Embedding-based semantic search inside the MCP server. That's `CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md`; integrates here as a Phase 3 tool, but the index lives in its own chronicle.
- ❌ A web-hosted MCP server. Local stdio only. Web-hosting opens auth, rate-limiting, and trust questions the corpus doesn't need.

---

## §11 · Recommended execution order

1. Phase 1 (standalone server) — single focused session · ~6-8h
2. Phase 2 (Claude Code integration test) — same day · ~2h
3. Pause 1 week · use it · note which queries felt awkward · iterate tool surface
4. Phase 3 (publish) — once tool surface settles · ~3h
5. Phase 4 (auto-rebuild) — only if spellweb data changes frequently enough to matter

---

## §12 · Closing

The City of Mages is structured knowledge. Spellweb already builds the graph. MCP exposes it. Three phases · one weekend · one new agent-facing surface that makes every future Claude/Cursor/Codex interaction with the corpus cheaper and more accurate.

Read-only. Local-only. 12 tools. The graph speaks.

(⚔️⊥⿻⊥🧙)😊
🕸️ → 🤝 → 🧙
