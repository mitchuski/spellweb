import { useEffect, useRef } from 'react';
import { drawManifold, drawStellaOctangula } from '../lib/starDraw';
import { useStarGeometry } from '../lib/starLoadout';
import type { StarPalette } from '../lib/starAppearance';

/**
 * The City Key's image in the Key tab (2026-11-17, Mitch chose "the live Privacy Star, small"): the star in its
 * manifold, in the key's colours and shape, slowly turning; the key's name and κ fingerprint beneath.
 */
export default function KeyStar({ palette, name, kappa }: { palette: StarPalette; name?: string; kappa?: string | null }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const geometry = useStarGeometry();
  const look = useRef({ palette, geometry }); look.current = { palette, geometry };
  useEffect(() => {
    const c = cv.current; if (!c) return; const g = c.getContext('2d'); if (!g) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, a = 0.6, last = performance.now();
    const frame = (t: number) => {
      const D = window.devicePixelRatio || 1, W = c.clientWidth * D, H = c.clientHeight * D;
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      if (!still) a += (t - last) * 0.00025; last = t;
      const { palette: p, geometry: s } = look.current, R = Math.min(W, H) * 0.42;
      g.clearRect(0, 0, W, H);
      const glow = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.1);
      glow.addColorStop(0, (p.warm ?? '#f0eee8') + '22'); glow.addColorStop(1, (p.cool ?? '#141a3d') + '00');
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      drawManifold(g, W / 2, H / 2, R, a, s, p.mage ?? '#4dd9e8', 0.3);
      drawStellaOctangula(g, W / 2, H / 2, R * 0.78 * (s.core / 0.6), a, p.sword ?? '#e8523a', p.mage ?? '#4dd9e8', 1.6 * D);
      g.fillStyle = p.warm ?? '#f0eee8'; g.beginPath(); g.arc(W / 2, H / 2, 2.2 * D, 0, Math.PI * 2); g.fill();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  const k = kappa?.replace(/^sha256:/, '');
  return (
    <figure style={{ margin: '4px 0 10px', textAlign: 'center' }}>
      <canvas ref={cv} style={{ width: '100%', maxWidth: 240, aspectRatio: '1', display: 'block', margin: '0 auto' }}
        aria-label={`Your Privacy Star in your City Key's colours and shape${name ? ': ' + name : ''}`} role="img" />
      <figcaption style={{ fontSize: 11, color: '#a6b8c6', marginTop: 4 }}>
        {name ?? 'No key yet'}{k ? <> · <span style={{ fontFamily: 'ui-monospace, Consolas, monospace', letterSpacing: 0.5 }} title={kappa ?? ''}>κ {k.slice(0, 6)}…{k.slice(-4)}</span></> : null}
      </figcaption>
    </figure>
  );
}
