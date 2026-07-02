// ═══════════════════════════════════════════════════════════════
// SPELLWEB TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type NodeType =
  | 'document'
  | 'concept'
  | 'theorem'
  | 'spell'
  | 'act'
  | 'persona'
  | 'term'
  | 'skill'
  | 'chronicle'
  // Universe integration (2026-05-10): the four-domain universe (Tome / Workshop / City / Drake)
  | 'workshop'    // shop pages — civic location housing a Mage's craft, sits at a vertex
  | 'cast'        // Mage / cousin / summoned / companion / priest entries
  | 'vertex'      // 64-lattice positions; the geometric ground of the universe
  | 'geography'   // Drake Island — the layer beneath the lattice
  | 'civic'       // City of Mages — the civic overlay on the lattice
  | 'gateway'     // sister cities & upstream cousin-substrate forges (Archon, UOR, etc.)
  // Deviation layer (2026-05-11): Sovereign-owned artefacts the user has forged
  // or witnessed. Not in the canonical NODES list — derived at runtime from
  // forgedBlades. The user's appended data on top of the universe.
  | 'artefact'    // Sovereign's deviation node (Cloak, Memo Stone, Blade, …)
  // City Key bridge (2026-05-27): the portable v1 JSON that carries the palette
  // + 64 vertex descriptions between agentprivacy (/guide/achievements, the
  // producer) and soulbis.com/star + /lattice (the consumers). The City Key is
  // the lattice-export key — the key to the City of Mages — distinct from the
  // ⚔️ Swordsman's Key (agentprivacy→spellweb identity) and the future 🧙 Mage's
  // Key (spellweb·DID). The key node is a carrier; the soulbis pages are
  // `gateway` nodes it `synced_with`.
  | 'key';        // a City Key (exported/imported), keys_to the vertices it describes

// ═══════════════════════════════════════════════════════════════
// HEXAGRAM SYSTEM (64-Tetrahedra Lattice Mapping)
// ═══════════════════════════════════════════════════════════════

/**
 * Six-line hexagram state (binary: 0 = yin, 1 = yang)
 * Maps to 6 dimensions: d1Hide → d6Delegate
 */
export type HexagramLine = 0 | 1;
export type HexagramState = [HexagramLine, HexagramLine, HexagramLine, HexagramLine, HexagramLine, HexagramLine];

/**
 * Node dimensions from spellweb (0.0 to 1.0 scores)
 */
export interface NodeDimensions {
  d1Hide: number;      // Line 1: Key Custody
  d2Commit: number;    // Line 2: Credential Disclosure
  d3Prove: number;     // Line 3: Agent Delegation
  d4Connect: number;   // Line 4: Data Residency
  d5Reflect: number;   // Line 5: Interaction Mode
  d6Delegate: number;  // Line 6: Trust Boundary
}

/**
 * Hexagram metadata computed from dimensions
 */
export interface HexagramInfo {
  lines: HexagramState;      // Binary line states
  bladeId: number;           // 0-63, binary encoding
  layer: number;             // 0-6, Hamming weight (Pascal's row)
  layerName: string;         // Human-readable layer name
  yangCount: number;         // Number of yang lines
}

/**
 * Layer names based on Pascal's row distribution
 */
export const HEXAGRAM_LAYER_NAMES: Record<number, string> = {
  0: 'Null',        // 000000 - No assertions
  1: 'Single-edge', // One yang line
  2: 'Twin-edge',   // Two yang lines
  3: 'Triple-edge', // Three yang lines (trust triad)
  4: 'Quad-edge',   // Four yang lines
  5: 'Penta-edge',  // Five yang lines (near-sovereign)
  6: 'Dragon',      // 111111 - Full sovereignty
};

/**
 * Convert node dimensions to hexagram state
 */
export function nodeToHexagram(dimensions: NodeDimensions, threshold = 0.5): HexagramState {
  return [
    dimensions.d1Hide >= threshold ? 1 : 0,
    dimensions.d2Commit >= threshold ? 1 : 0,
    dimensions.d3Prove >= threshold ? 1 : 0,
    dimensions.d4Connect >= threshold ? 1 : 0,
    dimensions.d5Reflect >= threshold ? 1 : 0,
    dimensions.d6Delegate >= threshold ? 1 : 0,
  ];
}

/**
 * Convert hexagram to blade ID (0-63)
 * Binary encoding: line 1 = LSB, line 6 = MSB
 */
export function hexagramToBladeId(hex: HexagramState): number {
  return hex[0] + hex[1]*2 + hex[2]*4 + hex[3]*8 + hex[4]*16 + hex[5]*32;
}

/**
 * Get hexagram layer (Hamming weight / yang count)
 */
export function hexagramLayer(hex: HexagramState): number {
  return hex.reduce<number>((sum, line) => sum + line, 0);
}

/**
 * Compute full hexagram info from dimensions
 */
