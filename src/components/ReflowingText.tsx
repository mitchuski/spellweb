/**
 * ReflowingText - Text that flows around moving orbs using Pretext
 *
 * This component demonstrates the core magic of Pretext integration:
 * - Text reflows in real-time as orbs move
 * - Zero DOM reflow - all measurement via canvas
 * - Variable line widths based on orb positions
 * - Privacy-preserving: surveillance JS sees nothing
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { usePretext, layoutNextLine, type PreparedText, type LayoutLine } from '../hooks/usePretext';

interface OrbPosition {
  x: number;
  y: number;
  radius: number;
}

interface ReflowingTextProps {
  text: string;
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  width: number;
  height: number;
  swordsmanOrb?: OrbPosition;
  mageOrb?: OrbPosition;
  padding?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Calculate available width for text at a given Y position,
 * accounting for one or two circular obstacles (orbs)
 */
function calculateAvailableWidth(
  y: number,
  lineHeight: number,
  containerWidth: number,
  orbs: OrbPosition[],
  padding: number
): { width: number; offsetX: number } {
  let availableLeft = 0;
  let availableRight = containerWidth;

  const lineTop = y;
  const lineBottom = y + lineHeight;
  const lineCenter = y + lineHeight / 2;

  for (const orb of orbs) {
    // Check if this line intersects with the orb vertically
    const orbTop = orb.y - orb.radius - padding;
    const orbBottom = orb.y + orb.radius + padding;

    if (lineBottom < orbTop || lineTop > orbBottom) {
      continue; // No intersection
    }

    // Calculate horizontal extent of orb at this Y level
    const dy = Math.abs(lineCenter - orb.y);
    const effectiveRadius = orb.radius + padding;

    if (dy >= effectiveRadius) {
      continue; // Line center is outside orb's vertical extent
    }

    // Calculate horizontal intersection using circle equation
    const dx = Math.sqrt(effectiveRadius * effectiveRadius - dy * dy);
    const orbLeft = orb.x - dx;
    const orbRight = orb.x + dx;

    // Determine which side has more space
    if (orbLeft <= availableLeft && orbRight < availableRight) {
      // Orb is on the left, push text right
      availableLeft = Math.max(availableLeft, orbRight);
    } else if (orbRight >= availableRight && orbLeft > availableLeft) {
      // Orb is on the right, constrain text to left
      availableRight = Math.min(availableRight, orbLeft);
    } else if (orbLeft > availableLeft && orbRight < availableRight) {
      // Orb is in the middle - pick the wider side
      const leftSpace = orbLeft - availableLeft;
      const rightSpace = availableRight - orbRight;
      if (leftSpace >= rightSpace) {
        availableRight = orbLeft;
      } else {
        availableLeft = orbRight;
      }
    }
  }

  return {
    width: Math.max(0, availableRight - availableLeft),
    offsetX: availableLeft,
  };
}

/**
 * Layout text with variable widths around orbs
 * This is the key algorithm that uses Pretext's layoutNextLine
 */
function layoutTextAroundOrbs(
  prepared: PreparedText,
  containerWidth: number,
  containerHeight: number,
  lineHeight: number,
  orbs: OrbPosition[],
  padding: number
): Array<LayoutLine & { offsetX: number; y: number }> {
  const lines: Array<LayoutLine & { offsetX: number; y: number }> = [];
  let cursor = 0;
  let y = 0;

  while (cursor < prepared.segments.length && y < containerHeight) {
    const { width: availableWidth, offsetX } = calculateAvailableWidth(
      y, lineHeight, containerWidth, orbs, padding
    );

    if (availableWidth < 20) {
      // Not enough space, skip this line
      y += lineHeight;
      continue;
    }

    const line = layoutNextLine(prepared, cursor, availableWidth);
    if (!line) break;

    lines.push({
      ...line,
      offsetX,
      y,
    });

    cursor = line.endIndex;
    y += lineHeight;
  }

  return lines;
}

export function ReflowingText({
  text,
  font = '"JetBrains Mono", monospace',
  fontSize = 14,
  lineHeight: lineHeightProp,
  color = '#c0c0d0',
  width,
  height,
  swordsmanOrb,
  mageOrb,
  padding = 12,
  className,
  style,
}: ReflowingTextProps) {
  const pretext = usePretext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Array<LayoutLine & { offsetX: number; y: number }>>([]);

  const fullFont = `${fontSize}px ${font}`;
  const lineHeight = lineHeightProp || fontSize * 1.5;

  // Prepare text once
  const prepared = useMemo(() => {
    return pretext.prepare(text, fullFont);
  }, [text, fullFont, pretext]);

  // Collect active orbs
  const orbs = useMemo(() => {
    const result: OrbPosition[] = [];
    if (swordsmanOrb && swordsmanOrb.radius > 0) result.push(swordsmanOrb);
    if (mageOrb && mageOrb.radius > 0) result.push(mageOrb);
    return result;
  }, [swordsmanOrb, mageOrb]);

  // Re-layout when orbs move
  useEffect(() => {
    const newLines = layoutTextAroundOrbs(
      prepared,
      width,
      height,
      lineHeight,
      orbs,
      padding
    );
    setLines(newLines);
  }, [prepared, width, height, lineHeight, orbs, padding]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        ...style,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: line.offsetX,
            top: line.y,
            width: line.width,
            height: lineHeight,
            font: fullFont,
            color,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'left 0.15s ease-out, width 0.15s ease-out',
          }}
        >
          {line.text.trim()}
        </div>
      ))}
    </div>
  );
}

/**
 * Canvas-based version for smoother animation
 * Uses pure canvas rendering - even more privacy-preserving
 */
export function ReflowingTextCanvas({
  text,
  font = '"JetBrains Mono", monospace',
  fontSize = 14,
  lineHeight: lineHeightProp,
  color = '#c0c0d0',
  width,
  height,
  swordsmanOrb,
  mageOrb,
  padding = 12,
  className,
  style,
}: ReflowingTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pretext = usePretext();
  const animationRef = useRef<number>(0);

  const fullFont = `${fontSize}px ${font}`;
  const lineHeight = lineHeightProp || fontSize * 1.5;

  // Prepare text once
  const prepared = useMemo(() => {
    return pretext.prepare(text, fullFont);
  }, [text, fullFont, pretext]);

  // Collect active orbs
  const orbs = useMemo(() => {
    const result: OrbPosition[] = [];
    if (swordsmanOrb && swordsmanOrb.radius > 0) result.push(swordsmanOrb);
    if (mageOrb && mageOrb.radius > 0) result.push(mageOrb);
    return result;
  }, [swordsmanOrb, mageOrb]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Layout and render text
      const lines = layoutTextAroundOrbs(
        prepared,
        width,
        height,
        lineHeight,
        orbs,
        padding
      );

      ctx.font = fullFont;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      lines.forEach(line => {
        ctx.fillText(line.text.trim(), line.offsetX, line.y);
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [prepared, width, height, lineHeight, orbs, padding, fullFont, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        ...style,
      }}
    />
  );
}

export default ReflowingText;
