import { loadKey } from './cityKey';
import type { SwordsmanLink } from './mageIdentity';

/**
 * 2026-11-17 (Mitch: the old Link Swordsman pop-up goes; keys live in the ceremony panel).
 * The Swordsman identity rides in the City Key: agentprivacy writes identity.publicKeyHex / displayName,
 * spellweb writes swordsmanId / bearerName. Either gives runecraft the bearer it needs.
 */
export const OPEN_KEY_EVENT = 'spellweb:open-key';
export const openKey = () => window.dispatchEvent(new Event(OPEN_KEY_EVENT));

export function swordsmanFromKey(): SwordsmanLink | null {
  let key; try { key = loadKey(); } catch { return null; }
  if (!key) return null;
  const p = (key.payload ?? {}) as Record<string, unknown>;
  const id = (p.identity && typeof p.identity === 'object' ? p.identity : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
  const publicKeyHex = str(id.publicKeyHex) ?? '';
  const participantId = key.swordsmanId ?? str(id.swordsman) ?? str(id.participantId) ?? (publicKeyHex ? 'ap-' + publicKeyHex.slice(0, 16) : undefined);
  if (!participantId) return null;
  const tier = str(id.trustTier);
  return {
    participantId,
    displayName: key.bearerName ?? str(id.displayName) ?? str(p.name) ?? 'Swordsman',
    publicKeyHex,
    trustTier: tier === 'light' || tier === 'heavy' || tier === 'dragon' ? tier : 'blade',
    linkedAt: key.updatedAt ?? new Date().toISOString(),
  };
}
