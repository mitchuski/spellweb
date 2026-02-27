import type { SpellwebNode } from '../types/graph';
import { THEME, getNodeVisual } from '../data/theme';

interface HoverTooltipProps {
  node: SpellwebNode;
}

export function HoverTooltip({ node }: HoverTooltipProps) {
  const visual = getNodeVisual(node);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        background: `${THEME.panelBg}f0`,
        borderRadius: 6,
        border: `1px solid ${visual.stroke}40`,
        padding: "10px 16px",
        zIndex: 90,
        maxWidth: 400,
        textAlign: "center",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: visual.stroke,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
        }}
      >
        {node.emoji && <span style={{ marginRight: 6 }}>{node.emoji}</span>}
        {node.label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: THEME.textDim,
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        {node.desc?.slice(0, 120)}
        {node.desc && node.desc.length > 120 ? "…" : ""}
      </div>
    </div>
  );
}
