import { THEME } from '../data/theme';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeCount: number;
  edgeCount: number;
}

export function Header({ searchQuery, onSearchChange, nodeCount, edgeCount }: HeaderProps) {
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

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, margin: "0 24px" }}>
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
        }}
      >
        <span
          style={{
            color: THEME.textDim,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
          }}
        >
          {nodeCount} nodes · {edgeCount} edges
        </span>
      </div>
    </div>
  );
}
