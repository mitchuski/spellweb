import { THEME } from '../data/theme';

interface LegendProps {
  hasSelectedNode: boolean;
  className?: string;
}

const DOMAINS = [
  { label: "⚔️ Swordsman", color: "#e94560" },
  { label: "🧙 Mage", color: "#7b68ee" },
  { label: "😊 First Person", color: "#ffd700" },
  { label: "◆ Shared", color: "#00d9ff" },
];

const EDGE_TYPES = [
  { label: "defines", color: "#00d9ff" },
  { label: "proves", color: "#e74c3c" },
  { label: "implements", color: "#7b68ee" },
  { label: "narrates", color: "#2ecc71" },
  { label: "compresses", color: "#ffd700" },
];

export function Legend({ hasSelectedNode, className = '' }: LegendProps) {
  return (
    <div
      className={`mobile-hide ${className}`}
      style={{
        position: "absolute",
        bottom: 16,
        right: hasSelectedNode ? 396 : 16,
        zIndex: 50,
        background: `${THEME.panelBg}e0`,
        borderRadius: 8,
        border: `1px solid ${THEME.panelBorder}`,
        padding: "14px 18px",
        backdropFilter: "blur(8px)",
        fontSize: 11,
        transition: "right 0.2s",
        minWidth: 320,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: THEME.textDim,
          marginBottom: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        DOMAINS
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {DOMAINS.map((d) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: d.color,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: d.color,
                boxShadow: `0 0 6px ${d.color}`,
              }}
            />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: THEME.textDim,
          marginTop: 12,
          marginBottom: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        EDGES
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {EDGE_TYPES.map((e) => (
          <span key={e.label} style={{ color: e.color }}>
            {e.label}
          </span>
        ))}
      </div>
    </div>
  );
}
