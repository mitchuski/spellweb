import type { StarPalette } from './starAppearance';
export function appearanceFromJSON(text: string): Promise<{kind: string; palette: StarPalette}>;
