/**
 * cityKey.ts — the holonic Swordsman City Key (C87 · "The Key Accumulates").
 *
 * The key is a holon: a whole that contains parts (folded charges) and is itself a
 * part of the City. Each "stamp" folds a charge in — an IVC step (C87: Key = accumulator,
 * trust tasks = step circuits, Charge = folding step, V63 = attested invariant). Folding
 * re-derives κ and chains the prior κ via `supersedes`, so the key carries a
 * content-addressed lineage of selves — the Swordsman walking his own mark back to the graph.
 *
 * κ DERIVATION IS BYTE-IDENTICAL to the star repo's /sigil page
 * (github.com/mitchuski/star · sigil/index.html → canonicalJSON + kappaLabel).
 * Do not "improve" the canonicalisation — same bytes in ⇒ same κ everywhere, which is the
 * whole interoperability guarantee with agentprivacy_master + soulbis /star + /lattice.
 *
 * Spec: spellweb/CHRONICLE_SPELLWEB_SYNC_AUDIT_2026-06-11.md §6 Option B.
 */

import { SPELLWEB_STORAGE_KEYS } from '../types/graph';
import type { SwordsmanCityKey, CityKeyCharge } from '../types/graph';

// ─────────────────────────────────────────────────────────────────────
// κ-label (UOR-ADDR · sha256 axis) — verbatim canon from star/sigil/index.html
// ─────────────────────────────────────────────────────────────────────

/** Deterministic JSON: keys sorted recursively, no whitespace. Byte-identical to /sigil. */
export function canonicalJSON(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalJSON).join(',') + ']';
  const o = v as Record<string, unknown>;
  return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canonicalJSON(o[k])).join(',') + '}';
}

/**
 * κ = "sha256:" + H(canonical form), with the `kappa` field excluded from its own preimage
 * (Law L5). Returns null when crypto.subtle is unavailable (e.g. insecure context) — the key
 * still works, it just stays unnamed until re-derived over localhost/https.
 */