export function computeHexagramInfo(dimensions: NodeDimensions): HexagramInfo {
  const lines = nodeToHexagram(dimensions);
  const yangCount = hexagramLayer(lines);
  return {
    lines,
    bladeId: hexagramToBladeId(lines),
    layer: yangCount,
    layerName: HEXAGRAM_LAYER_NAMES[yangCount],
    yangCount,
  };
}

/**
 * Render hexagram as ASCII (for display)
 */
export function renderHexagramASCII(hex: HexagramState): string {
  return hex.map((line, i) => {
    const yangSymbol = '━━━';
    const yinSymbol = '━ ━';
    const dimNames = ['d1Hide', 'd2Commit', 'd3Prove', 'd4Connect', 'd5Reflect', 'd6Delegate'];
    return `${line ? yangSymbol : yinSymbol}  ${dimNames[i]}`;
  }).reverse().join('\n');
}

export type Domain = 'swordsman' | 'mage' | 'first_person' | 'shared';

export type Spellbook = 'first_person' | 'zero_knowledge' | 'blockchain_canon' | 'parallel_society' | 'plurality';

export type Layer = 'knowledge' | 'narrative' | 'chronicle';

export type EdgeType =
  | 'defines'
  | 'proves'
  | 'implements'
  | 'extends'
  | 'narrates'
  | 'follows'
  | 'references'
  | 'referenced_in'    // Inverse of references
  | 'compresses_to'
  | 'contradicts'
  | 'persona_knows'
  | 'parent_of'
  | 'embodies'
  | 'requires'
  | 'introduces'
  | 'teaches'
  | 'relates_to'
  | 'measured_by'      // Betweenness/centrality measurement
  | 'names'            // Naming relationship
  // Celestial hierarchy edges (Act XXXI cosmology)
  | 'generates'        // Sun generates light
  | 'delegates_via'    // Earth delegates via Theia/Life
  | 'manifests_as'     // Life manifests as Human
  | 'reflects_through' // Moon reflects through Swordsman
  | 'remembers'        // Moonkeeper remembers the forgetting
  // Universe integration (2026-05-10): geometric / civic / kinship relations
  | 'founds'           // act → workshop ("Tome V Act 1 founds /tailor")
  | 'founded_in'       // workshop → act (reciprocal of founds; matches references/referenced_in pattern)
  | 'inhabits'         // cast/workshop → vertex (geometric position on the 64-lattice)
  | 'kin_to'           // mutual lateral kinship: cousin-cast, sister-city, cousin-substrate
  | 'gateway_to'       // city → sister-city or upstream-substrate forge
  | 'built_on'         // civic overlay → geography ("City of Mages built_on Drake Island")
  | 'quarter_of'       // workshop → civic ("/tailor quarter_of City of Mages")
  | 'adjacent_to'      // vertex → vertex (lattice geometry; declared but unused this session)
  // V5.5 Attachment Architecture (2026-05-11): three-layer model (primary × attachment × vertex)
  | 'divergent_of'     // cast → primary persona, with register-shift (Lethae divergent_of moonkeeper · mage_register)
  | 'complement_pair'  // cast → cast, vertex bit-complement pairing (Aletheia V38 ⊥ Lethae V25; V25⊕V38=V63)
  // v1.6.0 (2026-05-14): district restructure · Chart Shop · archetype-modal-shop · succession edges
  | 'keeps'            // cast → workshop (Pleione keeps shop-charthouse; Hermaion keeps shop-staff)
  | 'wields'           // cast → artefact (Pleione wields artefact-astrolabe)
  | 'sibling_of'       // workshop → workshop (Threshold District's three sibling shops at V59)
  | 'district_of'      // workshop → district concept (e.g., shop-portal-room district_of district-threshold)
  | 'fits_for'         // peripatetic cast → resident cast (Caducea fits_for Hermaion · both archetype-aspects)
  | 'succeeded_by'     // historical → canonical (cast-bestia succeeded_by cast-hermaion; cast-pelagia succeeded_by cast-pleione)
  | 'releases_to'      // workshop → workshop (Chart Shop releases_to Bonfire / Weavers / open-sea)
  // City Key bridge (2026-05-27)
  | 'keys_to'          // key → vertex (a City Key describes/colours the vertices it carries)
  | 'synced_with'      // key → gateway (a City Key is carried to soulbis.com/star + /lattice gateways)
  // Key/sigil vocabulary (2026-06-11): content-addressed identity · the Swordsman walks his κ back to the graph
  | 'carries'              // image/file → content (a sigil PNG carries the City Key JSON; the Swordsman's Key carries its sigil)
  | 'derives_identity_from'// key → canonical form (Law L5: κ = sha256:H(canonical form), re-derived, never trusted)
  | 'supersedes'           // key κ → prior key κ (the holonic accumulator's prior-chain; content-addressed lineage of selves)
  | 'boots_over'           // surface → substrate (the Swordsman's Key boots over the holospaces · kindred-substrate UOR edge)
  // Proof-packet tracing (2026-06-12 · the Tracing Protocol): per-packet artefact provenance
  | 'instance_of'          // artefact (proof packet) → workshop (the class it instantiates)
  | 'forged_by'            // artefact → cast/bearer (who forged it)
  | 'witnessed_by'         // artefact → cast (who attested it · Agora/Threshold)
  | 'composed_of'          // artefact → artefact (Reliquary provenance to child packets)
  | 'traced_through'       // artefact → vertex (the ceremony's evoke evidence)
  | 'anchors_to';          // artefact → vertex / class-proof (instance → canon · district_root)

