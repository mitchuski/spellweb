import { BUNDLE_KIND, createBundle, foldJourney, validateBundle, type JourneyBundle, type JourneyKey } from './journey-core';

const SLOT = 'agentprivacy:journey-bundle:v1';
export const JOURNEY_EVENT = 'agentprivacy:journey-changed';
let queue: Promise<unknown> = Promise.resolve();

export function loadJourney(): JourneyBundle | null {
  const raw = localStorage.getItem(SLOT);
  return raw ? JSON.parse(raw) as JourneyBundle : null;
}

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
}

function commit(bundle: JourneyBundle, before: string | null) {
  if (localStorage.getItem(SLOT) !== before) throw new Error('The journey changed in another tab. Retry with its latest key.');
  localStorage.setItem(SLOT, JSON.stringify(bundle)); // Quota errors must reach the player.
  window.dispatchEvent(new CustomEvent(JOURNEY_EVENT));
}

/** Explicit adoption replaces the local head. It never awards mana or credentials. */
export function adoptJourney(value: unknown): Promise<JourneyBundle> {
  return serial(async () => {
    const before = localStorage.getItem(SLOT);
    await validateBundle(value);
    const bundle = JSON.parse(JSON.stringify(value)) as JourneyBundle;
    commit(bundle, before);
    return bundle;
  });
}

/** Resolve originals for this head, then append newly encountered work exactly once. */
export function carryJourney(key: JourneyKey, packets: any[] = [], taskDocuments: any[] = []): Promise<JourneyBundle> {
  return serial(async () => {
    const before = localStorage.getItem(SLOT);
    const cached = before ? JSON.parse(before) as JourneyBundle : null;
    if (cached) await validateBundle(cached);
    if (cached?.key.journey?.steps?.some((step: any) => !key.journey?.steps?.some((s: any) => s.id === step.id))) {
      throw new Error('This key predates the carried journey. Import a complete bundle to deliberately replace it, or retry with the latest key.');
    }
    if (cached?.key.identity?.publicKeyHex && cached.key.identity.publicKeyHex !== key.identity?.publicKeyHex) {
      throw new Error('The carried journey belongs to another identity. Import a complete bundle to replace it.');
    }
    const tasks = cached?.taskDocuments ?? [];
    const all = [...new Map([...(cached?.packets ?? []), ...packets].map(p => [p.proof, p])).values()];
    let bundle: JourneyBundle | undefined;
    const candidates = key.packets ? [cached?.packets ?? [], packets, all] : [cached?.packets ?? []];
    let failure: unknown;
    for (const originals of candidates) {
      try { bundle = await createBundle(key, originals, tasks); break; }
      catch (error) { failure = error; }
    }
    if (!bundle) throw new Error(`Cannot continue this key: ${failure instanceof Error ? failure.message : 'original evidence missing'}. Import its private journey bundle.`);
    for (const packet of [...bundle.packets, ...packets]) bundle = (await foldJourney(bundle, { packet })).bundle;
    for (const taskDocument of [...bundle.taskDocuments, ...taskDocuments]) bundle = (await foldJourney(bundle, { taskDocument })).bundle;
    commit(bundle, before);
    return bundle;
  });
}

export function downloadJourney(bundle: JourneyBundle) {
  if (bundle.kind !== BUNDLE_KIND) throw new Error('Expected a journey bundle');
  const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'private-journey-bundle.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
