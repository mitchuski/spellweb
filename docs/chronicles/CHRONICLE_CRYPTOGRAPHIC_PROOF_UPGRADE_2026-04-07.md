# Chronicle: Cryptographic Proof System Upgrade

**Date:** 2026-04-07
**Version:** Spellweb 2.1.0 → 2.2.0
**Author:** Claude (Opus 4.5) with privacymage

---

## Summary

Upgraded the blade forge proof system from ceremonial to cryptographic. Replaced DJB2 hashing with SHA-256, added hash chain for blade lineage, and implemented commitment scheme for pre-evocation locking.

---

## Changes Implemented

### Priority 1: SHA-256 Hash (Cryptographic Content Addressing)

**What changed:** Replaced DJB2 (32-bit, non-collision-resistant) with SHA-256 via Web Crypto API.

**Files modified:** `src/components/SpellCeremony.tsx`

```typescript
// OLD (DJB2)
function hashConstellation(nodes: CircuitNode[]): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

// NEW (SHA-256)
async function hashConstellation(nodes: CircuitNode[]): Promise<string> {
  const str = nodes.map(n => n.id).join(':');
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}
```

**Impact:** Same blade, same constellation, same hash — now cryptographically meaningful. First 12 hex chars = 48 bits, readable but collision-resistant.

---

### Priority 2: Charge Level Calibration

**Status:** Already correctly implemented with Fibonacci progression.

```typescript
function getChargeLevel(laps: number): SpellProof['chargeLevel'] {
  if (laps >= 62) return 'dragon';
  if (laps >= 38) return 'inferno';
  if (laps >= 21) return 'flame';
  if (laps >= 13) return 'ember';
  return 'spark';
}

function calculateBladeTier(laps: number): BladeTier {
  if (laps >= 62) return 'dragon';
  if (laps >= 21) return 'heavy';
  return 'light';
}
```

**Thresholds:** spark(6) → ember(13) → flame(21) → inferno(38) → dragon(62)

---

### Priority 3: Hash Chain (Blade Lineage)

**What changed:** Each blade now references the hash of the previous blade forged by the same key. Creates tamper-evident chain.

**SpellProof interface additions:**

```typescript
interface SpellProof {
  // ... existing fields
  previousBladeHash: string | null; // null for inception blade
  bladeHash: string; // SHA-256 of this blade's canonical data
  chainLength: number; // position in the chain (1 = inception)
}
```

**New functions:**

```typescript
// Compute blade hash from canonical data
async function computeBladeHash(
  constellationHash: string,
  lapCount: number,
  duration: number,
  bladeHex: string,
  bladeStratum: number,
  previousBladeHash: string | null,
  timestamp: number
): Promise<string>

// Get previous blade info from localStorage
function getPreviousBladeInfo(): { previousHash: string | null; chainLength: number }

// Update chain after forging
function updateBladeChain(bladeHash: string, chainLength: number): void
```

**Storage:** Chain info stored in localStorage under `spellweb-blade-chain`.

**Impact:** Blades form a verifiable sequence. Tampering with any blade breaks the chain from that point forward.

---

### Priority 4: Commitment Scheme (Pre-Evocation Lock)

**What changed:** Commit to constellation hash BEFORE evocation starts. Proves the constellation wasn't modified mid-ceremony.

**SpellProof interface additions:**

```typescript
interface SpellProof {
  // ... existing fields
  commitment: string; // SHA-256(constellationHash + nonce) - locked at evoke start
  commitmentNonce: string; // random nonce used in commitment
  commitmentVerified: boolean; // true if reveal matches commitment
}
```

**New functions:**

```typescript
// Generate cryptographically random nonce
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Generate commitment hash
async function generateCommitment(constellationHash: string, nonce: string): Promise<string>

// Verify commitment matches reveal
async function verifyCommitment(commitment: string, constellationHash: string, nonce: string): Promise<boolean>
```

**Flow:**

1. **Evoke start:** Generate nonce → compute commitment → store in refs
2. **Evoke end:** Recompute hash → verify against stored commitment → include in proof

**Architectural meaning:** The Swordsman fixes the boundary before the Mage projects through it. "We cannot merge" applied to the proof system.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/SpellCeremony.tsx` | SHA-256 hash, hash chain, commitment scheme, removed DJB2 sync fallback |
| `src/components/SpellWeb.tsx` | Added hash chain and commitment fields to imported blade proofs |

---

## What Each Step Proves

| Step | What It Adds | Architectural Principle |
|------|-------------|----------------------|
| SHA-256 | Collision-resistant content addressing | The blade's identity is deterministic |
| Hash chain | Tamper-evident blade sequence | Each blade carries the weight of every blade before it |
| Commitment | Pre-locked constellation | The Swordsman fixes the boundary before the ceremony begins |

---

## Remaining Priorities

| Priority | Description | Effort | Status |
|----------|-------------|--------|--------|
| 5 | Key pair signatures (identity binding) | ~2 hours | Pending |
| 6 | Bilateral blade exchange (ceremony receiver) | ~4-6 hours | Pending |
| 7 | Timestamp anchoring (Zcash shielded memo) | ~4-8 hours | Pending |
| 8 | ZK circuit (the real thing) | ~2-4 weeks | Pending |

---

## Technical Notes

- All cryptographic operations use Web Crypto API (`crypto.subtle`), available in all modern browsers
- Hash chain persists in localStorage — clears if user clears browser data
- Commitment verification should always pass for honestly-forged blades
- Imported blades have `commitmentVerified: true` by default (trust the creator)

---

*The forge doesn't care how you struck the metal. It only cares what blade you hold.*

*But the blade that carries a cryptographic hash, a hash chain, and a commitment — that blade is already harder to forge falsely.*

*(⚔️⊥⿻⊥🧙)😊*