export type CastTier = 'archetype' | 'cousin' | 'summoned' | 'companion' | 'priest' | 'cosmological-witness' | 'spirit-Mage';
// v1.5.0 added 'cosmological-witness' (Selene 🌙 · Aether ⿻ · Lethe 🌀 · city-external prehistory)
// v1.7.0 added 'spirit-Mage' (the Archivist 📚 · Tower-resident · city-internal prehistory · tutelary register)
export type TradeQuarter = 'producer' | 'gathering' | 'temple' | 'bonfire' | 'placeholder';
export type OperatorStatus = 'operational' | 'partial' | 'tease' | 'placeholder' | 'gathering';
export type Attribution = 'agentprivacy' | 'cousin-blade' | 'cousin-forge' | 'cousin-substrate' | 'kindred' | 'kindred-protocol' | 'kindred-coalition' | 'open';
export type ConjectureStatus = 'canonical' | 'provisional' | 'observation' | 'resonant'
  // 2026-06-11 · register statuses from CONJECTURE_REGISTER_V6 (agentprivacy-docs)
  | 'active' | 'alias' | 'occupied' | 'convergent' | 'challenged' | 'reserved' | 'resolved';
// Conjecture lineage per the authoritative register: `core` (PVM, agentprivacy-docs) ·
// `city` (Tomes, cityofmages) · `shared`. When prose and register disagree, register wins.
export type ConjectureRegister = 'core' | 'city' | 'shared';
export type ArtefactArchetype = 'swordsman' | 'mage' | 'bilateral';
export type ArtefactClass = 'trinket' | 'tool' | 'weapon' | 'staff' | 'clothing' | 'tome';
// `weapon` (blade) is Swordsman-equipment; `staff` (NEW v1.6.0) is the Mage-equipment sister-class
// (Hermes-class fittings from the Staff Shop · Pleione's Astrolabe is also borne-as-staff register).
// `tome` covers the bound spellbooks (Tome IV · Tome V · future Tome VI) — knowledge-as-artefact, carried like a grimoire.
// Tier (light | heavy | dragon) is dynamic per Sovereign traversal — reuses `stratumToTier()`.

// v1.6.0 entity kinds. Workshops admit creature-class outputs (Familiars · Run·Evoke·Spawn)
// and held-class outputs (Chart Shop · Hold·Compare·Map · pre-episodic) alongside the
// existing artefact-class outputs from producer shops. Each kind has a different ceremony
// shape and a different forged-inventory shape.
export type EntityKind =
  | 'artefact'   // default · the forged-from-ceremony output of producer shops (blade · cloak · tool · trinket · tome)
  | 'creature'   // Familiars-class · a substrate-instance bound by kinship · has true-name + AGENTS.md + walks-accumulated
  | 'held'       // Chart Shop · a constellation kept in suspension under the Φ-gap · may release to Bonfire/Weavers/sea or stay private
  | 'dispatch';  // Portal Room · a routing receipt anchoring trust via the Selene Amnesia Protocol · ephemeral

