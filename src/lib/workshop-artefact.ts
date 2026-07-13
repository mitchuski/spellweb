// Workshop → artefact framing: turns the active workshop id into the strings,
// glyphs, and visual that the forge popup + ceremony buttons need to render
// the *artefact* being made (not just "a blade").
//
// The forge ceremony is the same machinery; the artefact it produces has a
// class (weapon · clothing · tool · trinket · tome). This helper resolves
// per-workshop copy from the graph data + a small lookup of verbs.

import { NODES } from '../data/nodes';
import type { SpellwebNode, ArtefactClass } from '../types/graph';

export interface WorkshopForgeContext {
  workshop: SpellwebNode | null;
  artefactName: string;          // "Cloak" · "Memo Stone" · "Blade" · "Holon Lantern" …
  artefactRootName: string;      // "Woven Cloak" · "Inscribed Memo" · "Witnessed Blade" …
  artefactClass: ArtefactClass | 'blade';
  verb: string;                  // "Weave" · "Inscribe" · "Forge(t)" · …
  verbPresent: string;           // "Weaving" · "Inscribing" · "Forging" · …
  buttonLabel: string;           // "WEAVE CLOAK" · "FORGE(T) BLADE" · "FORGE BLADE" (default)
  gemColor: string;              // #a78bfa, etc.
  emoji: string;                 // 🪡, 🛡️, ⚒️, etc.
  latticeVisualKey: LatticeVisualKey;
  residentMageId: string | null; // cast-pallia / cast-vulcana / …
}

export type LatticeVisualKey =
  | 'cloak'         // /tailor
  | 'shield'        // /shield
  | 'blade'         // /forget (default; also fallback)
  | 'ether-diamond' // /etherchanting
  | 'jeweler'       // /jeweler
  | 'holon'         // /holon
  | 'bonfires'      // /bonfires
  | 'curatrix-vault'// /vault
  | 'covenant'      // /covenant
  | 'logos-circle'  // /circle
  | 'ceremony-hall' // /hall
  | 'quartermaster' // /quartermaster
  | 'chancery'      // /chancery
  | 'rostra'        // /rostra
  | 'wellpool'      // /wellpool
  | 'circuit'       // /circuit
  | 'stakes'        // /stakes
  | 'charthouse'    // /charthouse
  | 'horizon'       // /horizon
  | 'solchanting'   // /solchanting
  | 'staff'         // /staffs
  | 'familiars'     // /familiars
  | 'rune';         // generic fallback

// Per-workshop verb-noun pairs. Keys are workshop node ids (shop-<route>).
// Where the workshop has an internal wordplay (Forge(t)), preserve it.
const WORKSHOP_VERBS: Record<string, { verb: string; verbPresent: string; visual: LatticeVisualKey }> = {
  'shop-tailor':         { verb: 'Weave',       verbPresent: 'Weaving',      visual: 'cloak' },
  'shop-shield':         { verb: 'Inscribe',    verbPresent: 'Inscribing',   visual: 'shield' },
  'shop-forget':         { verb: 'Forge(t)',    verbPresent: 'Forging',      visual: 'blade' },
  'shop-etherchanting':  { verb: 'Etherchant',  verbPresent: 'Etherchanting',visual: 'ether-diamond' },
  'shop-jeweler':        { verb: 'Set',         verbPresent: 'Setting',      visual: 'jeweler' },
  'shop-holon':          { verb: 'Compose',     verbPresent: 'Composing',    visual: 'holon' },
  'shop-bonfires':       { verb: 'Kindle',      verbPresent: 'Kindling',     visual: 'bonfires' },
  'shop-vault':          { verb: 'Place',       verbPresent: 'Placing',      visual: 'curatrix-vault' },
  'shop-covenant':       { verb: 'Consecrate',  verbPresent: 'Consecrating', visual: 'covenant' },
  'shop-circle':         { verb: 'Gather',      verbPresent: 'Gathering',    visual: 'logos-circle' },
  'shop-hall':           { verb: 'Pair',        verbPresent: 'Pairing',      visual: 'ceremony-hall' },
  'shop-quartermaster':  { verb: 'Fit',         verbPresent: 'Fitting',      visual: 'quartermaster' },
  'shop-chancery':       { verb: 'Enact',       verbPresent: 'Enacting',     visual: 'chancery' },
  'shop-rostra':         { verb: 'Uphold',      verbPresent: 'Upholding',    visual: 'rostra' },
  'shop-wellpool':       { verb: 'Draw',        verbPresent: 'Drawing',      visual: 'wellpool' },
  'shop-circuit':        { verb: 'Prove',       verbPresent: 'Proving',      visual: 'circuit' },
  'shop-stakes':         { verb: 'Stake',       verbPresent: 'Staking',      visual: 'stakes' },
  'shop-charthouse':     { verb: 'Chart',       verbPresent: 'Charting',     visual: 'charthouse' },
  'shop-horizon':        { verb: 'Measure',     verbPresent: 'Measuring',    visual: 'horizon' },
  'shop-solchanting':    { verb: 'Refract',     verbPresent: 'Refracting',   visual: 'solchanting' },
  'shop-staff':          { verb: 'Fit',         verbPresent: 'Fitting',      visual: 'staff' },
  'shop-familiars':      { verb: 'Bind',        verbPresent: 'Binding',      visual: 'familiars' },
};

