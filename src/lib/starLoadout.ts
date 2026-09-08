import { useEffect, useState } from 'react';
import { loadKey, saveKey, exportKeyJSON, kappaLabel, canonicalJSON, CITY_KEY_EVENT } from './cityKey';
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
export function readStarLoadout() {
 const read = (slot: string) => { const v = JSON.parse(localStorage.getItem(slot) || '[]'); if(!Array.isArray(v)) throw Error('Invalid local inventory. Repair or re-import it before syncing.'); return v; };
 return { kind: 'spellweb.loadout/1', status: 'local declaration',
  equipped: [...new Set(read('spellweb:equipped-items').filter((v: unknown) => typeof v === 'string'))].sort(),
  forged: read(SPELLWEB_STORAGE_KEYS.forgedBlades), held: read(SPELLWEB_STORAGE_KEYS.heldConstellations),
  bound: read(SPELLWEB_STORAGE_KEYS.boundFamiliars), receipts: read(SPELLWEB_STORAGE_KEYS.dispatchReceipts) };
}
let syncing = false;
export async function syncStarLoadout() {
 if(syncing) throw Error('Star sync is already running.');
 syncing = true;
 try {
  const key = loadKey(); if(!key?.kappa) throw Error('Import a City Key first.');
  const loadout = readStarLoadout();
  const payload = JSON.parse(exportKeyJSON(key));
  if(canonicalJSON(payload.spellwebLoadout ?? null) !== canonicalJSON(loadout)) {
   payload.spellwebLoadout = loadout;
   payload.prior = key.kappa;
   payload.kappa = await kappaLabel(payload);
   if(!payload.kappa) throw Error('Key hashing requires HTTPS or localhost.');
  }
  const bundle = await carryJourney(payload, exportOriginalPackets().packets);
  if(loadKey()?.kappa !== key.kappa) throw Error('Your key changed during sync. Retry from its current head.');
  const next = { ...bundle.key }; delete next.kappa;
  saveKey({ ...key, payload: next, kappa: bundle.key.kappa, priorKappa: bundle.key.prior ?? null, updatedAt: new Date().toISOString() });
  return loadout;
 } finally { syncing = false; }
}
