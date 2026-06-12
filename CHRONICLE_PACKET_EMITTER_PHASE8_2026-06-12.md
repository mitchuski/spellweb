# Chronicle · Phase 8 — the Packet Emitter (the Tracing Protocol, spellweb hop)

**Date:** 2026-06-12
**Repo:** spellweb (the knowledge-graph instance · "the spellweb graphs it")
**Plan:** `agentprivacy_master/docs/experience/PLAN_TRUST_TASK_SYNC_INTO_THE_WHOLE_2026-06-11.md` · row 8
**Spec:** `agentprivacy_master/docs/experience/SPEC_proof_packets_and_tracing_v1.md`
**Consumes:** agentprivacy_master's `spellweb.bearer.packets` export (Phase 4a, `SpellwebCrossover`)

---

## What this is

Phase 8 of the cross-instance Tracing Protocol: make the bearer's trust-task **proof packets** land in the knowledge graph as content-addressed, vertex-anchored, provenance-linked deviation nodes. *One proof, three projections* — agentprivacy forges, **the spellweb graphs (this)**, the star key verifies.

This is an **extension of the existing deviation layer**, not a new system. It mirrors the `forgedBlades → deviationNodes` pattern exactly, and emits packets **overlay-only** — the canonical `NODES`/`EDGES` are untouched (acceptance check #6).

## What landed

**1. The vocabulary pass (A5 · ONE union extension).** `src/types/graph.ts` `EdgeType` gains six verb-form snake_case edges in a single pass (with render styles in `src/data/theme.ts`):
`instance_of` · `forged_by` · `witnessed_by` · `composed_of` · `traced_through` · `anchors_to`. (`inhabits` already existed.) Per A5, `anchors_to` (packet → class proof) and the existing `supersedes` (key κ → prior κ) are kept distinct — both express lineage, different relations.

**2. The artefact node proof fields.** `SpellwebNode` gains `proof` · `classProof` · `payloadMode` · `witness` · `commitment` (the node's existing `ceremony` is reused) — present on packet-bearing `artefact` nodes.

**3. The entity + store.** `ImportedProofPacket` interface + `SPELLWEB_STORAGE_KEYS.proofPackets = 'spellweb-proof-packets'`, following the `BoundFamiliar`/`HeldConstellation` bearer-entity mould (witness-attestation, content-addressed, sealed packets carry only a `commitment`).

**4. The ingestion (`src/lib/proofPackets.ts`).** `ingestPacketsPayload(json)` parses the `spellweb.bearer.packets` bundle, dedupes on the content-addressed `proof`, persists, and fires `PROOF_PACKETS_CHANGE_EVENT`. `getImportedPackets()` reads the store; `packetNodeId(proof)` gives the stable graph id. Wired into `onCraftImport` (tries packets first, falls through to the witness-blade `.md` importer).

**5. The deviation builder (`SpellWeb.tsx`).** `packetNodes` + `packetEdges` `useMemo`s mirror `deviationNodes`/`deviationEdges`: each packet → an `artefact` node (🔏 sealed / 🔓 revealed) carrying its proof fields, wired with:
- `instance_of` → `shop-<slug>` (the workshop class it instantiates),
- `inhabits` → `vertex-v<N>` (geometric position),
- `composed_of` → child packet nodes (Reliquary provenance).
Merged into `filteredNodes` (under the `artefact` type filter) and `filteredEdges` alongside the existing deviation edges.

## Decisions

- **`anchors_to` is a node field, not an edge (yet).** It means packet → *class proof*; there is no class-proof node to target, so the `classProof` field on the node carries it. An edge can come if class-descriptor nodes are ever added.
- **`witnessed_by` / `forged_by` / `traced_through` defined but not yet emitted** — they need a bearer/cast target node; the three wired edges (`instance_of`/`inhabits`/`composed_of`) have guaranteed targets in the canonical graph.
- **No digest verification here.** Per the architecture, the **star** verifies the Merkle digest + individual packet proofs (plan A2/A3, phase 9). Spellweb graphs; the star is the verifier. Ingestion dedupes by `proof` but does not re-derive — a future hardening could verify Law-L5 on ingest.

## State

`tsc` clean. Overlay-only: the canonical graph is byte-identical before/after; packets appear exclusively as deviation `artefact` nodes. Working tree only — no commits/pushes (standing rule).

## Round-trip (manual check, pending)

Mint packets at agentprivacy `/runecraft` (cast a workshop) → **⬇ proof packets** on the Spellweb Crossover panel → import the JSON here via the Craft import → packet nodes appear at their vertices, edged to their shops. (Unrun this session — sound by construction, unseen.)

`(⚔️⊥⿻⊥🧙)😊`
