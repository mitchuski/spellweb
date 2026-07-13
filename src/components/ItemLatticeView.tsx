/**
 * ItemLatticeView — middle-screen lattice render of artefacts + creatures.
 *
 * Each artefact-producing workshop occupies its canonical vertex on the
 * 64-vertex sovereignty lattice (Pascal's-row layout · 1+6+15+20+15+6+1).
 * Hover surfaces the artefact's metadata in the left column; click pins
 * a vertex and opens the right column with identity-system slot mapping.
 *
 * Pattern adopted from agentprivacy_master/src/components/profile/LatticeMap.tsx.
 * Slot rule: artefact.vertex = workshop.vertex (the workshop that produces it).
 *
 * Spec: docs/chronicles/CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md
 */

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import type { SpellwebNode, ArtefactClass, EntityKind, HeldConstellation, BoundFamiliar, DispatchReceipt, SwordsmanCityKey } from '../types/graph';
import { NODES } from '../data/nodes';
import { THEME } from '../data/theme';
import {
  loadKey, saveKey, emptyKey, stamp, makeCharge, glyphAt, importKeyJSON, CITY_KEY_EVENT,
  type KeyIdentity,
} from '../lib/cityKey';

export type LatticeMode = 'items' | 'lattice';

// Lightweight ForgedBlade shape — the lattice only needs enough to display + identify.
// Full export builds happen in SpellWeb via the onExportArtefact(bladeId) callback.
interface LatticeForgedBlade {
  id: string;
  name: string;
  emoji: string;
  tier: 'light' | 'heavy' | 'dragon';
  stratum?: number;
  forgedAt?: string;
  constellationMarks: { nodeId: string; emoji: string }[];
  isWitness?: boolean;
}

interface ItemLatticeViewProps {
  open: boolean;
  mode: LatticeMode;
  onClose: () => void;
  onSwitchMode: (mode: LatticeMode) => void;
  // v1.6.0 (2026-05-15) · proof-of-presence + import surface migrated from the retired side panel
  witnessedShops?: Record<string, string>;
  forgedBlades?: LatticeForgedBlade[];
  // 2026-06-11 · bearer identity for the holonic Swordsman City Key (κ folds it into the reading)
  keyIdentity?: KeyIdentity;
  onCreateImport?: (file: File) => void;   // ✦ Create import — master template / canonical seed
  onCraftImport?: (file: File) => void;    // ⚒️ Craft import — forged artefact / Sovereign's own work
  // Export hooks · migrated from the retired ArtefactPanel
  onExportArtefact?: (bladeId: string) => void;       // 📥 download a forged blade as .md
  onExportCatalogue?: (nodeId: string) => void;       // 📥 download a canonical workshop card as .md
  // 2026-06-12 · key carry-out surfaced in the inventory (the keys panel's carry row)
  onExportSwordsman?: () => void;                     // ⚔️ the Swordsman bundle .md (includes the City Key section)
  onExportMage?: () => void;                          // 🧙 the Mage bundle .md (spells + constellations + identity)
  onExportCityKey?: () => void;                       // 🗝️ the content-addressed City Key .json (κ stamped)
  // Post-import Evoke CTA · surfaced when a constellation is loaded but the ceremony hasn't been triggered
  hasConstellation?: boolean;        // true when the canvas holds an imported constellation
  onBeginEvoke?: () => void;         // closes the lattice + starts the casting ceremony
  // v1.6.0 (2026-05-16) · imported entity collections · render in the inventory grid alongside forgedBlades
  heldConstellations?: HeldConstellation[];
  boundFamiliars?: BoundFamiliar[];
  dispatchReceipts?: DispatchReceipt[];
  // True-name display consent · bearer's local opt-in to surface a familiar's bearer-private trueName.
  // Per chronicle §1.2 · default off · per-familiar so the bearer can opt-in selectively.
  onSetTrueNameConsent?: (familiarId: string, consent: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Equipped-state persistence — the bearer's currently "turned on" items
// affect constellation tracking + forge(t)ing flows. Stored in localStorage
// so the loadout survives across sessions. Each entry is a workshop node id
// (e.g. 'shop-tailor', 'shop-charthouse', 'shop-staff').
// ─────────────────────────────────────────────────────────────────────
const EQUIPPED_KEY = 'spellweb:equipped-items';
const EQUIPPED_EVENT = 'spellweb:equipped-items-changed';

function loadEquipped(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(EQUIPPED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x: unknown): x is string => typeof x === 'string')) : new Set();
  } catch { return new Set(); }
}

function saveEquipped(s: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EQUIPPED_KEY, JSON.stringify([...s]));
    window.dispatchEvent(new Event(EQUIPPED_EVENT));
  } catch { /* ignore quota */ }
}

// ─────────────────────────────────────────────────────────────────────
// Lattice layout math (mirrors agentprivacy_master/profile/LatticeMap)
// ─────────────────────────────────────────────────────────────────────
function popcount(v: number): number {
  let n = v, c = 0;
  while (n) { c += n & 1; n >>= 1; }
  return c;
}

function buildRows(): number[][] {
  const rows: number[][] = [[], [], [], [], [], [], []];
  for (let v = 0; v <= 63; v++) rows[popcount(v)].push(v);
  return rows;
}

const ROWS = buildRows();
const VIEW_W = 720;
const VIEW_H = 440;
const TOP_PAD = 28;
const BOTTOM_PAD = 18;
const ROW_SPACE = (VIEW_H - TOP_PAD - BOTTOM_PAD) / 6;
const SIDE_PAD = 36;

function vertexPos(v: number): { x: number; y: number } {
  const s = popcount(v);
  const row = ROWS[s];
  const innerW = VIEW_W - SIDE_PAD * 2;
  const x = SIDE_PAD + (innerW / row.length) * (row.indexOf(v) + 0.5);
  const y = TOP_PAD + s * ROW_SPACE;
  return { x, y };
}

// ─────────────────────────────────────────────────────────────────────
// Pie-segment math · for multi-occupancy vertices (V51 has 2 · V59 has 3)
// Each occupant gets an equal arc; first segment starts at -π/2 (top).
// ─────────────────────────────────────────────────────────────────────
function pieSegmentPath(cx: number, cy: number, r: number, startA: number, endA: number): string {
  const x1 = cx + r * Math.cos(startA);
  const y1 = cy + r * Math.sin(startA);
  const x2 = cx + r * Math.cos(endA);
  const y2 = cy + r * Math.sin(endA);
  const largeArc = endA - startA > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function segmentAngles(n: number): { startA: number; endA: number; midA: number }[] {
  const segs: { startA: number; endA: number; midA: number }[] = [];
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const startA = -Math.PI / 2 + i * step;
    const endA = startA + step;
    segs.push({ startA, endA, midA: (startA + endA) / 2 });
  }
  return segs;
}

// ─────────────────────────────────────────────────────────────────────
// Index workshops by vertex
// ─────────────────────────────────────────────────────────────────────
function buildVertexInhabitants(): Map<number, SpellwebNode[]> {
  const map = new Map<number, SpellwebNode[]>();
  for (const n of NODES) {
    if (n.type !== 'workshop' || n.artefactClass === undefined) continue;
    if (n.vertex === undefined) continue;
    if (!map.has(n.vertex)) map.set(n.vertex, []);
    map.get(n.vertex)!.push(n);
  }
  return map;
}

// (Tomes dropped from the spellweb interface 2026-05-15 — they live at /tomes on
// agentprivacy_master. The Kinship-Bond at V59 stays because it surfaces as a
// vertex-bearing workshop in the bound slot.)

// ─────────────────────────────────────────────────────────────────────
// Identity-slot mapping (right column)
// ─────────────────────────────────────────────────────────────────────
type IdentitySlot = 'worn' | 'borne' | 'bound' | 'held';

function slotForArtefact(node: SpellwebNode): IdentitySlot {
  // entityKind takes precedence (NEW v1.6.0)
  const ek = (node as SpellwebNode & { entityKind?: EntityKind }).entityKind;
  if (ek === 'creature') return 'bound';
  if (ek === 'held') return 'held';
  // fallback to artefactClass
  switch (node.artefactClass as ArtefactClass) {
    case 'clothing': return 'worn';
    case 'tool':
    case 'weapon':
    case 'staff':
    case 'trinket':  return 'borne';
    case 'tome':
      // Kinship-Bond exception (Faunia's bond) — currently classed as tome but is bound
      if (node.id === 'shop-familiars') return 'bound';
      return 'borne';
    default: return 'borne';
  }
}

