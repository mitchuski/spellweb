import { useSyncExternalStore } from 'react';
export type StarPalette = Record<'cool' | 'warm' | 'sword' | 'mage', string>;
let state: { palette: StarPalette; expiresAt: number | null } | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
const emit = () => listeners.forEach(fn => fn());
export function clearStarAppearance() { clearTimeout(timer); state = null; emit(); }
export function receiveStarAppearance(value: unknown, temporary = true) {
 if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
 const source = value as Record<string, unknown>;
 const palette = {} as StarPalette;
 for (const name of ['cool', 'warm', 'sword', 'mage'] as const) {
  const color = source[name];
  if (typeof color !== 'string' || !/^#[a-f0-9]{6}$/i.test(color)) return false;
  palette[name] = color.toLowerCase();
 }
 clearTimeout(timer);
 state = { palette, expiresAt: temporary ? Date.now() + 300000 : null };
 if (temporary) timer = setTimeout(clearStarAppearance, 300000);
 emit(); return true;
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function useStarAppearance() { return useSyncExternalStore(subscribe, () => state, () => null); }
