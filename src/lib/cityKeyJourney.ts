import { loadKey, saveKey, exportKeyJSON } from './cityKey';
import { carryJourney } from './journey-store';
import { exportOriginalPackets } from './proofPackets';

/** Fold workshop originals into the carried key without replacing its local charge tape. */
export async function foldActiveJourney(packets?: any[], taskDocuments: any[] = []) {
  const key = loadKey();
  if (!key?.kappa) throw new Error('Import or strike your City Key before folding artefacts into its journey.');
  const originals = exportOriginalPackets();
  const bundle = await carryJourney(JSON.parse(exportKeyJSON(key)), packets ?? originals.packets, taskDocuments);
  if (loadKey()?.kappa !== key.kappa) throw new Error('Your City Key changed during the fold. Retry with the latest key.');
  const payload = { ...bundle.key }; delete payload.kappa;
  saveKey({ ...key, payload, kappa: bundle.key.kappa, priorKappa: bundle.key.prior ?? null, updatedAt: new Date().toISOString() });
  return bundle;
}
