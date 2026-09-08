# City and Star skills

The canonical `agentprivacy-skills/CITY_STAR_DISTRIBUTION.json` selects eight operational skills and seven existing personas. `scripts/sync-city-star-skills.mjs` regenerates the marked graph blocks from that cohort; `persona_knows` edges express operational loadouts, not credentials or grants. Registry Keeper is an existing canonical primary now indexed here; no new canonical primary or vertex was created.

Rebuild the targeted Guide projection and star chart first (see agentprivacy.guide/SYNC.md), then run `node scripts/sync-city-star-skills.mjs` and `node scripts/build-guide-bridge.mjs`. The bridge consumes exact source-to-page mappings from the Guide manifest. Run `node node_modules/typescript/bin/tsc --noEmit` and `node node_modules/vite/bin/vite.js build --configLoader runner`. The runner option avoids the Windows sandbox config-bundling failure.

Current additions cover review receipts, Namekeeper write contracts, private journey carriage, invitations, setup rehearsal and evidence-aware source reconciliation. All live-service and proof limitations remain explicit.