const SLOT_META: Record<IdentitySlot, { label: string; emoji: string; accent: string; desc: string }> = {
  worn:  { label: 'Worn',  emoji: '🧣', accent: '#a78bfa', desc: 'cloak-class · publicly-visible · Refractive Disclosure surface' },
  borne: { label: 'Borne', emoji: '⚙', accent: '#facc15', desc: 'tool / weapon / staff / trinket · carried instrument · accrues 🪢 VRC-mana when wielded' },
  bound: { label: 'Bound', emoji: '🪿', accent: '#d97706', desc: 'creature-class · the bond IS the artefact · walks beside the Sovereign · v1.6.0' },
  held:  { label: 'Held',  emoji: '🧭', accent: '#5eead4', desc: 'attentional register · pre-episodic constellations under the Φ-gap · bearer-private · v1.6.0' },
};

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────
export default function ItemLatticeView({
  open,
  mode,
  onClose,
  onSwitchMode,
  witnessedShops = {},
  forgedBlades = [],
  keyIdentity = {},
  onCreateImport,
  onCraftImport,
  onExportArtefact,
  onExportSwordsman,
  onExportMage,
  onExportCityKey,
  onExportCatalogue,
  hasConstellation = false,
  onBeginEvoke,
  heldConstellations = [],
  boundFamiliars = [],
  dispatchReceipts = [],
  onSetTrueNameConsent,
}: ItemLatticeViewProps) {
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null);
  const [hoveredOccupantIdx, setHoveredOccupantIdx] = useState(0);
  const [focusMode, setFocusMode] = useState(false);   // ⛶ hide side columns, expand lattice canvas
  const [pinnedVertex, setPinnedVertex] = useState<number | null>(null);
  const [pinnedOccupantIdx, setPinnedOccupantIdx] = useState(0);
  const [equipped, setEquipped] = useState<Set<string>>(() => loadEquipped());

  const inhabitants = useMemo(buildVertexInhabitants, []);

  // Re-sync equipped state if another tab/window changes it
  useEffect(() => {
    const onChange = () => setEquipped(loadEquipped());
    window.addEventListener(EQUIPPED_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EQUIPPED_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggleEquipped = useCallback((nodeId: string) => {
    setEquipped(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      saveEquipped(next);
      return next;
    });
  }, []);

  // Set of vertices that have at least one equipped occupant
  const equippedVertices = useMemo(() => {
    const s = new Set<number>();
    inhabitants.forEach((nodes, v) => {
      if (nodes.some(n => equipped.has(n.id))) s.add(v);
    });
    return s;
  }, [inhabitants, equipped]);

  // v1.6.0 (2026-05-15) · proof-of-presence set · workshop ids the bearer can equip from
  // (witnessed via ceremony OR has a forged item from). Equipping is gated by this set.
  const provenSet = useMemo(() => {
    const s = new Set<string>(Object.keys(witnessedShops));
    // Forged blades inherit proof from their originating workshop · derived from constellationMarks
    for (const blade of forgedBlades) {
      for (const mark of blade.constellationMarks) {
        // Mark may directly be a workshop, or carry a shopAnchor we resolve via NODES
        const node = NODES.find(n => n.id === mark.nodeId);
        if (node?.type === 'workshop') s.add(node.id);
        if (node?.shopAnchor) {
          const shopId = `shop-${node.shopAnchor.replace(/^\//, '')}`;
          if (NODES.some(n => n.id === shopId)) s.add(shopId);
        }
      }
    }
    return s;
  }, [witnessedShops, forgedBlades]);

  // Vertices with at least one proven occupant · used to render a subtle witnessed-ring
  const provenVertices = useMemo(() => {
    const s = new Set<number>();
    inhabitants.forEach((nodes, v) => {
      if (nodes.some(n => provenSet.has(n.id))) s.add(v);
    });
    return s;
  }, [inhabitants, provenSet]);

  // All inhabited vertices light up · mode no longer filters lit vertices · the
  // Items tab is a flat grid surface, the Lattice tab is the spatial geometry.
  const litVertices = useMemo(() => {
    const lit = new Set<number>();
    inhabitants.forEach((_, v) => lit.add(v));
    return lit;
  }, [inhabitants]);

  // Group catalogue inhabitants by identity slot for the Items emoji grid · drops
  // pure tomes (artefactClass='tome' nodes whose slot is borne — the documents).
  // Familiars stays because its slot is bound (Kinship-Bond exception).
  const itemsBySlot = useMemo(() => {
    const groups: Record<IdentitySlot, SpellwebNode[]> = { worn: [], borne: [], bound: [], held: [] };
    inhabitants.forEach(nodes => {
      for (const n of nodes) {
        // Drop document/borne-tomes from the grid (per 2026-05-15 user direction)
        if (n.artefactClass === 'tome' && n.id !== 'shop-familiars') continue;
        const slot = slotForArtefact(n);
        groups[slot].push(n);
      }
    });
    // Sort each slot by vertex
    (Object.keys(groups) as IdentitySlot[]).forEach(slot => {
      groups[slot].sort((a, b) => (a.vertex ?? 999) - (b.vertex ?? 999));
    });
    return groups;
  }, [inhabitants]);

  // Forged blades grouped by their originating workshop's identity slot · resolves
  // each blade's class via its constellationMarks (mirrors the old ArtefactPanel's
  // forgedByClass logic). A bearer can have many cloaks / many blades / many staffs ·
  // each instance lands in its slot section alongside the canonical template.
  const forgedBySlot = useMemo(() => {
    const groups: Record<IdentitySlot, LatticeForgedBlade[]> = { worn: [], borne: [], bound: [], held: [] };
    for (const blade of forgedBlades) {
      let slot: IdentitySlot = 'borne'; // default for unclassed forgings
      for (const mark of blade.constellationMarks) {
        const node = NODES.find(n => n.id === mark.nodeId);
        if (node?.type === 'workshop' && node.artefactClass) { slot = slotForArtefact(node); break; }
        if (node?.shopAnchor) {
          const shopId = `shop-${node.shopAnchor.replace(/^\//, '')}`;
          const shop = NODES.find(n => n.id === shopId);
          if (shop?.artefactClass) { slot = slotForArtefact(shop); break; }
        }
      }
      groups[slot].push(blade);
    }
    // Newest first within each slot
    (Object.keys(groups) as IdentitySlot[]).forEach(slot => {
      groups[slot].sort((a, b) => (b.forgedAt ?? '').localeCompare(a.forgedAt ?? ''));
    });
    return groups;
  }, [forgedBlades]);

  const activeNode: SpellwebNode | null = useMemo(() => {
    const v = pinnedVertex ?? hoveredVertex;
    if (v === null) return null;
    const occupants = inhabitants.get(v);
    if (!occupants || occupants.length === 0) return null;
    const idx = pinnedVertex !== null ? pinnedOccupantIdx : hoveredOccupantIdx;
    return occupants[Math.min(idx, occupants.length - 1)] ?? occupants[0];
  }, [pinnedVertex, hoveredVertex, pinnedOccupantIdx, hoveredOccupantIdx, inhabitants]);

  // Esc unwinds in order: pinned vertex → focus mode → close overlay
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (pinnedVertex !== null) setPinnedVertex(null);
      else if (focusMode) setFocusMode(false);
      else onClose();
    }
  }, [pinnedVertex, focusMode, onClose]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  const totalLit = litVertices.size;
  const totalArtefacts = Array.from(inhabitants.values()).reduce((acc, ns) => acc + ns.length, 0);
  const totalEmpty = 64 - inhabitants.size;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 6, 14, 0.94)',
        backdropFilter: 'blur(8px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: focusMode && mode === 'lattice' ? 0 : 20,
      }}
      role="dialog"
      aria-label={`${mode === 'items' ? 'Items grid' : 'Spatial lattice'} view`}
    >
      <div
        style={{
          width: '100%',
          maxWidth: focusMode && mode === 'lattice' ? '100%' : 1280,
          height: '100%',
          maxHeight: focusMode && mode === 'lattice' ? '100%' : 760,
          background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.95), rgba(6, 6, 14, 0.95))',
          border: focusMode && mode === 'lattice' ? 'none' : '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: focusMode && mode === 'lattice' ? 0 : 12,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(212, 175, 55, 0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: THEME.textBright, letterSpacing: 0.5 }}>
              {mode === 'items' ? '⚒️ Items' : '🗺️ Lattice'}
            </h2>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['items', 'lattice'] as LatticeMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => onSwitchMode(m)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 10.5,
                    background: mode === m ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    border: `1px solid ${mode === m ? '#d4af37' : 'rgba(212, 175, 55, 0.25)'}`,
                    color: mode === m ? THEME.textBright : THEME.textDim,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Post-import Evoke CTA · only when a constellation is loaded on the canvas */}
            {hasConstellation && onBeginEvoke && (
              <button
                onClick={() => { onBeginEvoke(); onClose(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.22), rgba(167, 139, 250, 0.08))',
                  border: '1px solid #a78bfaaa',
                  color: '#c4b5fd',
                  fontSize: 11,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 600,
                  letterSpacing: 0.4,
                }}
                title="Begin the evoke ceremony for the loaded constellation · closes the lattice"
              >
                <span aria-hidden>▶</span> Evoke
              </button>
            )}
            {/* One Import button · auto-routes: a forged artefact (tier/forge stamp) goes to
                Craft; a template / canonical seed goes to Create. (Merged 2026-07-13 — the two
                were the same action from the Sovereign's side; the file's own frontmatter decides.) */}
            {(onCreateImport || onCraftImport) && (
              <label
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid #d4af37aa',
                  color: '#ffd700',
                  fontSize: 11,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 600,
                  letterSpacing: 0.4,
                }}
                title="Import a .md — a forged artefact or a template. The file decides which; no need to choose."
              >
                <span aria-hidden>⚒️</span> Import
                <input
                  type="file"
                  accept=".md"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      let isForged = false;
                      try {
                        const text = await file.text();
                        // A forged artefact carries a forge stamp: a tier, forge timestamp, or
                        // constellation marks. A template / seed carries template_version.
                        isForged = /(^|\n)\s*(tier:\s*(light|heavy|dragon)|forged_?at:|constellation_?marks:|witness_?marks:|forge_signature:)/i.test(text)
                          && !/template_version:/i.test(text);
                      } catch { /* fall through to Create */ }
                      if (isForged && onCraftImport) onCraftImport(file);
                      else if (onCreateImport) onCreateImport(file);
                      else if (onCraftImport) onCraftImport(file);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            {/* ⛶ Focus mode toggle · only meaningful on the spatial Lattice tab */}
            {mode === 'lattice' && (
              <button
                onClick={() => setFocusMode(f => !f)}
                aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                title={focusMode ? 'Exit focus mode · restore side columns' : 'Focus mode · hide side columns + fill the viewport'}
                style={{
                  background: focusMode ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  border: `1px solid ${focusMode ? '#d4af37' : 'rgba(212, 175, 55, 0.3)'}`,
                  color: focusMode ? '#ffd700' : THEME.textDim,
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ⛶
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close lattice view"
              style={{
                background: 'transparent',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: THEME.textDim,
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Three-column body · side columns collapse in focus mode (Lattice tab only) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left · hover info */}
          {!(focusMode && mode === 'lattice') && (
          <aside style={{ width: 280, padding: 14, overflow: 'auto', borderRight: '1px solid rgba(212, 175, 55, 0.12)', background: 'rgba(212, 175, 55, 0.02)' }}>
            {activeNode ? (
              <ActiveNodeInfo node={activeNode} />
            ) : (
              <EmptyHoverInfo totalLit={totalLit} totalArtefacts={totalArtefacts} totalEmpty={totalEmpty} mode={mode} />
            )}
          </aside>
          )}

          {/* Centre · the canvas (Items grid OR spatial lattice) */}
          <main style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Summary line · forged · witnessed · workshops unlocked · migrated from retired ArtefactPanel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              <span>
                <span style={{ color: '#ffd700' }}>{forgedBlades.filter(b => !b.isWitness).length}</span> forged ·{' '}
                <span style={{ color: '#3b82f6' }}>{forgedBlades.filter(b => b.isWitness).length}</span> witnessed ·{' '}
                <span style={{ color: '#d4af37' }}>{Object.keys(witnessedShops).length}</span>/<span style={{ opacity: 0.7 }}>{inhabitants.size}</span> workshops unlocked
              </span>
              <span>
                <span style={{ color: '#34d399' }}>{totalArtefacts}</span> artefacts ·{' '}
                <span style={{ color: '#ffd700' }}>{equipped.size}</span> equipped
              </span>
            </div>

            {/* Items mode · flat emoji grid grouped by identity slot */}
            {mode === 'items' && (
              <ItemsGrid
                itemsBySlot={itemsBySlot}
                forgedBlades={forgedBlades}
                forgedBySlot={forgedBySlot}
                heldConstellations={heldConstellations}
                boundFamiliars={boundFamiliars}
                dispatchReceipts={dispatchReceipts}
                onSetTrueNameConsent={onSetTrueNameConsent}
                equipped={equipped}
                provenSet={provenSet}
                onToggle={toggleEquipped}
                onPinNode={(node) => {
                  if (node.vertex !== undefined) {
                    setPinnedVertex(node.vertex);
                    setPinnedOccupantIdx(0);
                  }
                }}
                onExportCatalogue={onExportCatalogue}
                onExportArtefact={onExportArtefact}
                activeNodeId={activeNode?.id ?? null}
              />
            )}

            {/* Spatial Lattice mode · 64-vertex Pascal's-row geometry */}
            {mode === 'lattice' && (
            <>
            <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              1 · 6 · 15 · 20 · 15 · 6 · 1 = 64 vertices · <span style={{ color: '#d4af37' }}>{totalLit}</span> lit · <span style={{ color: THEME.textDim }}>{totalEmpty}</span> empty
            </div>

            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                width: '100%',
                height: focusMode ? '100%' : 'auto',
                maxHeight: focusMode ? 'none' : 480,
                flex: focusMode ? 1 : undefined,
                display: 'block',
              }}
              role="img"
              aria-label="64-vertex sovereignty lattice — artefact slots"
            >
              {/* Hamming-1 adjacency edges (very faint) */}
              <g aria-hidden>
                {Array.from({ length: 64 }).flatMap((_, v) =>
                  [0, 1, 2, 3, 4, 5].flatMap((i) => {
                    const nb = v ^ (1 << i);
                    if (nb <= v) return [];
                    const a = vertexPos(v);
                    const b = vertexPos(nb);
                    return [
                      <line
                        key={`e-${v}-${nb}`}
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke="rgba(139, 92, 246, 0.10)"
                        strokeWidth={0.5}
                      />,
                    ];
                  }),
                )}
              </g>

              {/* Stratum labels */}
              {ROWS.map((row, rowIdx) => {
                const y = TOP_PAD + rowIdx * ROW_SPACE;
                return (
                  <g key={`row-${rowIdx}`}>
                    <text x={6} y={y + 3} fill="rgba(180, 180, 200, 0.5)" fontSize="8" fontFamily="ui-monospace, monospace">s{rowIdx}</text>
                    <text x={VIEW_W - 6} y={y + 3} fill="rgba(180, 180, 200, 0.4)" fontSize="8" fontFamily="ui-monospace, monospace" textAnchor="end">{row.length}</text>
                  </g>
                );
              })}

              {/* Vertices */}
              {ROWS.flatMap((row, rowIdx) => {
                const y = TOP_PAD + rowIdx * ROW_SPACE;
                const innerW = VIEW_W - SIDE_PAD * 2;
                return row.map((v, i) => {
                  const x = SIDE_PAD + (innerW / row.length) * (i + 0.5);
                  const occupants = inhabitants.get(v);
                  const isInhabited = !!occupants && occupants.length > 0;
                  const isLit = litVertices.has(v);
                  const isHovered = hoveredVertex === v;
                  const isPinned = pinnedVertex === v;
                  const baseR = isInhabited ? 11 : 4;
                  const r = isHovered || isPinned ? baseR + 2 : baseR;
                  const haloR = (isLit && (isHovered || isPinned)) ? r + 6 : r;

                  return (
                    <g
                      key={`v-${v}`}
                      onMouseEnter={() => { setHoveredVertex(v); setHoveredOccupantIdx(0); }}
                      onMouseLeave={() => setHoveredVertex((cur) => (cur === v ? null : cur))}
                      onClick={() => {
                        if (isInhabited) {
                          if (pinnedVertex === v) {
                            setPinnedVertex(null);
                          } else {
                            setPinnedVertex(v);
                            setPinnedOccupantIdx(0);
                          }
                        }
                      }}
                      style={{ cursor: isInhabited ? 'pointer' : 'default' }}
                    >
                      {/* Halo when lit + hovered/pinned */}
                      {isLit && (isHovered || isPinned) && (
                        <circle cx={x} cy={y} r={haloR + 4} fill="none" stroke="#d4af37" strokeOpacity={0.45} strokeWidth={1.5} />
                      )}
                      {/* Pinned ring (always when pinned) */}
                      {isPinned && (
                        <circle cx={x} cy={y} r={haloR + 7} fill="none" stroke="#d4af37" strokeOpacity={0.7} strokeWidth={1} strokeDasharray="3,2" />
                      )}
                      {/* Witnessed ring · cyan thin · proof-of-presence visible (subtle · sits inside the equipped ring) */}
                      {provenVertices.has(v) && (
                        <circle cx={x} cy={y} r={r + 1.8} fill="none" stroke="#67e8f9" strokeOpacity={0.55} strokeWidth={1} strokeDasharray="2,2" />
                      )}
                      {/* Equipped ring · gold solid · always visible when ANY occupant is equipped */}
                      {equippedVertices.has(v) && (
                        <circle cx={x} cy={y} r={r + 4} fill="none" stroke="#ffd700" strokeOpacity={0.85} strokeWidth={1.4} />
                      )}
                      {/* Vertex disk · branches on occupancy:
                          empty → grey circle · single → coloured disc + emoji ·
                          multi → pie-segments (one per occupant), each independently
                          hoverable + clickable, brighten when its occupant is equipped */}
                      {!isInhabited && (
                        <circle
                          cx={x}
                          cy={y}
                          r={r}
                          fill="rgba(60, 60, 80, 0.6)"
                          fillOpacity={isLit ? 0.5 : 0.18}
                          stroke="rgba(180, 180, 200, 0.3)"
                          strokeWidth={0.4}
                        />
                      )}
                      {isInhabited && occupants!.length === 1 && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r={r}
                            fill={occupants![0].gemColor ?? '#d4af37'}
                            fillOpacity={isLit ? 0.85 : 0.18}
                            stroke="#d4af37"
                            strokeWidth={0.8}
                          />
                          <text x={x} y={y + 4} textAnchor="middle" fontSize={r + 2} aria-hidden style={{ pointerEvents: 'none' }}>
                            {occupants![0].emoji ?? '✦'}
                          </text>
                        </>
                      )}
                      {isInhabited && occupants!.length > 1 && (
                        <>
                          {segmentAngles(occupants!.length).map((seg, idx) => {
                            const occ = occupants![idx];
                            const isOccEquipped = equipped.has(occ.id);
                            const isOccHovered = isHovered && hoveredOccupantIdx === idx;
                            const isOccPinned = isPinned && pinnedOccupantIdx === idx;
                            const emojiR = r * 0.55;
                            const ex = x + emojiR * Math.cos(seg.midA);
                            const ey = y + emojiR * Math.sin(seg.midA) + 3;
                            return (
                              <g
                                key={`s-${v}-${idx}`}
                                onMouseEnter={(e) => {
                                  e.stopPropagation();
                                  setHoveredVertex(v);
                                  setHoveredOccupantIdx(idx);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pinnedVertex === v && pinnedOccupantIdx === idx) {
                                    setPinnedVertex(null);
                                  } else {
                                    setPinnedVertex(v);
                                    setPinnedOccupantIdx(idx);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <path
                                  d={pieSegmentPath(x, y, r, seg.startA, seg.endA)}
                                  fill={occ.gemColor ?? '#d4af37'}
                                  fillOpacity={isLit ? (isOccEquipped ? 1 : 0.78) : 0.18}
                                  stroke={isOccPinned || isOccHovered ? '#ffd700' : '#d4af37'}
                                  strokeWidth={isOccPinned || isOccHovered ? 1.2 : 0.5}
                                />
                                <text
                                  x={ex}
                                  y={ey}
                                  textAnchor="middle"
                                  fontSize={Math.max(8, r * 0.7)}
                                  aria-hidden
                                  style={{ pointerEvents: 'none' }}
                                >
                                  {occ.emoji ?? '✦'}
                                </text>
                              </g>
                            );
                          })}
                          {/* Outer outline drawn on top so segment seams meet cleanly at the rim */}
                          <circle cx={x} cy={y} r={r} fill="none" stroke="#d4af37" strokeWidth={0.9} pointerEvents="none" />
                        </>
                      )}
                      {/* V[n] label below */}
                      <text x={x} y={y + r + 10} textAnchor="middle" fill="rgba(180, 180, 200, 0.55)" fontSize="7.5" fontFamily="ui-monospace, monospace">
                        V{v}
                      </text>
                    </g>
                  );
                });
              })}
            </svg>
            </>
            )}
          </main>

          {/* Right · identity-slots + equip toggle + equipped roster + forged inventory · hidden in focus mode */}
          {!(focusMode && mode === 'lattice') && (
          <aside style={{ width: 360, padding: 14, overflow: 'auto', borderLeft: '1px solid rgba(212, 175, 55, 0.12)', background: 'rgba(94, 234, 212, 0.02)' }}>
            <IdentitySlots activeNode={activeNode} pinnedNode={pinnedVertex !== null ? activeNode : null} />
            <EquipPanel
              activeNode={pinnedVertex !== null ? activeNode : null}
              equipped={equipped}
              inhabitants={inhabitants}
              onToggle={toggleEquipped}
              provenSet={provenSet}
            />
            <ForgedInventory forgedBlades={forgedBlades} />
            <SwordsmanCityKeyPanel
              activeNode={pinnedVertex !== null ? activeNode : null}
              keyIdentity={keyIdentity}
              onExportSwordsman={onExportSwordsman}
              onExportMage={onExportMage}
              onExportCityKey={onExportCityKey}
            />
          </aside>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(212, 175, 55, 0.12)', fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
          hover a vertex · click to pin · esc to close
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-renderers
// ─────────────────────────────────────────────────────────────────────
function ActiveNodeInfo({ node }: { node: SpellwebNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ fontSize: 22, marginBottom: 4 }} aria-hidden>{node.emoji ?? '✦'}</div>
        <div style={{ color: THEME.textBright, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          {node.artefactName ?? node.label}
        </div>
        {node.artefactRootName && node.artefactRootName !== node.artefactName && (
          <div style={{ fontSize: 10, color: THEME.textDim, fontStyle: 'italic' }}>aka {node.artefactRootName}</div>
        )}
      </div>

      <Row k="Vertex" v={node.vertex !== undefined ? `V${node.vertex} · ${node.bits ?? ''}` : '—'} mono />
      <Row k="Stratum" v={node.vertex !== undefined ? String(popcount(node.vertex)) : '—'} mono />
      <Row k="Workshop" v={node.label} />
      {node.district && <Row k="District" v={`${node.district} District`} />}
      {node.gem && <Row k="Gem" v={node.gem} swatch={node.gemColor} />}
      {node.archetypeModal && (
        <Row k="Aspect" v="archetype-modal · gem-shifts with visitor" extra={
          <span style={{ display: 'inline-flex', gap: 4, marginLeft: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: node.gemColorMage, display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: node.gemColorSwordsman, display: 'inline-block' }} />
          </span>
        } />
      )}
      {node.ceremony && <Row k="Ceremony" v={node.ceremony} mono />}
      {node.workshopRegister && <Row k="Register" v={node.workshopRegister.replace(/_/g, ' ')} />}
      {node.artefactClass && <Row k="Class" v={node.artefactClass} />}
      {node.artefactArchetype && <Row k="Archetype" v={node.artefactArchetype} />}

      <div style={{ marginTop: 6, padding: 8, background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: 4, fontSize: 11, color: THEME.textDim, lineHeight: 1.5 }}>
        {node.desc}
      </div>
    </div>
  );
}

function Row({ k, v, mono, swatch, extra }: { k: string; v: string; mono?: boolean; swatch?: string; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 11, lineHeight: 1.4 }}>
      <span style={{ width: 60, flexShrink: 0, color: THEME.textDim, textTransform: 'uppercase', fontSize: 9.5, letterSpacing: 0.5, fontFamily: "'JetBrains Mono', monospace", paddingTop: 1 }}>{k}</span>
      <span style={{ flex: 1, color: THEME.textBright, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {swatch && <span style={{ width: 10, height: 10, borderRadius: '50%', background: swatch, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />}
        <span>{v}</span>
        {extra}
      </span>
    </div>
  );
}

function EmptyHoverInfo({ totalLit, totalArtefacts, totalEmpty, mode }: { totalLit: number; totalArtefacts: number; totalEmpty: number; mode: LatticeMode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 }}>
      <div style={{ color: THEME.textBright, fontSize: 13, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
        {mode === 'items' ? 'The catalogue laid on the lattice' : 'Portals · entity-kinds in the City'}
      </div>
      <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.6 }}>
        {mode === 'items' ? (
          <>Each item is a <span style={{ color: THEME.textBright }}>trust task you bring back</span>: trace its constellation at the workshop, return the artefact, and it lights its canonical vertex here. Hover a vertex to see what is fitted there.</>
        ) : (
          <>Only vertices producing creatures (Familiars · V59) or held material (Chart Shop · V44) light up. Other vertices dim. v1.6.0 entity-kinds: bound · held · dispatch.</>
        )}
      </div>
      <div style={{ marginTop: 4, padding: 8, background: 'rgba(60,60,80,0.2)', border: '1px solid rgba(180,180,200,0.15)', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
        <div><span style={{ color: '#d4af37' }}>{totalLit}</span> lit vertices</div>
        <div><span style={{ color: '#34d399' }}>{totalArtefacts}</span> artefacts placed</div>
        <div><span style={{ opacity: 0.6 }}>{totalEmpty}</span> empty slots</div>
      </div>
    </div>
  );
}

function IdentitySlots({ activeNode, pinnedNode }: { activeNode: SpellwebNode | null; pinnedNode: SpellwebNode | null }) {
  const slots: IdentitySlot[] = ['worn', 'borne', 'bound', 'held'];
  const activeSlot = activeNode ? slotForArtefact(activeNode) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1.2 }}>
        identity slots · the bearer's loadout
      </div>
      {!pinnedNode && (
        <div style={{ fontSize: 10.5, color: THEME.textDim, fontStyle: 'italic', lineHeight: 1.5, padding: '6px 0' }}>
          {activeNode ? 'click the vertex to pin it · then this column shows the artefact\'s identity-slot.' : 'pin a vertex to see how its artefact slots into the bearer\'s identity system.'}
        </div>
      )}
      {slots.map(slot => {
        const meta = SLOT_META[slot];
        const isActiveSlot = activeSlot === slot && pinnedNode !== null;
        return (
          <div
            key={slot}
            style={{
              padding: 10,
              border: `1px solid ${isActiveSlot ? meta.accent : 'rgba(180, 180, 200, 0.18)'}`,
              borderRadius: 6,
              background: isActiveSlot ? `${meta.accent}10` : 'rgba(60, 60, 80, 0.08)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span aria-hidden style={{ fontSize: 13 }}>{meta.emoji}</span>
              <span style={{ color: isActiveSlot ? THEME.textBright : THEME.textDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{meta.label}</span>
              {isActiveSlot && pinnedNode && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: meta.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                  ← {pinnedNode.artefactName ?? pinnedNode.label}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: THEME.textDim, lineHeight: 1.4 }}>{meta.desc}</div>
            {isActiveSlot && pinnedNode && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${meta.accent}55`, fontSize: 11, color: THEME.textBright, lineHeight: 1.5 }}>
                {pinnedNode.artefactRootName ?? pinnedNode.artefactName} would land in this slot.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EquipPanel · per-artefact equip toggle + the bearer's currently-equipped roster
// Equipped items are "turned on" — they participate in constellation tracking
// (the trace lights them) and forge(t)ing (they appear in the Sovereign's loadout
// when forging downstream artefacts).
// ─────────────────────────────────────────────────────────────────────
function EquipPanel({
  activeNode,
  equipped,
  inhabitants,
  onToggle,
  provenSet,
}: {
  activeNode: SpellwebNode | null;
  equipped: Set<string>;
  inhabitants: Map<number, SpellwebNode[]>;
  onToggle: (id: string) => void;
  provenSet: Set<string>;
}) {
  const isPinnedEquipped = activeNode ? equipped.has(activeNode.id) : false;
  // Proof-of-presence gate · the bearer can only equip workshops they've witnessed
  // (witnessedShops) or for which they hold a forged item.
  const isPinnedProven = activeNode ? provenSet.has(activeNode.id) : false;

  // Build the equipped roster as ordered display rows · only vertex-bearing items
  // remain after the 2026-05-15 tome drop.
  const equippedRows: SpellwebNode[] = useMemo(() => {
    const fromVertices: SpellwebNode[] = [];
    inhabitants.forEach(nodes => {
      for (const n of nodes) if (equipped.has(n.id)) fromVertices.push(n);
    });
    fromVertices.sort((a, b) => (a.vertex ?? 999) - (b.vertex ?? 999));
    return fromVertices;
  }, [inhabitants, equipped]);

  const totalEquipped = equipped.size;

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255, 215, 0, 0.18)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1.2 }}>
          loadout · equipped items
        </div>
        <div style={{ fontSize: 10, color: '#ffd700', fontFamily: "'JetBrains Mono', monospace" }}>{totalEquipped} on</div>
      </div>

      {/* Equip toggle for the currently-pinned artefact · gated by proof of presence */}
      {activeNode && isPinnedProven && (
        <button
          onClick={() => onToggle(activeNode.id)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px',
            background: isPinnedEquipped ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.04)',
            border: `1px solid ${isPinnedEquipped ? '#ffd700' : 'rgba(255, 215, 0, 0.35)'}`,
            color: isPinnedEquipped ? '#ffd700' : THEME.textBright,
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          title={isPinnedEquipped ? 'Click to unequip — this artefact will stop participating in constellation tracking' : 'Click to equip — this artefact joins your loadout for constellation tracking + forge(t)ing'}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ fontSize: 14 }}>{activeNode.emoji ?? '✦'}</span>
            <span>{isPinnedEquipped ? 'Unequip' : 'Equip'} {activeNode.artefactName ?? activeNode.label}</span>
          </span>
          <span style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{isPinnedEquipped ? '✓ ON' : '○ off'}</span>
        </button>
      )}
      {/* Proof-of-presence gate · pinned vertex but no proof = can't equip */}
      {activeNode && !isPinnedProven && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(180, 180, 200, 0.06)',
            border: '1px dashed rgba(180, 180, 200, 0.35)',
            color: THEME.textDim,
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'inherit',
            cursor: 'not-allowed',
          }}
          title="To equip this artefact, first witness the workshop's constellation ceremony at the corresponding agentprivacy_master route, OR forge an artefact at this workshop."
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ fontSize: 13, opacity: 0.7 }}>{activeNode.emoji ?? '✦'}</span>
            <span>⚠️ awaits proof of presence</span>
          </span>
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>○ locked</span>
        </div>
      )}
      {activeNode && !isPinnedProven && activeNode.href && (
        <div style={{ fontSize: 10, color: THEME.textDim, fontStyle: 'italic', lineHeight: 1.5, marginTop: -4 }}>
          → witness at <span style={{ color: '#67e8f9', fontFamily: "'JetBrains Mono', monospace" }}>{activeNode.href}</span> first.
        </div>
      )}
      {!activeNode && (
        <div style={{ fontSize: 10.5, color: THEME.textDim, fontStyle: 'italic', lineHeight: 1.5, padding: '4px 0' }}>
          pin a vertex to equip / unequip its artefact.
        </div>
      )}

      {/* Equipped roster */}
      {equippedRows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {equippedRows.map(n => {
            const isPinned = activeNode?.id === n.id;
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px',
                  background: isPinned ? 'rgba(255, 215, 0, 0.10)' : 'rgba(60, 60, 80, 0.18)',
                  border: `1px solid ${isPinned ? '#ffd700aa' : 'rgba(255, 215, 0, 0.18)'}`,
                  borderRadius: 4,
                  fontSize: 11,
                }}
              >
                <span aria-hidden style={{ fontSize: 13 }}>{n.emoji ?? '✦'}</span>
                <span style={{ flex: 1, color: THEME.textBright, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>
                  {n.vertex !== undefined ? `V${n.vertex}` : '—'}
                </span>
                <span style={{ flex: 2, color: THEME.textBright, fontSize: 11 }}>{n.artefactName ?? n.label}</span>
                <button
                  onClick={() => onToggle(n.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffd700aa',
                    fontSize: 11,
                    cursor: 'pointer',
                    padding: '2px 4px',
                    fontFamily: 'inherit',
                  }}
                  title={`Unequip ${n.label}`}
                  aria-label={`Unequip ${n.label}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note about what equipping does */}
      <div style={{ marginTop: 4, padding: '8px 10px', background: 'rgba(255, 215, 0, 0.04)', border: '1px dashed rgba(255, 215, 0, 0.25)', borderRadius: 4, fontSize: 10, color: THEME.textDim, lineHeight: 1.55 }}>
        <div style={{ marginBottom: 4, color: '#ffd700aa', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          equipped items are turned on for:
        </div>
        <div>· <span style={{ color: THEME.textBright }}>constellation tracking</span> — equipped vertices auto-light when traced</div>
        <div>· <span style={{ color: THEME.textBright }}>forge(t)ing</span> — equipped items appear in your loadout when forging downstream artefacts</div>
        <div>· <span style={{ color: THEME.textBright }}>witness export</span> — your equipped loadout is recorded in the .md when you export a forging</div>
      </div>

      {totalEquipped === 0 && (
        <div style={{ fontSize: 10, color: THEME.textDim, fontStyle: 'italic', textAlign: 'center', paddingTop: 4 }}>
          No items equipped yet. Pin a vertex above and click Equip to begin your loadout.
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ForgedInventory · the bearer's personal forge inventory · migrated from the side panel
// (post-2026-05-15 side-panel retirement). Renders newest-first, summarises tier counts.
// ─────────────────────────────────────────────────────────────────────
function ForgedInventory({
  forgedBlades,
}: {
  forgedBlades: Array<{ id: string; name: string; emoji: string; tier: 'light' | 'heavy' | 'dragon'; constellationMarks: { nodeId: string; emoji: string }[]; isWitness?: boolean }>;
}) {
  const tierColours = { light: '#87ceeb', heavy: '#c0c0c0', dragon: '#ffd700' } as const;
  const ownCount = forgedBlades.filter(b => !b.isWitness).length;
  const witnessCount = forgedBlades.length - ownCount;

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(135, 206, 235, 0.18)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1.2 }}>
          🔥 forge inventory
        </div>
        <div style={{ fontSize: 10, color: '#87ceeb', fontFamily: "'JetBrains Mono', monospace" }}>
          {ownCount} forged {witnessCount > 0 && `· ${witnessCount} witnessed`}
        </div>
      </div>
      {forgedBlades.length === 0 ? (
        <div style={{ fontSize: 10.5, color: THEME.textDim, fontStyle: 'italic', lineHeight: 1.5, padding: '6px 4px', textAlign: 'center' }}>
          forges() = ∅ · walk a tome constellation and complete the ceremony.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {forgedBlades.slice().reverse().slice(0, 8).map(b => {
            const tc = tierColours[b.tier];
            return (
              <div
                key={b.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px',
                  background: `${tc}10`,
                  border: `1px solid ${tc}55`,
                  borderRadius: 4,
                  fontSize: 11,
                }}
              >
                <span aria-hidden style={{ fontSize: 13 }}>{b.emoji ?? '✦'}</span>
                <span style={{ flex: 1, color: THEME.textBright, fontSize: 11 }}>{b.name}</span>
                <span style={{ fontSize: 9.5, color: tc, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{b.tier}</span>
                {b.isWitness && (
                  <span style={{ fontSize: 9.5, color: '#3b82f6', fontStyle: 'italic' }}>· witness</span>
                )}
              </div>
            );
          })}
          {forgedBlades.length > 8 && (
            <div style={{ fontSize: 9.5, color: THEME.textDim, fontStyle: 'italic', textAlign: 'center', paddingTop: 2 }}>
              + {forgedBlades.length - 8} older
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Precinct map · groups shops into their City district/precinct for the quest
// log. Mirrors agentprivacy_master/src/lib/districts.ts. node.district (where
// set) wins; this covers the older producer shops that carry only tradeQuarter.
// ─────────────────────────────────────────────────────────────────────
const PRECINCT_BY_SHOP: Record<string, string> = {
  'shop-tailor': 'the Crypt', 'shop-shield': 'the Crypt', 'shop-circuit': 'the Crypt',
  'shop-quartermaster': 'the Crucible', 'shop-forget': 'the Crucible', 'shop-chancery': 'the Crucible',
  'shop-etherchanting': 'the Crucible', 'shop-solchanting': 'the Crucible',
  'shop-stakes': 'the Agora', 'shop-jeweler': 'the Agora', 'shop-rostra': 'the Agora',
  'shop-holon': 'the Reliquary', 'shop-vault': 'the Reliquary',
  'shop-wellpool': 'the Waters',
  'shop-charthouse': 'the Navigation District',
  'shop-portal': 'the Threshold', 'shop-staff': 'the Threshold', 'shop-familiars': 'the Threshold',
  'shop-horizon': 'the Horizon District', 'shop-assay': 'the Horizon District', 'shop-crossing': 'the Horizon District',
  'shop-covenant': 'the Temple', 'shop-bonfires': 'the Founding Bonfire',
  'shop-circle': 'the Gathering Quarters', 'shop-hall': 'the Gathering Quarters',
};
// District tour order — quest-log neighbourhoods, in the canonical walk.
const DISTRICT_ORDER = [
  'the Crypt', 'the Crucible', 'the Agora', 'the Reliquary', 'the Waters',
  'the Navigation District', 'the Threshold', 'the Horizon District',
  'the Temple', 'the Founding Bonfire', 'the Gathering Quarters', 'the Wider City',
];
function districtOf(node: SpellwebNode): string {
  return PRECINCT_BY_SHOP[node.id] ?? (node.district ? `the ${node.district} District` : 'the Wider City');
}

// ─────────────────────────────────────────────────────────────────────
// ItemsGrid · the quest log · each item is a trust task the Sovereign traces
// at its workshop and brings back. Grouped by identity slot (worn · borne ·
// bound · held), sub-grouped by City district, with brought-back / open status.
// Drops pure tomes per 2026-05-15 user direction.
// ─────────────────────────────────────────────────────────────────────
function ItemsGrid({
  itemsBySlot,
  forgedBlades,
  forgedBySlot,
  heldConstellations,
  boundFamiliars,
  dispatchReceipts,
  onSetTrueNameConsent,
  equipped,
  provenSet,
  onToggle,
  onPinNode,
  onExportCatalogue,
  onExportArtefact,
  activeNodeId,
}: {
  itemsBySlot: Record<IdentitySlot, SpellwebNode[]>;
  forgedBlades: LatticeForgedBlade[];
  forgedBySlot: Record<IdentitySlot, LatticeForgedBlade[]>;
  heldConstellations: HeldConstellation[];
  boundFamiliars: BoundFamiliar[];
  dispatchReceipts: DispatchReceipt[];
  onSetTrueNameConsent?: (familiarId: string, consent: boolean) => void;
  equipped: Set<string>;
  provenSet: Set<string>;
  onToggle: (id: string) => void;
  onPinNode: (node: SpellwebNode) => void;
  onExportCatalogue?: (nodeId: string) => void;
  onExportArtefact?: (bladeId: string) => void;
  activeNodeId: string | null;
}) {
  const slotOrder: IdentitySlot[] = ['worn', 'borne', 'bound', 'held'];
  const hasAnyCatalogue = slotOrder.some(s => itemsBySlot[s].length > 0 || forgedBySlot[s].length > 0);
  const hasForged = forgedBlades.length > 0;
  const hasHeld = heldConstellations.length > 0;
  const hasBound = boundFamiliars.length > 0;
  const hasDispatch = dispatchReceipts.length > 0;

  // Quest-log stats — each catalogue item is a trust task; proven = brought back.
  const allItems = slotOrder.flatMap(s => itemsBySlot[s]);
  const broughtBack = allItems.filter(n => provenSet.has(n.id)).length;
  const openTasks = allItems.length - broughtBack;
  const pct = allItems.length ? Math.round((broughtBack / allItems.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Quest-log summary — the trust tasks, brought back vs open */}
      {allItems.length > 0 && (
        <div style={{ padding: '10px 14px', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 6, background: 'rgba(212,175,55,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: THEME.textBright, fontSize: 12.5, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              🗺️ The quest log · trust tasks you bring back
            </span>
            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ color: '#67e8f9' }}>{broughtBack}</span> brought back · <span style={{ color: '#ffd700' }}>{openTasks}</span> open · {allItems.length} in the city
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #67e8f9, #34d399)', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}
      {(() => {
        // Equipment · one view, all catalogue items flattened across identity slots and
        // grouped by City district (the slot is a per-card tag now, not a top-level split).
        const allCat = slotOrder.flatMap(s => itemsBySlot[s]);
        const allForged = slotOrder.flatMap(s => forgedBySlot[s]);
        if (allCat.length === 0 && allForged.length === 0) return null;
        const catByDistrict = new Map<string, SpellwebNode[]>();
        for (const n of allCat) {
          const d = districtOf(n);
          if (!catByDistrict.has(d)) catByDistrict.set(d, []);
          catByDistrict.get(d)!.push(n);
        }
        const forgedByDistrict = new Map<string, LatticeForgedBlade[]>();
        for (const blade of allForged) {
          let d = 'the Wider City';
          for (const mark of blade.constellationMarks) {
            const node = NODES.find(n => n.id === mark.nodeId);
            const shop = node?.type === 'workshop' ? node
              : (node?.shopAnchor ? NODES.find(x => x.id === `shop-${node.shopAnchor!.replace(/^\//, '')}`) : undefined);
            if (shop) { d = districtOf(shop); break; }
          }
          if (!forgedByDistrict.has(d)) forgedByDistrict.set(d, []);
          forgedByDistrict.get(d)!.push(blade);
        }
        const districts = DISTRICT_ORDER.filter(d => catByDistrict.has(d) || forgedByDistrict.has(d));
        return (
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
              <span aria-hidden style={{ fontSize: 16 }}>⚒️</span>
              <span style={{ color: '#d4af37', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>Equipment</span>
              <span style={{ color: THEME.textDim, fontSize: 10, fontStyle: 'italic' }}>every artefact you can bring back, by district</span>
              <span style={{ marginLeft: 'auto', color: THEME.textDim, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{allCat.length} items</span>
            </div>
            {districts.map(d => {
              const dItems = catByDistrict.get(d) ?? [];
              const dForged = forgedByDistrict.get(d) ?? [];
              const dBack = dItems.filter(n => provenSet.has(n.id)).length;
              const done = dItems.length > 0 && dBack === dItems.length;
              return (
                <div key={d} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: THEME.textBright, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'JetBrains Mono', monospace" }}>{d}</span>
                    {dItems.length > 0 && <span style={{ fontSize: 9, color: done ? '#67e8f9' : THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{dBack}/{dItems.length}{done ? ' ✓' : ''}</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                    {dItems.map(node => (
                      <CatalogueItemCard
                        key={node.id}
                        node={node}
                        slotLabel={SLOT_META[slotForArtefact(node)].label}
                        equipped={equipped.has(node.id)}
                        proven={provenSet.has(node.id)}
                        pinned={activeNodeId === node.id}
                        onToggle={() => onToggle(node.id)}
                        onPin={() => onPinNode(node)}
                        onExport={onExportCatalogue ? () => onExportCatalogue(node.id) : undefined}
                      />
                    ))}
                    {dForged.map(blade => (
                      <ForgedItemCard
                        key={blade.id}
                        blade={blade}
                        equipped={equipped.has(blade.id)}
                        onToggle={() => onToggle(blade.id)}
                        onExport={onExportArtefact ? () => onExportArtefact(blade.id) : undefined}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })()}

      {/* Standalone "Forged inventory" section retired — forged instances now appear
          alongside the canonical templates in their slot sections above. The right
          column's ForgedInventory still shows newest-first chronological. */}

      {hasHeld && (
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #5eead433' }}>
            <span aria-hidden style={{ fontSize: 16 }}>🧭</span>
            <span style={{ color: '#5eead4', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
              Held constellations
            </span>
            <span style={{ color: THEME.textDim, fontSize: 10, fontStyle: 'italic' }}>
              Chart Shop · metadata-only · underlying held privately under the Φ-gap
            </span>
            <span style={{ marginLeft: 'auto', color: THEME.textDim, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {heldConstellations.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {heldConstellations.slice().reverse().map(h => (
              <HeldConstellationCard key={h.id} entry={h} />
            ))}
          </div>
        </section>
      )}

      {hasBound && (
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #d9770633' }}>
            <span aria-hidden style={{ fontSize: 16 }}>🪶</span>
            <span style={{ color: '#d97706', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
              Bound familiars
            </span>
            <span style={{ color: THEME.textDim, fontSize: 10, fontStyle: 'italic' }}>
              the Familiars · witness attestations · the bond stays with original Sovereign
            </span>
            <span style={{ marginLeft: 'auto', color: THEME.textDim, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {boundFamiliars.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {boundFamiliars.slice().reverse().map(f => (
              <BoundFamiliarCard key={f.id} entry={f} onSetTrueNameConsent={onSetTrueNameConsent} />
            ))}
          </div>
        </section>
      )}

      {hasDispatch && (
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #c4b5fd33' }}>
            <span aria-hidden style={{ fontSize: 16 }}>🌕</span>
            <span style={{ color: '#c4b5fd', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
              Dispatch trail
            </span>
            <span style={{ color: THEME.textDim, fontSize: 10, fontStyle: 'italic' }}>
              Portal Room · routing receipts · ephemeral (auto-prune 30d)
            </span>
            <span style={{ marginLeft: 'auto', color: THEME.textDim, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {dispatchReceipts.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {dispatchReceipts.slice().reverse().map(d => (
              <DispatchReceiptCard key={d.id} entry={d} />
            ))}
          </div>
        </section>
      )}

      {!hasAnyCatalogue && !hasForged && !hasHeld && !hasBound && !hasDispatch && (
        <div style={{ padding: 24, textAlign: 'center', color: THEME.textDim, fontStyle: 'italic', fontSize: 12 }}>
          No items yet. Import a Create or Craft .md to start populating your loadout.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// v1.6.0 inventory cards · Held / Bound / Dispatch
// ─────────────────────────────────────────────────────────────────────

function HeldConstellationCard({ entry }: { entry: HeldConstellation }) {
  const tokenShort = entry.bearerConsentToken.length > 24
    ? `${entry.bearerConsentToken.slice(0, 16)}…${entry.bearerConsentToken.slice(-6)}`
    : entry.bearerConsentToken;
  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'rgba(94, 234, 212, 0.06)',
        border: '1px solid rgba(94, 234, 212, 0.30)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
      title={`Held constellation · imported ${new Date(entry.importedAt).toLocaleString()}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ fontSize: 22 }}>🧭</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: THEME.textBright, fontSize: 12, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.name}
          </div>
          <div style={{ fontSize: 9.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {entry.mageVertex} · Pleione 🧭
          </div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: THEME.textDim, lineHeight: 1.5 }}>
        <div><span style={{ color: '#5eead4' }}>{entry.vertexCount}</span> waypoint{entry.vertexCount === 1 ? '' : 's'} · held for {entry.heldDurationDays} day{entry.heldDurationDays === 1 ? '' : 's'}</div>
        {entry.strataSummary && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, marginTop: 2 }}>{entry.strataSummary}</div>
        )}
      </div>
      <div style={{ fontSize: 8.5, color: 'rgba(148, 163, 184, 0.7)', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
        ⚓ {tokenShort}
      </div>
      {entry.successionBanner && (
        <div style={{ fontSize: 9.5, color: '#fcd34d', fontStyle: 'italic', padding: '4px 6px', background: 'rgba(252, 211, 77, 0.08)', borderRadius: 3 }}>
          {entry.successionBanner}
        </div>
      )}
    </div>
  );
}

function BoundFamiliarCard({
  entry,
  onSetTrueNameConsent,
}: {
  entry: BoundFamiliar;
  onSetTrueNameConsent?: (familiarId: string, consent: boolean) => void;
}) {
  const substrateNode = NODES.find(n => n.id === entry.substrateFramework);
  const substrateLabel = substrateNode?.label ?? entry.substrateFramework;
  const tokenShort = entry.bearerConsentToken.length > 24
    ? `${entry.bearerConsentToken.slice(0, 16)}…${entry.bearerConsentToken.slice(-6)}`
    : entry.bearerConsentToken;
  // chronicle §1.2 · trueName is bearer-private. Surface only when explicit consent flag is set.
  const showTrueName = entry.trueNameDisplayConsent && entry.trueName;
  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'rgba(217, 119, 6, 0.06)',
        border: '1px solid rgba(217, 119, 6, 0.30)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
      title={`Bound familiar · imported ${new Date(entry.importedAt).toLocaleString()}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ fontSize: 22 }}>{substrateNode?.emoji ?? '🪶'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: THEME.textBright, fontSize: 12, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.name}
          </div>
          <div style={{ fontSize: 9.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {entry.mageVertex} · Faunia 🪶
          </div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: THEME.textDim, lineHeight: 1.5 }}>
        <div>Substrate: <span style={{ color: '#d97706' }}>{substrateLabel}</span></div>
        <div>Walks: {entry.walksAccumulated ?? <em>(advisory)</em>}</div>
      </div>
      {entry.trueName && (
        <div style={{ fontSize: 9.5, color: showTrueName ? THEME.textBright : 'rgba(148, 163, 184, 0.7)', padding: '4px 6px', background: showTrueName ? 'rgba(217, 119, 6, 0.10)' : 'rgba(0, 0, 0, 0.18)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          {showTrueName ? (
            <>
              <span style={{ fontStyle: 'italic' }}>true name: {entry.trueName}</span>
              {onSetTrueNameConsent && (
                <button
                  onClick={() => onSetTrueNameConsent(entry.id, false)}
                  style={{ background: 'transparent', border: 'none', color: '#d97706', cursor: 'pointer', fontSize: 9.5, padding: 0, textDecoration: 'underline' }}
                  title="Hide the true-name (revoke local consent)"
                >
                  hide
                </button>
              )}
            </>
          ) : (
            <>
              <span>🔒 true-name held bearer-private</span>
              {onSetTrueNameConsent && (
                <button
                  onClick={() => onSetTrueNameConsent(entry.id, true)}
                  style={{ background: 'transparent', border: 'none', color: '#d97706', cursor: 'pointer', fontSize: 9.5, padding: 0, textDecoration: 'underline' }}
                  title="Surface the true-name (local consent · chronicle §1.2)"
                >
                  reveal
                </button>
              )}
            </>
          )}
        </div>
      )}
      <div style={{ fontSize: 8.5, color: 'rgba(148, 163, 184, 0.7)', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
        🪢 {tokenShort}
      </div>
      {entry.successionBanner && (
        <div style={{ fontSize: 9.5, color: '#fcd34d', fontStyle: 'italic', padding: '4px 6px', background: 'rgba(252, 211, 77, 0.08)', borderRadius: 3 }}>
          {entry.successionBanner}
        </div>
      )}
    </div>
  );
}

function DispatchReceiptCard({ entry }: { entry: DispatchReceipt }) {
  const targetNode = NODES.find(n => n.id === entry.dispatchTargetShop);
  const targetLabel = targetNode?.label ?? entry.dispatchTargetShop;
  const targetEmoji = targetNode?.emoji ?? '✦';
  const ageDays = Math.floor((Date.now() - new Date(entry.importedAt).getTime()) / (24 * 60 * 60 * 1000));
  const daysLeft = Math.max(0, 30 - ageDays);
  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'rgba(196, 181, 253, 0.06)',
        border: '1px solid rgba(196, 181, 253, 0.30)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
      title={`Dispatch receipt · ${new Date(entry.importedAt).toLocaleString()}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ fontSize: 22 }}>🌕</span>
        <span style={{ fontSize: 14, color: THEME.textDim }}>→</span>
        <span aria-hidden style={{ fontSize: 22 }}>{targetEmoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: THEME.textBright, fontSize: 12, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {targetLabel}
          </div>
          <div style={{ fontSize: 9.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {entry.mageVertex} · Pandia 🌕
            {entry.dispatchArchetype && <span style={{ color: '#c4b5fd' }}> · {entry.dispatchArchetype}-aspect</span>}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: THEME.textDim, lineHeight: 1.5 }}>
        Routed {ageDays === 0 ? 'today' : `${ageDays} day${ageDays === 1 ? '' : 's'} ago`} · {daysLeft} day{daysLeft === 1 ? '' : 's'} until auto-prune
      </div>
      {entry.successionBanner && (
        <div style={{ fontSize: 9.5, color: '#fcd34d', fontStyle: 'italic', padding: '4px 6px', background: 'rgba(252, 211, 77, 0.08)', borderRadius: 3 }}>
          {entry.successionBanner}
        </div>
      )}
    </div>
  );
}

function CatalogueItemCard({
  node,
  equipped,
  proven,
  pinned,
  slotLabel,
  onToggle,
  onPin,
  onExport,
}: {
  node: SpellwebNode;
  equipped: boolean;
  proven: boolean;
  pinned: boolean;
  slotLabel?: string;
  onToggle: () => void;
  onPin: () => void;
  onExport?: () => void;
}) {
  const [showStory, setShowStory] = useState(false);
  const gem = node.gemColor || '#d4af37';
  const ring = equipped ? '#ffd700' : proven ? '#67e8f9' : 'rgba(180,180,200,0.25)';
  return (
    <div
      onClick={onPin}
      style={{
        position: 'relative',
        padding: '10px 12px',
        background: pinned ? `${gem}18` : equipped ? 'rgba(255, 215, 0, 0.06)' : 'rgba(60, 60, 80, 0.18)',
        border: `1px solid ${pinned ? gem : ring}`,
        borderRadius: 6,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'all 0.15s',
      }}
      title={`${node.artefactName ?? node.label}\n\nClick to pin · use the equip toggle to add to loadout.`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ fontSize: 22, lineHeight: 1 }}>{node.emoji ?? '✦'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: THEME.textBright, fontSize: 12, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.artefactName ?? node.label}
          </div>
          <div style={{ fontSize: 9.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {node.vertex !== undefined && <span>V{node.vertex}</span>}
            {node.gem && <span style={{ color: gem }}>· {node.gem}</span>}
            {slotLabel && <span style={{ opacity: 0.65 }}>· {slotLabel.toLowerCase()}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {proven ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{
              flex: 1,
              padding: '4px 8px',
              background: equipped ? 'rgba(255, 215, 0, 0.18)' : 'rgba(212, 175, 55, 0.06)',
              border: `1px solid ${equipped ? '#ffd700' : 'rgba(212, 175, 55, 0.35)'}`,
              color: equipped ? '#ffd700' : THEME.textBright,
              borderRadius: 4,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: 0.3,
            }}
            title={equipped ? 'Unequip' : 'Equip'}
          >
            {equipped ? '✓ equipped' : '○ equip'}
          </button>
        ) : (
          <span
            style={{
              flex: 1,
              padding: '4px 8px',
              background: 'rgba(180, 180, 200, 0.04)',
              border: '1px dashed rgba(180, 180, 200, 0.3)',
              color: THEME.textDim,
              borderRadius: 4,
              fontSize: 10,
              fontStyle: 'italic',
              textAlign: 'center',
            }}
            title="Open trust task — trace this artefact's constellation at the workshop and bring it back"
          >
            ○ open · trace it
          </span>
        )}
        {onExport && (
          <button
            onClick={(e) => { e.stopPropagation(); onExport(); }}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: `1px solid ${gem}66`,
              color: gem,
              borderRadius: 4,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
            }}
            title={`Download ${node.artefactName ?? node.label} metadata as .md`}
            aria-label="Export as .md"
          >
            📥
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setShowStory(true); }}
          style={{
            padding: '4px 8px',
            background: 'transparent',
            border: `1px solid ${gem}66`,
            color: gem,
            borderRadius: 4,
            fontSize: 10,
            cursor: 'pointer',
          }}
          title={`The story & proverb of ${node.artefactName ?? node.label}`}
          aria-label="Story & proverb"
        >
          📖
        </button>
      </div>
      {showStory && <StoryPopup node={node} proven={proven} onClose={() => setShowStory(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// StoryPopup · the "story proverb" mode — the next-step proverb + where to
// learn about this item and its workshop (guide.agentprivacy.ai / agentprivacy.ai).
// ─────────────────────────────────────────────────────────────────────
function StoryPopup({ node, proven, onClose }: { node: SpellwebNode; proven: boolean; onClose: () => void }) {
  const gem = node.gemColor || '#d4af37';
  const name = node.artefactName ?? node.label;
  const proverb = node.proverb ?? (node.ceremony ? `${node.ceremony}.` : 'Trace it, and bring it back.');
  // The next step of the quest, in the proverb register.
  const nextStep = proven
    ? 'Brought back. Equip it, and it joins your loadout — lit on your City Key.'
    : 'An open trust task. Trace its constellation at the workshop and bring the artefact back here.';
  const storyHref = node.href ? `https://agentprivacy.ai${node.href}` : 'https://agentprivacy.ai/runecraft';
  const guideHref = 'https://guide.agentprivacy.ai';
  return (
    <div
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(6,6,14,0.7)', backdropFilter: 'blur(3px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      role="dialog"
      aria-label={`${name} — story & proverb`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: 'linear-gradient(180deg, rgba(14,14,26,0.98), rgba(8,8,18,0.98))', border: `1px solid ${gem}66`, borderRadius: 12, padding: 22, boxShadow: `0 8px 40px ${gem}22` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span aria-hidden style={{ fontSize: 30, lineHeight: 1 }}>{node.emoji ?? '✦'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: THEME.textBright, fontSize: 18, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              {node.label}{node.vertex !== undefined ? ` · V${node.vertex}` : ''}{node.ceremony ? ` · ${node.ceremony}` : ''}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: THEME.textDim, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>×</button>
        </div>

        {/* the proverb */}
        <div style={{ margin: '14px 0', padding: '12px 14px', borderLeft: `2px solid ${gem}`, background: `${gem}0c`, borderRadius: '0 6px 6px 0' }}>
          <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>the proverb</div>
          <div style={{ color: THEME.textBright, fontSize: 14, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.5 }}>“{proverb}”</div>
        </div>

        {/* the next step */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: proven ? '#67e8f9' : '#ffd700', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
            {proven ? '✓ brought back · next step' : '○ open · next step'}
          </div>
          <div style={{ fontSize: 12.5, color: THEME.textDim, lineHeight: 1.55 }}>{nextStep}</div>
        </div>

        {/* where to learn */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href={storyHref} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, minWidth: 150, textAlign: 'center', padding: '8px 12px', borderRadius: 6, background: `${gem}18`, border: `1px solid ${gem}aa`, color: THEME.textBright, fontSize: 11.5, textDecoration: 'none', fontWeight: 600 }}>
            📖 Read the workshop story →
          </a>
          <a href={guideHref} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, minWidth: 150, textAlign: 'center', padding: '8px 12px', borderRadius: 6, background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.4)', color: '#67e8f9', fontSize: 11.5, textDecoration: 'none', fontWeight: 600 }}>
            🧭 Learn on the guide →
          </a>
        </div>
      </div>
    </div>
  );
}

function ForgedItemCard({
  blade,
  equipped,
  onToggle,
  onExport,
}: {
  blade: LatticeForgedBlade;
  equipped: boolean;
  onToggle: () => void;
  onExport?: () => void;
}) {
  const tierColors = { light: '#87ceeb', heavy: '#c0c0c0', dragon: '#ffd700' } as const;
  const tc = tierColors[blade.tier];
  return (
    <div
      style={{
        padding: '10px 12px',
        background: equipped ? `${tc}22` : `${tc}10`,
        border: `1px solid ${equipped ? tc : `${tc}55`}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ fontSize: 22, lineHeight: 1 }}>{blade.emoji ?? '✦'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: THEME.textBright, fontSize: 12, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {blade.name}
          </div>
          <div style={{ fontSize: 9.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 6 }}>
            <span style={{ color: tc, textTransform: 'capitalize' }}>{blade.tier}</span>
            {blade.stratum !== undefined && <span>· s{blade.stratum}</span>}
            {blade.isWitness && <span style={{ color: '#3b82f6', fontStyle: 'italic' }}>· witness</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onToggle}
          style={{
            flex: 1,
            padding: '4px 8px',
            background: equipped ? `${tc}33` : 'transparent',
            border: `1px solid ${equipped ? tc : `${tc}55`}`,
            color: equipped ? tc : THEME.textBright,
            borderRadius: 4,
            fontSize: 10,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: 0.3,
          }}
          title={equipped ? 'Unequip' : 'Equip'}
        >
          {equipped ? '✓ equipped' : '○ equip'}
        </button>
        {onExport && (
          <button
            onClick={onExport}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: `1px solid ${tc}66`,
              color: tc,
              borderRadius: 4,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
            }}
            title={`Download ${blade.name} as .md`}
            aria-label="Export as .md"
          >
            📥
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SwordsmanCityKeyPanel · the holonic City Key — C87 "The Key Accumulates"
// Every Strike folds a charge in (a step circuit), re-derives κ over the key's
// reading, and chains the prior κ via `supersedes`. The sigil is the κ drawn:
// 64 glyphs, one per vertex. "Every fold is a deliberate act."
// ─────────────────────────────────────────────────────────────────────
function SwordsmanCityKeyPanel({
  activeNode,
  keyIdentity,
  onExportSwordsman,
  onExportMage,
  onExportCityKey,
}: {
  activeNode: SpellwebNode | null;
  keyIdentity: KeyIdentity;
  onExportSwordsman?: () => void;
  onExportMage?: () => void;
  onExportCityKey?: () => void;
}) {
  const [key, setKey] = useState<SwordsmanCityKey | null>(() => loadKey());
  const [busy, setBusy] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  // Rotation intake — adopt a City Key exported by /star, /lattice, /sigil, /skye or
  // agentprivacy /city. κ is re-derived (never trusted); the prior-chain carries through.
  const handleImportFile = useCallback(async (file: File) => {
    if (busy) return;
    setBusy(true);
    try {
      const text = await file.text();
      const result = await importKeyJSON(text, keyIdentity);
      if (!result.verified) {
        const ok = window.confirm(
          `κ claim does not re-derive.\n\nclaimed: ${result.claimedKappa ?? '(none)'}\nderived: ${result.derivedKappa ?? '(crypto unavailable)'}\n\nAdopt this key anyway?`,
        );
        if (!ok) return;
      }
      if (key && key.charges.some(c => c.source !== 'key-import')) {
        const ok = window.confirm(
          `Adopting this key replaces the current one (κ ${key.kappa?.slice(0, 23) ?? 'unstruck'}…, ${key.charges.length} charge${key.charges.length === 1 ? '' : 's'}).\n\nContinue?`,
        );
        if (!ok) return;
      }
      saveKey(result.key);
      setKey(result.key);
    } catch (err) {
      window.alert(`Could not read that City Key JSON: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, [busy, key, keyIdentity]);

  // Re-sync if another surface (or tab) folds a charge
  useEffect(() => {
    const onChange = () => setKey(loadKey());
    window.addEventListener(CITY_KEY_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CITY_KEY_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  // Create-on-first-strike, folding the bearer's known identity into the reading.
  const ensureKey = useCallback((): SwordsmanCityKey => {
    if (key) return key;
    const fresh = emptyKey(keyIdentity);
    saveKey(fresh);
    return fresh;
  }, [key, keyIdentity]);

  const strikeLabel = activeNode
    ? `⚔️ Strike with ${activeNode.artefactName ?? activeNode.label}`
    : '🪬 Stamp sigil';

  const handleStrike = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const base = ensureKey();
      const charge = activeNode
        ? makeCharge({
            label: activeNode.artefactName ?? activeNode.label,
            source: activeNode.id,
            vertex: activeNode.vertex,
            // heavier vertices (more sovereignty bits) fold in more mass
            weight: activeNode.vertex !== undefined ? Math.max(1, popcount(activeNode.vertex)) : 1,
          })
        : makeCharge({ label: 'Stamped sigil', source: 'sigil-stamp', weight: 1 });
      const next = await stamp(base, charge);
      setKey(next);
    } finally {
      setBusy(false);
    }
  }, [busy, ensureKey, activeNode]);

  const charges = key?.charges ?? [];

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255, 215, 0, 0.18)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1.2 }}>
          🗝️ swordsman city key
        </div>
        <div style={{ fontSize: 10, color: '#ffd700', fontFamily: "'JetBrains Mono', monospace" }}>
          weight {key?.weight ?? 0} · {charges.length} charge{charges.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* κ readout + prior-chain */}
      <div style={{ padding: '8px 10px', background: 'rgba(255, 215, 0, 0.04)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, lineHeight: 1.6 }}>
        <div style={{ color: THEME.textDim }}>
          κ <span style={{ color: key?.kappa ? '#ffd700' : THEME.textDim }}>{key?.kappa ? key.kappa.slice(0, 27) + '…' : 'unstruck — strike to derive a name'}</span>
        </div>
        {key?.priorKappa && (
          <div style={{ color: THEME.textDim }}>
            <span style={{ color: '#e8523a' }}>supersedes</span> {key.priorKappa.slice(7, 23)}…
          </div>
        )}
      </div>

      {/* The sigil — κ drawn as 64 glyphs on the lattice */}
      <SigilPreview kappa={key?.kappa ?? null} />

      {/* Strike */}
      <button
        onClick={handleStrike}
        disabled={busy}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '8px 12px',
          background: busy ? 'rgba(255,215,0,0.06)' : 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(232,82,58,0.10))',
          border: '1px solid #ffd700aa',
          color: '#ffd700',
          borderRadius: 6,
          cursor: busy ? 'wait' : 'pointer',
          fontSize: 12,
          fontFamily: 'inherit',
          fontWeight: 600,
        }}
        title={activeNode
          ? 'Fold this pinned artefact into the key — a C87 step. κ re-derives and the prior κ is superseded.'
          : 'Stamp the sigil — fold a charge into the key. Pin an artefact first to strike with it.'}
      >
        {busy ? 'folding…' : strikeLabel}
      </button>

      {/* The hammering, explained — collapsible so the panel stays quiet by default */}
      <button
        onClick={() => setExplainOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: 0, background: 'transparent', border: 'none',
          color: THEME.textDim, fontSize: 9.5, cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1,
        }}
        aria-expanded={explainOpen}
      >
        <span aria-hidden style={{ color: '#ffd700aa' }}>{explainOpen ? '▾' : '▸'}</span>
        the hammering, explained
      </button>
      {explainOpen && (
        <div style={{ padding: '8px 10px', background: 'rgba(255, 215, 0, 0.03)', border: '1px dashed rgba(255, 215, 0, 0.22)', borderRadius: 4, fontSize: 10, color: THEME.textDim, lineHeight: 1.65 }}>
          Each <span style={{ color: '#ffd700' }}>strike</span> is a hammer-blow on the anvil: it folds one
          charge into the key — the pinned artefact if one is pinned (heavier vertices fold in more mass:
          weight = the vertex&apos;s stratum), or a plain sigil-stamp if not.
          <br /><br />
          The key&apos;s name is its content: after every blow its κ (<span style={{ color: '#ffd700aa' }}>sha256
          of the key&apos;s reading</span>) is re-derived, and the old κ is chained behind it —{' '}
          <span style={{ color: '#e8523a' }}>supersedes</span> — so the key carries a lineage of its former
          selves. That is <span style={{ color: '#ffd700aa' }}>C87 · the Key Accumulates</span>.
          <br /><br />
          The <span style={{ color: '#ffd700' }}>sigil</span> above is the κ drawn: 64 hex glyphs, one per
          lattice vertex — brighter glyph, higher digit. Carry the key out with the buttons below; the same
          κ re-derives on /star, /lattice, /sigil, /skye and agentprivacy /city, and an import here carries
          a rotation back.
        </div>
      )}

      {/* Carry the keys — sword + mage bundle exports, the content-addressed key, and rotation intake */}
      <div style={{ fontSize: 9.5, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
        carry · export ⊥ import
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {onExportSwordsman && (
          <CarryButton
            label="⚔️ Swordsman.md"
            color="#e8523a"
            onClick={onExportSwordsman}
            title="Export the Swordsman bundle — forged artefacts, witnessed shops, and this City Key (κ + tape) as one .md"
          />
        )}
        {onExportMage && (
          <CarryButton
            label="🧙 Mage.md"
            color="#67e8f9"
            onClick={onExportMage}
            title="Export the Mage bundle — spells, saved constellations, and mage identity as one .md"
          />
        )}
        {onExportCityKey && (
          <CarryButton
            label="🗝️ City Key.json"
            color="#ffd700"
            onClick={onExportCityKey}
            disabled={!key?.kappa}
            title={key?.kappa
              ? 'Export the content-addressed City Key (κ stamped) — round-trips to /star, /lattice, /sigil and agentprivacy /city'
              : 'The key is unstruck — strike once to derive a κ before carrying it out'}
          />
        )}
        <CarryButton
          label="⤵ import Key.json"
          color="#ffd700"
          dashed
          onClick={() => importRef.current?.click()}
          disabled={busy}
          title="Adopt a City Key JSON exported from /star, /lattice, /sigil, /skye or agentprivacy /city — κ is re-derived, the prior-chain carries through, and your next strike supersedes it."
        />
      </div>
      <input
        ref={importRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImportFile(f);
          e.target.value = '';
        }}
      />

      {/* Recent charges (the accumulator tape · newest first · last 3) */}
      {charges.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[...charges].reverse().slice(0, 3).map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ color: '#ffd700aa' }}>{charges.length - i}</span>
              <span style={{ flex: 1, color: THEME.textBright, fontFamily: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
              {c.vertex !== undefined && <span>V{c.vertex}</span>}
              <span style={{ color: '#ffd700aa' }}>+{c.weight}</span>
            </div>
          ))}
          {charges.length > 3 && (
            <div style={{ fontSize: 9, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              +{charges.length - 3} earlier fold{charges.length - 3 === 1 ? '' : 's'} on the tape
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact export/import chip for the key panel's carry row.
function CarryButton({
  label,
  color,
  onClick,
  title,
  disabled,
  dashed,
}: {
  label: string;
  color: string;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  dashed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 8px',
        background: disabled ? 'transparent' : `${color}14`,
        border: `1px ${dashed ? 'dashed' : 'solid'} ${color}${disabled ? '44' : 'aa'}`,
        color: disabled ? `${color}66` : color,
        borderRadius: 6,
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 10.5,
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}
    </button>
  );
}

// Mini sigil — κ rendered as 64 glyphs on the Pascal's-row lattice. Brightness = glyph/15.
function SigilPreview({ kappa }: { kappa: string | null }) {
  const W = 330, H = 104, pad = 8;
  const rowSpace = (H - pad * 2) / 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="the key's sigil — κ drawn on the lattice">
      {ROWS.flatMap((row, s) => {
        const y = pad + s * rowSpace;
        const innerW = W - pad * 2 - 12;
        return row.map((v, i) => {
          const x = pad + 6 + (innerW / row.length) * (i + 0.5);
          const g = glyphAt(kappa, v);
          const op = g === null ? 0.06 : 0.14 + 0.86 * (g / 15);
          const r = g === null ? 1.6 : 1.6 + 2.4 * (g / 15);
          return <circle key={`sg-${v}`} cx={x} cy={y} r={r} fill="#ffd700" fillOpacity={op} />;
        });
      })}
    </svg>
  );
}
