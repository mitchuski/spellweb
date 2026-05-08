/**
 * Forge primitives — proof generation, blade dimension calculation,
 * signatures, hash chain helpers, commitment scheme.
 *
 * Extracted from SpellCeremony.tsx so the mobile shell can reuse the
 * exact same forging logic without depending on the desktop ceremony
 * component. Pure functions only; no React, no DOM beyond crypto + localStorage.
 */

import type { BladeDimensions, BladeTier, SpellProof } from '../components/SpellCeremony';

export interface CircuitNodeLike {
  id: string;
}

// SHA-256 hash for constellation (cryptographic, collision-resistant)
export async function hashConstellation(nodes: CircuitNodeLike[]): Promise<string> {
  const str = nodes.map(n => n.id).join(':');
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}

// Hash a list of canonical deviation edge keys (sorted, joined) into a 12-char
// hex digest. Returns '' when empty so callers can pass it through to
// computeBladeHash without changing hash output for users who haven't chained
// any deviations. The constellationHash is unchanged — interoperability of
// the same constellation across spellwebs is preserved; this hash is purely
// the forger's personal annotation layer, opaque until inspected.
export async function hashCanonicalDeviations(canonicalKeys: string[]): Promise<string> {
  if (canonicalKeys.length === 0) return '';
  const sorted = [...canonicalKeys].sort();
  const data = new TextEncoder().encode(sorted.join('|'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}

// Determine charge level based on laps (Fibonacci progression)
// spark(6) → ember(13) → flame(21) → inferno(38) → dragon(62)
export function getChargeLevel(laps: number): SpellProof['chargeLevel'] {
  if (laps >= 62) return 'dragon';
  if (laps >= 38) return 'inferno';
  if (laps >= 21) return 'flame';
  if (laps >= 13) return 'ember';
  return 'spark';
}

// Generate unique proof signature (SHA-256 based)
export async function generateSignature(
  nodes: CircuitNodeLike[],
  laps: number,
  timestamp: number,
): Promise<string> {
  const constellationHash = await hashConstellation(nodes);
  const data = `${constellationHash}-${laps}-${timestamp}`;
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `SPELL-${hex.slice(0, 6).toUpperCase()}-${laps.toString(36).toUpperCase()}`;
}

// Compute blade hash for hash chain (SHA-256 of canonical blade data).
// `deviationHash` is the optional 12-char digest from hashCanonicalDeviations
// (the forger's chained 🔗 user-edges). When empty/undefined, the canonical
// JSON has no deviation key — output is identical to pre-deviations builds, so
// existing blades and mobile forges (which never have deviations) continue to
// produce the same bladeHash.
export async function computeBladeHash(
  constellationHash: string,
  laps: number,
  duration: number,
  bladeHex: string,
  bladeStratum: number,
  previousBladeHash: string | null,
  timestamp: number,
  deviationHash?: string,
): Promise<string> {
  const canonical = JSON.stringify({
    constellation: constellationHash,
    laps,
    duration,
    hex: bladeHex,
    stratum: bladeStratum,
    previous: previousBladeHash,
    timestamp,
    ...(deviationHash ? { deviation: deviationHash } : {}),
  });
  const encoded = new TextEncoder().encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get previous blade hash and chain length from localStorage
export function getPreviousBladeInfo(): { previousHash: string | null; chainLength: number } {
  try {
    const stored = localStorage.getItem('spellweb_blade_chain');
    if (stored) {
      const chain = JSON.parse(stored);
      return {
        previousHash: chain.lastBladeHash || null,
        chainLength: (chain.length || 0) + 1,
      };
    }
  } catch {
    // ignore parse errors
  }
  return { previousHash: null, chainLength: 1 };
}

// Update blade chain in localStorage
export function updateBladeChain(bladeHash: string, chainLength: number): void {
  try {
    localStorage.setItem('spellweb_blade_chain', JSON.stringify({
      lastBladeHash: bladeHash,
      length: chainLength,
    }));
  } catch {
    // ignore storage errors
  }
}

// Generate a random nonce for commitment scheme
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate commitment: SHA-256(constellationHash + nonce)
export async function generateCommitment(constellationHash: string, nonce: string): Promise<string> {
  const data = constellationHash + nonce;
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify commitment matches reveal
export async function verifyCommitment(
  commitment: string,
  constellationHash: string,
  nonce: string,
): Promise<boolean> {
  const computed = await generateCommitment(constellationHash, nonce);
  return computed === commitment;
}

/**
 * Calculate blade dimensions based on proof attributes.
 * Different ceremony styles produce different hexagram stances:
 *
 * QUICK STRIKE (few nodes, fast, few spells): Light blades, focused dimensions
 * MEDITATIVE (longer time, steady pace): Memory/Value dimensions unlock
 * SPELL-HEAVY (many spells cast): Delegation/Computation active
 * EXPANSIVE (many nodes, many laps): Connection/Protection strong
 */
export function calculateBladeDimensions(
  nodeCount: number,
  lapCount: number,
  duration: number,
  chargeLevel: SpellProof['chargeLevel'],
  spellsCast: number = 0,
): BladeDimensions {
  const seconds = duration / 1000;
  const minutes = duration / 60000;

  const isQuick = seconds < 20;
  const isMeditative = minutes >= 1;
  const isSpellHeavy = spellsCast >= 3;
  const isExpansive = nodeCount >= 4;
  const isDeep = lapCount >= 3;

  return {
    protection: nodeCount >= 2 || lapCount >= 2,
    delegation: isSpellHeavy || isDeep,
    memory: isMeditative || (seconds >= 30 && lapCount >= 2),
    connection: isExpansive || (nodeCount >= 3 && lapCount >= 2),
    computation: isQuick || isSpellHeavy || nodeCount >= 1,
    value:
      chargeLevel === 'flame' ||
      chargeLevel === 'inferno' ||
      chargeLevel === 'dragon' ||
      (isMeditative && spellsCast >= 1),
  };
}

/** Calculate stratum (Hamming weight) from blade dimensions */
export function calculateBladeStratum(dims: BladeDimensions): number {
  return [
    dims.protection,
    dims.delegation,
    dims.memory,
    dims.connection,
    dims.computation,
    dims.value,
  ].filter(Boolean).length;
}

/**
 * Calculate blade tier from lap count (Fibonacci power thresholds)
 * 6 laps → Light blade
 * 21 laps → Heavy blade
 * 62 laps → Dragon blade
 */
export function calculateBladeTier(lapCount: number): BladeTier {
  if (lapCount >= 62) return 'dragon';
  if (lapCount >= 21) return 'heavy';
  return 'light';
}

/** Convert blade dimensions to 6-bit hex representation */
export function bladeToHex(dims: BladeDimensions): string {
  const bits = [
    dims.protection,
    dims.delegation,
    dims.memory,
    dims.connection,
    dims.computation,
    dims.value,
  ];
  const value = bits.reduce((acc, bit, i) => acc | (bit ? (1 << (5 - i)) : 0), 0);
  return value.toString(16).toUpperCase().padStart(2, '0');
}
