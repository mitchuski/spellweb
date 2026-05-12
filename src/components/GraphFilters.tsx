import { useState } from 'react';
import type { FilterState, TypeFilterState } from '../types/graph';
import { THEME } from '../data/theme';

interface GraphFiltersProps {
  filters: FilterState;
  typeFilters: TypeFilterState;
  onToggleLayer: (layer: keyof FilterState) => void;
  onToggleType: (type: keyof TypeFilterState) => void;
  isOpen?: boolean;
  // Mobile action props
  onOpenConstellations?: () => void;
  onOpenZKBlades?: () => void;
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
  // Universe integration (2026-05-10)
  { key: "workshop" as const,  label: "🏛 Workshops", color: "#d4af37" },
  { key: "cast" as const,      label: "✦ Cast", color: "#c4a8ff" },
  { key: "vertex" as const,    label: "· Vertices", color: "#d4af37" },
  { key: "civic" as const,     label: "🏰 City", color: "#e4c84f" },
  { key: "geography" as const, label: "🐉 Drake Island", color: "#7a3a1a" },
  { key: "gateway" as const,   label: "↗ Sister Cities", color: "#86c5ff" },
  { key: "artefact" as const,  label: "✦ Your Artefacts", color: "#ffd700" },
];

// SPELLBOOK_BUTTONS moved to Header.tsx

export function GraphFilters({
  filters, typeFilters, onToggleLayer, onToggleType, isOpen = true,
  onOpenConstellations, onOpenZKBlades, hasLatestProof, constellationCount = 0, forgedBladesCount = 0, witnessBladesCount: _wbc = 0,
}: GraphFiltersProps) {
  // Collapse state for each section
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const [typesCollapsed, setTypesCollapsed] = useState(false);

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
        onClick={() => setLayersCollapsed(!layersCollapsed)}
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: THEME.textDim,
          marginBottom: layersCollapsed ? 0 : 8,
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span>LAYERS</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{layersCollapsed ? '🔽' : '🔼'}</span>
      </div>
      {!layersCollapsed && LAYER_BUTTONS.map((l) => (
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
        onClick={() => setTypesCollapsed(!typesCollapsed)}
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: THEME.textDim,
          marginTop: 12,
          marginBottom: typesCollapsed ? 0 : 8,
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span>NODE TYPES</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{typesCollapsed ? '🔽' : '🔼'}</span>
      </div>
      {!typesCollapsed && TYPE_BUTTONS.map((t) => (
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