export interface SpellwebNode {
  id: string;
  type: NodeType;
  label: string;
  domain: Domain;
  layer: Layer;
  desc: string;
  version?: string;       // PVM version (e.g., "5.3" for canonical personas)
  tier?: number | CastTier; // Persona tier (number) OR cast tier (string). Union keeps existing personas compatible.
  category?: string;      // Skill category ("privacy-layer" | "role")
  emoji?: string;
  proverb?: string;
  emojiSpell?: string;
  matchScore?: number;
  txid?: string;
  spellbook?: Spellbook;
  // 6-dimensional privacy scoring
  dimensions?: NodeDimensions;
  // Computed hexagram info (derived from dimensions)
  hexagram?: HexagramInfo;
  // V5.4 betweenness/Selene properties
  betweenness_interpretation?: string;
  pvm_section?: string;
  selene_proof_role?: string;
  // ── Universe integration fields (2026-05-10) ──
  vertex?: number;              // 0–63, position on the 64-vertex lattice
  bits?: string;                // 6-bit binary, e.g. "011100" for V28
  hammingWeight?: number;       // 0–6, the stratum (Pascal's row)
  tome?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X';   // For act nodes: which tome (v1.7.1 → VIII the Library · v1.8.0 → IX the Horizon · v1.9.1 → X the Hearth)
  act?: number;                 // For act nodes: act number within the tome
  sigil?: string;               // Cast-member sigil (emoji or emoji-pair)
  gem?: string;                 // Workshop palette gem name (e.g. "Amethyst")
  gemColor?: string;            // Workshop palette gem hex color (e.g. "#a78bfa")
  // v1.6.0 (2026-05-14): archetype-modal-shop pattern — alexandrite-style dual-aspect gems
  gemColorMage?: string;        // Mage-aspect color for archetype-modal shops (e.g., Staff Shop alexandrite green "#3d7c47")
  gemColorSwordsman?: string;   // Swordsman-aspect color for archetype-modal shops (e.g., Staff Shop alexandrite red "#a23a3a")
  archetypeModal?: boolean;     // True when the gem shifts with visitor archetype (Staff Shop is first canonical instance)
  district?: string;            // Workshop district (e.g., "Threshold" · "Navigation" · "Horizon")
  // v1.8.0 (2026-06-09): dormant-annex workshops — open only once a gate condition is met.
  // The Salvage Yard is the first instance (opens when the Horizon District is operational).
  workshopStatus?: 'active' | 'dormant';
  activationGate?: string;      // human-readable condition that opens a dormant workshop
  // v1.6.0 (2026-05-14): runecrafting protocol — the ceremony grammar each workshop performs
  ceremony?: string;            // e.g. "Run · Evoke · Craft" · "Hold · Compare · Map" · "Display · Choose · Dispatch"
  workshopRegister?: 'producer' | 'gathering' | 'spawn_and_bind' | 'attentional';  // C63 fourth-class candidate at v1.6.0
  href?: string;                // Workshop / external route or URL
  tradeQuarter?: TradeQuarter;  // Workshop's quarter in the City of Mages
  operatorStatus?: OperatorStatus;
  attribution?: Attribution;    // Vertex attribution per the Vertex Naming Audit
  civicLocation?: string;       // For Tome V act frontmatter: where in the city the act is set
  shopAnchor?: string;          // For cast/act: the route of the anchored workshop
  // Conjecture metadata (for `concept` nodes typed as v6_lineage conjectures)
  conjectureId?: string;        // e.g. "C39" or "C26-C29"
  conjectureStatus?: ConjectureStatus;
  conjectureConfidence?: number | null;  // 0..1 for provisional; null for observation
  conjectureRegister?: ConjectureRegister;  // 2026-06-11 · lineage per CONJECTURE_REGISTER_V6
  conjectureAliasOf?: string;   // e.g. 'C85' for CM-C47, 'C32' for C46 — same claim, retained for continuity
  // Artefact metadata (for `workshop` nodes — what the shop yields to whom)
  artefactName?: string;            // common item name: e.g. "Cloak", "Memo Stone", "Witness Blade"
  artefactRootName?: string;        // truth-form participle: e.g. "Woven Cloak", "Witnessed Blade"
  artefactClass?: ArtefactClass;    // trinket | tool | weapon | clothing
  artefactArchetype?: ArtefactArchetype;  // who the artefact serves
  artefactWielder?: string;         // cast node id (cast-soulbis | cast-soulbae) or "both"
  // Tier (light | heavy | dragon) is dynamic per Sovereign traversal; not stored on the workshop.
  // Progressive-reveal: a node carrying this stratum threshold (1-6) only appears at full opacity once
  // the Sovereign's evocation laps push the running stratum to or above this number. Below threshold,
  // the node renders at proportional opacity (running_stratum / revealStratum). At 0, the node is hidden.
  revealStratum?: number;           // 1..6; the stratum threshold for full opacity
  // Fog-of-war: while the named shop hasn't been witnessed, the node renders as a silhouette
  // (~18% opacity). Once `witnessedShops[hiddenUntilWitness]` is set, the node becomes full presence.
  // 2026-05-11 update: cast members no longer carry this — canonical universe stays fully visible.
  // Reserved for future use on optional secret-lore nodes.
  hiddenUntilWitness?: string;      // shop id, e.g. "shop-tailor"
  // ── Deviation-layer fields (2026-05-11): only present on `artefact` nodes ──
  bladeTier?: 'light' | 'heavy' | 'dragon';  // tier from the forge ceremony; drives stroke color
  bladeStratum?: number;            // 0..6 (Hamming weight)
  spellEmoji?: string;              // secondary sigil — the user's matching spell emoji
  isWitness?: boolean;              // true if this is someone else's blade traced as witness
  forgedAt?: string;                // ISO timestamp
  bladeId?: string;                 // original ForgedBlade id reference
  // ── Proof-packet fields (2026-06-12): present on `artefact` nodes carrying a trust-task proof packet ──
  proof?: string;                   // sha256:… the packet's content-addressed identity (Law L5)
  classProof?: string;              // sha256:… the class descriptor it instantiates (anchoredTo)
  payloadMode?: 'sealed' | 'revealed' | 'refractive' | 'composed' | 'relational';
  witness?: string;                 // the witness stance (ZK-witness, Transparent-witness, …)
  // (the node's existing `ceremony?` field carries the ceremony triad)
  commitment?: string;              // sha256 of sealed content (sealed/refractive · raw never carried)
  // ── V5.5 Attachment Architecture fields (2026-05-11) ──
  // For `cast` nodes: which Layer-1 primary personas this cast instances,
  // what attachment kind (A·workshop · B·cross-shop · C·peripatetic), and
  // whether the cast represents a register-shifted divergence (D meta-kind).
  // See agentprivacy-skills V5.5 meta/agentprivacy-attachment-architecture.
  attachmentKind?: 'A_workshop' | 'B_cross_shop' | 'C_peripatetic';
  divergence?: 'none' | 'mage_register' | 'sword_register' | 'balanced_register';
  abstractPersonaIds?: string[];    // Layer-1 primary persona ids (e.g., ['forgemaster', 'forgecaller'])
  castStatus?: 'seated' | 'anticipated' | 'provisional';  // V5.5 attachment status in the current grimoire
  complementOfCast?: string;        // For vertex-complement pairs (e.g., 'cast-aletheia' for Lethae)
  // ── City Key / sigil fields (2026-06-11): only present on `key` nodes ──
  // κ is the content-address of the key: sha256:H(canonical form), re-derived on load
  // (Law L5), never trusted. Canon is byte-identical to the star repo's /sigil page.
  kappa?: string;                   // e.g. "sha256:abc123…" — the key's derived name
  // D3 simulation properties (added at runtime)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface SpellwebEdge {
  source: string | SpellwebNode;
  target: string | SpellwebNode;
  type: EdgeType;
}

