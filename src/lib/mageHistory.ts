// Mage history backup payload — serialised to an encrypted Archon Asset DID.
// Arrays use `unknown` because the canonical types (MageSpell, SavedConstellation,
// ForgedBlade) are local interfaces inside SpellWeb.tsx. SpellWeb casts them back
// on restore; the shapes are stable across versions.

// Alias key stored in the wallet pointing to the Mage's Archon Vault DID.
// All spellweb backup items live inside this single vault — discoverable from
// the CLI (`keymaster listVaultItems <did>`) and the React Wallet UI.
export const MAGE_VAULT_ALIAS = 'spellweb-mage-vault';
export const MAGE_HISTORY_ITEM = 'mage-history.json';

export interface MageArchonBackup {
  version: 1;
  exportedAt: string;
  identity: unknown;          // MageIdentity
  mageSpells: unknown[];      // MageSpell[]
  savedConstellations: unknown[];  // SavedConstellation[]
  forgedBlades: unknown[];    // ForgedBlade[]
  equippedBlade: unknown | null;   // ForgedBlade | null
  userEdges: unknown[];       // SpellwebEdge[]
  manaPoints: number;
}