export async function kappaLabel(obj: Record<string, unknown>): Promise<string | null> {
  const subtle = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) return null;
  const c: Record<string, unknown> = { ...obj };
  delete c.kappa;
  const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJSON(c)));
  return 'sha256:' + [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The hash glyph at vertex x (0..63): the x-th hex digit of κ, value 0..15.
 * This is the sigil — 64 glyphs, one per vertex (the constellation render reads this).
 * Returns null if κ is absent. Mirrors /sigil glyphAt.
 */
export function glyphAt(kappa: string | null, x: number): number | null {
  if (!kappa || !kappa.startsWith('sha256:')) return null;
  const hex = kappa.slice(7);
  if (x < 0 || x >= hex.length) return null;
  return parseInt(hex[x], 16);
}

// ─────────────────────────────────────────────────────────────────────
// The accumulator — build · fold · persist · serialize
// ─────────────────────────────────────────────────────────────────────

export interface KeyIdentity {
  bearerName?: string;
  swordsmanId?: string;
  mageId?: string;
}

/** A fresh, charge-less key. κ is null until the first fold (or an explicit reseal). */
export function emptyKey(identity: KeyIdentity = {}): SwordsmanCityKey {
  const now = new Date().toISOString();
  return {
    version: 1,
    bearerName: identity.bearerName,
    swordsmanId: identity.swordsmanId,
    mageId: identity.mageId,
    kappa: null,
    priorKappa: null,
    weight: 0,
    charges: [],
    payload: {},
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Star-surface fields that RIDE WITH THE KEY through every fold/reseal (2026-06-12).
 * `geometry` is the bearer's chosen stance — written at /star, passed through by
 * /lattice, worn by /sigil's ring. Until measured figures make the shape automatic
 * (FIG-2.0, future /city work), the chosen stance must survive the spellweb round-trip,
 * so these fields are carried verbatim from the previous payload. They are content —
 * they stay inside the κ preimage, exactly as star semantics demand. The reading
 * fields (name/version/kind/identity/lattice/weight/charges/prior) stay owned here.
 */
const CARRIED_STAR_FIELDS = [
  'palette', 'descriptions', 'geometry', 'lit', 'trace', 'focus', 'witness',
  'figures', 'packets', 'did',
] as const;

/**
 * The star-compatible City Key payload — a *reading* of the bearer's current standing.
 * κ derives from THIS (kappa-excluded). It folds in identity + the cumulative per-vertex
 * weight the bearer has accrued, so each charge changes the reading and therefore κ.
 * Shape stays a valid City Key (name/version/identity/lattice/weight) for round-trip,
 * and the adopted star dress (geometry et al.) is carried through, never dropped.
 */
export function buildPayload(key: SwordsmanCityKey): Record<string, unknown> {
  const lattice: Record<string, number> = {};
  for (const c of key.charges) {
    if (c.vertex === undefined) continue;
    lattice[String(c.vertex)] = (lattice[String(c.vertex)] ?? 0) + c.weight;
  }
  const identity: Record<string, string> = {};
  if (key.swordsmanId) identity.swordsman = key.swordsmanId;
  if (key.mageId) identity.mage = key.mageId;
  const prev = (key.payload ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of CARRIED_STAR_FIELDS) {
    if (prev[f] !== undefined) out[f] = prev[f];
  }
  out.name = key.bearerName || "the swordsman's city key";
  out.version = 1;
  out.kind = 'city-key';
  out.identity = identity;
  out.lattice = lattice;             // { "44": 2, "63": 5, … } — sorted recursively by canonicalJSON
  out.weight = key.weight;           // the holon's accumulated mass
  out.charges = key.charges.length;  // a count, not the tape — the payload is a reading, not the ledger
  return out;
}

/**
 * Fold one charge into the key — the C87 step. Appends the charge, recomputes the payload
 * reading, re-derives κ over it, records that κ as the step's running invariant, and chains
 * the prior κ via priorKappa (the `supersedes` edge made concrete). Async because κ is a
 * SHA-256 over the canonical bytes. Returns a NEW key (caller persists).
 */
export async function foldCharge(
  key: SwordsmanCityKey,
  input: Omit<CityKeyCharge, 'kappaAfter'>,
): Promise<SwordsmanCityKey> {
  const next: SwordsmanCityKey = {
    ...key,
    charges: [...key.charges, { ...input, kappaAfter: null }],
    weight: key.weight + input.weight,
    updatedAt: new Date().toISOString(),
  };
  next.payload = buildPayload(next);
  // The prior κ travels INSIDE the payload (star semantics: `prior` is part of the κ
  // preimage), so /skye can thread the lineage from the exported JSON alone. When the
  // key was adopted from another surface and never struck, the adopted chain carries.
  const prior = key.kappa ?? key.priorKappa;
  if (prior) next.payload.prior = prior;
  const newKappa = await kappaLabel(next.payload);
  next.priorKappa = prior ?? null;      // chain: this self supersedes the prior κ
  next.kappa = newKappa;
  // stamp the running invariant onto the charge we just folded
  next.charges[next.charges.length - 1].kappaAfter = newKappa;
  return next;
}

/** Re-derive κ over the current payload without folding (e.g. after a crypto-unavailable load). */
export async function reseal(key: SwordsmanCityKey): Promise<SwordsmanCityKey> {
  const payload = buildPayload(key);
  const carried = (key.payload as Record<string, unknown> | undefined)?.prior ?? key.priorKappa;
  if (typeof carried === 'string') payload.prior = carried; // resealing must not drop the lineage
  const kappa = await kappaLabel(payload);
  return { ...key, payload, kappa };
}

/** A convenience charge factory — `Date.now`-stamped, de-dup id derived from source + time. */
export function makeCharge(opts: { label: string; source: string; vertex?: number; weight?: number }): Omit<CityKeyCharge, 'kappaAfter'> {
  const foldedAt = new Date().toISOString();
  return {
    id: `charge-${opts.source}-${Date.now()}`,
    label: opts.label,
    source: opts.source,
    vertex: opts.vertex,
    weight: opts.weight ?? 1,
    foldedAt,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Persistence — one key per bearer, localStorage, cross-tab change event
// ─────────────────────────────────────────────────────────────────────

const KEY = SPELLWEB_STORAGE_KEYS.swordsmanCityKey;
export const CITY_KEY_EVENT = 'spellweb:swordsman-city-key-changed';

export function loadKey(): SwordsmanCityKey | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SwordsmanCityKey;
    return parsed && parsed.version === 1 ? parsed : null;
  } catch { return null; }
}

export function saveKey(key: SwordsmanCityKey): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(key));
    window.dispatchEvent(new Event(CITY_KEY_EVENT));
  } catch { /* ignore quota */ }
}

/** Fold + persist in one call. Returns the new key. */
export async function stamp(
  key: SwordsmanCityKey,
  input: Omit<CityKeyCharge, 'kappaAfter'>,
): Promise<SwordsmanCityKey> {
  const next = await foldCharge(key, input);
  saveKey(next);
  return next;
}

// ─────────────────────────────────────────────────────────────────────
// Rotation — adopt a City Key from another information space
// (/star · /lattice · /sigil · /skye · agentprivacy /city). κ-lineage is what
// rotates: the imported reading folds into the tape, and the star dress
// (palette · geometry · lit · trace …) RIDES WITH THE KEY — carried verbatim
// through every fold via CARRIED_STAR_FIELDS, so the stance chosen at /star
// survives the spellweb round-trip (changed 2026-06-12; it used to stay with
// its surface). The prior-chain carries through per the star rotation rule —
// content unchanged at adoption ⇒ `prior` carries; the first local fold
// then supersedes the adopted κ itself (C87).
// ─────────────────────────────────────────────────────────────────────

export interface ImportedKeyResult {
  key: SwordsmanCityKey;
  /** κ claim re-derived and matched (Law L5: never trusted, always re-derived). */
  verified: boolean;
  derivedKappa: string | null;
  claimedKappa: string | null;
}

/**
 * Parse a star-/city-compatible City Key JSON and adopt it as the local holonic key.
 * Per-vertex standing (lattice · focus · lit) re-enters the tape as import charges so
 * the accumulator continues from the imported reading. Caller persists (saveKey).
 */
