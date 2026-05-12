---
title: "Security FAQ — spellweb.ai (mirror)"
date: "2026-05-12"
status: "v1 — basic FAQ (mirror)"
license: "CC BY-SA 4.0"
signature: "(⚔️⊥⿻⊥🧙)😊"
canonical_source: "agentprivacy_master/docs/SECURITY_FAQ.md"
---

# Security FAQ (mirror)

> The canonical version lives in the agentprivacy_master repo at `docs/SECURITY_FAQ.md` and is the source of truth. This is a mirror so spellweb contributors find it locally.

Both copies must agree. Edit the master copy; sync this one.

---

## Quick reference (spellweb-specific)

### What spellweb stores in your browser

| `localStorage` key | What it holds |
|---|---|
| `spellweb-forged-blades` | Your forged artefacts (Cloak / Blade / Memo Stone / …) |
| `spellweb-equipped-blade` | The artefact currently equipped |
| `spellweb-constellations` | Paths you've saved |
| `spellweb-user-edges` | Your deviations (drawn edges) |
| `spellweb-canonical-edges` | Which deviations you've marked canonical (🔗) |
| `spellweb-mage-spells` | Your 8-spell loadout |
| `spellweb-mage-identity` | **Your ed25519 signing keypair — sensitive** |
| `spellweb-swordsman-link` | Reference to your agentprivacy Soulbis identity (not a key) |
| `spellweb:witnessed-shops` | Which workshops you've unlocked via witness imports |
| `spellweb_mana_points` | Privacy-budget counter |

### Spellweb is purely client-side

No backend, no API routes, no server logic. Built as static React + d3 (Vite), served via Cloudflare Workers. Nothing leaves your browser unless you:
- Click a workshop link out to agentprivacy.ai or an external operational site
- Play the ☯️ Ceremon[y] popout audio (streamed from `voice.agentprivacy.ai`)
- Publish a witness on-chain via one of the master shop wizards (those live on agentprivacy.ai, not here)

### Wipe your spellweb data

```javascript
// DevTools console on spellweb.ai:
Object.keys(localStorage).forEach(k => { if (k.startsWith('spellweb')) localStorage.removeItem(k); });
location.reload();
```

**Before wiping**, export **Mage.md** (Mage panel top-right) and **Swordsman.md** (Swords panel top-right) if you want to restore your Mage key later.

### Mage identity safety

`spellweb-mage-identity` holds your **ed25519 signing private key**. It is generated in your browser, never transmitted, but stored unencrypted in localStorage. Treat it like a password:

- **Back it up** via Mage panel → 📥 Mage.md (the bundle includes the key as JSON)
- **Do not share** Mage.md bundles publicly
- **Per-artefact `.md`** exports (Cloak.md, MyBlade.md, etc.) are safe to share — they carry only the public proof, not the private key

### Threat-model notes

- Imported artefacts are **parsed**, not executed. The YAML frontmatter and markdown body are read by regex; no JS evaluation. Safe to import from any source.
- **Signature verification on import is not yet implemented.** Trust comes from the chain of custody (you forged it; or someone you trust forged it). Phase 3 will add ed25519 verification.
- A malicious browser extension can read `localStorage`. If you've installed extensions you don't trust, do not forge anything sensitive in that profile.

### Full FAQ

See the canonical version for the complete coverage (data collection · third-party interactions · NEAR.AI chat · chain memos · reporting issues · etc.):

→ `agentprivacy_master/docs/SECURITY_FAQ.md`

---

`(⚔️⊥⿻⊥🧙)😊` — *Your data stays in your browser. Your key is yours to keep.*

CC BY-SA 4.0 · privacymage · 2026-05-12
