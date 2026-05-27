# Decision Note: Defer the Archon Identity-Wallet Integration

**Date:** 2026-05-26
**Status:** DECISION (architecture decision record) · **DEFER — do not accept PR #4 / PR #5 into `main` at this time**
**Audience:** spellweb maintainers · the bearer
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion:** [`CHRONICLE_ARCHON_VAULT_PR_REVIEW_2026-05-26.md`](CHRONICLE_ARCHON_VAULT_PR_REVIEW_2026-05-26.md) — the PR-by-PR review this decision supersedes for #4/#5.

---

## §0 · Decision in one line

The Archon identity-wallet system (Keymaster + Gatekeeper + vault, via the `@didcid/*` SDK) is **not accepted into spellweb at this time.** PR #4 and PR #5 are **held / closed-without-merge**. The canonical graph and the Privacymage Grimoire stay untouched (already the position for #4). The work is sound; the *infrastructure it depends on does not yet exist in a deployable form*, so shipping it now would put dark/broken features on a public site.

---

## §1 · What was proposed

PRs #4 and #5 add an Archon wallet to spellweb:

- a sovereign **Mage DID** (`did:cid:…`) the blade-signing key is derived from;
- **Save Game / vault backup + restore** of the Mage's spells, constellations, forged blades, and Swordsman link;
- a **Weaver-vault import** path for registry contributions.

This rides on four pieces (see §2). The integration code itself is clean — PR #5 is the rebased, additive version that touches neither the canonical graph nor the grimoire (Option C in the companion chronicle). The problem is not the code.

## §2 · The architecture (why it can't stand alone)

| Piece | Where it runs | Role |
|-------|--------------|------|
| **Keymaster** (`@didcid/keymaster`) | browser | the wallet — holds the seed, mints DIDs, signs, manages aliases + encrypted vault items |
| **Cipher** (`@didcid/cipher`) | browser | crypto primitives for vault items + signing |
| **WalletWeb** | browser storage | the encrypted wallet seed (passphrase-protected), local-only |
| **Gatekeeper** (the Archon daemon) | **a server** | the DID resolver + registry node — anchors DID-create ops and vault items on a registry (hyperswarm/IPFS), resolves DIDs, serves CIDs |
| **Drawbridge** (`@didcid/gatekeeper/drawbridge`) | browser | the HTTP *client* to the Gatekeeper |

**The hard dependency:** creating a Mage DID, saving to the vault, and restoring all route through a **running, network-reachable Gatekeeper**. The wallet seed and the blade-key derivation are local; everything anchored is not. No reachable Gatekeeper → no DID, no vault. The `@didcid/*` packages in spellweb are only the *client SDK* — the Gatekeeper server is a separate Archon daemon (currently on flaxlap, `192.168.1.23:4224`).

## §3 · Why defer — the blockers

1. **No reachable Gatekeeper.** The URL is hard-coded to flaxlap's LAN IP (`http://192.168.1.23:4224`). Verified 2026-05-26: this machine is on `192.168.55.240` (different subnet) and `Test-NetConnection 192.168.1.23:4224` → **False**. The console errors (`createId failed: Network Error`, `ERR_CONNECTION_TIMED_OUT`) are this, not a bug.

2. **Cannot work on the live site as-is.** A public browser can never reach a private `192.168.x.x` address. And the live site is HTTPS while the Gatekeeper is plain `http://` — browsers **block mixed content**. So wallet/vault would be dead for every public visitor.

3. **No hosting model decided.** The strategic fork is unresolved: sovereign-per-user (each runs their own Gatekeeper at localhost) vs. one hosted public HTTPS Gatekeeper vs. hybrid (hosted default + sovereign opt-out). Also unresolved: whether the flaxlap node is *ours* to deploy publicly or is Christian's (csaucier's) — i.e. whether "host it" means "deploy our own" or "agree a shared Archon endpoint."

4. **Cost of shipping now.** PR #5 adds `@didcid/cipher`, `@didcid/gatekeeper`, `@didcid/keymaster`, `@noble/hashes`, `buffer` (~791 transitive packages; `npm install` flagged 22 vulnerabilities — 11 high). That is a meaningful dependency + security surface to take on for a feature that would ship non-functional in production.

The sum: accepting now means new deps, new attack surface, and features that visibly fail for anyone not on flaxlap's LAN — on a public site. Not worth it until the Gatekeeper question is answered.

## §4 · What we keep

- **Both review chronicles** (this note + the PR review) — the analysis and the Option-C design stand as the blueprint for if/when this is revisited.
- **The Archivist graph-connection fix** — *independent of Archon.* The Tome VIII cluster (Archivist, both acts, Vitalik, Fourth Turn, C65) was a disconnected island. Three bridge edges anchor it into the giant component (`fp-act-19 →introduces→ cast-the-archivist`; `cast-soulbae →kin_to→ cast-the-archivist`; `cast-the-archivist →kin_to→ per-architect`). This belongs on `main` on its own merit and is applied separately — it has nothing to do with the wallet system.
- **`poh-cloak-contribution.ts` reasoning** — if csaucier's PoH nodes are ever wanted, they enter via the runtime Weaver-vault import, not by baking into the canonical graph (Option C). Moot while the integration is deferred.

## §5 · Reconsider when (exit criteria)

Revisit the Archon integration once **all** of these hold:

1. **Hosting model chosen** (sovereign / hosted / hybrid) and Gatekeeper ownership settled (ours vs. Christian's shared endpoint).
2. **A reachable Gatekeeper exists for the target context** — a public **HTTPS** endpoint for the live site, or a documented sovereign-local path.
3. **The Gatekeeper URL is configurable** — `VITE_GATEKEEPER_URL` build-time + runtime override + a UI field; no hard-coded LAN IP.
4. **End-to-end flow proven** locally: connect → create wallet → mint DID → forge → Save Game → reload → restore.
5. **Dependency / security review** of the `@didcid/*` chain completed.

When those are met, PR #5 (Option C — additive, no grimoire, no graph overwrite) is the form to bring back.

## §6 · PR disposition (updated)

| PR | What it is | Disposition |
|----|------------|-------------|
| #2 | Solar Ascension ceremony (subset of #3) | Close — superseded by #3 |
| #3 | Excalibur enchanted + Swordsman bundle (ceremony markdown only · **no code · no Gatekeeper dependency**) | Merge — independent of this decision |
| #4 | First Archon cut — grimoire hand-edit + canonical-graph overwrite | **Close, reject** |
| #5 | Archon integration, rebased + additive | **Hold / close — defer per this note** |

---

*The wallet is sovereign and local; the Gatekeeper is the bank it phones. We do not ship the wallet before the bank has a reachable address. Until the Gatekeeper has a home, the spellweb graph stands on its own — which it does.*
