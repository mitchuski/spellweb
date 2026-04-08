# Dual-Keypair Runecraft Architecture Plan

## Vision

Two unique ECDSA keypairs, one per interface, both contributing to blade identity:

| Interface | Agent | Key Type | Purpose |
|-----------|-------|----------|---------|
| **agentprivacy** | Swordsman | Ed25519 | Privacy boundaries, terms, delegation |
| **spellweb** | Mage | ECDSA P-256 | Knowledge paths, spell mastery, learning |

A **runecrafted blade** carries both signatures — proving the same consciousness walked both paths.

---

## Current State

### agentprivacy (Swordsman Identity)
- ✅ Ed25519 keypair generation via `@noble/ed25519`
- ✅ AgentCard with `publicKeyHex` and `signature`
- ✅ Stored in localStorage: `ap-private-key`, `ap-public-key`, `ap-agent-card`
- ✅ 6-step ceremony creates identity with constellation path
- ✅ Soul file export with signature

### spellweb (Mage Identity)
- ✅ Equipped blade (Swordsman's constellation marks)
- ✅ Mage spells (6 learned spells with hexagram lines)
- ❌ No Mage keypair — this is what we're adding
- ❌ No import of Swordsman identity from agentprivacy

---

## Architecture Design

### Phase 1: Mage Keypair Generation (spellweb)

**Location:** New file `src/lib/mageIdentity.ts`

```typescript
interface MageIdentity {
  id: string;                    // First 16 hex chars of public key hash
  publicKeySpki: string;         // Base64 SPKI format
  displayName?: string;          // Optional mage name
  createdAt: number;
  bladesForged: number;
  lastForgedAt?: number;
}

interface MageKeyPair {
  privateKey: CryptoKey;         // Non-extractable, stays in browser
  publicKey: CryptoKey;
  identity: MageIdentity;
}
```

**Generation Flow:**
1. First visit to spellweb → check localStorage for existing identity
2. If none → prompt for Mage name (optional) → generate ECDSA P-256 keypair
3. Store public key as base64 SPKI in `spellweb-mage-identity`
4. Private key stored via IndexedDB (crypto.subtle pattern)

**Why ECDSA P-256 (not Ed25519)?**
- Web Crypto API native support (no npm dependency)
- Different from Swordsman's Ed25519 → distinct cryptographic identity
- Easier verification in browser contexts

### Phase 2: Swordsman Identity Import (agentprivacy → spellweb)

**Import Mechanism:** Manual copy-paste or localStorage bridge

**Option A: localStorage Bridge (same origin impossible)**
Since agentprivacy and spellweb are different origins, direct localStorage access won't work.

**Option B: Export/Import Flow (recommended)**
1. agentprivacy exports `SwordsmanIdentityExport`:
```typescript
interface SwordsmanIdentityExport {
  participantId: string;         // ap-{16hex}
  displayName: string;
  publicKeyHex: string;          // Ed25519 public key
  trustTier: 'blade' | 'light' | 'heavy' | 'dragon';
  constellationPath?: string;    // Emoji path from ceremony
  exportedAt: string;
}
```
2. User copies JSON or downloads `.swordsman` file
3. spellweb has "Link Swordsman" button → paste/upload
4. spellweb stores in `spellweb-swordsman-link`

**Verification:** spellweb cannot verify the signature without the message that was signed. Export should include:
- The signed payload (AgentCard minus signature)
- The signature
- The public key

Then spellweb can verify using `@noble/ed25519` (add as dependency) or trust without verification.

### Phase 3: SpellProof Runecraft Extension

**New Fields in SpellProof:**

```typescript
interface SpellProof {
  // ... existing fields ...

  // Mage signature (always present after Phase 1)
  mageSignature?: string;        // ECDSA P-256 signature (base64)
  mageKeyId?: string;            // First 16 hex of public key hash

  // Swordsman signature (present if runecrafted)
  swordsmanSignature?: string;   // Ed25519 signature (hex)
  swordsmanKeyId?: string;       // participantId (ap-{16hex})

  // Runecraft metadata
  runecrafted: boolean;          // True if both signatures present
  runecraftedAt?: number;        // Timestamp of runecraft
}
```

### Phase 4: Runecraft Ceremony

**UI Flow:**
1. User forges blade normally → SpellProof with mageSignature
2. If Swordsman linked → "Runecraft" button appears
3. Runecraft ceremony:
   - Display blade proof
   - Show Swordsman identity
   - Prompt for Swordsman signature

**Signature Challenge:**
The Swordsman private key is in agentprivacy, not spellweb. Options:

**Option A: Message Signing Bridge**
1. spellweb generates challenge: `RUNECRAFT:{bladeHash}:{timestamp}`
2. User copies challenge to agentprivacy
3. agentprivacy has "Sign Message" feature → signs with Ed25519
4. User copies signature back to spellweb
5. spellweb verifies and attaches

**Option B: Cross-Origin PostMessage (if same deployment)**
If both apps are on same domain (different paths), can use postMessage.

**Option C: Shared Browser Extension**
A browser extension could hold keys and sign for both interfaces.

**Recommended: Option A** — most universal, works regardless of deployment.

### Phase 5: Verification & Display

**Blade Display Shows:**
```
╔══════════════════════════════════════╗
║  SELENE  ✨                          ║
║  Tier: Heavy  |  Charge: Flame       ║
╠══════════════════════════════════════╣
║  Mage: mage-a1b2c3d4e5f6g7h8        ║
║  Signed: ✓                           ║
╠══════════════════════════════════════╣
║  Swordsman: ap-9i8h7g6f5e4d3c2b     ║
║  Runecrafted: ✓                      ║
╠══════════════════════════════════════╣
║  Hash Chain: #47                     ║
║  Blade Hash: aszx1i...               ║
╚══════════════════════════════════════╝
```

---

## Implementation Steps

### Step 1: Mage Identity System
- [ ] Create `src/lib/mageIdentity.ts`
- [ ] ECDSA P-256 keypair generation via Web Crypto
- [ ] IndexedDB storage for private key (non-extractable)
- [ ] localStorage for public identity
- [ ] Identity initialization on first visit

### Step 2: Mage Signature Integration
- [ ] Add `signBladeWithMageKey()` function
- [ ] Extend SpellProof interface with mage signature fields
- [ ] Integrate into proof generation pipeline (SpellCeremony.tsx)
- [ ] Update blade display to show mage signature status

### Step 3: Swordsman Identity Import
- [ ] Add `@noble/ed25519` to spellweb dependencies
- [ ] Create `src/lib/swordsmanLink.ts`
- [ ] Build import UI component
- [ ] Store linked Swordsman identity
- [ ] Add export feature to agentprivacy (SwordsmanIdentityExport)

### Step 4: Runecraft Ceremony
- [ ] Create RunecraftModal component
- [ ] Challenge generation for cross-app signing
- [ ] Signature verification
- [ ] SpellProof update with swordsman signature
- [ ] Add "Sign Message" feature to agentprivacy

### Step 5: Visual & Export Updates
- [ ] Update blade card to show dual signatures
- [ ] Update markdown export to include runecraft info
- [ ] Add verification badges/indicators

---

## Security Considerations

1. **Private Key Isolation**: Each app holds only its own private key
2. **Cross-Origin Safety**: No direct key sharing between apps
3. **Verification**: Both signatures can be independently verified
4. **Non-Extractable Keys**: Web Crypto keys marked non-extractable
5. **Challenge Freshness**: Runecraft challenges include timestamp to prevent replay

---

## Future Extensions

- **Bilateral Blade Exchange**: Import runecrafted blades from other users
- **Trust Graph Integration**: Runecrafted blades carry more weight
- **Privacy Pools**: ZK proof that blade was runecrafted without revealing identity
- **Hardware Wallet**: Sign with Ledger/Trezor for stronger key security

---

## Questions to Resolve

1. **Mage Identity Ceremony**: Should there be a ceremony like Swordsman has, or just generate on first forge?

2. **Signature Algorithm Alignment**: Keep different (Ed25519 vs ECDSA) for distinction, or align for simplicity?

3. **Runecraft Permanence**: Once runecrafted, can it be "unlinked"? Or is it permanent?

4. **Trust Implications**: Should runecrafted blades unlock special features?

