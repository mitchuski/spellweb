/**
 * The Privacy Star, drawn on a canvas (2026-11-17, Mitch: the City Key image and the star between the orbs).
 * One figure across the universe: the stella octangula (the Swordsman's tetrahedron in the sword colour, the Mage's in
 * the mage colour) inside its manifold shell, whose ripple ε·sin(mφ)·cos(nθ) is the key's own shape — as on
 * agentprivacy.ai/stars and soulbis /star. Used by the Key tab (KeyStar) and between the wandering orbs.
 */
import type { StarGeometry } from './starLoadout';

type V3 = readonly [number, number, number];
const TET_A: ReadonlyArray<V3> = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
const TET_B: ReadonlyArray<V3> = TET_A.map(([x, y, z]) => [-x, -y, -z] as const);
const TET_EDGES: ReadonlyArray<readonly [number, number]> = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const hex = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');

/** A view: turn about the vertical axis by `angle`, then fixed tilt and roll that keep the figure off its degenerate views. */
export function projector(cx: number, cy: number, scale: number, angle: number, tilt = 0.62, roll = 0.31) {
  const cA = Math.cos(angle), sA = Math.sin(angle), cT = Math.cos(tilt), sT = Math.sin(tilt), cR = Math.cos(roll), sR = Math.sin(roll);
  return ([x, y, z]: V3) => {
    const X1 = x * cA + z * sA, Z1 = -x * sA + z * cA;
    const Y2 = y * cT - Z1 * sT, Z2 = y * sT + Z1 * cT;
    const X3 = X1 * cR - Y2 * sR, Y3 = X1 * sR + Y2 * cR;
    return { x: cx + X3 * scale, y: cy + Y3 * scale * 0.92, z: Z2 };
  };
}

/** The stella octangula, its vertices at radius `size`. Nearer edges are brighter and heavier. */
export function drawStellaOctangula(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, angle: number, swordColor: string, mageColor: string, weight = 1) {
  const s = size / Math.sqrt(3);
  const P = projector(cx, cy, s, angle);
  const draw = (tet: ReadonlyArray<V3>, color: string) => {
    const pts = tet.map(P);
    for (const [i, j] of TET_EDGES) {
      const p = pts[i], q = pts[j], d = ((p.z + q.z) / 2 + Math.sqrt(3)) / (2 * Math.sqrt(3));
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = color + hex(70 + 150 * d);
      ctx.lineWidth = (0.7 + 0.9 * d) * weight;
      ctx.stroke();
    }
  };
  draw(TET_A, swordColor);
  draw(TET_B, mageColor);
}

/** The manifold shell: a few latitude rings of r = R·(1 + e·sin(mφ)·cos(nθ)), turning with the star. */
export function drawManifold(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, angle: number, g: Pick<StarGeometry, 'eps' | 'm' | 'n'>, color: string, alpha = 0.22, rings = 7,
  view?: (p: V3) => { x: number; y: number }) {
  // `view` (optional): the caller's own projection of a unit-shell point, so the ripples turn with a draggable view
  const P = view ?? projector(cx, cy, R, angle);
  const e = g.eps * 0.3;
  ctx.lineWidth = 0.8;
  for (let k = 1; k <= rings; k++) {
    const phi = (Math.PI * k) / (rings + 1);
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {
      const th = (2 * Math.PI * i) / 72;
      const r = 1 + e * Math.sin(g.m * phi) * Math.cos(g.n * th);
      const q = P([r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)]);
      if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
    }
    // rings facing the viewer read a little brighter
    ctx.strokeStyle = color + hex(255 * alpha * (0.6 + 0.4 * Math.sin(phi)));
    ctx.stroke();
  }
}
