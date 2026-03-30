import type { FilterState, TypeFilterState, SpellbookFilterState } from '../types/graph';
import { THEME } from '../data/theme';

interface GraphFiltersProps {
  filters: FilterState;
  typeFilters: TypeFilterState;
  spellbookFilters: SpellbookFilterState;
  onToggleLayer: (layer: keyof FilterState) => void;
  onToggleType: (type: keyof TypeFilterState) => void;
  onToggleSpellbook: (spellbook: keyof SpellbookFilterState) => void;
  isOpen?: boolean;
  // Mobile action props
  onOpenConstellations?: () => void;
  onOpenZKBlades?: () => void;
  onWitnessBlade?: (file: File) => void;
  hasLatestProof?: boolean;
  constellationCount?: number;
  forgedBladesCount?: number;
  witnessBladesCount?: number;
}

const LAYER_BUTTONS = [
  { key: "knowledge" as const, label: "Knowledge", color: "#00d9ff" },
  { key: "narrative" as const, label: "Narrative", color: "#2ecc71" },
];

const TYPE_BUTTONS = [
  { key: "document" as const, label: "📜 Docs", color: "#3a3a5c" },
  { key: "concept" as const, label: "◆ Concepts", color: "#00d9ff" },
  { key: "theorem" as const, label: "△ Theorems", color: "#e74c3c" },
  { key: "spell" as const, label: "✦ Spells", color: "#ffd700" },
  { key: "act" as const, label: "◇ Acts", color: "#2ecc71" },
  { key: "persona" as const, label: "○ Personas", color: "#a78bfa" },
  { key: "term" as const, label: "· Terms", color: "#555570" },
  { key: "skill" as const, label: "⚙ Skills", color: "#f39c12" },
];

const SPELLBOOK_BUTTONS = [
  { key: "first_person" as const, label: "📖 First Person", color: "#ffd700" },
  { key: "zero_knowledge" as const, label: "🔐 Zero Knowledge", color: "#e94560" },
  { key: "blockchain_canon" as const, label: "⛓️ Blockchain Canon", color: "#00d9ff" },
  { key: "parallel_society" as const, label: "🏛️ Parallel Society", color: "#2ecc71" },
  { key: "plurality" as const, label: "⿻ Plurality", color: "#7b68ee" },
];