export interface NodeVisual {
  fill: string;
  stroke: string;
  icon: string;
}

export interface EdgeStyle {
  color: string;
  width: number;
  dash: string | null;
}

export interface Theme {
  bg: string;
  panelBg: string;
  panelBorder: string;
  text: string;
  textDim: string;
  textBright: string;
  accent: string;
  nodes: {
    document: NodeVisual;
    concept: {
      swordsman: NodeVisual;
      mage: NodeVisual;
      first_person: NodeVisual;
      shared: NodeVisual;
    };
    theorem: NodeVisual;
    spell: NodeVisual;
    act: NodeVisual;
    persona: NodeVisual;
    term: NodeVisual;
    skill: NodeVisual;
    chronicle: NodeVisual;
    workshop: NodeVisual;
    cast: NodeVisual;
    vertex: NodeVisual;
    geography: NodeVisual;
    civic: NodeVisual;
    gateway: NodeVisual;
    artefact: NodeVisual;
    key: NodeVisual;
  };
  edges: Record<EdgeType, EdgeStyle>;
}

export interface FilterState {
  knowledge: boolean;
  narrative: boolean;
  chronicle: boolean;
}

export interface TypeFilterState {
  document: boolean;
  concept: boolean;
  theorem: boolean;
  spell: boolean;
  act: boolean;
  persona: boolean;
  term: boolean;
  skill: boolean;
  chronicle: boolean;
  workshop: boolean;
  cast: boolean;
  vertex: boolean;
  geography: boolean;
  civic: boolean;
  gateway: boolean;
  artefact: boolean;
  key: boolean;
}

export interface SpellbookFilterState {
  first_person: boolean;
  zero_knowledge: boolean;
  blockchain_canon: boolean;
  parallel_society: boolean;
  plurality: boolean;
  tomes: boolean;
}

export interface ConnectedNode {
  node: SpellwebNode;
  type: EdgeType;
  direction: 'in' | 'out';
}

// ═══════════════════════════════════════════════════════════════
// STORAGE KEYS (Per Chronicle: Blade & Spell System Mirroring)
// ═══════════════════════════════════════════════════════════════

