import { useMemo, useState } from 'react';
import type { SpellwebNode, ArtefactArchetype, ArtefactClass } from '../types/graph';
import type { SpellProof } from './SpellCeremony';
import { NODES } from '../data/nodes';
import { THEME } from '../data/theme';
import SidePanel from './SidePanel';

// Lightweight mirror of SpellWeb's ForgedBlade interface — kept local so this
// panel doesn't need to import from SpellWeb (avoids a circular dep).
export interface ForgedArtefact {
  id: string;
  name: string;
  emoji: string;
  tier: 'light' | 'heavy' | 'dragon';
  stratum: number;
  proof: SpellProof;
  forgedAt: string;
  constellationNodes: number;
  constellationMarks: { nodeId: string; nodeLabel: string; emoji: string; note: string }[];
  constellationConnections: { sourceId: string; targetId: string; note: string }[];
  isWitness?: boolean;
  witnessOf?: string;
  witnessedFrom?: string;
}

interface ArtefactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onWitnessBlade: (file: File) => void;
  witnessedShops: Record<string, string>;
  forgedBlades: ForgedArtefact[];
  onExportArtefact: (artefact: ForgedArtefact) => void;
  /** Export a catalogue artefact card (workshop or tome) as a metadata .md. */
  onExportCatalogue: (node: SpellwebNode) => void;
}

const ARCHETYPE_LABEL: Record<ArtefactArchetype, string> = {
  swordsman: 'Soulbis ⚔️',
  mage:      'Soulbae 🧙',
  bilateral: 'Bilateral ⿻',
};

const CLASS_LABEL: Record<ArtefactClass, string> = {
  trinket:  'Trinket',
  tool:     'Tool',
  weapon:   'Blade',
  clothing: 'Cloak',
  tome:     'Tome',
};

const CLASS_GLYPH: Record<ArtefactClass, string> = {
  trinket:  '◇',
  tool:     '⚙',
  weapon:   '⚔️',
  clothing: '🧣',
  tome:     '📖',
};

// Tabs: Forged sits first (the Sovereign's own inventory), then by class.
type Tab = 'forged' | 'weapon' | 'trinket' | 'tool' | 'clothing' | 'tome';

const TAB_LABEL: Record<Tab, string> = {
  forged:   '🔥 Forged',
  weapon:   '⚔️ Blades',
  trinket:  '◇ Trinkets',
  tool:     '⚙ Tools',
  clothing: '🧣 Cloaks',
  tome:     '📖 Tomes',
};

const TAB_ORDER: Tab[] = ['forged', 'weapon', 'trinket', 'tool', 'clothing', 'tome'];

export function ArtefactPanel({
  isOpen,
  onClose,
  onWitnessBlade,
  witnessedShops,
  forgedBlades,
  onExportArtefact,
  onExportCatalogue,
}: ArtefactPanelProps) {
  const [tab, setTab] = useState<Tab>('forged');

  // Catalogue: workshops + tomes grouped by artefact class.
  const cataloguebyClass = useMemo(() => {
    const all = NODES.filter(n => n.artefactClass !== undefined);
    const byClass: Record<Exclude<Tab, 'forged'>, SpellwebNode[]> = {
      weapon: [], trinket: [], tool: [], clothing: [], tome: [],
    };
    for (const n of all) {
      const c = n.artefactClass as ArtefactClass;
      if (c in byClass) byClass[c as Exclude<Tab, 'forged'>].push(n);
    }
    return byClass;
  }, []);

  const forgedCount = forgedBlades.length;
  const witnessedCount = forgedBlades.filter(b => b.isWitness).length;
  const ownCount = forgedCount - witnessedCount;

  const eyebrow = 'CITY OF MAGES · INVENTORY';
  const headerLine = (
    <>
      Forged: <span style={{ color: '#ffd700' }}>{ownCount}</span> · Witnessed: <span style={{ color: '#3b82f6' }}>{witnessedCount}</span> · Workshops unlocked: <span style={{ color: '#d4af37' }}>{Object.keys(witnessedShops).length}/11</span>
    </>
  );

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={eyebrow}
      title="🏛 Artefacts"
      accent="#d4af37"
      preTabs={
        <>
          <div style={{ padding: '10px 16px', fontSize: 11, color: THEME.textDim, lineHeight: 1.5 }}>
            {headerLine}
          </div>
          <div style={{ padding: 12, background: 'rgba(212, 175, 55, 0.06)' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.04))',
                border: `1px solid #d4af37aa`,
                color: '#ffd700',
                fontSize: 12,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              <span>👁️</span> Witness Constellation
              <input
                type="file"
                accept=".md"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onWitnessBlade(file);
                  e.target.value = '';
                }}
              />
            </label>
            <div style={{ marginTop: 8, fontSize: 10, color: THEME.textDim, textAlign: 'center', lineHeight: 1.4 }}>
              Import a tome constellation or another Sovereign&apos;s artefact.md — the spellweb traces the path, forges, and the workshop unlocks.
            </div>
          </div>
        </>
      }
      tabs={
        <>
          {TAB_ORDER.map(t => {
            const count = t === 'forged' ? forgedCount : cataloguebyClass[t].length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: '1 0 auto',
                  minWidth: 0,
                  padding: '10px 6px',
                  background: tab === t ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: tab === t ? '2px solid #d4af37' : '2px solid transparent',
                  color: tab === t ? THEME.textBright : THEME.textDim,
                  fontSize: 11,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  cursor: 'pointer',
                  letterSpacing: 0.3,
                  whiteSpace: 'nowrap',
                }}
              >
                {TAB_LABEL[t]} <span style={{ opacity: 0.55, fontSize: 10 }}>({count})</span>
              </button>
            );
          })}
        </>
      }
    >
      {tab === 'forged' ? (
        forgedBlades.length === 0 ? (
          <div style={{ color: THEME.textDim, fontSize: 12, textAlign: 'center', padding: 24 }}>
            No artefacts forged yet. Walk a tome constellation and complete the ceremony.
          </div>
        ) : (
          forgedBlades.slice().reverse().map(b => (
            <ForgedArtefactCard
              key={b.id}
              artefact={b}
              onExport={() => onExportArtefact(b)}
            />
          ))
        )
      ) : (
        (() => {
          const items = cataloguebyClass[tab];
          if (items.length === 0) return (
            <div style={{ color: THEME.textDim, fontSize: 12, textAlign: 'center', padding: 24 }}>
              No artefacts in this catalogue.
            </div>
          );
          return items.map(item => (
            <CatalogueCard
              key={item.id}
              node={item}
              witnessed={!!witnessedShops[item.id]}
              onExport={() => onExportCatalogue(item)}
            />
          ));
        })()
      )}
    </SidePanel>
  );
}