export function GraphFilters({
  filters, typeFilters, spellbookFilters, onToggleLayer, onToggleType, onToggleSpellbook, isOpen = true,
  onOpenConstellations, onOpenZKBlades, onWitnessBlade, hasLatestProof, constellationCount = 0, forgedBladesCount = 0, witnessBladesCount = 0,
}: GraphFiltersProps) {
  return (
    <div
      className={`filters-panel ${isOpen ? 'filters-open' : ''}`}
      style={{
        position: "absolute",
        top: 68,
        left: 12,
        zIndex: 80,
        background: `${THEME.panelBg}e0`,
        borderRadius: 6,
        border: `1px solid ${THEME.panelBorder}`,
        padding: "14px 14px 10px",
        backdropFilter: "blur(12px)",
        maxWidth: 170,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: THEME.textDim,
          marginBottom: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        LAYERS
      </div>
      {LAYER_BUTTONS.map((l) => (
        <button
          key={l.key}
          onClick={() => onToggleLayer(l.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "5px 8px",
            marginBottom: 3,
            borderRadius: 3,
            cursor: "pointer",
            background: filters[l.key] ? `${l.color}15` : "transparent",
            border: `1px solid ${filters[l.key] ? l.color + "40" : "transparent"}`,
            color: filters[l.key] ? l.color : THEME.textDim,
            fontSize: 11,
            fontFamily: "'IBM Plex Sans', sans-serif",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: filters[l.key] ? l.color : THEME.textDim,
              boxShadow: filters[l.key] ? `0 0 6px ${l.color}` : "none",
            }}
          />
          {l.label}
        </button>
      ))}

      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: THEME.textDim,
          marginTop: 12,
          marginBottom: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        NODE TYPES
      </div>
      {TYPE_BUTTONS.map((t) => (
        <button
          key={t.key}
          onClick={() => onToggleType(t.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            padding: "4px 8px",
            marginBottom: 2,
            borderRadius: 3,
            cursor: "pointer",
            background: typeFilters[t.key] ? `${t.color}10` : "transparent",
            border: `1px solid ${typeFilters[t.key] ? t.color + "30" : "transparent"}`,
            color: typeFilters[t.key] ? THEME.text : THEME.textDim,
            fontSize: 11,
            fontFamily: "'IBM Plex Sans', sans-serif",
            textAlign: "left",
          }}
        >
          <span style={{ opacity: typeFilters[t.key] ? 1 : 0.3 }}>{t.label}</span>
        </button>
      ))}

      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: THEME.textDim,
          marginTop: 12,
          marginBottom: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        SPELLBOOKS
      </div>
      {SPELLBOOK_BUTTONS.map((s) => (
        <button
          key={s.key}
          onClick={() => onToggleSpellbook(s.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            padding: "4px 8px",
            marginBottom: 2,
            borderRadius: 3,
            cursor: "pointer",
            background: spellbookFilters[s.key] ? `${s.color}15` : "transparent",
            border: `1px solid ${spellbookFilters[s.key] ? s.color + "40" : "transparent"}`,
            color: spellbookFilters[s.key] ? s.color : THEME.textDim,
            fontSize: 10,
            fontFamily: "'IBM Plex Sans', sans-serif",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: spellbookFilters[s.key] ? s.color : THEME.textDim,
              boxShadow: spellbookFilters[s.key] ? `0 0 4px ${s.color}` : "none",
            }}
          />
          <span style={{ opacity: spellbookFilters[s.key] ? 1 : 0.4 }}>{s.label}</span>
        </button>
      ))}

      {/* Mobile Actions - Only shown on mobile via CSS */}
      <div className="mobile-actions-section">
        <div
          style={{
            fontSize: 9,
            letterSpacing: 2,
            color: THEME.textDim,
            marginTop: 12,
            marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
            borderTop: `1px solid ${THEME.panelBorder}`,
            paddingTop: 12,
          }}
        >
          ACTIONS
        </div>

        {/* Constellations */}
        {onOpenConstellations && (
          <button
            onClick={onOpenConstellations}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "6px 8px",
              marginBottom: 4,
              borderRadius: 4,
              cursor: "pointer",
              background: constellationCount > 0 ? "rgba(155, 89, 182, 0.15)" : "transparent",
              border: `1px solid ${constellationCount > 0 ? '#9b59b6' : THEME.panelBorder}`,
              color: constellationCount > 0 ? "#c9a0dc" : THEME.textDim,
              fontSize: 11,
              fontFamily: "'IBM Plex Sans', sans-serif",
              textAlign: "left",
            }}
          >
            <span>🌌</span> Constellations {constellationCount > 0 && `(${constellationCount})`}
          </button>
        )}

        {/* ZK Blades */}
        {onOpenZKBlades && (
          <button
            onClick={onOpenZKBlades}
            disabled={!hasLatestProof}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "6px 8px",
              marginBottom: 4,
              borderRadius: 4,
              cursor: hasLatestProof ? "pointer" : "default",
              background: hasLatestProof ? "rgba(255, 215, 0, 0.15)" : "transparent",
              border: `1px solid ${hasLatestProof ? '#ffd700' : THEME.panelBorder}`,
              color: hasLatestProof ? "#ffd700" : THEME.textDim,
              fontSize: 11,
              fontFamily: "'IBM Plex Sans', sans-serif",
              textAlign: "left",
              opacity: hasLatestProof ? 1 : 0.5,
            }}
          >
            <span>⚔️</span> ZK Blades {forgedBladesCount > 0 && `(${forgedBladesCount})`}
          </button>
        )}

        {/* Witness Blade */}
        {onWitnessBlade && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "6px 8px",
              marginBottom: 4,
              borderRadius: 4,
              cursor: "pointer",
              background: witnessBladesCount > 0 ? "rgba(59, 130, 246, 0.15)" : "transparent",
              border: `1px solid ${witnessBladesCount > 0 ? '#3b82f6' : THEME.panelBorder}`,
              color: witnessBladesCount > 0 ? "#3b82f6" : THEME.textDim,
              fontSize: 11,
              fontFamily: "'IBM Plex Sans', sans-serif",
              textAlign: "left",
            }}
          >
            <span>👁️</span> Witness Blade {witnessBladesCount > 0 && `(${witnessBladesCount})`}
            <input
              type="file"
              accept=".md"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onWitnessBlade) {
                  onWitnessBlade(file);
                }
                e.target.value = "";
              }}
            />
          </label>
        )}

        {/* Share Knowledge */}
        <a
          href="https://agentprivacy.ai/evoke"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "6px 8px",
            marginBottom: 4,
            borderRadius: 4,
            background: "transparent",
            border: `1px solid ${THEME.panelBorder}`,
            color: THEME.textDim,
            fontSize: 11,
            fontFamily: "'IBM Plex Sans', sans-serif",
            textAlign: "left",
            textDecoration: "none",
          }}
        >
          <span>🔮</span> Share Knowledge
        </a>
      </div>
    </div>
  );
}
