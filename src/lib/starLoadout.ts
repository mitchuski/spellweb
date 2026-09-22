import { useEffect, useState } from 'react';
import { loadKey, saveKey, exportKeyJSON, kappaLabel, canonicalJSON, foldCharge, CITY_KEY_EVENT } from './cityKey';
import type { CityKeyCharge } from '../types/graph';
import { NODES } from '../data/nodes';
import { carryJourney } from './journey-store';
import { exportOriginalPackets } from './proofPackets';
import { SPELLWEB_STORAGE_KEYS } from '../types/graph';
const EQUIP = 'spellweb:star-equipped';
const EVENT = 'spellweb:star-equipped-changed';
export function setStarEquipped(value: boolean) { localStorage.setItem(EQUIP, String(value)); window.dispatchEvent(new Event(EVENT)); }
export function useEquippedStar() {
 const read = () => !!loadKey()?.kappa && localStorage.getItem(EQUIP) !== 'false';
 const [equipped, setEquipped] = useState(read);
 useEffect(() => { const update = () => setEquipped(read()); const events = [EVENT, CITY_KEY_EVENT, 'storage']; events.forEach(e => window.addEventListener(e, update)); return () => events.forEach(e => window.removeEventListener(e, update)); }, []);
 return equipped;
}
/** The key's chosen stance — /star's geometry block — with the Star's own slider ranges. Defaults = /star's DEFAULTS. */
export type StarGeometry = { eps: number; m: number; n: number; core: number; smRatio: number };
export const DEFAULT_STAR_GEOMETRY: StarGeometry = { eps: 0.35, m: 5, n: 6, core: 0.6, smRatio: 1 };
const num = (v: unknown, lo: number, hi: number, d: number) => (typeof v === 'number' && Number.isFinite(v)) ? Math.min(hi, Math.max(lo, v)) : d;
export function readStarGeometry(): StarGeometry {
 let g: unknown = null;
 try { g = (loadKey()?.payload as Record<string, unknown> | undefined)?.geometry ?? null; } catch { g = null; }
 if (!g || typeof g !== 'object' || Array.isArray(g)) return DEFAULT_STAR_GEOMETRY;
 const o = g as Record<string, unknown>;
 return { eps: num(o.eps, 0, 0.6, 0.35), m: Math.round(num(o.m, 1, 10, 5)), n: Math.round(num(o.n, 1, 10, 6)), core: num(o.core, 0.25, 0.85, 0.6), smRatio: num(o.smRatio, 1, 2.2, 1) };
}
/** Re-reads whenever the key, the equip flag or another tab changes it. */
export function useStarGeometry(): StarGeometry {
 const [g, setG] = useState(readStarGeometry);
 useEffect(() => { const update = () => setG(readStarGeometry()); const events = [EVENT, CITY_KEY_EVENT, 'storage']; events.forEach(e => window.addEventListener(e, update)); return () => events.forEach(e => window.removeEventListener(e, update)); }, []);
 return g;
}
export function readStarLoadout() {
 const read = (slot: string) => { const v = JSON.parse(localStorage.getItem(slot) || '[]'); if(!Array.isArray(v)) throw Error('Invalid local inventory. Repair or re-import it before syncing.'); return v; };
 return { kind: 'spellweb.loadout/1', status: 'local declaration',
  equipped: [...new Set(read('spellweb:equipped-items').filter((v: unknown) => typeof v === 'string'))].sort(),
  forged: read(SPELLWEB_STORAGE_KEYS.forgedBlades), held: read(SPELLWEB_STORAGE_KEYS.heldConstellations),
  bound: read(SPELLWEB_STORAGE_KEYS.boundFamiliars), receipts: read(SPELLWEB_STORAGE_KEYS.dispatchReceipts) };
}
/**
 * The loadout as the accumulator tape sees it. Every item that sits at a lattice vertex becomes one charge
 * there — an equipped item at its node's vertex, a forged blade at each distinct vertex its constellation
 * marks touch, a held constellation and a bound familiar at the vertex their keeper mage sits at ("V44").
 * The exported key's `lattice` then carries them, and the Star's charged layer draws them. Pure: the caller
 * folds. Idempotent: a charge whose `source` is already on the tape is not folded twice, so re-syncing adds
 * nothing and re-derives nothing. Items with no resolvable vertex are skipped, never guessed.
 */