// ─────────────────────────────────────────────────────────────
// Forged-inventory card (the user's own artefacts)
// ─────────────────────────────────────────────────────────────
function ForgedArtefactCard({ artefact, onExport }: { artefact: ForgedArtefact; onExport: () => void }) {
  const tierColor =
    artefact.tier === 'dragon' ? '#ffd700' :
    artefact.tier === 'heavy'  ? '#c0c0c0' :
                                 '#87ceeb';
  return (
    <div
      style={{
        marginBottom: 10,
        padding: '12px 14px',
        background: `${tierColor}10`,
        border: `1px solid ${tierColor}55`,
        borderRadius: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 24, lineHeight: 1 }}>{artefact.emoji || '✦'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: THEME.textBright, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              {artefact.name}
            </span>
            {artefact.isWitness && (
              <span style={{ color: '#3b82f6', fontSize: 10, fontStyle: 'italic' }}>· witness</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: tierColor, textTransform: 'capitalize' }}>{artefact.tier}</span>
            <span>· stratum {artefact.stratum}/6</span>
            <span>· {artefact.constellationNodes} nodes</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            forged {new Date(artefact.forgedAt).toLocaleDateString()}
          </div>
        </div>
        <button
          onClick={onExport}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            background: `${tierColor}22`,
            border: `1px solid ${tierColor}88`,
            color: tierColor,
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
          }}
        >
          📥 .md
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Catalogue card (the canonical workshop artefact slot)
// ─────────────────────────────────────────────────────────────
function CatalogueCard({ node, witnessed, onExport }: { node: SpellwebNode; witnessed: boolean; onExport: () => void }) {
  const archetypeColor =
    node.artefactArchetype === 'swordsman' ? '#e94560' :
    node.artefactArchetype === 'mage'      ? '#a78bfa' :
                                              '#67e8f9';
  const opacity = witnessed ? 1 : 0.55;
  const gem = node.gemColor || archetypeColor;
  const cls = node.artefactClass;
  return (
    <div
      style={{
        marginBottom: 10,
        padding: '12px 14px',
        background: witnessed ? `${gem}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${witnessed ? gem + '55' : THEME.panelBorder}`,
        borderRadius: 6,
        opacity,
        transition: 'opacity 0.3s, background 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 24, lineHeight: 1 }}>{node.emoji ?? '◆'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: THEME.textBright, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              {node.artefactName ?? node.label}
            </span>
            {node.artefactRootName && (
              <span style={{ color: THEME.textDim, fontSize: 11, fontStyle: 'italic' }}>· {node.artefactRootName}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {cls && <span>{CLASS_GLYPH[cls]} {CLASS_LABEL[cls]}</span>}
            {node.artefactArchetype && <span>· {ARCHETYPE_LABEL[node.artefactArchetype]}</span>}
            {node.vertex !== undefined && <span>· V{node.vertex}</span>}
            {node.gem && <span style={{ color: gem }}>· {node.gem}</span>}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: witnessed ? THEME.text : THEME.textDim, lineHeight: 1.4 }}>
            {witnessed ? (
              <>
                <span style={{ color: '#86efac' }}>● witnessed</span>
                {' '}· walk the tome to forge
              </>
            ) : (
              <span style={{ color: '#666' }}>○ unwitnessed · awaits constellation walk</span>
            )}
          </div>
        </div>
        <button
          onClick={onExport}
          title={`Download ${node.artefactName ?? node.label} metadata card (.md)`}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            background: `${gem}22`,
            border: `1px solid ${gem}88`,
            color: gem,
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
          }}
        >
          📥 .md
        </button>
      </div>
    </div>
  );
}
