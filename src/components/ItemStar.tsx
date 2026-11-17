import { useEffect, useRef, useState } from 'react';
import type { SpellwebNode } from '../types/graph';
import { drawManifold } from '../lib/starDraw';
import { useStarGeometry } from '../lib/starLoadout';
import { useStarAppearance } from '../lib/starAppearance';

/**
 * Items on the Privacy Star (2026-11-17, Mitch: "add a star visualisation the way it exists on the agentprivacy /stars
 * … and then when you do the insert of the artefact it lights up"). The 64 vertices sit where agentprivacy.ai/stars puts
 * them — house corner CV(v>>3) plus 0.3·CV(v&7) — inside the stella octangula and its manifold, in the City Key's colours.
 * Every artefact's place is already set on the star as an empty socket (a dashed ring, a ghost of its emoji); bringing
 * it back (witnessed or forged) fills the place: it turns solid and glows, and flares the moment it is filled. Drag to turn, wheel to zoom, click a vertex to open it in the drawer.
 */
const CV = (k: number) => [(k & 4 ? 1 : -1), (k & 2 ? 1 : -1), (k & 1 ? 1 : -1)];
const STATES: number[][] = []; for (let v = 0; v < 64; v++) { const H = CV(v >> 3), S = CV(v & 7); STATES.push([0, 1, 2].map(i => H[i] + S[i] * 0.3)); }
const Q6: [number, number][] = []; for (let a = 0; a < 64; a++) for (let b = 0; b < 6; b++) { const c = a ^ (1 << b); if (c > a) Q6.push([a, c]); }
const DEF = { cool: '#141a3d', warm: '#f0eee8', sword: '#e8523a', mage: '#4dd9e8' };
const hexA = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

