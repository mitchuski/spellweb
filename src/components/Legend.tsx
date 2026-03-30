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
        right: hasSelectedNode ? 436 : 16,
        zIndex: 50,
        background: `${THEME.panelBg}e0`,
        borderRadius: 8,
        border: `1px solid ${THEME.panelBorder}`,
        padding: "10px 14px",
        backdropFilter: "blur(8px)",
        fontSize: 10,
        transition: "right 0.2s",
        maxWidth: 280,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1,
          color: THEME.textDim,
          marginBottom: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        DOMAINS
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {DOMAINS.map((d) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: d.color,
              fontSize: 9,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: d.color,
                boxShadow: `0 0 4px ${d.color}`,
              }}
            />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1,
          color: THEME.textDim,
          marginTop: 8,
          marginBottom: 4,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        EDGES
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 9 }}>
        {EDGE_TYPES.map((e) => (
          <span key={e.label} style={{ color: e.color }}>
            {e.label}
          </span>
        ))}
      </div>
    </div>
  );
}
