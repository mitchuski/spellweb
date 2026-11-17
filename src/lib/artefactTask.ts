import { loadKey } from './cityKey';
import { foldActiveJourney } from './cityKeyJourney';
import { swordsmanFromKey } from './keyIdentity';

/**
 * Artefacts as Trust Tasks (2026-11-17, Mitch: "make the key and artefact side of this knowledge graph … compatible
 * with trust tasks"). Each blade forged or witnessed at the ceremony becomes a Trust Task document of type
 * artefact/present (spec: agentprivacy_master/trust-tasks/spec/artefact/present/0.1) and, when a City Key is held,
 * rides in the key's journey as a `trust-task` step, beside the workshop packets. Nothing leaves the browser here:
 * the document travels only when the bearer exports their journey bundle.
 */
export const ARTEFACT_TASK_TYPE = 'https://agentprivacy.ai/trust-tasks/spec/artefact/present/0.1';
export const ARTEFACT_KIND = 'spellweb/artefact/1';

export interface BladeLike {
  id: string; name: string; emoji: string; tier: string; stratum: number; forgedAt: string;
  constellationNodes?: number; constellationMarks?: string[];
  isWitness?: boolean; witnessOf?: string; witnessedFrom?: string;
  proof: {
    constellationHash: string; bladeHash: string; previousBladeHash: string | null; chainLength: number;
    commitment: string; commitmentVerified?: boolean; signature: string; chargeLevel: string; lapCount: number; nodeCount: number;
    bladeHex?: string; deviationHash?: string; mageId?: string; mageSignature?: string;
  };
}

const uuid = () => (globalThis.crypto && 'randomUUID' in globalThis.crypto ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export function artefactTaskDocument(blade: BladeLike) {
  const bearer = swordsmanFromKey();
  const p = blade.proof;
  const payload: Record<string, unknown> = {
    kind: ARTEFACT_KIND,
    artefact: {
      id: blade.id, name: blade.name, emoji: blade.emoji, tier: blade.tier, stratum: blade.stratum, forgedAt: blade.forgedAt,
      ...(blade.isWitness ? { witness: { of: blade.witnessOf ?? null, from: blade.witnessedFrom ?? null } } : {}),
    },
    proof: {
      constellationHash: p.constellationHash, bladeHash: p.bladeHash, previousBladeHash: p.previousBladeHash, chainLength: p.chainLength,
      commitment: p.commitment, commitmentVerified: p.commitmentVerified ?? false, signature: p.signature,
      chargeLevel: p.chargeLevel, lapCount: p.lapCount, nodeCount: p.nodeCount,
      ...(p.bladeHex ? { bladeHex: p.bladeHex } : {}), ...(p.deviationHash ? { deviationHash: p.deviationHash } : {}),
      ...(p.mageId && p.mageSignature ? { mage: { id: p.mageId, signature: p.mageSignature } } : {}),
    },
    ...(blade.constellationMarks?.length ? { constellation: blade.constellationMarks.slice(0, 256) } : {}),
  };
  return {
    // one artefact, one task: the id comes from the proof's signature, so carrying it twice folds once
    id: p.signature ? `urn:spellweb:artefact:${p.signature}` : `urn:uuid:${uuid()}`,
    type: ARTEFACT_TASK_TYPE,
    issuer: bearer?.participantId ?? p.mageId ?? 'spellweb:local',
    issuedAt: new Date().toISOString(),
    payload,
  };
}

/** Carry a freshly forged or witnessed blade into the City Key's journey as an artefact/present Trust Task. */
export async function presentArtefact(blade: BladeLike): Promise<'carried' | 'no-key'> {
  if (!loadKey()?.kappa) return 'no-key';
  await foldActiveJourney(undefined, [artefactTaskDocument(blade)]);
  return 'carried';
}