export default function ItemStar({ inhabitants, provenSet, equipped, activeVertex, pinnedVertex, onHover, onPick }: {
  inhabitants: Map<number, SpellwebNode[]>; provenSet: Set<string>; equipped: Set<string>;
  activeVertex: number | null; pinnedVertex: number | null;
  onHover: (v: number | null) => void; onPick: (node: SpellwebNode) => void;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const geometry = useStarGeometry(), appearance = useStarAppearance();
  const data = useRef({ inhabitants, provenSet, equipped, activeVertex, pinnedVertex, geometry, palette: { ...DEF, ...(appearance?.palette ?? {}) } });
  data.current = { inhabitants, provenSet, equipped, activeVertex, pinnedVertex, geometry, palette: { ...DEF, ...(appearance?.palette ?? {}) } };
  const flares = useRef(new Map<string, number>());     // artefact id → when it was brought back
  const seen = useRef<Set<string> | null>(null);
  const [paused, setPaused] = useState(false); const pausedRef = useRef(false); pausedRef.current = paused;
  const zoom = useRef(1);

  // a vertex whose artefact was just brought back flares
  useEffect(() => {
    const lit = new Set<string>(); inhabitants.forEach(ns => { for (const n of ns) if (provenSet.has(n.id)) lit.add(n.id); });
    if (seen.current) for (const id of lit) if (!seen.current.has(id)) flares.current.set(id, performance.now());
    seen.current = lit;
  }, [inhabitants, provenSet]);

  useEffect(() => {
    const c = cv.current; if (!c) return; const g = c.getContext('2d'); if (!g) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, yaw = 0.6, tilt = 0.45, vy = still ? 0 : 0.00018, last = performance.now();
    let drag: { x: number; y: number; moved: boolean } | null = null;
    let pts: { v: number; i: number; x: number; y: number }[] = [];
    const nearest = (e: PointerEvent) => { const r = c.getBoundingClientRect(), D = window.devicePixelRatio || 1, mx = (e.clientX - r.left) * D, my = (e.clientY - r.top) * D;
      let best: { v: number; i: number } | null = null, bd = 18 * D; for (const p of pts) { const d = Math.hypot(p.x - mx, p.y - my); if (d < bd) { bd = d; best = p; } } return best; };
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, moved: false }; c.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; yaw += dx * 0.006; tilt = Math.max(-1.2, Math.min(1.2, tilt + dy * 0.006)); drag.x = e.clientX; drag.y = e.clientY; return; }
      const h = nearest(e), on = h != null && data.current.inhabitants.has(h.v); onHoverRef.current(on ? h!.v : null); c.style.cursor = on ? 'pointer' : 'grab';
    };
    const up = (e: PointerEvent) => {
      const was = drag; drag = null; if (!was || was.moved) return;
      const h = nearest(e); const ns = h != null ? data.current.inhabitants.get(h.v) : undefined; if (ns?.length) onPickRef.current(ns[Math.max(0, h!.i)] ?? ns[0]);
    };
    const wheel = (e: WheelEvent) => { e.preventDefault(); zoom.current = Math.max(0.6, Math.min(2.6, zoom.current * Math.exp(-e.deltaY * 0.0015))); };
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up);
    c.addEventListener('pointerleave', () => onHoverRef.current(null)); c.addEventListener('wheel', wheel, { passive: false });

    const frame = (t: number) => {
      const D = window.devicePixelRatio || 1, W = c.clientWidth * D, H = c.clientHeight * D;
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      const dt = Math.min(50, t - last); last = t;
      if (!drag && !pausedRef.current && data.current.pinnedVertex == null) yaw += vy * dt;
      const { inhabitants: inh, provenSet: prov, equipped: eq, activeVertex: av, pinnedVertex: pv, geometry: geo, palette: L } = data.current;
      const R = Math.min(W, H) * 0.24 * zoom.current;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
      const proj = (p: number[]) => { const x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy, y = p[1] * ct - z * st; return { x: W / 2 + x * R, y: H / 2 + y * R, z: p[1] * st + z * ct }; };
      g.clearRect(0, 0, W, H);
      // the manifold and the stella octangula, turning with the view (same yaw; tilt folded into the shared projector)
      drawManifold(g, W / 2, H / 2, R * 1.95, -yaw, { eps: geo.eps, m: geo.m, n: geo.n }, L.mage, 0.18, 9, p => proj([p[0] * 1.95, p[1] * 1.95, p[2] * 1.95]));
      // the Q6 lattice: vertices one bit apart
      g.lineWidth = 0.6 * D; g.strokeStyle = hexA(L.warm, 0.08); g.beginPath();
      for (const [a, b] of Q6) { const p = proj(STATES[a]), q = proj(STATES[b]); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); } g.stroke();
      // the two tetrahedra on the cube's corners
      const corner = (k: number) => proj(CV(k));
      const tet = (ks: number[], col: string) => { g.strokeStyle = hexA(col, 0.55); g.lineWidth = 1.2 * D; g.beginPath(); for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const p = corner(ks[i]), q = corner(ks[j]); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); } g.stroke(); };
      tet([0, 3, 5, 6], L.sword); tet([1, 2, 4, 7], L.mage);
      // vertices
      pts = [];
      const order = STATES.map((s, v) => ({ v, q: proj(s) })).sort((a, b) => a.q.z - b.q.z);
      for (const { v, q } of order) {
        const ns = inh.get(v), depth = 0.55 + 0.45 * ((q.z + 2) / 4);
        if (!ns?.length) { pts.push({ v, i: -1, x: q.x, y: q.y }); g.fillStyle = hexA(L.warm, 0.18 * depth); g.beginPath(); g.arc(q.x, q.y, 1.6 * D, 0, Math.PI * 2); g.fill(); continue; }
        const focused = v === av || v === pv, many = ns.length > 1;
        // 2026-11-17 (Mitch chose "a small cluster"): artefacts sharing a vertex petal around it, each its own socket
        const spread = many ? (focused ? 22 : 12) * D : 0;
        if (many) { g.fillStyle = hexA(L.warm, 0.5 * depth); g.beginPath(); g.arc(q.x, q.y, 1.8 * D, 0, Math.PI * 2); g.fill(); }
        ns.forEach((n, i) => {
          const ang = -Math.PI / 2 + (2 * Math.PI * i) / ns.length;
          const x = q.x + Math.cos(ang) * spread, y = q.y + Math.sin(ang) * spread;
          pts.push({ v, i, x, y });
          const proven = prov.has(n.id), worn = eq.has(n.id), size = many && !focused ? 0.72 : 1;
          const fl = flares.current.get(n.id), age = fl ? (t - fl) / 1800 : 1;
          if (proven) { const r = (16 * size + (age < 1 ? 40 * (1 - age) : 0)) * D, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA('#ffd700', age < 1 ? 0.75 : 0.42)); gr.addColorStop(1, hexA('#ffd700', 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
          if (age < 1) { g.strokeStyle = hexA('#ffd700', 1 - age); g.lineWidth = 2 * D; g.beginPath(); g.arc(x, y, (8 + 46 * age) * D, 0, Math.PI * 2); g.stroke(); }
          else if (fl) flares.current.delete(n.id);
          if (!proven) {  // an empty socket: its place is set, waiting for you to fill it
            g.setLineDash([2.5 * D, 3 * D]); g.strokeStyle = hexA(L.warm, 0.45 * depth); g.lineWidth = 1.1 * D;
            g.beginPath(); g.arc(x, y, 10 * size * D, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
          }
          g.globalAlpha = (proven ? 1 : 0.22) * depth;
          g.font = `${(proven ? 17 : 12) * size * D}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(n.emoji ?? '◆', x, y);
          g.globalAlpha = 1;
          if (worn) { g.strokeStyle = hexA(L.mage, 0.9); g.lineWidth = 1.4 * D; g.beginPath(); g.arc(x, y, 13 * size * D, 0, Math.PI * 2); g.stroke(); }
        });
        if (focused) {
          g.strokeStyle = hexA(L.warm, 0.6); g.lineWidth = 1.2 * D; g.beginPath(); g.arc(q.x, q.y, spread + 16 * D, 0, Math.PI * 2); g.stroke();
          g.font = `${11 * D}px ui-monospace, monospace`; g.fillStyle = hexA(L.warm, 0.95); g.textAlign = 'center';
          const label = many ? `V${v} · ${ns.length} artefacts · ${ns.filter(n => prov.has(n.id)).length} filled` : `${ns[0].artefactName ?? ns[0].label} · V${v}`;
          g.fillText(label, q.x, q.y + spread + 28 * D);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('wheel', wheel); };
  }, []);
  const onHoverRef = useRef(onHover); onHoverRef.current = onHover;
  const onPickRef = useRef(onPick); onPickRef.current = onPick;

  let total = 0, lit = 0; inhabitants.forEach(ns => { total += ns.length; lit += ns.filter(n => provenSet.has(n.id)).length; });
  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 420 }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
        role="img" aria-label={`Your artefacts on the Privacy Star: ${lit} of ${total} places filled`} />
      <div style={{ position: 'absolute', left: 4, top: 0, fontSize: 11, color: '#a6b8c6', fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none' }}>
        <span style={{ color: '#ffd700' }}>{lit}</span> of {total} places filled · bring an artefact back to light its place
      </div>
      <div style={{ position: 'absolute', right: 4, top: 0, display: 'flex', gap: 6 }}>
        <button onClick={() => setPaused(p => !p)} style={{ background: 'rgba(11,21,35,.85)', border: '1px solid rgba(255,255,255,.2)', color: '#a6b8c6', borderRadius: 999, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>{paused ? '▶ turn' : '❚❚ stop'}</button>
        <button onClick={() => { zoom.current = Math.max(0.6, zoom.current / 1.25); }} aria-label="Zoom out" style={{ background: 'rgba(11,21,35,.85)', border: '1px solid rgba(255,255,255,.2)', color: '#a6b8c6', borderRadius: 999, width: 28, fontSize: 12, cursor: 'pointer' }}>−</button>
        <button onClick={() => { zoom.current = Math.min(2.6, zoom.current * 1.25); }} aria-label="Zoom in" style={{ background: 'rgba(11,21,35,.85)', border: '1px solid rgba(255,255,255,.2)', color: '#a6b8c6', borderRadius: 999, width: 28, fontSize: 12, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
}
