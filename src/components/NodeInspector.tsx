import type { SpellwebNode, SpellwebEdge, ConnectedNode, EdgeType, NodeDimensions } from '../types/graph';
import { computeHexagramInfo } from '../types/graph';
import { THEME, getNodeVisual, getEdgeStyle } from '../data/theme';
import { NODES } from '../data/nodes';

interface NodeInspectorProps {
  node: SpellwebNode;
  edges: SpellwebEdge[];
  onClose: () => void;
  onNavigate: (node: SpellwebNode) => void;
  // Action callbacks
  onAddToPath?: () => void;
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

export function NodeInspector({
  node, edges, onClose, onNavigate, onAddToPath,
  isWaypointActive, isInPath,
}: NodeInspectorProps) {
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
      className="side-panel"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 420,
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
          padding: "20px 24px",
          borderBottom: `1px solid ${THEME.panelBorder}`,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: THEME.text,
            margin: 0,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {node.desc}
        </p>

        {/* Proverb - for acts with grimoire data */}
        {node.proverb && (
          <div style={{ marginTop: 18 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 2,
                color: THEME.textDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              PROVERB
            </span>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "#ffd700",
                margin: "8px 0 0",
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
          <div style={{ marginTop: 14 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 2,
                color: THEME.textDim,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              EMOJI SPELL
            </span>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.8,
                color: THEME.text,
                margin: "8px 0 0",
                fontFamily: "sans-serif",
                whiteSpace: "pre-wrap",
              }}
            >
              {node.emojiSpell}
            </p>
          </div>
        )}

        {/* Hexagram - for nodes with dimensions */}
        {node.dimensions && (() => {
          const hexInfo = computeHexagramInfo(node.dimensions);
          const dimLabels = ['d1Hide', 'd2Commit', 'd3Prove', 'd4Connect', 'd5Reflect', 'd6Delegate'];
          const dimNames = ['Key Custody', 'Disclosure', 'Delegation', 'Data Residency', 'Interaction', 'Trust Boundary'];
          const tierColor = hexInfo.layer >= 5 ? '#ffd700' : hexInfo.layer >= 3 ? '#c0c0c0' : '#87ceeb';

          return (
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: THEME.textDim,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                HEXAGRAM · BLADE {hexInfo.bladeId} · LAYER {hexInfo.layer}
              </span>
              <div style={{
                marginTop: 8,
                padding: 12,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 8,
                border: `1px solid ${tierColor}40`,
              }}>
                {/* Hexagram lines (reversed for visual: line 6 at top) */}
                {[...hexInfo.lines].reverse().map((line, i) => {
                  const actualIndex = 5 - i;
                  const dimValue = (node.dimensions as NodeDimensions)[dimLabels[actualIndex] as keyof NodeDimensions];
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: i < 5 ? 4 : 0,
                    }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: 14,
                        color: line ? tierColor : '#666',
                        letterSpacing: 2,
                      }}>
                        {line ? '━━━' : '━ ━'}
                      </span>
                      <span style={{
                        fontSize: 9,
                        color: line ? tierColor : '#666',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {dimNames[actualIndex]} ({(dimValue * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}

                {/* Layer info */}
                <div style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${tierColor}30`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: 11,
                    color: tierColor,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 'bold',
                  }}>
                    {hexInfo.layerName}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: '#888',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {hexInfo.yangCount}/6 yang
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

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

      <div style={{ padding: "20px 24px", flex: 1, overflow: "auto" }}>
        <span
          style={{
            fontSize: 12,
            letterSpacing: 2,
            color: THEME.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          CONNECTIONS ({connected.length})
        </span>
        <div style={{ marginTop: 12 }}>
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
                  gap: 10,
                  padding: "10px 12px",
                  marginBottom: 6,
                  borderRadius: 6,
                  cursor: "pointer",
                  background: "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff08")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 10, color: edgeStyle.color }}>
                  {c.direction === "out" ? "→" : "←"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: edgeStyle.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 90,
                  }}
                >
                  {c.type}
                </span>
                <span style={{ fontSize: 14, color: cv.stroke }}>{cv.icon}</span>
                <span style={{ fontSize: 14, color: THEME.text, flex: 1 }}>
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
