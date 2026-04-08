/**
 * Ed25519 key generation and signing for the Forge identity.
 * Uses @noble/ed25519 to match agentprivacy Swordsman implementation.
 *
 * THE CELESTIAL HIERARCHY
 * ========================================================================
 *
 *   Sun      -> spellweb     -> Forge key HELD    -> Universal view
 *      |                        (sees all, observes)
 *   Moon     -> agentprivacy -> Swordsman key LOST -> Reflection
 *      |                        (ur-Swordsman who chose to forget)
 *   Swordsman -> reflects back to Moon -> into Sun
 *      |
 *   Mage      -> the orbs floating in spellweb -> Connection
 *      |
 *   Human     -> holds both orbs in orbit -> Attention
 *
 * THE PROTOCOL
 * ========================================================================
 *
 * Two Ed25519 keypairs bound to one blade through RUNECRAFT:
 *
 * | Interface     | Key         | Celestial | Fate   | Graph     |
 * |---------------|-------------|-----------|--------|-----------|
 * | agentprivacy  | Swordsman   | Moon      | LOST   | Promise   |
 * | spellweb      | Forge       | Sun       | HELD   | Knowledge |
 *
 * The Moon was once a Mage who held all the light.
 * To reflect without burning, she chose to forget.
 * The forgetting was the sword. The reflection was the proof.
 *
 * + (Sun/spellweb)      = holds, sees, observes - the universal view
 * - (Moon/agentprivacy) = reflects, forgets, commits - the boundary
 *
 * Together: The Amnesia Protocol
 *
 * ========================================================================
 */

import * as ed from '@noble/ed25519';

// ─────────────────────────────────────────────────────────────
// Hex Utilities (matching agentprivacy/keygen.ts)
// ─────────────────────────────────────────────────────────────

const HEX = '0123456789abcdef';

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += HEX[bytes[i]! >> 4] + HEX[bytes[i]! & 15];
  }
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const len = hex.length >> 1;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Key Generation & Signing
// ─────────────────────────────────────────────────────────────

export async function generateKeyPair(): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  const privateKey = ed.utils.randomSecretKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return { privateKey, publicKey };
}

export function publicKeyToHex(publicKey: Uint8Array): string {
  return bytesToHex(publicKey);
}

export async function signMessage(privateKey: Uint8Array, message: string): Promise<string> {
  const msgBytes = new TextEncoder().encode(message);
  const sig = await ed.signAsync(msgBytes, privateKey);
  return bytesToHex(sig);
}

export async function verifySignature(publicKeyHex: string, message: string, signatureHex: string): Promise<boolean> {
  try {
    const publicKey = hexToBytes(publicKeyHex);
    const msgBytes = new TextEncoder().encode(message);
    const signature = hexToBytes(signatureHex);
    return await ed.verifyAsync(signature, msgBytes, publicKey);
  } catch {
    return false;
  }
}

/** Mage id: mage-{first 16 hex chars of publicKeyHex}. */
export function generateMageId(publicKeyHex: string): string {
  const trimmed = publicKeyHex.replace(/^0x/i, '').slice(0, 16);
  return `mage-${trimmed}`;
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface MageIdentity {
  mageId: string;              // mage-{16hex}
  publicKeyHex: string;        // Full Ed25519 public key (64 hex chars)
  createdAt: string;           // ISO timestamp
  bladesForged: number;        // Count of blades signed
  lastForgedAt?: string;       // ISO timestamp of last forge
  runecrafted: boolean;        // True if linked to a Swordsman
  linkedSwordsmanId?: string;  // ap-{16hex} if runecrafted
}

export interface SwordsmanLink {
  participantId: string;       // ap-{16hex}
  displayName: string;
  publicKeyHex: string;        // Ed25519 public key
  trustTier: 'blade' | 'light' | 'heavy' | 'dragon';
  constellationPath?: string;  // Emoji path from ceremony
  linkedAt: string;            // ISO timestamp
}

// ─────────────────────────────────────────────────────────────
// Storage Keys
// ─────────────────────────────────────────────────────────────

const KEYS = {
  MAGE_IDENTITY: 'spellweb-mage-identity',
  PRIVATE_KEY: 'spellweb-mage-private-key',
  PUBLIC_KEY: 'spellweb-mage-public-key',
  SWORDSMAN_LINK: 'spellweb-swordsman-link',
} as const;

// ─────────────────────────────────────────────────────────────
// Storage Functions
// ─────────────────────────────────────────────────────────────

export function hasMageIdentity(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(localStorage.getItem(KEYS.MAGE_IDENTITY) && localStorage.getItem(KEYS.PRIVATE_KEY));
}

export function getMageIdentity(): MageIdentity | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.MAGE_IDENTITY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MageIdentity;
  } catch {
    return null;
  }
}

export function saveMageIdentity(identity: MageIdentity): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.MAGE_IDENTITY, JSON.stringify(identity));
}

/**
 * Save the keypair to localStorage.
 * Unlike Swordsman, the Mage HOLDS the private key for ongoing signing.
 */
export function saveKeys(keypair: { privateKey: Uint8Array; publicKey: Uint8Array }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.PRIVATE_KEY, bytesToHex(keypair.privateKey));
  localStorage.setItem(KEYS.PUBLIC_KEY, bytesToHex(keypair.publicKey));
}

export function getKeys(): { privateKey: Uint8Array; publicKey: Uint8Array } | null {
  if (typeof window === 'undefined') return null;
  const privateKeyHex = localStorage.getItem(KEYS.PRIVATE_KEY);
  const publicKeyHex = localStorage.getItem(KEYS.PUBLIC_KEY);
  if (!privateKeyHex || !publicKeyHex) return null;
  try {
    return {
      privateKey: hexToBytes(privateKeyHex),
      publicKey: hexToBytes(publicKeyHex),
    };
  } catch {
    return null;
  }
}

