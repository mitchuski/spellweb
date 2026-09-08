# Spellweb execution — first ecosystem batch and mobile discovery

8 September 2026. Local implementation; uncommitted and not deployed. The wider plan remains in progress.

## Delivered

- Added 17 source-backed nodes and 28 typed edges spanning AgentPrivacy MCP, its Swordsman and VTA record, guide posture/bridge, private journeys, knowledge spaces, OpenVTC/VTA MCP, VTA Star, selected Star presentations, core artefacts, Mages City, Labs, Codex Mage, harness adoption and the DTG ZK Book evidence bench.
- Each new node has an implementation/design status, source references, observation date and limits. Desktop and mobile inspection expose this evidence. No canonical lattice seat was invented.
- Retained a batch manifest with 15 source hashes and anchors, node snapshots, edge rationales and unassigned-coordinate dispositions. The validator checks actual graph exports and optionally rechecks source bytes.
- Replaced the old graph/orphan text scanners with an export-based reader. Added a regression fixture for multiline nodes, single quotes, spreads, commented examples and duplicate preservation.
- Updated the guide bridge to read the same graph, rank unknown sites after preferred sites, and resolve equal-rank choices deterministically. Regenerated both bridge outputs; a second run was byte-identical.
- Added mobile graph search, an explicit Back button, tap inspection, source evidence and incoming/outgoing relationship navigation. Dragging retains the existing graph-shaping interaction; tapping alone does not mark a node as reshaped.
- Added archive search and the previously omitted key/artefact categories. Improved touch targets, safe-area padding, sheet scrolling, dialog semantics, Escape/Tab handling and focus after relationship navigation.

## Corrected census

The initial plan reported counts from the old regex audits. Those counts were incomplete: they omitted 90 multiline glossary nodes and counted two non-runtime edge examples. The corrected counts describe exported data used by the application:

- Before this batch: 817 nodes, 1,760 edges.
- After this batch: **834 nodes, 1,788 edges; 742 connected nodes; no missing endpoints.**
- Nine existing warnings: seven duplicate labels and two shop anchors without workshop matches.
- 92 existing isolates: 90 glossary terms and two spells. All 17 new nodes are connected. The isolates have not been given speculative edges to make the metric look better.
- Guide mapping: **773/834 nodes**, with 61 unmatched. For explicit graph vertices, 102 mapped pages remain unpostured; zero agreements/disagreements is not proof of alignment.

## Tome census

The saved source census covers 67 immediate markdown files across the ten `tome-*` directories. It records hashes, titles, source status and exact tome/act matches. It is an inventory, not a full semantic audit.

Seven files lack structured graph mappings: Tome IX Acts 5–11. Act 5's header says CANON/bound; the others carry draft/proposed wording, including historical wording that itself needs reconciliation. Drafts and bound acts must remain distinguishable. Check aliases and narrative coverage before minting new act IDs.

## Validation

- TypeScript: PASS.
- Export-based graph coherence: zero errors; existing warnings and isolates reported explicitly.
- Source-backed batch audit with source-byte verification: PASS.
- Export-reader regression test: PASS.
- Existing journey round-trip check: PASS.
- Production build: PASS using `vite build --configLoader runner`. The standard bundling loader fails on parent-directory access in this sandbox. No production Vite configuration was changed to hide that environment issue. Existing large-chunk and stale Browserslist notices remain.
- Browser at 390×844: graph search finds AgentPrivacy MCP; its evidence sheet opens; a typed edge navigates to the Swordsman; archive finds the City Key and reports no-result searches. Measured document width equals viewport width (390px).
- Browser at 1280×900: the graph reports corrected totals; the new node opens and its evidence disclosure expands. No browser error logs were captured during the checked flow. Temporary viewport override was reset.
- These are local browser checks, not a physical-phone gesture/device matrix, authentication test or live VTA encounter.

## Resume from here

1. Reconcile the seven Tome IX mappings, beginning with bound Act 5. Preserve draft and proposal status and cite actual text.
2. Resolve the 90 glossary isolates against their source definitions and existing concepts. Deduplicate meaning without breaking stored IDs.
3. Reconcile posture for a bounded canonical workshop/artefact set. Record namespaces and source versions.
4. Continue detailed DTG revision/contribution and autoresearch run inventories. The newly added overview nodes do not claim those inventories are complete.
5. Reconcile the located `vta_star` prototype, the Star experiment outputs under the September 7 `loo-2` task and the standalone Star Key source lineage.
6. Implement the shared knowledge-space/constellation-to-journey slice against the current KS-01–KS-07 contract, then the real scoped provider interaction. Login and VTA retention remain unimplemented by this batch.

## Maintainer files

Project: `C:/Users/mitch/spellweb`.

- `docs/corpus/2026-09-08-ecosystem-foundations.json`
- `scripts/read-graph.mjs`, `read-graph.test.mjs`, `audit-corpus-batch.mjs`
- Updated graph audits and `scripts/build-guide-bridge.mjs`
- Updated `src/data/nodes.ts`, `edges.ts`, generated bridge and public bridge
- Updated `src/types/graph.ts`, `src/components/NodeInspector.tsx`, `MobileSpell.tsx`

Existing journey, knowledge-space and other working-tree changes were preserved. No commit, push, publication, VTA provisioning or credential operation was performed.