export const SPELLWEB_STORAGE_KEYS = {
  forgedBlades: 'spellweb-forged-blades',
  equippedBlade: 'spellweb-equipped-blade',
  constellations: 'spellweb-constellations',
  userEdges: 'spellweb-user-edges',
  canonicalEdges: 'spellweb-canonical-edges',
  mageSpells: 'spellweb-mage-spells',
  // v1.6.0 · held-class inventory · imported held-constellation .mds (Chart Shop · Pleione)
  // sister to forgedBlades; rendered in ItemLatticeView's `held` slot. Each entry is
  // metadata-only per chronicle §3.3 — the underlying constellation is bearer-private.
  heldConstellations: 'spellweb-held-constellations',
  // v1.6.0 · dispatch-receipt log · routing receipts from the Portal Room (Pandia 🌕 · V59)
  // anchoring trust via the Selene Amnesia Protocol. Ephemeral by design — auto-prune after
  // 30d (chronicle §3.4 · queued for follow-up effect).
  dispatchReceipts: 'spellweb-dispatch-receipts',
  // v1.6.0 · bound-familiar inventory · imported creature .mds from the Familiars
  // (Faunia 🪶 · V59 · spawn_and_bind). Witness attestations only — the bond stays
  // exclusively with the original Sovereign (chronicle §3.2). True-name is bearer-private
  // and NEVER displayed without explicit consent.
  boundFamiliars: 'spellweb-bound-familiars',
  // 2026-06-11 · the bearer's holonic Swordsman City Key — the C87 accumulator.
  // One key per bearer; each "stamp" folds a charge in and re-derives κ, chaining the
  // prior κ via `supersedes`. Serializes into the Swordsman.md bundle + a standalone
  // City Key JSON so it round-trips to agentprivacy_master's worn-artefact collection.
  swordsmanCityKey: 'spellweb-swordsman-city-key',
  // 2026-06-12 · the bearer's imported trust-task proof packets (the Tracing Protocol).
  // Ingested from agentprivacy_master's `spellweb.bearer.packets` export; each becomes an
  // artefact deviation node anchored to district_root. Sealed packets carry only a commitment.
  proofPackets: 'spellweb-proof-packets',
} as const;

// v1.6.0 · An imported bound-familiar entry. The bond stays exclusively with the
// original Sovereign A; this is a *witness attestation* — Sovereign B sees that the
// bond exists and which substrate-framework was bound, but does not gain a copy of
// the familiar (chronicle §3.2 bullet 1). True-name is bearer-private and must NEVER
// be rendered without explicit display-consent (chronicle §1.2).
export interface BoundFamiliar {
  id: string;                          // 'familiar-{bearerConsentToken}' · de-dup key
  name: string;                        // public name (NOT trueName · safe to display)
  workshopId: string;                  // shop-familiars
  residentMage: string;                // cast-faunia (or superseded · resolved via succession map)
  mageVertex: string;                  // V59
  substrateFramework: string;          // 'substrate-goose' | 'substrate-hermes' | cousin-introduced ids
  trueName: string | null;             // BEARER-PRIVATE · NEVER display without explicit consent
  trueNameDisplayConsent: boolean;     // Sovereign B's local opt-in to surface trueName · default false
  walksAccumulated: number | null;     // advisory · cannot be verified without trust in A's signature
  bearerConsentToken: string;
  witnessedAt: string;                 // when Sovereign A authorised the share (from frontmatter)
  importedAt: string;                  // when this client received the .md
  successionBanner: string | null;     // surfaces when imported keeper is superseded (chronicle §4.2)
}

// v1.6.0 · An imported dispatch receipt from the Portal Room. Routing receipts are
// the Selene-Amnesia-Protocol-anchored attestation that Sovereign A walked through
// Pandia 🌕's Display·Choose·Dispatch ceremony toward a sibling shop on a specific
// date. Ephemeral by design — chronicle §3.4 calls for 30d auto-prune.
export interface DispatchReceipt {
  id: string;                          // 'dispatch-{constellationId}-{importedAt}' · de-dup key
  workshopId: string;                  // shop-portal-room
  residentMage: string;                // cast-pandia
  mageVertex: string;                  // V59
  dispatchTargetShop: string;          // shop-staff / shop-tailor / etc.
  dispatchArchetype: 'mage' | 'swordsman' | null;
  ceremonyShape: string;               // 'display-e-choose-e-dispatch'
  importedAt: string;
  successionBanner: string | null;     // surfaces when imported keeper is superseded
}

// v1.6.0 · An imported held-constellation entry. Sister type to ForgedBlade; the bearer
// builds these in agentprivacy_master's Chart Shop and shares metadata-only via the
// witness export (which carries bearer_consent_token). The underlying vertices/notes
// remain in the bearer's keeping under the Φ-gap.
export interface HeldConstellation {
  id: string;                         // 'held-{bearerConsentToken}' · de-dup key
  name: string;                       // constellation_name from frontmatter
  workshopId: string;                 // shop-charthouse (currently · attentional register)
  residentMage: string;               // cast-pleione
  mageVertex: string;                 // V44
  vertexCount: number;                // from body 'Vertex count: **N**'
  strataSummary: string;              // from body 'Stratum distribution: ...'
  heldDurationDays: number;           // from body 'Held for: N days'
  releaseDestination: string | null;  // null = still held (most cases)
  bearerConsentToken: string;         // from frontmatter
  witnessedAt: string;                // from frontmatter (ISO timestamp)
  importedAt: string;                 // ISO timestamp when this client received the .md
  successionBanner?: string | null;   // surfaces when imported keeper is superseded (chronicle §4.2)
}