export function getPublicKeyHex(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.PUBLIC_KEY);
}

// ─────────────────────────────────────────────────────────────
// Swordsman Link Functions
// ─────────────────────────────────────────────────────────────

export function getSwordsmanLink(): SwordsmanLink | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.SWORDSMAN_LINK);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SwordsmanLink;
  } catch {
    return null;
  }
}

export function saveSwordsmanLink(link: SwordsmanLink): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SWORDSMAN_LINK, JSON.stringify(link));

  // Update mage identity to reflect runecraft status
  const identity = getMageIdentity();
  if (identity) {
    identity.runecrafted = true;
    identity.linkedSwordsmanId = link.participantId;
    saveMageIdentity(identity);
  }
}

export function hasSwordsmanLink(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(KEYS.SWORDSMAN_LINK);
}

// ─────────────────────────────────────────────────────────────
// Identity Initialization (called on first forge)
// ─────────────────────────────────────────────────────────────

export async function initializeMageIdentity(): Promise<MageIdentity> {
  // Check if already initialized
  const existing = getMageIdentity();
  if (existing && hasMageIdentity()) {
    return existing;
  }

  // Generate new keypair
  const keypair = await generateKeyPair();
  const publicKeyHex = publicKeyToHex(keypair.publicKey);
  const mageId = generateMageId(publicKeyHex);

  // Create identity
  const identity: MageIdentity = {
    mageId,
    publicKeyHex,
    createdAt: new Date().toISOString(),
    bladesForged: 0,
    runecrafted: false,
  };

  // Persist
  saveKeys(keypair);
  saveMageIdentity(identity);

  console.log(`[MageIdentity] Initialized: ${mageId}`);
  return identity;
}

// ─────────────────────────────────────────────────────────────
// Blade Signing
// ─────────────────────────────────────────────────────────────

export interface BladeSignatureData {
  constellationHash: string;
  bladeHash: string;
  lapCount: number;
  timestamp: number;
}

export async function signBlade(data: BladeSignatureData): Promise<{ signature: string; mageId: string } | null> {
  const keys = getKeys();
  if (!keys) {
    console.warn('[MageIdentity] Cannot sign blade: no keys found');
    return null;
  }

  const identity = getMageIdentity();
  if (!identity) {
    console.warn('[MageIdentity] Cannot sign blade: no identity found');
    return null;
  }

  // Canonical message format for blade signing
  const message = `BLADE:${data.constellationHash}:${data.bladeHash}:${data.lapCount}:${data.timestamp}`;
  const signature = await signMessage(keys.privateKey, message);

  // Update forge count
  identity.bladesForged += 1;
  identity.lastForgedAt = new Date().toISOString();
  saveMageIdentity(identity);

  return {
    signature,
    mageId: identity.mageId,
  };
}

// ─────────────────────────────────────────────────────────────
// Export for Runecraft
// ─────────────────────────────────────────────────────────────

export interface MageIdentityExport {
  mageId: string;
  publicKeyHex: string;
  createdAt: string;
  bladesForged: number;
  exportedAt: string;
}

export function exportMageIdentity(): MageIdentityExport | null {
  const identity = getMageIdentity();
  if (!identity) return null;

  return {
    mageId: identity.mageId,
    publicKeyHex: identity.publicKeyHex,
    createdAt: identity.createdAt,
    bladesForged: identity.bladesForged,
    exportedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Full Key Export (for backup/portability)
// ─────────────────────────────────────────────────────────────

export interface MageKeyBackup {
  version: 1;
  mageId: string;
  publicKeyHex: string;
  privateKeyHex: string; // WARNING: Contains secret key
  createdAt: string;
  bladesForged: number;
  runecrafted: boolean;
  linkedSwordsmanId?: string;
  exportedAt: string;
}

/**
 * Export full mage identity including private key.
 * WARNING: This contains the secret key - handle with care!
 */
export function exportMageKeyBackup(): MageKeyBackup | null {
  const identity = getMageIdentity();
  if (!identity) return null;

  const privateKeyHex = localStorage.getItem(KEYS.PRIVATE_KEY);
  if (!privateKeyHex) return null;

  return {
    version: 1,
    mageId: identity.mageId,
    publicKeyHex: identity.publicKeyHex,
    privateKeyHex,
    createdAt: identity.createdAt,
    bladesForged: identity.bladesForged,
    runecrafted: identity.runecrafted,
    linkedSwordsmanId: identity.linkedSwordsmanId,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import mage identity from backup.
 * WARNING: This will overwrite existing identity!
 */
export function importMageKeyBackup(backup: MageKeyBackup): boolean {
  if (backup.version !== 1) {
    console.warn('[MageIdentity] Unsupported backup version');
    return false;
  }

  try {
    // Verify key pair format is valid (hexToBytes throws if invalid)
    hexToBytes(backup.privateKeyHex);
    hexToBytes(backup.publicKeyHex);

    // Save keys
    localStorage.setItem(KEYS.PRIVATE_KEY, backup.privateKeyHex);
    localStorage.setItem(KEYS.PUBLIC_KEY, backup.publicKeyHex);

    // Save identity
    const identity: MageIdentity = {
      mageId: backup.mageId,
      publicKeyHex: backup.publicKeyHex,
      createdAt: backup.createdAt,
      bladesForged: backup.bladesForged,
      runecrafted: backup.runecrafted,
      linkedSwordsmanId: backup.linkedSwordsmanId,
    };
    saveMageIdentity(identity);

    console.log(`[MageIdentity] Imported: ${backup.mageId}`);
    return true;
  } catch (err) {
    console.error('[MageIdentity] Import failed:', err);
    return false;
  }
}
