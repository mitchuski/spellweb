import { ReactNode } from 'react';
import { THEME } from '../data/theme';

/**
 * Right-anchored side-panel shell. Standardises Mage / Swords / Items real estate
 * so each pane has the same chrome (header + close), the same width, and the same
 * z-stacking. The forge ceremony popup remains centred — only the inventory /
 * identity / spell surfaces use this.
 */
export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Tiny eyebrow text above the title, e.g. "CITY OF MAGES · INVENTORY". */
  eyebrow?: string;
  /** Right-side accent color (border + eyebrow). Defaults to gold. */
  accent?: string;
  /** Optional right-aligned header content (e.g. counters, status pill). */
  headerRight?: ReactNode;
  /** Optional fixed pre-tabs section (e.g. primary CTA above tabs). */
  preTabs?: ReactNode;
  /** Optional sticky tabs strip. */
  tabs?: ReactNode;
  /** Scrolling body. */
  children: ReactNode;
  /** Width in px (default 480). */
  width?: number;
}

export default function SidePanel({
  isOpen,
  onClose,
  title,
  eyebrow,
  accent = '#d4af37',
  headerRight,
  preTabs,
  tabs,
  children,
  width = 480,
}: SidePanelProps) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width,
        height: '100%',
        background: THEME.panelBg,
        borderLeft: `1px solid ${accent}55`,
        zIndex: 110,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: `-12px 0 32px rgba(0,0,0,0.4)`,
      }}
    >
      <div
        style={{
          padding: '20px 20px 12px',
          flexShrink: 0,
          borderBottom: `1px solid ${THEME.panelBorder}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {eyebrow && (
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: accent,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                {eyebrow}
              </div>
            )}
            <h2
              style={{
                margin: '6px 0 0',
                fontSize: 22,
                color: THEME.textBright,
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
              }}
            >
              {title}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {headerRight}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: THEME.textDim,
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
                padding: '0 4px',
              }}
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {preTabs && (
        <div style={{ flexShrink: 0, borderBottom: `1px solid ${THEME.panelBorder}` }}>{preTabs}</div>
      )}
      {tabs && (
        <div
          style={{
            display: 'flex',
            flexShrink: 0,
            borderBottom: `1px solid ${THEME.panelBorder}`,
            overflowX: 'auto',
          }}
        >
          {tabs}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{children}</div>
    </div>
  );
}
