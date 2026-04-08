import { useState } from 'react';
import { THEME } from '../data/theme';
import type { SpellbookFilterState } from '../types/graph';

const SPELLBOOK_BUTTONS = [
  { key: "first_person" as const, label: "📖", fullLabel: "First Person", color: "#ffd700" },
  { key: "zero_knowledge" as const, label: "🔐", fullLabel: "Zero Knowledge", color: "#e94560" },
  { key: "blockchain_canon" as const, label: "⛓️", fullLabel: "Blockchain Canon", color: "#00d9ff" },
  { key: "parallel_society" as const, label: "🏛️", fullLabel: "Parallel Society", color: "#2ecc71" },
  { key: "plurality" as const, label: "⿻", fullLabel: "Plurality", color: "#7b68ee" },
];

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeCount: number;
  edgeCount: number;
  spellbookFilters?: SpellbookFilterState;
  onToggleSpellbook?: (spellbook: keyof SpellbookFilterState) => void;
  hasConstellation?: boolean;
  onClearConstellation?: () => void;
  windowWidth?: number;
}

export function Header({ searchQuery, onSearchChange, nodeCount, edgeCount, spellbookFilters, onToggleSpellbook, hasConstellation, onClearConstellation, windowWidth = 1200 }: HeaderProps) {
  const [showSpellbooks, setShowSpellbooks] = useState(false);
  const isMobile = windowWidth < 768;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: `${THEME.panelBg}e0`,
        borderBottom: `1px solid ${THEME.panelBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 80,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            fontSize: 18,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            color: THEME.accent,
            letterSpacing: 1,
          }}
        >
          (⚔️⊥⿻⊥🧙)🕸️
        </span>
        <span
          style={{
            fontSize: 16,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            color: THEME.textBright,
            letterSpacing: 2,
          }}
        >
          SPELLWEB
        </span>
      </div>

      {/* Search - Centered absolutely (hidden on mobile to avoid overlap) */}
      {!isMobile && (
        <div style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
        }}>
          <input
            type="text"
            placeholder="Search concepts, spells, theorems..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: 4,
              background: "#ffffff08",
              border: `1px solid ${THEME.panelBorder}`,
              color: THEME.textBright,
              fontSize: 13,
              outline: "none",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = THEME.accent)}
            onBlur={(e) => (e.target.style.borderColor = THEME.panelBorder)}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 8 : 12,
          fontSize: 12,
        }}
      >
        {/* Clear Constellation Button */}
        {hasConstellation && onClearConstellation && (
          <button
            onClick={onClearConstellation}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid rgba(255, 68, 68, 0.3)",
              color: "#ff4444",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
            title="Clear constellation"
          >
            <span>🗑️</span>
            {!isMobile && <span>CLEAR</span>}
          </button>
        )}

        {/* Mobile: Combined menu with spellbooks + share */}
        {isMobile && spellbookFilters && onToggleSpellbook && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSpellbooks(!showSpellbooks)}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                background: showSpellbooks ? "rgba(255, 215, 0, 0.15)" : "transparent",
                border: `1px solid ${showSpellbooks ? '#ffd700' : THEME.panelBorder}`,
                color: showSpellbooks ? "#ffd700" : THEME.textDim,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>📚</span>
              <span style={{ fontSize: 8, opacity: 0.6 }}>{showSpellbooks ? '▲' : '▼'}</span>
            </button>

            {/* Mobile dropdown with spellbooks + share */}
            {showSpellbooks && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  background: `${THEME.panelBg}f0`,
                  borderRadius: 6,
                  border: `1px solid ${THEME.panelBorder}`,
                  padding: "8px",
                  backdropFilter: "blur(12px)",
                  zIndex: 100,
                  minWidth: 180,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                {SPELLBOOK_BUTTONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onToggleSpellbook(s.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "6px 10px",
                      marginBottom: 2,
                      borderRadius: 4,
                      cursor: "pointer",
                      background: spellbookFilters[s.key] ? `${s.color}15` : "transparent",
                      border: `1px solid ${spellbookFilters[s.key] ? s.color + "40" : "transparent"}`,
                      color: spellbookFilters[s.key] ? s.color : THEME.textDim,
                      fontSize: 11,
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
                    <span style={{ opacity: spellbookFilters[s.key] ? 1 : 0.5 }}>{s.label} {s.fullLabel}</span>
                  </button>
                ))}

                {/* Divider */}
                <div style={{
                  height: 1,
                  background: THEME.panelBorder,
                  margin: "8px 0"
                }} />

                {/* Share button in dropdown */}
                <a
                  href="https://agentprivacy.ai/evoke"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 4,
                    background: "transparent",
                    border: "1px solid transparent",
                    color: THEME.textDim,
                    fontSize: 11,
                    textDecoration: "none",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  <span>🔮</span>
                  <span>Share Knowledge</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Desktop: Spellbook Filters dropdown */}
        {!isMobile && spellbookFilters && onToggleSpellbook && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
            <button
              onClick={() => setShowSpellbooks(!showSpellbooks)}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: showSpellbooks ? "rgba(255, 215, 0, 0.15)" : "transparent",
                border: `1px solid ${showSpellbooks ? '#ffd700' : THEME.panelBorder}`,
                color: showSpellbooks ? "#ffd700" : THEME.textDim,
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>📚</span>
              <span>SPELLBOOKS</span>
              <span style={{ fontSize: 8, opacity: 0.6 }}>{showSpellbooks ? '▲' : '▼'}</span>
            </button>

            {/* Spellbook dropdown */}
            {showSpellbooks && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  background: `${THEME.panelBg}f0`,
                  borderRadius: 6,
                  border: `1px solid ${THEME.panelBorder}`,
                  padding: "8px",
                  backdropFilter: "blur(12px)",
                  zIndex: 100,
                  minWidth: 180,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                {SPELLBOOK_BUTTONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onToggleSpellbook(s.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "6px 10px",
                      marginBottom: 2,
                      borderRadius: 4,
                      cursor: "pointer",
                      background: spellbookFilters[s.key] ? `${s.color}15` : "transparent",
                      border: `1px solid ${spellbookFilters[s.key] ? s.color + "40" : "transparent"}`,
                      color: spellbookFilters[s.key] ? s.color : THEME.textDim,
                      fontSize: 11,
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
                    <span style={{ opacity: spellbookFilters[s.key] ? 1 : 0.5 }}>{s.label} {s.fullLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop: Share Knowledge Link */}
        {!isMobile && (
          <a
            href="https://agentprivacy.ai/evoke"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              background: "transparent",
              border: `1px solid ${THEME.panelBorder}`,
              color: THEME.textDim,
              fontSize: 10,
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7b68ee';
              e.currentTarget.style.color = '#7b68ee';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = THEME.panelBorder;
              e.currentTarget.style.color = THEME.textDim;
            }}
          >
            <span>🔮</span>
            <span>SHARE</span>
          </a>
        )}

        {/* Node/edge count - hide on mobile */}
        {!isMobile && (
          <span
            style={{
              color: THEME.textDim,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
            }}
          >
            {nodeCount} nodes · {edgeCount} edges
          </span>
        )}
      </div>
    </div>
  );
}