export async function importKeyJSON(json: string, identity: KeyIdentity = {}): Promise<ImportedKeyResult> {
  const obj = JSON.parse(json) as Record<string, unknown>;
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('Not a City Key object');
  }
  const claimedKappa = typeof obj.kappa === 'string' ? obj.kappa : null;
  const derivedKappa = await kappaLabel(obj); // kappa-excluded from its own preimage
  const verified = claimedKappa === null || derivedKappa === null || claimedKappa === derivedKappa;
  const now = new Date().toISOString();

  // Per-vertex standing → import charges. /city + spellweb keys carry `lattice` or
  // `focus` ({ vertex: weight }); star keys may only carry `lit` (number[], weight 1 each).
  const weighted = (v: unknown): Record<string, unknown> =>
    v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const latticeMap = { ...weighted(obj.lattice), ...weighted(obj.focus) };
  const charges: CityKeyCharge[] = [];
  for (const [v, w] of Object.entries(latticeMap)) {
    const vertex = Number(v);
    const weight = typeof w === 'number' ? w : 0;
    if (!Number.isFinite(vertex) || weight <= 0) continue;
    charges.push({
      id: `charge-key-import-v${vertex}`,
      label: `Imported reading · V${vertex}`,
      source: 'key-import',
      vertex,
      weight,
      foldedAt: now,
      kappaAfter: null,
    });
  }
  if (charges.length === 0 && Array.isArray(obj.lit)) {
    for (const v of obj.lit) {
      const vertex = Number(v);
      if (!Number.isFinite(vertex)) continue;
      charges.push({
        id: `charge-key-import-v${vertex}`,
        label: `Imported reading · V${vertex} (lit)`,
        source: 'key-import',
        vertex,
        weight: 1,
        foldedAt: now,
        kappaAfter: null,
      });
    }
  }

  const ident = weighted(obj.identity);
  const payload: Record<string, unknown> = { ...obj };
  delete payload.kappa;

  const key: SwordsmanCityKey = {
    version: 1,
    bearerName: identity.bearerName ?? (typeof obj.name === 'string' ? obj.name : undefined),
    swordsmanId: identity.swordsmanId ?? (typeof ident.swordsman === 'string' ? ident.swordsman : undefined),
    mageId: identity.mageId ?? (typeof ident.mage === 'string' ? ident.mage : undefined),
    kappa: derivedKappa ?? claimedKappa,
    priorKappa: typeof obj.prior === 'string' ? obj.prior : null, // carry the chain through unchanged content
    weight: charges.reduce((s, c) => s + c.weight, 0),
    charges,
    payload,
    createdAt: now,
    updatedAt: now,
  };
  return { key, verified, derivedKappa, claimedKappa };
}

// ─────────────────────────────────────────────────────────────────────
// Serialization — round-trips to agentprivacy_master + soulbis /star + /lattice
// ─────────────────────────────────────────────────────────────────────

/**
 * The standalone star-compatible City Key JSON, with κ stamped (as /sigil emits on export).
 *
 * INTENTIONAL BOUNDARY (user-confirmed 2026-06-12): a spellweb-NATIVE key (never
 * adopted from /star) carries no palette/descriptions, and agentprivacy /city's
 * parseCityKey requires both — so it will not charge there. This is by design,
 * not a gap: the Mage's key must transform at the Swordsman boundary — walk
 * /star once to be dressed — before it can charge. Do not add default palette/
 * descriptions here to make it charge directly.
 */
export function exportKeyJSON(key: SwordsmanCityKey): string {
  const out: Record<string, unknown> = { ...key.payload };
  if (key.kappa) out.kappa = key.kappa;
  return JSON.stringify(out, null, 2);
}

/** A markdown section for the Swordsman.md bundle — the key, its κ, weight, and prior-chain. */
export function serializeKeyMarkdown(key: SwordsmanCityKey): string {
  const lines: string[] = [
    `## 🗝️ Swordsman City Key`,
    '',
    `- **κ (name):** \`${key.kappa ?? 'unsealed — re-derive over localhost/https'}\``,
    key.priorKappa ? `- **Supersedes:** \`${key.priorKappa}\`` : `- **Inception** — no prior κ`,
    `- **Weight:** ${key.weight} · **${key.charges.length}** charge${key.charges.length === 1 ? '' : 's'} folded`,
    `- **Updated:** ${new Date(key.updatedAt).toLocaleString()}`,
    '',
    '### Charges (the accumulator tape)',
    '',
  ];
  if (key.charges.length === 0) {
    lines.push('*No charges yet — the key is unstruck.*', '');
  } else {
    lines.push('| # | Charge | Source | V | Weight | κ after |', '|---|--------|--------|---|--------|---------|');
    key.charges.forEach((c, i) => {
      const kshort = c.kappaAfter ? c.kappaAfter.slice(0, 23) + '…' : '—';
      lines.push(`| ${i + 1} | ${c.label} | \`${c.source}\` | ${c.vertex ?? '—'} | ${c.weight} | \`${kshort}\` |`);
    });
    lines.push('');
  }
  return lines.join('\n');
}
