/**
 * usePretext - React hook for zero-reflow text measurement
 *
 * Integrates the Pretext library for privacy-preserving text layout.
 * All measurement happens via canvas - no DOM reflow, invisible to surveillance.
 */

import { useRef, useCallback, useMemo } from 'react';

// Pretext-style types (we'll inline the core logic since it's pure math)
export interface PreparedText {
  segments: string[];
  widths: number[];
  totalWidth: number;
  font: string;
}

export interface LayoutLine {
  text: string;
  width: number;
  startIndex: number;
  endIndex: number;
}

export interface LayoutResult {
  lines: LayoutLine[];
  height: number;
  lineCount: number;
}

// Canvas measurement cache
const measurementCache = new Map<string, number>();
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedContext: CanvasRenderingContext2D | null = null;

function getContext(font: string): CanvasRenderingContext2D {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedContext = sharedCanvas.getContext('2d');
  }
  if (sharedContext && sharedContext.font !== font) {
    sharedContext.font = font;
  }
  return sharedContext!;
}

function measureSegment(text: string, font: string): number {
  const cacheKey = `${font}|${text}`;
  let width = measurementCache.get(cacheKey);
  if (width === undefined) {
    const ctx = getContext(font);
    width = ctx.measureText(text).width;
    measurementCache.set(cacheKey, width);
  }
  return width;
}

/**
 * Prepare text for layout - segments and measures via canvas
 * Call once when text first appears (or changes)
 */
export function prepare(text: string, font: string): PreparedText {
  if (!text) {
    return { segments: [], widths: [], totalWidth: 0, font };
  }

  // Simple word segmentation (full Pretext uses Intl.Segmenter for i18n)
  const segments = text.split(/(\s+)/);
  const widths = segments.map(seg => measureSegment(seg, font));
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);

  return { segments, widths, totalWidth, font };
}

/**
 * Layout text at a given width - pure arithmetic, no DOM
 * Call on every resize or when layout area changes
 */
export function layout(prepared: PreparedText, maxWidth: number, lineHeight: number): LayoutResult {
  if (prepared.segments.length === 0) {
    return { lines: [], height: 0, lineCount: 0 };
  }

  const lines: LayoutLine[] = [];
  let currentLine: string[] = [];
  let currentWidth = 0;
  let startIndex = 0;

  for (let i = 0; i < prepared.segments.length; i++) {
    const segment = prepared.segments[i];
    const segWidth = prepared.widths[i];
    const isWhitespace = /^\s+$/.test(segment);

    // Would this segment overflow?
    if (currentWidth + segWidth > maxWidth && currentLine.length > 0) {
      // Finish current line (trailing whitespace hangs)
      lines.push({
        text: currentLine.join(''),
        width: currentWidth,
        startIndex,
        endIndex: i,
      });
      currentLine = [];
      currentWidth = 0;
      startIndex = i;

      // Skip leading whitespace on new line
      if (isWhitespace) continue;
    }

    currentLine.push(segment);
    if (!isWhitespace) {
      currentWidth += segWidth;
    }
  }

  // Final line
  if (currentLine.length > 0) {
    lines.push({
      text: currentLine.join(''),
      width: currentWidth,
      startIndex,
      endIndex: prepared.segments.length,
    });
  }

  return {
    lines,
    height: lines.length * lineHeight,
    lineCount: lines.length,
  };
}

/**
 * Layout single line with variable width - KEY for orb reflow!
 * Returns one line at a time, allowing different widths per line
 */
export function layoutNextLine(
  prepared: PreparedText,
  startIndex: number,
  maxWidth: number
): LayoutLine | null {
  if (startIndex >= prepared.segments.length) return null;

  let currentText = '';
  let currentWidth = 0;
  let i = startIndex;

  // Skip leading whitespace
  while (i < prepared.segments.length && /^\s+$/.test(prepared.segments[i])) {
    i++;
  }

  const lineStartIndex = i;

  for (; i < prepared.segments.length; i++) {
    const segment = prepared.segments[i];
    const segWidth = prepared.widths[i];
    const isWhitespace = /^\s+$/.test(segment);

    if (currentWidth + segWidth > maxWidth && currentText.length > 0) {
      break;
    }

    currentText += segment;
    if (!isWhitespace) {
      currentWidth += segWidth;
    }
  }

  if (currentText.length === 0) return null;

  return {
    text: currentText,
    width: currentWidth,
    startIndex: lineStartIndex,
    endIndex: i,
  };
}

/**
 * Calculate variable widths around a circular obstacle (orb)
 * Returns array of available widths per line
 */
export function calculateOrbReflowWidths(
  containerWidth: number,
  containerHeight: number,
  lineHeight: number,
  orbX: number,
  orbY: number,
  orbRadius: number,
  padding: number = 8
): number[] {
  const lineCount = Math.ceil(containerHeight / lineHeight);
  const widths: number[] = [];

  for (let i = 0; i < lineCount; i++) {
    const lineY = i * lineHeight + lineHeight / 2;
    const dy = lineY - orbY;

    // Is this line within the orb's vertical range?
    if (Math.abs(dy) < orbRadius + padding) {
      // Calculate horizontal intersection
      const dx = Math.sqrt(Math.max(0, (orbRadius + padding) ** 2 - dy ** 2));
      const orbLeft = orbX - dx;
      const orbRight = orbX + dx;

      // Text flows around the orb
      if (orbLeft > 0 && orbRight < containerWidth) {
        // Orb in middle - text wraps both sides (complex, simplify to one side)
        widths.push(Math.min(orbLeft, containerWidth - orbRight));
      } else if (orbLeft <= 0) {
        // Orb on left - text on right
        widths.push(containerWidth - orbRight);
      } else {
        // Orb on right - text on left
        widths.push(orbLeft);
      }
    } else {
      widths.push(containerWidth);
    }
  }

  return widths;
}

/**
 * React hook for using Pretext in components
 */
export function usePretext() {
  const cacheRef = useRef<Map<string, PreparedText>>(new Map());

  const prepareText = useCallback((text: string, font: string): PreparedText => {
    const key = `${font}|${text}`;
    let prepared = cacheRef.current.get(key);
    if (!prepared) {
      prepared = prepare(text, font);
      cacheRef.current.set(key, prepared);
    }
    return prepared;
  }, []);

  const layoutText = useCallback((
    prepared: PreparedText,
    maxWidth: number,
    lineHeight: number
  ): LayoutResult => {
    return layout(prepared, maxWidth, lineHeight);
  }, []);

  const layoutWithOrb = useCallback((
    text: string,
    font: string,
    containerWidth: number,
    containerHeight: number,
    lineHeight: number,
    orbX: number,
    orbY: number,
    orbRadius: number
  ): LayoutLine[] => {
    const prepared = prepareText(text, font);
    const variableWidths = calculateOrbReflowWidths(
      containerWidth, containerHeight, lineHeight,
      orbX, orbY, orbRadius
    );

    const lines: LayoutLine[] = [];
    let cursor = 0;
    let lineIndex = 0;

    while (cursor < prepared.segments.length && lineIndex < variableWidths.length) {
      const line = layoutNextLine(prepared, cursor, variableWidths[lineIndex]);
      if (!line) break;
      lines.push(line);
      cursor = line.endIndex;
      lineIndex++;
    }

    return lines;
  }, [prepareText]);

  return useMemo(() => ({
    prepare: prepareText,
    layout: layoutText,
    layoutNextLine,
    layoutWithOrb,
    calculateOrbReflowWidths,
  }), [prepareText, layoutText, layoutWithOrb]);
}

export default usePretext;