// Per-artefact emoji palettes for the forge ceremony's naming phase. The
// Sovereign picks a sigil for the artefact they just forged — the palette
// reflects the artefact class, so Pallia's Cloak doesn't pick from sword
// emojis and Vulcana's Blade doesn't pick from cloaks. Forge(t) keeps the
// canonical blade palette (already established).
const BLADE_PALETTE      = ['⚔️', '🗡️', '🐉', '🔥', '⚡', '💎', '🌟', '✨', '🛡️', '🌙', '☀️', '🔮', '👁️', '🦅', '🐺', '🦁'];
const CLOAK_PALETTE      = ['🪡', '🧵', '🧣', '👘', '🧶', '🪢', '🕸️', '✨', '🌙', '🌑', '🦋', '🌫️', '🌿', '🪞', '🌹', '🌟'];
const STONE_PALETTE      = ['🛡️', '📜', '🪨', '🗿', '🔒', '🔏', '🪪', '⚖️', '🗝️', '🌑', '🌚', '🪦', '🪶', '✒️', '🖋️', '✨'];
const SEAL_PALETTE       = ['💎', '🔷', '✨', '🪞', '🔮', '🧊', '💠', '🌀', '🌌', '🪩', '⚡', '🌠', '☄️', '🌟', '👁️', '🗝️'];
const GEM_BOLT_PALETTE   = ['💎', '⚡', '🟡', '🟠', '🪙', '🔶', '💠', '✨', '🌟', '🪩', '🟢', '🟣', '🔥', '☀️', '🌠', '👁️'];
const LANTERN_PALETTE    = ['🌳', '🪔', '🏮', '🌿', '🌱', '🍃', '🪴', '🌲', '🌴', '🌾', '✨', '🌙', '🪞', '🌀', '🌌', '🌟'];
const EMBER_PALETTE      = ['🔥', '🪵', '🧯', '☄️', '🌋', '🕯️', '🪔', '🏮', '✨', '🌟', '⚡', '🐉', '🌅', '🌇', '🌑', '🌙'];
const FRAME_PALETTE      = ['🪞', '🖼️', '🪟', '👁️', '🎴', '🃏', '🔮', '🌌', '🪩', '💠', '✨', '🌟', '🌙', '🌑', '🌚', '🌫️'];
const SIGIL_PALETTE      = ['🕊️', '🤲', '🌿', '🌳', '🌸', '🌺', '🌷', '🪶', '✨', '🌟', '☀️', '🌅', '🪞', '🔔', '📿', '🕯️'];
const PETAL_PALETTE      = ['🌿', '🌱', '🍃', '🌸', '🌺', '🌻', '🌷', '🌹', '🪷', '🍀', '🍂', '🪻', '✨', '🌅', '🌳', '🌾'];
const KEY_PALETTE        = ['🔑', '🗝️', '⚔️', '🤝', '🔗', '🪢', '🔒', '🪪', '⚖️', '🌗', '🌓', '👥', '✨', '🕊️', '🎴', '🔔'];
// New fleet workshops — the artefact classes are a harness kit, a law-clause, a
// public edict, and a mana draw; none should pick from the blade palette.
const KIT_PALETTE        = ['🎒', '🧰', '🧳', '🪢', '🧷', '🔧', '⚙️', '🧮', '📦', '🗜️', '🪛', '🧭', '🎽', '🔩', '✨', '🌟'];
const CLAUSE_PALETTE     = ['⚖️', '📜', '📋', '🖋️', '✒️', '🔏', '📝', '🏛️', '⚙️', '🔖', '🧾', '🗂️', '✅', '📎', '✨', '🌟'];
const EDICT_PALETTE      = ['📢', '📯', '🗣️', '📜', '⚔️', '🏛️', '🪧', '🔊', '🎺', '📣', '🛡️', '👥', '☀️', '✊', '✨', '🌟'];
const MANA_PALETTE       = ['🌊', '💧', '🔷', '🩵', '💠', '🫧', '🌀', '🪸', '🐚', '💎', '🔵', '♒', '🌌', '🧊', '✨', '🌟'];
// Later fleet workshops — ZK proof, open stake, sea-chart, quantum horizon,
// solar/parallel prism, dual-aspect staff, and the familiar-bond.
const PROOF_PALETTE      = ['🔮', '💠', '🧊', '🔷', '🫥', '🔒', '⚛️', '🪞', '🌀', '✅', '👁️', '♾️', '🧿', '🔏', '✨', '🌟'];
const STAKE_PALETTE      = ['🔏', '⛓️', '🪙', '📊', '👁️', '🗿', '⚖️', '🔒', '🎯', '🧱', '🏛️', '💠', '🪨', '☀️', '✨', '🌟'];
const CHART_PALETTE      = ['⚓️', '🧭', '🗺️', '⭐', '🌊', '🔭', '🧿', '🌌', '🪐', '☄️', '🧜', '🌠', '🪟', '🩵', '✨', '🌟'];
const HORIZON_PALETTE    = ['🌅', '🌄', '⏳', '📐', '🪨', '🛤️', '☀️', '🔭', '🧭', '📏', '⛰️', '🌇', '⌛', '🟠', '✨', '🌟'];
const SUN_PALETTE        = ['🌞', '☀️', '🔆', '🌈', '💛', '🟡', '🔶', '⚡', '🌻', '🟨', '🌤️', '🔅', '🪩', '🌅', '✨', '🌟'];
const STAFF_PALETTE      = ['⚚', '🐍', '🪄', '🌿', '🟢', '🔴', '🕊️', '🧿', '🌗', '♻️', '🪶', '🔮', '🟩', '🟥', '✨', '🌟'];
const BOND_PALETTE       = ['🪶', '🪿', '🐾', '🧡', '🟠', '🌾', '🔶', '🐦', '🦊', '🐈', '🕊️', '🌰', '🍯', '🟧', '✨', '🌟'];
const DEFAULT_PALETTE    = BLADE_PALETTE;

