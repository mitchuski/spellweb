/**
 * The one side drawer (2026-11-17, Mitch: "lets reconsider the panel ux … cleaned significantly"; chose one drawer):
 * Key, Sword, Mage and Items open in the same place on the right, the graph stays visible on the left,
 * nothing floats over the middle. Every drawer tab shows this strip at its top.
 */
export type DrawerTab = 'key' | 'sword' | 'mage' | 'items';
export const DRAWER_W = 420;
export const HEADER_H = 56;

const TABS: { id: DrawerTab; glyph: string; label: string; color: string }[] = [
  { id: 'key', glyph: '🗝️', label: 'Key', color: '#ffd700' },
  { id: 'sword', glyph: '⚔️', label: 'Sword', color: '#e74c3c' },
  { id: 'mage', glyph: '🧙', label: 'Mage', color: '#9b59b6' },
  { id: 'items', glyph: '⚒️', label: 'Items', color: '#d4af37' },
];

export function openDrawer(tab: DrawerTab | null) {
  window.dispatchEvent(new CustomEvent('spellweb:drawer', { detail: tab }));
}

export default function DrawerTabs({ active, onPick, onClose }: { active: DrawerTab; onPick: (t: DrawerTab) => void; onClose: () => void }) {
  return (
    <nav aria-label="Drawer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(8,8,16,0.96)', position: 'sticky', top: 0, zIndex: 2 }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => onPick(t.id)} aria-pressed={active === t.id}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 6px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            background: active === t.id ? `${t.color}22` : 'transparent', border: `1px solid ${active === t.id ? t.color + 'aa' : 'transparent'}`, color: active === t.id ? t.color : '#8a8a9a' }}>
          <span aria-hidden="true">{t.glyph}</span>{t.label}
        </button>
      ))}
      <button onClick={onClose} aria-label="Close the drawer" title="Close (Esc)"
        style={{ marginLeft: 4, width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#8a8a9a', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
    </nav>
  );
}

/** The drawer's frame for tabs that do not have their own panel (Key). */
export function DrawerShell({ active, onPick, onClose, children }: { active: DrawerTab; onPick: (t: DrawerTab) => void; onClose: () => void; children: React.ReactNode }) {
  return (
    <aside aria-label={`${active} drawer`} style={{ position: 'fixed', top: HEADER_H, right: 0, bottom: 0, width: DRAWER_W, maxWidth: '100vw', background: 'rgba(10,10,20,0.98)', borderLeft: '1px solid rgba(255,255,255,0.1)', boxShadow: '-12px 0 32px rgba(0,0,0,0.4)', zIndex: 120, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DrawerTabs active={active} onPick={onPick} onClose={onClose} />
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </aside>
  );
}