export type LoadoutLike = { equipped?: unknown; forged?: unknown; held?: unknown; bound?: unknown };
const asVertex = (v: unknown): number | undefined => {
 if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 64) return v;
 if (typeof v === 'string') { const m = /^\s*V?(\d{1,2})\s*$/.exec(v); if (m) { const n = Number(m[1]); if (n >= 0 && n < 64) return n; } }
 return undefined;
};
export const vertexOfNode = (id: string): number | undefined => { const n = NODES.find(x => x.id === id); return typeof n?.vertex === 'number' ? n.vertex : undefined; };
export function loadoutCharges(loadout: LoadoutLike, existingSources: Iterable<string>, vertexOf: (id: string) => number | undefined = vertexOfNode): Array<Omit<CityKeyCharge, 'kappaAfter'>> {
 const have = new Set(existingSources); const out: Array<Omit<CityKeyCharge, 'kappaAfter'>> = []; const foldedAt = new Date().toISOString();
 const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
 const str = (v: unknown, d: string) => typeof v === 'string' && v ? v : d;
 const push = (source: string, label: string, vertex: number | undefined) => { if (vertex === undefined || have.has(source)) return; have.add(source); out.push({ id: `charge-${source}`, label, source, vertex, weight: 1, foldedAt }); };
 for (const id of arr(loadout.equipped)) if (typeof id === 'string') push(`loadout:equipped:${id}`, `Equipped · ${id}`, vertexOf(id));
 for (const b of arr(loadout.forged)) {
  const blade = b as { id?: unknown; name?: unknown; constellationMarks?: unknown } | null;
  if (typeof blade?.id !== 'string') continue;
  const seen = new Set<number>();
  for (const m of arr(blade.constellationMarks)) {
   const nodeId = (m as { nodeId?: unknown } | null)?.nodeId; if (typeof nodeId !== 'string') continue;
   const v = vertexOf(nodeId); if (v === undefined || seen.has(v)) continue; seen.add(v);
   push(`loadout:blade:${blade.id}:V${v}`, `Forged · ${str(blade.name, blade.id)} · V${v}`, v);
  }
 }
 for (const h of arr(loadout.held)) { const c = h as { id?: unknown; name?: unknown; mageVertex?: unknown } | null; if (typeof c?.id !== 'string') continue; push(`loadout:held:${c.id}`, `Held · ${str(c.name, c.id)}`, asVertex(c.mageVertex)); }
 for (const b of arr(loadout.bound)) { const c = b as { id?: unknown; name?: unknown; mageVertex?: unknown } | null; if (typeof c?.id !== 'string') continue; push(`loadout:familiar:${c.id}`, `Bound · ${str(c.name, c.id)}`, asVertex(c.mageVertex)); }
 return out;
}
let syncing = false;
export async function syncStarLoadout() {
 if(syncing) throw Error('Star sync is already running.');
 syncing = true;
 try {
  const key = loadKey(); if(!key?.kappa) throw Error('Import a City Key first.');
  const loadout = readStarLoadout();
  // vertex-seated items become charges on the tape first, so `lattice` carries them and the Star draws them
  let struck = key;
  for (const c of loadoutCharges(loadout, key.charges.map(x => x.source))) struck = await foldCharge(struck, c);
  const payload = JSON.parse(exportKeyJSON(struck));
  if(canonicalJSON(payload.spellwebLoadout ?? null) !== canonicalJSON(loadout)) {
   payload.spellwebLoadout = loadout;
   payload.prior = struck.kappa;
   payload.kappa = await kappaLabel(payload);
   if(!payload.kappa) throw Error('Key hashing requires HTTPS or localhost.');
  }
  const bundle = await carryJourney(payload, exportOriginalPackets().packets);
  if(loadKey()?.kappa !== key.kappa) throw Error('Your key changed during sync. Retry from its current head.');
  const next = { ...bundle.key }; delete next.kappa;
  saveKey({ ...struck, payload: next, kappa: bundle.key.kappa, priorKappa: bundle.key.prior ?? null, updatedAt: new Date().toISOString() });
  return loadout;
 } finally { syncing = false; }
}