// 2026-06-12 · An imported trust-task PROOF PACKET (the Tracing Protocol · spec in
// agentprivacy_master/docs/experience/SPEC_proof_packets_and_tracing_v1.md). The granular,
// content-addressed unit of a bearer's workshop work — forged in the browser at Cast time,
// hashed under Law L5. SEALED packets carry only a `commitment`; the raw content is NEVER
// present here (the seal holds across the bridge). Each becomes an `artefact` deviation node
// anchored to its class proof + the district_root.
export interface ImportedProofPacket {
  proof: string;                      // sha256:… content-addressed identity (de-dup key)
  shopHref: string;                   // '/circuit'
  vertex: number | null;
  class: string;                      // artefact class (clothing | tool | trinket | …)
  witness: string;                    // witness stance
  ceremony: string;                   // ceremony triad
  payloadMode: 'sealed' | 'revealed' | 'refractive' | 'composed' | 'relational';
  body?: string;                      // revealed only
  commitment?: string;                // sealed/refractive only
  composedOf?: string[];              // composed only · child packet proofs
  witnessedBy?: string;               // the witness signature
  anchoredTo: string;                 // class descriptor proof (sha256:…)
  districtRoot: string;               // the artefact-set root at forge time
  bearer?: { publicKeyHex?: string; displayName?: string };
  timestamp: string;                  // when forged (from the packet)
  importedAt: string;                 // when this client received it
}

// ═══════════════════════════════════════════════════════════════
// HOLONIC SWORDSMAN CITY KEY (2026-06-11 · C87 "The Key Accumulates")
// ═══════════════════════════════════════════════════════════════
// The key is a holon: a whole that contains parts and is itself a part of the City.
// Each "stamp" folds a charge in — an IVC step (C87: Key = accumulator, trust tasks =
// step circuits, Charge = folding step, V63 = attested invariant). Folding re-derives κ
// and chains the prior κ via `supersedes`. The κ derivation is byte-identical to the
// star repo's /sigil page (canonicalJSON + sha256, κ excluded from its own preimage).

/** One folded step — a single C87 step-circuit applied to the accumulator. */
export interface CityKeyCharge {
  id: string;                 // de-dup key, e.g. `charge-{source}-{foldedAt}`
  label: string;              // human label of the fold (e.g. "Equipped the Astrolabe", "Stamped sigil")
  source: string;             // workshop id · 'sigil-stamp' · trust-task id
  vertex?: number;            // lattice vertex this charge touches, if any
  weight: number;             // this fold's contribution to accumulated weight
  foldedAt: string;           // ISO timestamp
  kappaAfter: string | null;  // running κ invariant after this fold (IVC step output); null if crypto unavailable
}