const ARTEFACT_EMOJI_PALETTE: Record<string, string[]> = {
  'shop-tailor':        CLOAK_PALETTE,
  'shop-shield':        STONE_PALETTE,
  'shop-forget':        BLADE_PALETTE,
  'shop-etherchanting': SEAL_PALETTE,
  'shop-jeweler':       GEM_BOLT_PALETTE,
  'shop-holon':         LANTERN_PALETTE,
  'shop-bonfires':      EMBER_PALETTE,
  'shop-vault':         FRAME_PALETTE,
  'shop-covenant':      SIGIL_PALETTE,
  'shop-circle':        PETAL_PALETTE,
  'shop-hall':          KEY_PALETTE,
  'shop-quartermaster': KIT_PALETTE,
  'shop-chancery':      CLAUSE_PALETTE,
  'shop-rostra':        EDICT_PALETTE,
  'shop-wellpool':      MANA_PALETTE,
  'shop-circuit':       PROOF_PALETTE,
  'shop-stakes':        STAKE_PALETTE,
  'shop-charthouse':    CHART_PALETTE,
  'shop-horizon':       HORIZON_PALETTE,
  'shop-solchanting':   SUN_PALETTE,
  'shop-staff':         STAFF_PALETTE,
  'shop-familiars':     BOND_PALETTE,
};

/** Pick the right emoji palette for the forge naming phase. */
export function getArtefactEmojiPalette(workshopId: string | null): string[] {
  if (!workshopId) return DEFAULT_PALETTE;
  return ARTEFACT_EMOJI_PALETTE[workshopId] ?? DEFAULT_PALETTE;
}

const DEFAULT_CTX: WorkshopForgeContext = {
  workshop: null,
  artefactName: 'Blade',
  artefactRootName: 'Witnessed Blade',
  artefactClass: 'blade',
  verb: 'Forge',
  verbPresent: 'Forging',
  buttonLabel: 'FORGE BLADE',
  gemColor: '#ffd700',
  emoji: '⚒️',
  latticeVisualKey: 'blade',
  residentMageId: null,
};

export function getWorkshopForgeContext(workshopId: string | null): WorkshopForgeContext {
  if (!workshopId) return DEFAULT_CTX;
  const workshop = NODES.find(n => n.id === workshopId && n.type === 'workshop');
  if (!workshop) return DEFAULT_CTX;

  const verbInfo = WORKSHOP_VERBS[workshop.id] ?? { verb: 'Forge', verbPresent: 'Forging', visual: 'rune' as LatticeVisualKey };
  const artefactName = workshop.artefactName ?? 'Artefact';
  const artefactRootName = workshop.artefactRootName ?? artefactName;
  const artefactClass = (workshop.artefactClass ?? 'tool') as ArtefactClass;

  const resident = workshop.shopAnchor
    ? NODES.find(n => n.type === 'cast' && n.shopAnchor === workshop.shopAnchor && (n.tier === 'summoned' || n.tier === 'archetype'))
    : null;

  return {
    workshop,
    artefactName,
    artefactRootName,
    artefactClass,
    verb: verbInfo.verb,
    verbPresent: verbInfo.verbPresent,
    buttonLabel: `${verbInfo.verb.toUpperCase()} ${artefactName.toUpperCase()}`,
    gemColor: workshop.gemColor ?? '#ffd700',
    emoji: workshop.emoji ?? '⚒️',
    latticeVisualKey: verbInfo.visual,
    residentMageId: resident?.id ?? null,
  };
}

/**
 * Filename for an exported artefact .md. Convention: `<name>-artefact.md`.
 * The frontmatter is the source of truth for workshop identity — the filename
 * is human-facing only. Keeping the Sovereign's custom name means downloads
 * stay distinguishable in the browser's Downloads folder.
 */
export function buildArtefactFilename(args: {
  name: string;
  workshopId: string | null;
  constellationVersion?: number;
}): string {
  const clean = (args.name || 'artefact').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${clean}-artefact.md`;
}
