/**
 * Proof Packets — ingestion + store for the bearer's imported trust-task proof
 * packets (the Tracing Protocol). Sister to the forgedBlades deviation layer:
 * packets arrive from agentprivacy_master's `spellweb.bearer.packets` export and
 * become `artefact` deviation nodes anchored to district_root.
 *
 * SEALED packets carry only a `commitment` — the raw content is never present
 * (the seal holds across the bridge). One proof, three projections: agentprivacy
 * forges, the spellweb graphs (here), the star key verifies.
 */

import { SPELLWEB_STORAGE_KEYS, type ImportedProofPacket } from '../types/graph';

export const PROOF_PACKETS_CHANGE_EVENT = 'spellweb-proof-packets-changed';

type PayloadMode = ImportedProofPacket['payloadMode'];

export function getImportedPackets(): ImportedProofPacket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SPELLWEB_STORAGE_KEYS.proofPackets);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is ImportedProofPacket =>
        !!p && typeof p === 'object' &&
        typeof (p as ImportedProofPacket).proof === 'string' &&
        typeof (p as ImportedProofPacket).shopHref === 'string',
    );
  } catch {
    return [];
  }
}

function persist(packets: ImportedProofPacket[]): void {
  try {
    localStorage.setItem(SPELLWEB_STORAGE_KEYS.proofPackets, JSON.stringify(packets));
  } catch {
    // ignore quota
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROOF_PACKETS_CHANGE_EVENT));
  }
}

const MODES: PayloadMode[] = ['sealed', 'revealed', 'refractive', 'composed', 'relational'];

/**
 * Ingest a `spellweb.bearer.packets` payload (the agentprivacy export). Dedupes
 * on the content-addressed `proof`. Returns {added,total}, or null if the JSON
 * is not a packets payload (so callers can fall through to other importers).
 */
export function ingestPacketsPayload(json: unknown): { added: number; total: number } | null {
  if (!json || typeof json !== 'object') return null;
  const obj = json as Record<string, unknown>;
  if (obj.kind !== 'spellweb.bearer.packets' || !Array.isArray(obj.packets)) return null;

  const importedAt = new Date().toISOString();
  const next = getImportedPackets();
  const seen = new Set(next.map((p) => p.proof));
  let added = 0;

  for (const raw of obj.packets as Record<string, unknown>[]) {
    if (!raw || typeof raw.proof !== 'string' || typeof raw.shopHref !== 'string') continue;
    if (seen.has(raw.proof)) continue;
    seen.add(raw.proof);
    const mode = MODES.includes(raw.payloadMode as PayloadMode) ? (raw.payloadMode as PayloadMode) : 'sealed';
    next.push({
      proof: raw.proof,
      shopHref: raw.shopHref,
      vertex: typeof raw.vertex === 'number' ? raw.vertex : null,
      class: String(raw.class ?? 'tool'),
      witness: String(raw.witness ?? ''),
      ceremony: String(raw.ceremony ?? ''),
      payloadMode: mode,
      body: typeof raw.body === 'string' ? raw.body : undefined,
      commitment: typeof raw.commitment === 'string' ? raw.commitment : undefined,
      composedOf: Array.isArray(raw.composedOf) ? (raw.composedOf as string[]) : undefined,
      witnessedBy: typeof raw.witnessedBy === 'string' ? raw.witnessedBy : undefined,
      anchoredTo: String(raw.anchoredTo ?? ''),
      districtRoot: String(raw.districtRoot ?? ''),
      bearer:
        raw.bearer && typeof raw.bearer === 'object'
          ? (raw.bearer as ImportedProofPacket['bearer'])
          : undefined,
      timestamp: String(raw.timestamp ?? importedAt),
      importedAt,
    });
    added += 1;
  }

  if (added > 0) persist(next);
  return { added, total: next.length };
}

/** Stable graph-node id for a packet (content-addressed). */
export function packetNodeId(proof: string): string {
  return `packet-${proof.replace(/^sha256:/, '').slice(0, 16)}`;
}