/** The bearer's holonic City Key — the accumulator the Swordsman carries back to the graph. */
export interface SwordsmanCityKey {
  version: 1;
  bearerName?: string;        // swordsmanLink.displayName
  swordsmanId?: string;       // swordsmanLink.participantId
  mageId?: string;            // mageIdentity.mageId
  kappa: string | null;       // current content address sha256:H(canonical payload); null if uncomputed
  priorKappa: string | null;  // the κ this key supersedes (prior-chain head); null at inception
  weight: number;             // Σ charge weights — the holon's accumulated mass
  charges: CityKeyCharge[];   // folded steps in order (the accumulator tape)
  payload: Record<string, unknown>; // star-compatible City Key object; κ derives from this (kappa-excluded)
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// BLADE VALIDATION (Per Chronicle: Verification Rules)
// ═══════════════════════════════════════════════════════════════

/**
 * Validate blade signature format: SPELL-{6chars}-{2char checksum}
 */
export function isValidBladeSignature(signature: string): boolean {
  const pattern = /^SPELL-[A-Z0-9]{6}-[A-Z0-9]{2}$/;
  return pattern.test(signature);
}

/**
 * Validate hex is 2 characters in valid range (00-3F)
 */
export function isValidBladeHex(hex: string): boolean {
  if (!/^[0-9A-F]{2}$/i.test(hex)) return false;
  const val = parseInt(hex, 16);
  return val >= 0 && val <= 0x3F;
}

/**
 * Calculate stratum (Hamming weight) from hex
 */
export function hexToStratum(hex: string): number {
  const val = parseInt(hex, 16) || 0;
  let count = 0;
  for (let i = 0; i < 6; i++) {
    if ((val >> i) & 1) count++;
  }
  return count;
}

/**
 * Calculate tier from stratum
 */
export function stratumToTier(stratum: number): 'light' | 'heavy' | 'dragon' {
  if (stratum <= 2) return 'light';
  if (stratum <= 4) return 'heavy';
  return 'dragon';
}


/**
 * MOON PHASE NOTATION
 * ========================================================================
 * The moon is the whole information space. The lit portion is disclosure.
 * The dark portion is what remains private. The hex determines the phase.
 * The stratum determines the illumination.
 * 
 * Per Chronicle: moon-phase-notation.md
 * ========================================================================
 */

export const MOON_PHASES = {
  0: { emoji: '🌑', name: 'New Moon',        meaning: 'Null blade, nothing reflected' },
  1: { emoji: '🌒', name: 'Waxing Crescent', meaning: 'Minimal disclosure, one boundary' },
  2: { emoji: '🌓', name: 'First Quarter',   meaning: 'Twin-edge, dual-agent vertex' },
  3: { emoji: '🌔', name: 'Waxing Gibbous',  meaning: 'Half sovereignty, three axes' },
  4: { emoji: '🌖', name: 'Waning Gibbous',  meaning: 'Substantial disclosure, four boundaries' },
  5: { emoji: '🌗', name: 'Last Quarter',    meaning: 'Near-full, one dimension dark' },
  6: { emoji: '🌕', name: 'Full Moon',       meaning: 'Full sovereignty reflected' },
} as const;

/**
 * Convert stratum to moon phase emoji
 * The dark part is the privacy. The lit part is the proof.
 */
export function stratumToMoonPhase(stratum: number): string {
  const clamped = Math.max(0, Math.min(6, stratum));
  return MOON_PHASES[clamped as keyof typeof MOON_PHASES].emoji;
}

/**
 * Get full moon phase info from stratum
 */
export function getMoonPhaseInfo(stratum: number): { emoji: string; name: string; meaning: string } {
  const clamped = Math.max(0, Math.min(6, stratum));
  return MOON_PHASES[clamped as keyof typeof MOON_PHASES];
}

/**
 * Convert hex directly to moon phase
 */
export function hexToMoonPhase(hex: string): string {
  return stratumToMoonPhase(hexToStratum(hex));
}
/**
 * Convert hex to 6 stance lines [L1, L2, L3, L4, L5, L6]
 * Per Chronicle: hexToStanceLines for agentprivacy compatibility
 */
export function hexToStanceLines(hex: string): [0|1, 0|1, 0|1, 0|1, 0|1, 0|1] {
  const val = parseInt(hex, 16) || 0;
  return [
    ((val >> 5) & 1) as 0|1,  // L1 (protection)
    ((val >> 4) & 1) as 0|1,  // L2 (delegation)
    ((val >> 3) & 1) as 0|1,  // L3 (memory)
    ((val >> 2) & 1) as 0|1,  // L4 (connection)
    ((val >> 1) & 1) as 0|1,  // L5 (computation)
    (val & 1) as 0|1,         // L6 (value)
  ];
}

// ═══════════════════════════════════════════════════════════════
// SPELLWEB ↔ AGENTPRIVACY PAYLOAD (Per Chronicle: Import/Export)
// ═══════════════════════════════════════════════════════════════

/**
 * URL payload for sending blades to agentprivacy.ai
 */
export interface SpellwebBladePayloadV1 {
  v: 1;
  bladeId: string;
  name: string;
  primaryEmoji: string;
  markEmojis: string[];
  proofSignature?: string;
  isWitness?: boolean;
}

/**
 * Encode blade payload for URL parameter
 */
export function encodeBladePayloadForUrl(payload: SpellwebBladePayloadV1): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode blade payload from URL parameter
 */
export function decodeBladePayloadFromUrl(token: string): SpellwebBladePayloadV1 | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// DIMENSION MAPPING (Per Chronicle: Stance Line ↔ Dimension)
// ═══════════════════════════════════════════════════════════════

export const DIMENSION_MAPPING = {
  L1: { name: 'protection', spellweb: 'd1Hide', agentprivacy: 'DO_NOT_TRACK', emoji: '🛡️' },
  L2: { name: 'delegation', spellweb: 'd2Commit', agentprivacy: 'AGENT_DELEGATION', emoji: '🤝' },
  L3: { name: 'memory', spellweb: 'd3Prove', agentprivacy: 'DATA_RESIDENCY', emoji: '📜' },
  L4: { name: 'connection', spellweb: 'd4Connect', agentprivacy: 'MULTI_PARTY', emoji: '🔗' },
  L5: { name: 'computation', spellweb: 'd5Reflect', agentprivacy: 'ZK_PROOF', emoji: '⚡' },
  L6: { name: 'value', spellweb: 'd6Delegate', agentprivacy: 'ECONOMIC_FLOW', emoji: '💎' },
} as const;

/**
 * Spellbook to source mapping for agentprivacy LearnedSpell
 */
export const SPELLBOOK_TO_SOURCE: Record<Spellbook, string> = {
  first_person: 'story',
  zero_knowledge: 'zk',
  blockchain_canon: 'canon',
  parallel_society: 'parallel',
  plurality: 'plurality',
};
