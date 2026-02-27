import type { SpellwebNode, SpellwebEdge, ConnectedNode, EdgeType } from '../types/graph';
import { THEME, getNodeVisual, getEdgeStyle } from '../data/theme';
import { NODES } from '../data/nodes';

interface NodeInspectorProps {
  node: SpellwebNode;
  edges: SpellwebEdge[];
  onClose: () => void;
  onNavigate: (node: SpellwebNode) => void;
  // Action callbacks
  onCastSpell?: () => void;
  onConnect?: () => void;
  onAddToPath?: () => void;
  isInConstellation?: boolean;
  isWaypointActive?: boolean;
  isInPath?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  document: "DOCUMENT",
  concept: "CONCEPT",
  theorem: "THEOREM",
  spell: "SPELL",
  act: "NARRATIVE ACT",
  persona: "PERSONA",
  term: "GLOSSARY TERM",
};

export function NodeInspector({ node, edges, onClose, onNavigate, onCastSpell, onConnect, onAddToPath, isInConstellation, isWaypointActive, isInPath }: NodeInspectorProps) {
  const visual = getNodeVisual(node);

  const connected: ConnectedNode[] = edges
    .filter((e) => {
      const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
      const targetId = typeof e.target === 'string' ? e.target : e.target.id;
      return sourceId === node.id || targetId === node.id;
    })
    .map((e) => {
      const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
      const targetId = typeof e.target === 'string' ? e.target : e.target.id;
      const connectedId = sourceId === node.id ? targetId : sourceId;
      const connectedNode = NODES.find((n) => n.id === connectedId);
      return {
        node: connectedNode || { id: connectedId, label: connectedId, type: 'term', domain: 'shared', layer: 'knowledge', desc: '' } as SpellwebNode,
        type: e.type as EdgeType,
        direction: (sourceId === node.id ? 'out' : 'in') as 'in' | 'out',
      };
    });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 380,
        height: "100%",
        background: THEME.panelBg,
        borderLeft: `1px solid ${THEME.panelBorder}`,
        overflow: "auto",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: THEME.textDim,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {TYPE_LABELS[node.type] || node.type.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: THEME.textDim,
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
        <h2
          style={{
            margin: "8px 0 4px",
            fontSize: 20,
            color: THEME.textBright,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
          }}
        >
          {node.emoji && <span style={{ marginRight: 8 }}>{node.emoji}</span>}
          {node.label}
        </h2>
        {node.version && (
          <span
            style={{
              fontSize: 11,
              color: visual.stroke,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            v{node.version}
          </span>
        )}
        <div
          style={{
            display: "inline-block",
            marginLeft: node.version ? 8 : 0,
            padding: "2px 8px",
            borderRadius: 3,
            fontSize: 10,
            letterSpacing: 1,
            background: visual.fill,
            border: `1px solid ${visual.stroke}`,
            color: visual.stroke,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {node.domain}
        </div>
      </div>

      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${THEME.panelBorder}`,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: THEME.text,
            margin: 0,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {node.desc}
        </p>

        {/* Proverb - for acts with grimoire data */}
        {node.proverb && (
          <div style={{ marginTop: 16 }}>
            <span
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: THEME.textDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              PROVERB
            </span>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "#ffd700",
                margin: "6px 0 0",
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
              }}
            >
              "{node.proverb}"
            </p>
          </div>
        )}

        {/* Emoji Spell - for acts with grimoire data */}
        {node.emojiSpell && (
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: THEME.textDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              EMOJI SPELL
            </span>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: THEME.text,
                margin: "6px 0 0",
                fontFamily: "sans-serif",
                whiteSpace: "pre-wrap",
              }}
            >
              {node.emojiSpell}
            </p>
          </div>
        )}

        {/* Match Score - for inscribed acts */}
        {node.matchScore !== undefined && (
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: THEME.textDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              MATCH SCORE
            </span>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: "#ffffff15",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${node.matchScore * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, #7b68ee, #ffd700)`,
                    borderRadius: 2,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: THEME.text,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {(node.matchScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add to Path Button - Shows during waypoint mode */}
      {isWaypointActive && onAddToPath && (
        <div
          style={{
            padding: "12px 20px",
            borderBottom: `1px solid ${THEME.panelBorder}`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onAddToPath}
            disabled={isInPath}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 6,
              background: isInPath
                ? `#00d9ff20`
                : `linear-gradient(135deg, #00d9ff30, #7b68ee30)`,
              border: `1px solid ${isInPath ? '#00d9ff50' : '#00d9ff'}`,
              color: isInPath ? '#00d9ff80' : '#00d9ff',
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: isInPath ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontWeight: 600,
            }}
          >
            <span>{isInPath ? '✓' : '📍'}</span>
            {isInPath ? 'In Path' : 'Add to Path'}
          </button>
        </div>
      )}

      {/* Connect Button - Always visible, for drawing edges */}
      {onConnect && !isWaypointActive && (
        <div
          style={{
            padding: "12px 20px",
            borderBottom: `1px solid ${THEME.panelBorder}`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onConnect}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 6,
              background: `linear-gradient(135deg, #2ecc7120, #27ae6020)`,
              border: `1px solid #2ecc71`,
              color: '#2ecc71',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontWeight: 500,
            }}
          >
            <span>🔗</span>
            Connect
          </button>
        </div>
      )}

      {/* Add to Constellation Button - For waypoint magic */}
      {onCastSpell && !isWaypointActive && (
        <div
          style={{
            padding: "0 20px 12px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onCastSpell}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 6,
              background: isInConstellation
                ? `linear-gradient(135deg, #7b68ee30, #ffd70030)`
                : `linear-gradient(135deg, #7b68ee20, #ffd70020)`,
              border: `1px solid ${isInConstellation ? '#ffd700' : '#7b68ee'}`,
              color: isInConstellation ? '#ffd700' : '#7b68ee',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontWeight: 500,
            }}
          >
            <span>✨</span>
            {isInConstellation ? 'In Constellation' : 'Add to Constellation'}
          </button>
        </div>
      )}

      <div style={{ padding: "16px 20px", flex: 1, overflow: "auto" }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: THEME.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          CONNECTIONS ({connected.length})
        </span>
        <div style={{ marginTop: 10 }}>
          {connected.map((c, i) => {
            const cv = getNodeVisual(c.node);
            const edgeStyle = getEdgeStyle(c.type);
            return (
              <div
                key={i}
                onClick={() => onNavigate(c.node)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  marginBottom: 4,
                  borderRadius: 4,
                  cursor: "pointer",
                  background: "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff08")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 8, color: edgeStyle.color }}>
                  {c.direction === "out" ? "→" : "←"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: edgeStyle.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 80,
                  }}
                >
                  {c.type}
                </span>
                <span style={{ fontSize: 12, color: cv.stroke }}>{cv.icon}</span>
                <span style={{ fontSize: 12, color: THEME.text, flex: 1 }}>
                  {c.node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
