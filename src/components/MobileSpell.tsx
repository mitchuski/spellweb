/**
 * MobileSpell — simplified mobile shell for spellweb.
 *
 * Three-screen flow:
 *   1. Preset picker — Sun / Moon / Aether cards + witness-import row
 *   2. Ceremony     — orbs trace the chosen constellation, user casts spells
 *   3. Forge        — blade portrait, name + glyph, download .md artefacts
 *
 * No graph, no overlays, no node-clicking. The desktop SpellWeb is bypassed
 * entirely; we share only the forge primitives (src/lib/forge.ts), the orbs
 * component, and the preset data.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import * as d3 from 'd3';
import {
  CONSTELLATION_PRESETS,
  type PresetConstellation,
} from '../data/presets';
import { NODES } from '../data/nodes';
import { EDGES } from '../data/edges';
import { WanderingOrbs } from './WanderingOrbs';
import {
  bladeToHex,
  calculateBladeDimensions,
  calculateBladeStratum,
  calculateBladeTier,
  computeBladeHash,
  generateCommitment,
  generateNonce,
  generateSignature,
  getChargeLevel,
  getPreviousBladeInfo,
  hashConstellation,
  updateBladeChain,
} from '../lib/forge';
import type {
  BladeTier,
  MageSpellData,
  SpellProof,
} from './SpellCeremony';
import {
  exportMageKeyBackup,
  getMageIdentity,
  getSwordsmanLink,
  importMageKeyBackup,
  initializeMageIdentity,
  saveSwordsmanLink,
  type MageIdentity,
  type MageKeyBackup,
  type SwordsmanLink,
} from '../lib/mageIdentity';
import {
  getMoonPhaseInfo,
  SPELLWEB_STORAGE_KEYS,
  stratumToMoonPhase,
  type NodeType,
  type SpellwebNode,
} from '../types/graph';

// ─────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────

type Mode = 'picker' | 'ceremony' | 'forge' | 'web' | 'archive' | 'mage' | 'sword';

// Gravity field captured from the immersive Web screen. Maps node id → normalized
// position in [-1, 1] from canvas center. Only contains entries for nodes the user
// explicitly dragged. Used to perturb the preset constellation Lissajous layout.
type GravityField = Map<string, { nx: number; ny: number }>;

// Forged blade structure (mirrors the inline type in SpellWeb.tsx — same localStorage shape)
interface ForgedBlade {
  id: string;
  name: string;
  emoji: string;
  tier: BladeTier;
  stratum: number;
  proof: SpellProof;
  forgedAt: string;
  constellationNodes: number;
  isWitness?: boolean;
  witnessOf?: string;
  witnessedFrom?: string;
}

// Audio track URLs (mirrors defaults in SpellCeremony.tsx)
const AUDIO_URLS: Record<PresetConstellation['ceremony'], string> = {
  sun: 'https://voice.agentprivacy.ai/The_Emissary_Who_Forgot_the_Master.mp3',
  moon: 'https://voice.agentprivacy.ai/The_Amnesia_Protocol.mp3',
  celestial: 'https://voice.agentprivacy.ai/The_Tide_Proves_Orbit_Keeps_Selene.mp3',
};

interface CircuitPoint {
  id: string;
  x: number;
  y: number;
  emoji?: string;
}

interface ActiveCeremony {
  preset: PresetConstellation;
  isWitness: boolean;
  witnessSource?: string; // markdown content if witness, used for hash chain
}

const BG = '#06060e';
const PANEL = 'rgba(15, 15, 25, 0.92)';
const BORDER = '#2a2a3a';
const TEXT = '#c8c8d8';
const TEXT_DIM = '#7a7a8a';
const TEXT_BRIGHT = '#f0f0f8';
const GOLD = '#ffd700';
const SWORDSMAN = '#e74c3c';
const MAGE = '#9b59b6';

const CHARGE_COLOR: Record<SpellProof['chargeLevel'], string> = {
  spark: '#7a7a8a',
  ember: '#ff8844',
  flame: '#ff4444',
  inferno: '#ff2266',
  dragon: '#ffd700',
};

const TIER_COLOR: Record<BladeTier, string> = {
  light: '#88c8ff',
  heavy: '#c8c8d8',
  dragon: '#ffd700',
};

// ─────────────────────────────────────────────────────────────────
// Layout helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Distribute the preset's marks as evenly-spaced points on a Lissajous-style
 * curve inside the orbs canvas. Deterministic — same preset always lays out
 * the same way. Reads as a constellation traversal on mobile portrait.
 */
function layoutCircuit(
  preset: PresetConstellation,
  width: number,
  height: number,
  gravityField?: GravityField | null,
): CircuitPoint[] {
  const n = preset.marks.length;
  if (n === 0) return [];

  const padX = 36;
  const padY = 36;
  const cx = width / 2;
  const cy = height / 2;
  const rx = (width - padX * 2) / 2;
  const ry = (height - padY * 2) / 2;

  return preset.marks.map((m, i) => {
    // Lissajous (3:2) — visually rich path that returns to start
    const t = (i / n) * Math.PI * 2;
    let x = cx + rx * Math.sin(3 * t);
    let y = cy + ry * Math.sin(2 * t);

    // If the user explicitly dragged this node in the immersive Web screen,
    // place the constellation mark at the warped position instead.
    const g = gravityField?.get(m.nodeId);
    if (g) {
      x = cx + g.nx * rx;
      y = cy + g.ny * ry;
    }

    return { id: m.nodeId, x, y, emoji: m.emoji };
  });
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export default function MobileSpell() {
  const [mode, setMode] = useState<Mode>('picker');
  const [active, setActive] = useState<ActiveCeremony | null>(null);
  const [proof, setProof] = useState<SpellProof | null>(null);
  // In-memory deformation captured from the immersive Web screen. Resets on reload.
  const [gravityField, setGravityField] = useState<GravityField | null>(null);

  // Lifted audio state — survives picker ↔ ceremony transitions so the poem
  // narration can keep playing while the user evokes / forges. Single shared
  // <Audio> element, only one ceremony track plays at a time.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingCeremony, setPlayingCeremony] = useState<PresetConstellation['ceremony'] | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingCeremony(null);
  };

  const toggleAudioFor = (ceremony: PresetConstellation['ceremony']) => {
    if (playingCeremony === ceremony) {
      stopAudio();
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(AUDIO_URLS[ceremony]);
    audio.addEventListener('ended', () => setPlayingCeremony(null));
    audio.addEventListener('error', () => setPlayingCeremony(null));
    audioRef.current = audio;
    audio.play().then(() => setPlayingCeremony(ceremony)).catch(() => setPlayingCeremony(null));
  };

  const handlePickPreset = (preset: PresetConstellation) => {
    setActive({ preset, isWitness: false });
    setProof(null);
    setMode('ceremony');
  };

  const handleWitnessImport = (preset: PresetConstellation, source: string) => {
    setActive({ preset, isWitness: true, witnessSource: source });
    setProof(null);
    setMode('ceremony');
  };

  const handleProof = (p: SpellProof) => {
    setProof(p);
    setMode('forge');
  };

  const handleForgeAnother = () => {
    setActive(null);
    setProof(null);
    setMode('picker');
  };

  const handleGravitySettle = (field: GravityField) => {
    setGravityField(field.size > 0 ? field : null);
  };

  const goPicker = () => setMode('picker');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {mode === 'picker' && (
        <PickerScreen
          onPick={handlePickPreset}
          onWitness={handleWitnessImport}
          onOpenWeb={() => setMode('web')}
          onOpenArchive={() => setMode('archive')}
          onOpenMage={() => setMode('mage')}
          onOpenSword={() => setMode('sword')}
          gravityActive={gravityField !== null && gravityField.size > 0}
          playingCeremony={playingCeremony}
          onToggleAudio={toggleAudioFor}
        />
      )}
      {mode === 'ceremony' && active && (
        <CeremonyScreen
          active={active}
          onProof={handleProof}
          onCancel={handleForgeAnother}
          gravityField={gravityField}
          playingCeremony={playingCeremony}
          onToggleAudio={toggleAudioFor}
        />
      )}
      {mode === 'forge' && active && proof && (
        <ForgeScreen
          active={active}
          proof={proof}
          onForgeAnother={handleForgeAnother}
        />
      )}
      {mode === 'web' && (
        <WebScreen
          onBack={goPicker}
          onSettle={handleGravitySettle}
          initialField={gravityField}
        />
      )}
      {mode === 'archive' && <ArchiveScreen onBack={goPicker} />}
      {mode === 'mage' && <MageScreen onBack={goPicker} />}
      {mode === 'sword' && <SwordScreen onBack={goPicker} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen 1: Picker
// ─────────────────────────────────────────────────────────────────

function PickerScreen({
  onPick,
  onWitness,
  onOpenWeb,
  onOpenArchive,
  onOpenMage,
  onOpenSword,
  gravityActive,
  playingCeremony,
  onToggleAudio,
}: {
  onPick: (preset: PresetConstellation) => void;
  onWitness: (preset: PresetConstellation, source: string) => void;
  onOpenWeb: () => void;
  onOpenArchive: () => void;
  onOpenMage: () => void;
  onOpenSword: () => void;
  gravityActive: boolean;
  playingCeremony: PresetConstellation['ceremony'] | null;
  onToggleAudio: (ceremony: PresetConstellation['ceremony']) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Audio is owned by MobileSpell root now — pickers and ceremony share one
  // <Audio> element, so the poem narration carries through into the evoke.
  const togglePlay = (preset: PresetConstellation) => {
    onToggleAudio(preset.ceremony);
  };

  // Picking a preset no longer interrupts audio — the same track follows the
  // user into the ceremony screen if they had it playing.
  const handlePick = (preset: PresetConstellation) => {
    onPick(preset);
  };

  const handleFile = async (file: File) => {
    setImportError(null);
    try {
      const content = await file.text();
      const parsed = parseConstellationMarkdown(content);
      if (!parsed) {
        setImportError('Could not parse a constellation from this file.');
        return;
      }
      onWitness(parsed, content);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to read file');
    }
  };

  return (
    <>
      <Header title="spellweb" subtitle="choose your ceremony" />

      <div
        style={{
          padding: '8px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {CONSTELLATION_PRESETS.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onTap={() => handlePick(preset)}
            isPlaying={playingCeremony === preset.ceremony}
            onTogglePlay={() => togglePlay(preset)}
          />
        ))}

        <button
          onClick={() => fileRef.current?.click()}
          style={{
            marginTop: 4,
            padding: '16px 18px',
            background: 'transparent',
            border: `1px dashed ${BORDER}`,
            borderRadius: 14,
            color: TEXT_DIM,
            fontSize: 14,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 22 }}>📜</span>
          <span>Witness another's constellation (.md)</span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".md,text/markdown,text/plain"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {importError && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 100, 100, 0.08)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              borderRadius: 10,
              color: '#ff6e6e',
              fontSize: 13,
            }}
          >
            {importError}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: '12px 16px 8px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 8,
        }}
      >
        <HubButton glyph="🧙" label="Mage" accent={MAGE} onTap={onOpenMage} />
        <HubButton glyph="⚔️" label="Sword" accent={SWORDSMAN} onTap={onOpenSword} />
        <HubButton
          glyph="◆"
          label={gravityActive ? 'Web ·' : 'Web'}
          accent={GOLD}
          onTap={onOpenWeb}
        />
        <HubButton glyph="📚" label="Archive" accent={TEXT} onTap={onOpenArchive} />
      </div>

      <div
        style={{
          padding: '8px 16px 24px',
          fontSize: 11,
          color: TEXT_DIM,
          textAlign: 'center',
          letterSpacing: 1,
        }}
      >
        ⚔️⊥⿻⊥🧙
      </div>
    </>
  );
}

function PresetCard({
  preset,
  onTap,
  isPlaying,
  onTogglePlay,
}: {
  preset: PresetConstellation;
  onTap: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: PANEL,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
      }}
    >
      <button
        onClick={onTap}
        style={{
          width: '100%',
          padding: '20px 18px',
          paddingRight: 60, // leave room for play icon
          background: 'transparent',
          border: 'none',
          borderRadius: 16,
          textAlign: 'left',
          color: TEXT,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 36, lineHeight: 1 }}>{preset.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: TEXT_BRIGHT }}>
          {preset.name}
        </div>
        <div style={{ fontSize: 12, color: TEXT_DIM, fontVariant: 'small-caps' }}>
          {preset.ceremony} blade · {preset.nodeCount} nodes
        </div>
        <div
          style={{
            fontSize: 13,
            color: TEXT_DIM,
            fontStyle: 'italic',
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          “{preset.proverb}”
        </div>
      </button>

      <button
        aria-label={isPlaying ? 'stop narration' : 'play narration'}
        onClick={e => {
          e.stopPropagation();
          onTogglePlay();
        }}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isPlaying ? `${GOLD}33` : 'rgba(40, 40, 60, 0.6)',
          border: `1px solid ${isPlaying ? GOLD : BORDER}`,
          color: isPlaying ? GOLD : TEXT_DIM,
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {isPlaying ? '■' : '▶'}
      </button>
    </div>
  );
}

function HubButton({
  glyph,
  label,
  accent,
  onTap,
}: {
  glyph: string;
  label: string;
  accent: string;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      style={{
        padding: '14px 12px',
        background: `${accent}11`,
        border: `1px solid ${accent}55`,
        borderRadius: 12,
        color: accent,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 22 }}>{glyph}</span>
      <span style={{ fontVariant: 'small-caps', letterSpacing: 0.5 }}>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen 2: Ceremony
// ─────────────────────────────────────────────────────────────────

function CeremonyScreen({
  active,
  onProof,
  onCancel,
  gravityField,
  playingCeremony,
  onToggleAudio,
}: {
  active: ActiveCeremony;
  onProof: (p: SpellProof) => void;
  onCancel: () => void;
  gravityField: GravityField | null;
  playingCeremony: PresetConstellation['ceremony'] | null;
  onToggleAudio: (ceremony: PresetConstellation['ceremony']) => void;
}) {
  const { preset, isWitness, witnessSource } = active;
  const isPlayingThis = playingCeremony === preset.ceremony;

  // Canvas dimensions follow viewport
  const [dims, setDims] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 360,
    h: typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.55, 520) : 460,
  }));

  useEffect(() => {
    const onResize = () =>
      setDims({
        w: window.innerWidth,
        h: Math.min(window.innerHeight * 0.55, 520),
      });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const circuit = useMemo(
    () => layoutCircuit(preset, dims.w, dims.h, gravityField),
    [preset, dims.w, dims.h, gravityField],
  );

  const [startedAt] = useState(() => Date.now());
  const [lapCount, setLapCount] = useState(0);
  const [spellsCast, setSpellsCast] = useState(0);
  const [forging, setForging] = useState(false);

  // Cast feedback — each Cast tap projects the next preset mark's emoji as a
  // transient sprite at that node's position. Sequence cycles through circuit.
  interface CastSprite { key: number; emoji: string; x: number; y: number }
  const [castSprites, setCastSprites] = useState<CastSprite[]>([]);
  const castSeqRef = useRef(0);
  const castKeyRef = useRef(0);

  // Lap detection: track which nodes we've passed in the current lap.
  // A lap completes when we reach the FIRST node again after visiting all others.
  const visitedRef = useRef<Set<string>>(new Set());
  const startNodeId = circuit[0]?.id ?? null;

  const handleNodeReached = (nodeId: string) => {
    visitedRef.current.add(nodeId);
    if (
      nodeId === startNodeId &&
      visitedRef.current.size >= circuit.length &&
      circuit.length > 1
    ) {
      setLapCount(l => l + 1);
      visitedRef.current = new Set([startNodeId]);
    }
  };

  const chargeLevel = getChargeLevel(lapCount);

  const handleCast = () => {
    setSpellsCast(s => s + 1);
    if (circuit.length === 0) return;
    const idx = castSeqRef.current % circuit.length;
    castSeqRef.current += 1;
    const target = circuit[idx];
    const emoji = target.emoji ?? preset.emoji ?? '✨';
    const key = ++castKeyRef.current;
    const sprite: CastSprite = { key, emoji, x: target.x, y: target.y };
    setCastSprites(prev => [...prev, sprite]);
    setTimeout(() => {
      setCastSprites(prev => prev.filter(s => s.key !== key));
    }, 1500);
  };

  const handleForge = async () => {
    if (forging) return;
    setForging(true);
    const traceStart = Date.now();
    const MIN_TRACE_MS = 2600; // ensure the orbs visibly trace before transition
    try {
      const completedAt = Date.now();
      const duration = completedAt - startedAt;
      const effectiveLaps = Math.max(1, lapCount); // a tap-to-forge with no full lap still earns a spark

      const dims_ = calculateBladeDimensions(
        circuit.length,
        effectiveLaps,
        duration,
        chargeLevel,
        spellsCast,
      );
      const stratum = calculateBladeStratum(dims_);
      const tier = calculateBladeTier(effectiveLaps);
      const hex = bladeToHex(dims_);

      const constellationHash = await hashConstellation(circuit);
      const signature = await generateSignature(circuit, effectiveLaps, completedAt);

      const nonce = generateNonce();
      const commitment = await generateCommitment(constellationHash, nonce);

      const { previousHash, chainLength } = getPreviousBladeInfo();
      const bladeHash = await computeBladeHash(
        constellationHash,
        effectiveLaps,
        duration,
        hex,
        stratum,
        previousHash,
        completedAt,
      );
      updateBladeChain(bladeHash, chainLength);

      const proof: SpellProof = {
        lapCount: effectiveLaps,
        duration,
        startedAt,
        completedAt,
        constellationHash,
        nodeCount: circuit.length,
        chargeLevel,
        signature,
        spellsCast,
        bladeDimensions: dims_,
        bladeStratum: stratum,
        bladeTier: tier,
        bladeHex: hex,
        previousBladeHash: previousHash,
        bladeHash,
        chainLength,
        commitment,
        commitmentNonce: nonce,
        commitmentVerified: true,
      };

      // Stash witness source so the forge screen can echo it in the export
      (proof as SpellProof & { _witnessSource?: string })._witnessSource =
        isWitness ? witnessSource : undefined;

      // Hold the visual trace at least MIN_TRACE_MS so the user perceives the
      // ceremony resolving — orbs continue tracing the constellation, the
      // overlay glow blooms, then we transition.
      const elapsed = Date.now() - traceStart;
      if (elapsed < MIN_TRACE_MS) {
        await new Promise(r => setTimeout(r, MIN_TRACE_MS - elapsed));
      }

      onProof(proof);
    } finally {
      setForging(false);
    }
  };

  return (
    <>
      <Header
        title={`${preset.emoji} ${preset.name}`}
        subtitle={`${isWitness ? 'witnessing · ' : ''}${preset.ceremony} blade · ${circuit.length} nodes`}
      />

      <div
        style={{
          padding: '6px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: TEXT_DIM,
          fontVariant: 'small-caps',
          letterSpacing: 0.5,
        }}
      >
        <span>
          lap{' '}
          <span style={{ color: TEXT_BRIGHT, fontWeight: 600 }}>{lapCount}</span>
        </span>
        <span style={{ color: BORDER }}>·</span>
        <span style={{ color: CHARGE_COLOR[chargeLevel], fontWeight: 600 }}>
          {chargeLevel}
        </span>
        <span style={{ color: BORDER }}>·</span>
        <span>
          <span style={{ color: TEXT_BRIGHT, fontWeight: 600 }}>{spellsCast}</span>{' '}
          spells
        </span>
        <span style={{ flex: 1 }} />
        {/* Play / pause the preset's poem narration during the ceremony */}
        <button
          onClick={() => onToggleAudio(preset.ceremony)}
          aria-label={isPlayingThis ? 'pause narration' : 'play narration'}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: isPlayingThis
              ? 'rgba(255, 215, 0, 0.18)'
              : 'rgba(20, 20, 35, 0.6)',
            border: `1px solid ${isPlayingThis ? GOLD : BORDER}`,
            color: isPlayingThis ? GOLD : TEXT,
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
            padding: 0,
            lineHeight: 1,
          }}
        >
          {isPlayingThis ? '■' : '▶'}
        </button>
      </div>

      <div
        style={{
          width: '100%',
          height: dims.h,
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <WanderingOrbs
          width={dims.w}
          height={dims.h}
          isEvoking={false}
          isTracing
          waypointNodes={circuit}
          ceremonyPosition={{ x: dims.w / 2, y: dims.h / 2 }}
          traceColor={GOLD}
          onNodeReached={handleNodeReached}
        />

        {/* Cast emoji sprites — float up + fade out. zIndex above the orbs
            canvas (50) so they appear over the orbs/trace lines. */}
        {castSprites.map(s => (
          <div
            key={s.key}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              fontSize: 32,
              pointerEvents: 'none',
              zIndex: 60,
              animation: 'mobileCastSprite 1.5s ease-out forwards',
              willChange: 'transform, opacity',
              filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))',
            }}
          >
            {s.emoji}
          </div>
        ))}

        {/* Forge tracing glow — blooms while the orbs complete a ceremonial trace */}
        {forging && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 55,
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.04) 45%, transparent 75%)',
              animation: 'mobileForgeGlow 2.6s ease-in-out forwards',
            }}
          />
        )}
        {forging && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 14,
              textAlign: 'center',
              color: GOLD,
              fontSize: 12,
              letterSpacing: 2,
              fontVariant: 'small-caps',
              pointerEvents: 'none',
              zIndex: 60,
              animation: 'mobileForgeLabel 2.6s ease-in-out forwards',
            }}
          >
            forging…
          </div>
        )}
      </div>

      <style>{`
        @keyframes mobileCastSprite {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          18% { opacity: 1; transform: translate(-50%, -60%) scale(1.15); }
          100% { opacity: 0; transform: translate(-50%, -160%) scale(0.95); }
        }
        @keyframes mobileForgeGlow {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        @keyframes mobileForgeLabel {
          0% { opacity: 0; letter-spacing: 0.5px; }
          30% { opacity: 1; letter-spacing: 2.4px; }
          100% { opacity: 0.6; letter-spacing: 3px; }
        }
        /* Two orbs walk back and forth across the mobile constellation
           progress bar — same family as desktop's constellationProgressOrb. */
        @keyframes mobileProgressOrb {
          0%   { left: 5px; }
          50%  { left: calc(100% - 15px); }
          100% { left: 5px; }
        }
      `}</style>

      <div style={{ flex: 1 }} />

      {/* Constellation progress bar — mirrors the desktop Focus-mode widget.
          Always visible during the mobile ceremony since the whole screen IS
          the focus surface; sits just above the Cast / Stop & Forge buttons. */}
      {circuit.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '4px 16px 8px',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 16px',
              background: 'rgba(10, 10, 20, 0.55)',
              border: `1px solid ${GOLD}38`,
              borderRadius: 999,
              backdropFilter: 'blur(6px)',
            }}
          >
            <span
              style={{
                color: GOLD,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                fontVariant: 'small-caps',
                paddingRight: 4,
                borderRight: `1px solid ${GOLD}30`,
                marginRight: 4,
              }}
            >
              lap {lapCount}
            </span>
            {circuit.map((p, i) => (
              <span
                key={`${p.id}-${i}`}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: `${GOLD}99`,
                  display: 'block',
                }}
              />
            ))}
            <span
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: SWORDSMAN,
                top: '50%',
                marginTop: -5,
                left: 5,
                animation: 'mobileProgressOrb 6s ease-in-out infinite',
                filter: `drop-shadow(0 0 6px ${SWORDSMAN}b3)`,
              }}
            />
            <span
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: MAGE,
                top: '50%',
                marginTop: -5,
                left: 5,
                animation: 'mobileProgressOrb 6s ease-in-out -3s infinite',
                filter: `drop-shadow(0 0 6px ${MAGE}b3)`,
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          padding: '16px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <button
          onClick={handleCast}
          disabled={forging}
          style={{
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${MAGE}33, ${MAGE}11)`,
            border: `1px solid ${MAGE}66`,
            borderRadius: 14,
            color: TEXT_BRIGHT,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cast ✨
        </button>

        <button
          onClick={handleForge}
          disabled={forging}
          style={{
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${SWORDSMAN}33, ${SWORDSMAN}11)`,
            border: `1px solid ${SWORDSMAN}66`,
            borderRadius: 14,
            color: TEXT_BRIGHT,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            opacity: forging ? 0.6 : 1,
          }}
        >
          {forging ? 'Forging…' : 'Stop & Forge'}
        </button>

        <button
          onClick={onCancel}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: TEXT_DIM,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← cancel
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen 3: Forge / Download
// ─────────────────────────────────────────────────────────────────

function ForgeScreen({
  active,
  proof,
  onForgeAnother,
}: {
  active: ActiveCeremony;
  proof: SpellProof;
  onForgeAnother: () => void;
}) {
  const defaultName = active.isWitness
    ? `Witness of ${active.preset.name}`
    : active.preset.name;
  const defaultGlyph = active.preset.emoji;

  const [name, setName] = useState(defaultName);
  const [glyph, setGlyph] = useState(defaultGlyph);

  const moonInfo = getMoonPhaseInfo(proof.bladeStratum);

  const downloadConstellation = () => {
    const md = renderConstellationMd(active, proof, name, glyph);
    download(`${slug(name)}-constellation.md`, md);
  };

  const downloadBlade = () => {
    const md = renderBladeMd(active, proof, name, glyph);
    download(`${slug(name)}-blade.md`, md);
  };

  return (
    <>
      <Header title={active.isWitness ? '✦ witnessed' : '✦ forged'} subtitle="" />

      <div
        style={{
          padding: '8px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <BladePortrait
          glyph={glyph}
          tier={proof.bladeTier}
          moonEmoji={stratumToMoonPhase(proof.bladeStratum)}
          isWitness={active.isWitness}
        />
        <div
          style={{
            fontSize: 13,
            color: TEXT_DIM,
            fontFamily: '"JetBrains Mono", monospace',
            marginTop: 8,
          }}
        >
          {proof.signature}
        </div>
        <div style={{ fontSize: 12, color: TEXT_DIM, fontVariant: 'small-caps' }}>
          {proof.bladeTier} · stratum {proof.bladeStratum}/6 · {moonInfo.name.toLowerCase()}
        </div>
      </div>

      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Field label="Name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(30, 30, 45, 0.8)',
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              color: TEXT_BRIGHT,
              fontSize: 15,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </Field>

        <Field label="Glyph">
          <input
            value={glyph}
            onChange={e => setGlyph(e.target.value)}
            maxLength={4}
            style={{
              width: 70,
              padding: '10px 12px',
              background: 'rgba(30, 30, 45, 0.8)',
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              color: TEXT_BRIGHT,
              fontSize: 22,
              textAlign: 'center',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </Field>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: '16px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <button
          onClick={downloadConstellation}
          style={downloadBtnStyle(GOLD)}
        >
          ⬇ constellation.md
        </button>
        <button
          onClick={downloadBlade}
          style={downloadBtnStyle(TIER_COLOR[proof.bladeTier])}
        >
          ⬇ blade.md
        </button>
        <button
          onClick={onForgeAnother}
          style={{
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: TEXT_DIM,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginTop: 4,
          }}
        >
          forge another →
        </button>
      </div>
    </>
  );
}

function downloadBtnStyle(accent: string): React.CSSProperties {
  return {
    padding: '14px 18px',
    background: `${accent}1a`,
    border: `1px solid ${accent}66`,
    borderRadius: 12,
    color: accent,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          fontSize: 12,
          color: TEXT_DIM,
          fontVariant: 'small-caps',
          letterSpacing: 0.5,
          width: 56,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function BladePortrait({
  glyph,
  tier,
  moonEmoji,
  isWitness,
}: {
  glyph: string;
  tier: BladeTier;
  moonEmoji: string;
  isWitness: boolean;
}) {
  const accent = TIER_COLOR[tier];
  return (
    <div
      style={{
        width: 180,
        height: 180,
        borderRadius: isWitness ? '50%' : 24,
        background: `radial-gradient(circle at 50% 35%, ${accent}33, ${accent}08 60%, transparent 100%)`,
        border: `2px solid ${accent}aa`,
        boxShadow: isWitness
          ? `0 0 40px ${accent}66, inset 0 0 30px ${accent}22`
          : `0 0 30px ${accent}55`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
      }}
    >
      <div style={{ fontSize: 56, lineHeight: 1 }}>{glyph}</div>
      <div style={{ fontSize: 24, lineHeight: 1 }}>{moonEmoji}</div>
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          fontSize: 10,
          color: accent,
          fontVariant: 'small-caps',
          letterSpacing: 1,
        }}
      >
        {tier}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen: Web (read-only graph as categorized list)
// ─────────────────────────────────────────────────────────────────

const NODE_TYPE_ORDER: NodeType[] = [
  'document',
  'concept',
  'theorem',
  'spell',
  'act',
  'persona',
  'term',
  'skill',
  'chronicle',
];

const NODE_TYPE_LABEL: Record<NodeType, string> = {
  document: 'Documents',
  concept: 'Concepts',
  theorem: 'Theorems',
  spell: 'Spells',
  act: 'Acts',
  persona: 'Personas',
  term: 'Terms',
  skill: 'Skills',
  chronicle: 'Chronicles',
};

const NODE_TYPE_GLYPH: Record<NodeType, string> = {
  document: '📜',
  concept: '◆',
  theorem: '△',
  spell: '✦',
  act: '◇',
  persona: '○',
  term: '·',
  skill: '⚡',
  chronicle: '✎',
};

// ─────────────────────────────────────────────────────────────────
// Screen: immersive Web (chromeless force-graph with press-to-warp)
// ─────────────────────────────────────────────────────────────────

interface WebSimNode extends d3.SimulationNodeDatum {
  id: string;
  type: NodeType;
  emoji?: string;
  label: string;
}

interface WebSimEdge extends d3.SimulationLinkDatum<WebSimNode> {
  type: string;
}

// Shared style for the WebScreen zoom-control buttons (＋ / − / ⊙).
const zoomButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 18,
  background: 'rgba(10, 10, 25, 0.8)',
  border: '1px solid rgba(255, 215, 0, 0.35)',
  color: '#ffd700',
  fontSize: 16,
  fontFamily: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(6px)',
  userSelect: 'none',
  padding: 0,
};

const NODE_COLOR_BY_TYPE: Record<NodeType, string> = {
  document: '#88c8ff',
  concept: '#ffd700',
  theorem: '#9b59b6',
  spell: '#e74c3c',
  act: '#ff8844',
  persona: '#88e088',
  term: '#7a7a8a',
  skill: '#22d3ee',
  chronicle: '#f0c419',
};

function WebScreen({
  onBack,
  onSettle,
  initialField,
}: {
  onBack: () => void;
  onSettle: (field: GravityField) => void;
  initialField: GravityField | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<d3.Simulation<WebSimNode, WebSimEdge> | null>(null);
  const nodesRef = useRef<WebSimNode[]>([]);
  const edgesRef = useRef<WebSimEdge[]>([]);
  const draggingRef = useRef<{ id: string | null }>({ id: null });
  const swipeRef = useRef<{ startY: number | null; startX: number | null; topZone: boolean }>({
    startY: null,
    startX: null,
    topZone: false,
  });
  const touchedRef = useRef<Set<string>>(new Set(initialField ? Array.from(initialField.keys()) : []));

  // View transform: scale + translation applied to the canvas during draw.
  // Pointer events are inverse-transformed so hit testing and pin placement
  // stay in world (simulation) coordinates regardless of zoom.
  const viewRef = useRef({ scale: 1, tx: 0, ty: 0 });

  const [dims, setDims] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 360,
    h: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  // Track the latest dimensions for use inside event handlers without re-binding.
  const dimsRef = useRef(dims);
  useEffect(() => {
    dimsRef.current = dims;
  }, [dims]);

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Render loop — draws edges underneath nodes. Reset transform each frame to
  // (dpr × view), so zoom controls take effect immediately and don't accumulate.
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = dimsRef.current;
    const v = viewRef.current;

    // Clear in device-pixel space first
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    // Compose dpr scaling + view transform for graph drawing
    ctx.setTransform(dpr * v.scale, 0, 0, dpr * v.scale, dpr * v.tx, dpr * v.ty);

    // Edges first, so they sit beneath the nodes
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(200, 200, 216, 0.18)';
    for (const link of edgesRef.current) {
      const s = link.source as WebSimNode;
      const t = link.target as WebSimNode;
      if (typeof s !== 'object' || typeof t !== 'object') continue;
      ctx.beginPath();
      ctx.moveTo(s.x ?? 0, s.y ?? 0);
      ctx.lineTo(t.x ?? 0, t.y ?? 0);
      ctx.stroke();
    }

    for (const n of nodesRef.current) {
      const x = n.x ?? w / 2;
      const y = n.y ?? h / 2;
      const color = NODE_COLOR_BY_TYPE[n.type] ?? TEXT_DIM;
      const touched = touchedRef.current.has(n.id);
      const r = touched ? 9 : 6;

      ctx.beginPath();
      ctx.arc(x, y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = `${color}1a`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = touched ? 1 : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  // Build the simulation once per dim-set
  useEffect(() => {
    const { w, h } = dims;
    const cx = w / 2;
    const cy = h / 2;
    const rx = (w - 48) / 2;
    const ry = (h - 96) / 2;

    const simNodes: WebSimNode[] = NODES.map((n, i) => {
      // If we have an initial field for this node, restore it; otherwise scatter
      // around a Fibonacci spiral so the layout is stable across mounts.
      const seeded = initialField?.get(n.id);
      let sx: number;
      let sy: number;
      if (seeded) {
        sx = cx + seeded.nx * rx;
        sy = cy + seeded.ny * ry;
      } else {
        const golden = Math.PI * (3 - Math.sqrt(5));
        const angle = i * golden;
        const radius = Math.sqrt(i / NODES.length) * Math.min(rx, ry) * 0.85;
        sx = cx + Math.cos(angle) * radius;
        sy = cy + Math.sin(angle) * radius;
      }
      return {
        id: n.id,
        type: n.type,
        emoji: n.emoji,
        label: n.label,
        x: sx,
        y: sy,
      };
    });
    nodesRef.current = simNodes;

    // Build the edge list. Filter to edges where both endpoints exist as nodes,
    // and clone each edge so d3.forceLink can mutate source/target without
    // poisoning the static EDGES module.
    const nodeIds = new Set(simNodes.map(n => n.id));
    const simEdges: WebSimEdge[] = EDGES
      .filter(e => {
        const s = typeof e.source === 'string' ? e.source : e.source.id;
        const t = typeof e.target === 'string' ? e.target : e.target.id;
        return nodeIds.has(s) && nodeIds.has(t);
      })
      .map(e => ({
        source: typeof e.source === 'string' ? e.source : e.source.id,
        target: typeof e.target === 'string' ? e.target : e.target.id,
        type: e.type,
      }));
    edgesRef.current = simEdges;

    const sim = d3
      .forceSimulation<WebSimNode, WebSimEdge>(simNodes)
      .force(
        'link',
        d3
          .forceLink<WebSimNode, WebSimEdge>(simEdges)
          .id(n => n.id)
          .distance(60)
          .strength(0.4),
      )
      .force('charge', d3.forceManyBody<WebSimNode>().strength(-110))
      .force('center', d3.forceCenter(cx, cy).strength(0.04))
      .force('collision', d3.forceCollide<WebSimNode>(16))
      .alpha(0.6)
      .alphaDecay(0.02)
      .on('tick', draw);

    simRef.current = sim;
    draw();
    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, dims.h]);

  // Resize the canvas backing store when dims change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = `${dims.w}px`;
    canvas.style.height = `${dims.h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, dims.h]);

  const captureField = (): GravityField => {
    const { w, h } = dimsRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const rx = (w - 48) / 2;
    const ry = (h - 96) / 2;
    const field: GravityField = new Map();
    for (const n of nodesRef.current) {
      if (!touchedRef.current.has(n.id)) continue;
      const x = n.x ?? cx;
      const y = n.y ?? cy;
      const nx = Math.max(-1, Math.min(1, (x - cx) / rx));
      const ny = Math.max(-1, Math.min(1, (y - cy) / ry));
      field.set(n.id, { nx, ny });
    }
    return field;
  };

  const exitWithField = () => {
    onSettle(captureField());
    onBack();
  };

  // Map screen → world (simulation) coordinates by inverting the view transform.
  const screenToWorld = (clientX: number, clientY: number) => {
    const v = viewRef.current;
    return {
      x: (clientX - v.tx) / v.scale,
      y: (clientY - v.ty) / v.scale,
    };
  };

  // Zoom around the current viewport center, clamped so users can't get lost.
  const zoomBy = (factor: number) => {
    const { w, h } = dimsRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const old = viewRef.current;
    const nextScale = Math.max(0.3, Math.min(3, old.scale * factor));
    if (nextScale === old.scale) return;
    const ratio = nextScale / old.scale;
    viewRef.current = {
      scale: nextScale,
      tx: cx - (cx - old.tx) * ratio,
      ty: cy - (cy - old.ty) * ratio,
    };
    draw();
  };

  const resetView = () => {
    viewRef.current = { scale: 1, tx: 0, ty: 0 };
    draw();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const y = e.clientY;

    // Edge-swipe-down detection: pointerdown in top 56px of the screen.
    // Stays in screen coords — independent of zoom.
    if (y < 56) {
      swipeRef.current = { startY: y, startX: x, topZone: true };
      return;
    }

    // Find nearest node — convert pointer to world coords, scale hit radius
    // so 50 px on screen stays the effective tap target at any zoom.
    const sim = simRef.current;
    if (!sim) return;
    const v = viewRef.current;
    const { x: wx, y: wy } = screenToWorld(x, y);
    const screenHit = 50;
    const worldHit = screenHit / v.scale;
    let nearest: WebSimNode | null = null;
    let bestDistSq = worldHit * worldHit;
    for (const n of nodesRef.current) {
      const dx = (n.x ?? 0) - wx;
      const dy = (n.y ?? 0) - wy;
      const d = dx * dx + dy * dy;
      if (d < bestDistSq) {
        bestDistSq = d;
        nearest = n;
      }
    }
    if (nearest) {
      nearest.fx = wx;
      nearest.fy = wy;
      draggingRef.current.id = nearest.id;
      touchedRef.current.add(nearest.id);
      sim.alpha(0.85).restart();
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const y = e.clientY;

    // Edge-swipe-down: still uses screen coords.
    if (swipeRef.current.topZone && swipeRef.current.startY !== null) {
      if (y - swipeRef.current.startY > 70) {
        swipeRef.current = { startY: null, startX: null, topZone: false };
        exitWithField();
        return;
      }
      return;
    }

    const id = draggingRef.current.id;
    if (id) {
      const node = nodesRef.current.find(n => n.id === id);
      if (node) {
        const { x: wx, y: wy } = screenToWorld(x, y);
        node.fx = wx;
        node.fy = wy;
        simRef.current?.alpha(Math.max(simRef.current.alpha(), 0.5)).restart();
      }
    }
  };

  const handlePointerUp = () => {
    const id = draggingRef.current.id;
    if (id) {
      const node = nodesRef.current.find(n => n.id === id);
      // Release the pin but keep the node's current x/y as its new resting position.
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      draggingRef.current.id = null;
    }
    swipeRef.current = { startY: null, startX: null, topZone: false };
  };

  const touchedCount = touchedRef.current.size;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        inset: 0,
        background: BG,
        touchAction: 'none',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Floating orbs drift over the graph (non-tracing, no waypoints) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <WanderingOrbs
          width={dims.w}
          height={dims.h}
          isEvoking={false}
          waypointNodes={[]}
          ceremonyPosition={{ x: dims.w / 2, y: dims.h / 2 }}
          isTracing={false}
        />
      </div>

      {/* Top hint — also marks the swipe-down zone */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: TEXT_DIM,
          fontSize: 11,
          letterSpacing: 1.2,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(6,6,14,0.6), transparent)',
        }}
      >
        ↓  swipe down from here to exit  ↓
      </div>

      {/* Zoom controls — sit above the bottom hint, right side. zIndex above
          the orbs canvas (50) so they remain tappable. */}
      <div
        style={{
          position: 'absolute',
          right: 14,
          bottom: 56,
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <button
          onClick={() => zoomBy(1.4)}
          aria-label="zoom in"
          style={zoomButtonStyle}
        >
          ＋
        </button>
        <button
          onClick={() => zoomBy(1 / 1.4)}
          aria-label="zoom out"
          style={zoomButtonStyle}
        >
          −
        </button>
        <button
          onClick={resetView}
          aria-label="reset view"
          style={zoomButtonStyle}
        >
          ⊙
        </button>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: TEXT_DIM,
          fontSize: 11,
          letterSpacing: 0.8,
          pointerEvents: 'none',
        }}
      >
        {touchedCount === 0
          ? 'press and drag a node — the web reshapes around it'
          : `${touchedCount} node${touchedCount === 1 ? '' : 's'} placed · constellations will warp`}
      </div>
    </div>
  );
}

function ArchiveScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<SpellwebNode | null>(null);

  const grouped = useMemo(() => {
    const out: Record<NodeType, SpellwebNode[]> = {
      document: [],
      concept: [],
      theorem: [],
      spell: [],
      act: [],
      persona: [],
      term: [],
      skill: [],
      chronicle: [],
    };
    NODES.forEach(n => {
      if (out[n.type]) out[n.type].push(n);
    });
    return out;
  }, []);

  return (
    <>
      <BackHeader title="📚 archive" subtitle="tap a node to learn" onBack={onBack} />

      <div
        style={{
          padding: '0 16px 24px',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {NODE_TYPE_ORDER.map(type => {
          const nodes = grouped[type];
          if (!nodes || nodes.length === 0) return null;
          return (
            <div key={type} style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  color: TEXT_DIM,
                  fontVariant: 'small-caps',
                  letterSpacing: 1,
                  marginBottom: 6,
                  paddingBottom: 4,
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                {NODE_TYPE_LABEL[type]} · {nodes.length}
              </div>
              {nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelected(node)}
                  style={{
                    width: '100%',
                    padding: '10px 4px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${BORDER}55`,
                    color: TEXT,
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                    {node.emoji ?? NODE_TYPE_GLYPH[node.type]}
                  </span>
                  <span style={{ flex: 1 }}>{node.label}</span>
                  <span style={{ color: TEXT_DIM, fontSize: 11 }}>›</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {selected && <NodeInfoSheet node={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function NodeInfoSheet({
  node,
  onClose,
}: {
  node: SpellwebNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80vh',
          background: PANEL,
          borderTop: `1px solid ${BORDER}`,
          borderRadius: '16px 16px 0 0',
          padding: '20px 18px 28px',
          overflowY: 'auto',
          color: TEXT,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 36, lineHeight: 1 }}>
            {node.emoji ?? NODE_TYPE_GLYPH[node.type]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: TEXT_BRIGHT }}>
              {node.label}
            </div>
            <div
              style={{
                fontSize: 11,
                color: TEXT_DIM,
                fontVariant: 'small-caps',
                letterSpacing: 0.5,
                marginTop: 2,
              }}
            >
              {node.type} · {node.domain.replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: 'transparent',
              border: 'none',
              color: TEXT_DIM,
              fontSize: 22,
              cursor: 'pointer',
              padding: 0,
              width: 28,
              height: 28,
            }}
          >
            ✕
          </button>
        </div>

        {node.proverb && (
          <div
            style={{
              fontSize: 14,
              color: TEXT_DIM,
              fontStyle: 'italic',
              marginBottom: 16,
              padding: '10px 14px',
              background: 'rgba(255, 215, 0, 0.05)',
              borderLeft: `2px solid ${GOLD}66`,
              borderRadius: 4,
            }}
          >
            “{node.proverb}”
          </div>
        )}

        <div style={{ fontSize: 14, lineHeight: 1.5, color: TEXT, marginBottom: 16 }}>
          {node.desc}
        </div>

        {node.emojiSpell && (
          <InfoRow label="Spell" value={node.emojiSpell} mono />
        )}
        {node.spellbook && (
          <InfoRow label="Book" value={node.spellbook.replace(/_/g, ' ')} />
        )}
        {node.version && <InfoRow label="Version" value={node.version} />}
        {node.dimensions && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: TEXT_DIM,
                fontVariant: 'small-caps',
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              Dimensions
            </div>
            <DimensionBars dims={node.dimensions} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', fontSize: 13 }}>
      <span
        style={{
          width: 70,
          color: TEXT_DIM,
          fontVariant: 'small-caps',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          color: TEXT_BRIGHT,
          fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DimensionBars({ dims }: { dims: NonNullable<SpellwebNode['dimensions']> }) {
  const rows = [
    { name: 'd1 Hide', value: dims.d1Hide },
    { name: 'd2 Commit', value: dims.d2Commit },
    { name: 'd3 Prove', value: dims.d3Prove },
    { name: 'd4 Connect', value: dims.d4Connect },
    { name: 'd5 Reflect', value: dims.d5Reflect },
    { name: 'd6 Delegate', value: dims.d6Delegate },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {rows.map(r => (
        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
          <span style={{ width: 80, color: TEXT_DIM }}>{r.name}</span>
          <div
            style={{
              flex: 1,
              height: 8,
              background: 'rgba(40, 40, 60, 0.6)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.round(r.value * 100)}%`,
                height: '100%',
                background: r.value >= 0.5 ? GOLD : `${GOLD}55`,
              }}
            />
          </div>
          <span style={{ width: 32, color: TEXT_DIM, textAlign: 'right' }}>
            {r.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen: Mage menu (identity, spells, key export/import)
// ─────────────────────────────────────────────────────────────────

function MageScreen({ onBack }: { onBack: () => void }) {
  const [identity, setIdentity] = useState<MageIdentity | null>(null);
  const [spells, setSpells] = useState<MageSpellData[]>([]);
  const [showAddSpell, setShowAddSpell] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setIdentity(getMageIdentity());
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.mageSpells);
      setSpells(saved ? (JSON.parse(saved) as MageSpellData[]) : []);
    } catch {
      setSpells([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const persistSpells = (next: MageSpellData[]) => {
    setSpells(next);
    try {
      localStorage.setItem(SPELLWEB_STORAGE_KEYS.mageSpells, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const handleInitialize = async () => {
    await initializeMageIdentity();
    refresh();
    setStatusMsg('Mage identity created.');
  };

  const handleUnequipSpell = (idx: number) => {
    const next = spells.filter((_, i) => i !== idx);
    persistSpells(next);
  };

  const handleAddSpell = (node: SpellwebNode) => {
    if (spells.length >= 6) return;
    if (spells.some(s => s.nodeId === node.id)) return;
    const newSpell: MageSpellData = {
      nodeId: node.id,
      label: node.label,
      emoji: node.emoji,
      emojiSpell: node.emojiSpell,
      proverb: node.proverb,
      hexagramLine: spells.length, // assign next available line 0-5
    };
    persistSpells([...spells, newSpell]);
    setShowAddSpell(false);
  };

  const handleExportConfirmed = () => {
    const backup = exportMageKeyBackup();
    if (!backup) {
      setStatusMsg('No identity to export.');
      setShowExportConfirm(false);
      return;
    }
    const json = JSON.stringify(backup, null, 2);
    download(`${backup.mageId}-key-backup.json`, json, 'application/json');
    setShowExportConfirm(false);
    setStatusMsg('Key backup downloaded. Store it somewhere safe.');
  };

  const handleImportFile = async (file: File) => {
    setStatusMsg(null);
    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as MageKeyBackup;
      const ok = importMageKeyBackup(parsed);
      if (!ok) {
        setStatusMsg('Import failed — file did not contain a valid backup.');
        return;
      }
      refresh();
      setStatusMsg('Mage identity restored from backup.');
    } catch {
      setStatusMsg('Could not parse backup file.');
    }
  };

  return (
    <>
      <BackHeader title="🧙 Mage" subtitle="identity · spells · keys" onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        {/* Identity card */}
        {identity ? (
          <div
            style={{
              padding: 16,
              background: PANEL,
              border: `1px solid ${MAGE}55`,
              borderRadius: 14,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 12, color: TEXT_DIM, fontVariant: 'small-caps' }}>
              your mage
            </div>
            <div
              style={{
                fontSize: 15,
                fontFamily: '"JetBrains Mono", monospace',
                color: MAGE,
                marginTop: 4,
                wordBreak: 'break-all',
              }}
            >
              {identity.mageId}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: TEXT_DIM,
                fontFamily: '"JetBrains Mono", monospace',
                wordBreak: 'break-all',
              }}
            >
              <span style={{ color: TEXT }}>pubkey:</span> {identity.publicKeyHex.slice(0, 32)}…
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: TEXT_DIM }}>
              <span>{identity.bladesForged} blades forged</span>
              <span>·</span>
              <span>{identity.runecrafted ? 'runecrafted' : 'solo'}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInitialize}
            style={{
              width: '100%',
              padding: '16px 18px',
              background: `${MAGE}22`,
              border: `1px solid ${MAGE}66`,
              borderRadius: 14,
              color: MAGE,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: 16,
            }}
          >
            🧙 Create Mage Identity
          </button>
        )}

        {/* Spells */}
        <SectionLabel>Equipped Spells · {spells.length}/6</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {spells.map((spell, i) => (
            <div
              key={`${spell.nodeId}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: PANEL,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>{spell.emoji ?? '✦'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: TEXT_BRIGHT, fontWeight: 500 }}>
                  {spell.label}
                </div>
                {spell.proverb && (
                  <div
                    style={{
                      fontSize: 12,
                      color: TEXT_DIM,
                      fontStyle: 'italic',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    “{spell.proverb}”
                  </div>
                )}
              </div>
              <button
                onClick={() => handleUnequipSpell(i)}
                aria-label="unequip"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: TEXT_DIM,
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {spells.length < 6 && (
            <button
              onClick={() => setShowAddSpell(true)}
              style={{
                padding: '14px 18px',
                background: 'transparent',
                border: `1px dashed ${BORDER}`,
                borderRadius: 12,
                color: TEXT_DIM,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + add a spell
            </button>
          )}
        </div>

        {/* Keys */}
        <SectionLabel>Keys</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setShowExportConfirm(true)}
            disabled={!identity}
            style={{
              padding: '14px 18px',
              background: identity ? `${MAGE}1a` : 'rgba(60, 60, 80, 0.2)',
              border: `1px solid ${identity ? `${MAGE}66` : BORDER}`,
              borderRadius: 12,
              color: identity ? MAGE : TEXT_DIM,
              fontSize: 15,
              fontWeight: 600,
              cursor: identity ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            ⬇ export keys
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '14px 18px',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              color: TEXT,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ⬆ import keys
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = '';
            }}
          />
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 215, 0, 0.05)',
              border: `1px solid ${GOLD}33`,
              borderRadius: 10,
              color: GOLD,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {statusMsg}
          </div>
        )}
      </div>

      {showAddSpell && (
        <SpellPicker
          excludeIds={spells.map(s => s.nodeId)}
          onPick={handleAddSpell}
          onClose={() => setShowAddSpell(false)}
        />
      )}

      {showExportConfirm && (
        <ConfirmDialog
          icon="⚠"
          title="Export Mage Keys"
          message="This file contains your PRIVATE KEY. Anyone with it can act as you. Use it only to move your Mage to another browser."
          confirmLabel="Download"
          confirmAccent={MAGE}
          onCancel={() => setShowExportConfirm(false)}
          onConfirm={handleExportConfirmed}
        />
      )}
    </>
  );
}

function SpellPicker({
  excludeIds,
  onPick,
  onClose,
}: {
  excludeIds: string[];
  onPick: (node: SpellwebNode) => void;
  onClose: () => void;
}) {
  const candidates = useMemo(
    () => NODES.filter(n => n.type === 'spell' && !excludeIds.includes(n.id)),
    [excludeIds],
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80vh',
          background: PANEL,
          borderTop: `1px solid ${BORDER}`,
          borderRadius: '16px 16px 0 0',
          padding: '20px 18px 28px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT_BRIGHT, flex: 1 }}>
            Choose a spell
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: 'transparent',
              border: 'none',
              color: TEXT_DIM,
              fontSize: 22,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
        {candidates.length === 0 && (
          <div style={{ color: TEXT_DIM, fontSize: 13, textAlign: 'center', padding: 24 }}>
            No more spells available — all in your grimoire already.
          </div>
        )}
        {candidates.map(node => (
          <button
            key={node.id}
            onClick={() => onPick(node)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 4px',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${BORDER}55`,
              color: TEXT,
              fontSize: 14,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>
              {node.emoji ?? '✦'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: TEXT_BRIGHT, fontWeight: 500 }}>{node.label}</div>
              {node.proverb && (
                <div
                  style={{
                    fontSize: 12,
                    color: TEXT_DIM,
                    fontStyle: 'italic',
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  “{node.proverb}”
                </div>
              )}
            </div>
            <span style={{ color: TEXT_DIM, fontSize: 14 }}>+</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen: Sword menu (blade equip, swordsman link)
// ─────────────────────────────────────────────────────────────────

function SwordScreen({ onBack }: { onBack: () => void }) {
  const [forged, setForged] = useState<ForgedBlade[]>([]);
  const [equippedId, setEquippedId] = useState<string | null>(null);
  const [link, setLink] = useState<SwordsmanLink | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const refresh = () => {
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.forgedBlades);
      setForged(saved ? (JSON.parse(saved) as ForgedBlade[]) : []);
    } catch {
      setForged([]);
    }
    try {
      const eq = localStorage.getItem(SPELLWEB_STORAGE_KEYS.equippedBlade);
      if (eq) {
        const parsed = JSON.parse(eq);
        setEquippedId(parsed?.id ?? null);
      } else {
        setEquippedId(null);
      }
    } catch {
      setEquippedId(null);
    }
    setLink(getSwordsmanLink());
  };

  useEffect(() => {
    refresh();
  }, []);

  const equipBlade = (blade: ForgedBlade) => {
    const equipped = {
      id: blade.id,
      name: blade.name,
      emoji: blade.emoji,
      constellationMarks: [], // mobile keeps this minimal — desktop populates with full marks
    };
    try {
      localStorage.setItem(SPELLWEB_STORAGE_KEYS.equippedBlade, JSON.stringify(equipped));
      setEquippedId(blade.id);
      setStatusMsg(`Equipped ${blade.emoji} ${blade.name}.`);
    } catch {
      setStatusMsg('Could not save equipped blade.');
    }
  };

  const unequip = () => {
    try {
      localStorage.removeItem(SPELLWEB_STORAGE_KEYS.equippedBlade);
      setEquippedId(null);
      setStatusMsg('Unequipped.');
    } catch {
      // ignore
    }
  };

  const equipped = forged.find(b => b.id === equippedId) ?? null;

  return (
    <>
      <BackHeader title="⚔️ Sword" subtitle="blades · swordsman link" onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        {/* Equipped */}
        <SectionLabel>Equipped Blade</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          {equipped ? (
            <div
              style={{
                padding: 16,
                background: PANEL,
                border: `1px solid ${TIER_COLOR[equipped.tier]}66`,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ fontSize: 36 }}>{equipped.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: TEXT_BRIGHT }}>
                  {equipped.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: TEXT_DIM,
                    fontVariant: 'small-caps',
                    marginTop: 2,
                  }}
                >
                  {equipped.tier} · stratum {equipped.stratum}/6 ·{' '}
                  {stratumToMoonPhase(equipped.stratum)}
                </div>
              </div>
              <button
                onClick={unequip}
                aria-label="unequip"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: TEXT_DIM,
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: 16,
                background: 'transparent',
                border: `1px dashed ${BORDER}`,
                borderRadius: 14,
                color: TEXT_DIM,
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              No blade equipped — pick one below.
            </div>
          )}
        </div>

        {/* Inventory */}
        <SectionLabel>Forged Blades · {forged.length}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {forged.length === 0 && (
            <div
              style={{
                padding: 14,
                color: TEXT_DIM,
                fontSize: 13,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              No blades yet. Forge one through a ceremony.
            </div>
          )}
          {forged.map(blade => {
            const isEq = blade.id === equippedId;
            return (
              <button
                key={blade.id}
                onClick={() => (isEq ? unequip() : equipBlade(blade))}
                style={{
                  padding: '12px 14px',
                  background: isEq ? `${TIER_COLOR[blade.tier]}1a` : PANEL,
                  border: `1px solid ${
                    isEq ? `${TIER_COLOR[blade.tier]}88` : BORDER
                  }`,
                  borderRadius: 12,
                  color: TEXT,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    width: 36,
                    textAlign: 'center',
                    filter: blade.isWitness ? 'drop-shadow(0 0 6px #88c8ff)' : 'none',
                  }}
                >
                  {blade.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT_BRIGHT }}>
                    {blade.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: TEXT_DIM,
                      fontVariant: 'small-caps',
                      marginTop: 2,
                    }}
                  >
                    {blade.isWitness ? 'witness · ' : ''}
                    {blade.tier} · stratum {blade.stratum}/6
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: isEq ? TIER_COLOR[blade.tier] : TEXT_DIM,
                    fontVariant: 'small-caps',
                    letterSpacing: 0.5,
                  }}
                >
                  {isEq ? 'equipped' : 'tap'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Swordsman link */}
        <SectionLabel>Linked Swordsman</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          {link ? (
            <div
              style={{
                padding: 16,
                background: PANEL,
                border: `1px solid ${SWORDSMAN}55`,
                borderRadius: 14,
              }}
            >
              <div style={{ fontSize: 11, color: TEXT_DIM, fontVariant: 'small-caps' }}>
                linked
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: SWORDSMAN,
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                ⚔️ {link.displayName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: TEXT_DIM,
                  marginTop: 4,
                  wordBreak: 'break-all',
                }}
              >
                {link.participantId}
              </div>
              {link.constellationPath && (
                <div style={{ fontSize: 14, marginTop: 6 }}>{link.constellationPath}</div>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: 14,
                color: TEXT_DIM,
                fontSize: 13,
                textAlign: 'center',
                border: `1px dashed ${BORDER}`,
                borderRadius: 12,
              }}
            >
              Not linked. Import a Swordsman from agentprivacy.ai.
            </div>
          )}
          <button
            onClick={() => setShowImport(true)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '14px 18px',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              color: TEXT,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ⬆ link / update Swordsman
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 215, 0, 0.05)',
              border: `1px solid ${GOLD}33`,
              borderRadius: 10,
              color: GOLD,
              fontSize: 13,
            }}
          >
            {statusMsg}
          </div>
        )}
      </div>

      {showImport && (
        <SwordsmanImportSheet
          onClose={() => setShowImport(false)}
          onImported={(imported) => {
            saveSwordsmanLink(imported);
            setLink(imported);
            setShowImport(false);
            setStatusMsg(`Linked ${imported.displayName}.`);
          }}
        />
      )}
    </>
  );
}

function SwordsmanImportSheet({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: (link: SwordsmanLink) => void;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      if (!parsed.publicKeyHex || !/^[0-9a-f]{64}$/i.test(parsed.publicKeyHex)) {
        throw new Error('Missing or invalid publicKeyHex (expected 64 hex chars)');
      }
      if (!parsed.participantId || !/^ap-[0-9a-f]{16}$/i.test(parsed.participantId)) {
        throw new Error('Missing or invalid participantId (expected ap-{16hex})');
      }
      const link: SwordsmanLink = {
        participantId: parsed.participantId,
        displayName: parsed.displayName || 'Unknown Swordsman',
        publicKeyHex: parsed.publicKeyHex,
        trustTier: parsed.trustTier || 'blade',
        constellationPath: parsed.constellationPath,
        linkedAt: new Date().toISOString(),
      };
      onImported(link);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '85vh',
          background: PANEL,
          borderTop: `1px solid ${BORDER}`,
          borderRadius: '16px 16px 0 0',
          padding: '20px 18px 28px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT_BRIGHT, flex: 1 }}>
            Link Swordsman
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: 'transparent',
              border: 'none',
              color: TEXT_DIM,
              fontSize: 22,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 13, color: TEXT_DIM, marginBottom: 12, lineHeight: 1.5 }}>
          Paste your agentprivacy.ai swordsman export below.
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`{
  "publicKeyHex": "...",
  "participantId": "ap-...",
  "displayName": "..."
}`}
          style={{
            width: '100%',
            minHeight: 140,
            padding: 12,
            background: 'rgba(30, 30, 45, 0.8)',
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            color: TEXT_BRIGHT,
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        {error && (
          <div
            style={{
              marginTop: 8,
              padding: '8px 12px',
              background: 'rgba(255, 100, 100, 0.08)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              borderRadius: 8,
              color: '#ff6e6e',
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          style={{
            width: '100%',
            marginTop: 14,
            padding: '14px 18px',
            background: input.trim() ? `${SWORDSMAN}1a` : 'rgba(60, 60, 80, 0.2)',
            border: `1px solid ${input.trim() ? `${SWORDSMAN}66` : BORDER}`,
            borderRadius: 12,
            color: input.trim() ? SWORDSMAN : TEXT_DIM,
            fontSize: 15,
            fontWeight: 600,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          ⚔️ Link Identity
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shared bits: confirm dialog, section label, back header
// ─────────────────────────────────────────────────────────────────

function ConfirmDialog({
  icon,
  title,
  message,
  confirmLabel,
  confirmAccent,
  onCancel,
  onConfirm,
}: {
  icon: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmAccent: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 360,
          width: '100%',
          background: PANEL,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '24px 22px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: TEXT_BRIGHT }}>{title}</span>
        </div>
        <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.5, marginBottom: 18 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 14px',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              color: TEXT,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 14px',
              background: `${confirmAccent}22`,
              border: `1px solid ${confirmAccent}88`,
              borderRadius: 10,
              color: confirmAccent,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: TEXT_DIM,
        fontVariant: 'small-caps',
        letterSpacing: 1,
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function BackHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        padding: '20px 16px 12px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <button
        onClick={onBack}
        aria-label="back"
        style={{
          background: 'transparent',
          border: 'none',
          color: TEXT,
          fontSize: 20,
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          marginTop: 2,
        }}
      >
        ←
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: TEXT_BRIGHT }}>{title}</div>
        {subtitle && (
          <div
            style={{
              fontSize: 12,
              color: TEXT_DIM,
              marginTop: 4,
              fontVariant: 'small-caps',
              letterSpacing: 0.5,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        padding: '20px 16px 12px',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, color: TEXT_BRIGHT }}>
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: TEXT_DIM,
            marginTop: 4,
            fontVariant: 'small-caps',
            letterSpacing: 0.5,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Markdown rendering & parsing
// ─────────────────────────────────────────────────────────────────

function renderConstellationMd(
  active: ActiveCeremony,
  proof: SpellProof,
  name: string,
  glyph: string,
): string {
  const { preset, isWitness } = active;
  const moonInfo = getMoonPhaseInfo(proof.bladeStratum);

  const lines: string[] = [
    `# ${glyph} ${name}`,
    `*${isWitness ? 'Witnessed' : 'Forged'}: ${new Date(proof.completedAt).toLocaleString()}*`,
    '',
    isWitness ? '## Witness Blade' : '## Forged Blade',
    `**${glyph} ${name}**`,
    `- **Tier:** ${capitalize(proof.bladeTier)} Blade`,
    `- **Stratum:** ${proof.bladeStratum}/6 ${stratumToMoonPhase(proof.bladeStratum)} (${moonInfo.name})`,
    `- **Forged:** ${new Date(proof.completedAt).toLocaleString()}`,
    `- **Nodes:** ${proof.nodeCount}`,
    `- **Source:** ${preset.emoji} ${preset.name}`,
    '',
    '### Blade Dimensions',
    '| Dimension | Status |',
    '|-----------|--------|',
    `| 🛡️ Protection | ${proof.bladeDimensions.protection ? '✅ Active' : '⬜ Dormant'} |`,
    `| 🤝 Delegation | ${proof.bladeDimensions.delegation ? '✅ Active' : '⬜ Dormant'} |`,
    `| 📜 Memory | ${proof.bladeDimensions.memory ? '✅ Active' : '⬜ Dormant'} |`,
    `| 🔗 Connection | ${proof.bladeDimensions.connection ? '✅ Active' : '⬜ Dormant'} |`,
    `| ⚡ Computation | ${proof.bladeDimensions.computation ? '✅ Active' : '⬜ Dormant'} |`,
    `| 💎 Value | ${proof.bladeDimensions.value ? '✅ Active' : '⬜ Dormant'} |`,
    '',
    '## Proof of Presence',
    `- **Charge Level:** ${proof.chargeLevel.toUpperCase()} 🔥`,
    `- **Laps:** ${proof.lapCount}`,
    `- **Duration:** ${Math.round(proof.duration / 1000)}s`,
    `- **Spells Cast:** ${proof.spellsCast}`,
    '',
    '### Cryptographic Proof',
    '```',
    `Signature: ${proof.signature}`,
    `Hash: ${proof.constellationHash}`,
    `Hex: ${proof.bladeHex}`,
    `Blade Hash: ${proof.bladeHash}`,
    `Chain: #${proof.chainLength}${proof.previousBladeHash ? ` (prev: ${proof.previousBladeHash.slice(0, 8)}...)` : ' (inception)'}`,
    '```',
    '',
    '## Inscribed Spell',
    `\`${preset.inscribedSpell}\``,
    '',
  ];

  if (preset.reflection) {
    lines.push('## Reflection', `> ${preset.reflection}`, '');
  }

  lines.push('## Constellation Path');
  preset.marks.forEach((m, i) => {
    lines.push(
      `${i + 1}. ${m.emoji ?? '◆'} **${m.note ?? m.nodeId}**${m.emojiSpell ? ` — \`${m.emojiSpell}\`` : ''}`,
    );
  });
  lines.push('');

  if (preset.connections.length > 0) {
    lines.push('## Connections');
    preset.connections.forEach(c => {
      const src = preset.marks.find(m => m.nodeId === c.sourceId);
      const tgt = preset.marks.find(m => m.nodeId === c.targetId);
      lines.push(
        `- ${src?.emoji ?? '◆'} ${src?.note ?? c.sourceId} → ${tgt?.emoji ?? '◆'} ${tgt?.note ?? c.targetId}`,
      );
    });
    lines.push('');
  }

  lines.push('---', '*Forged in the 64-Tetrahedra Lattice*', '*(⚔️⊥⿻⊥🧙)🙂*');
  return lines.join('\n');
}

function renderBladeMd(
  active: ActiveCeremony,
  proof: SpellProof,
  name: string,
  glyph: string,
): string {
  const moonInfo = getMoonPhaseInfo(proof.bladeStratum);
  const lines: string[] = [
    `# ${glyph} ${name}`,
    `*${active.isWitness ? 'Witness' : 'Forged'} Blade — ${new Date(proof.completedAt).toLocaleString()}*`,
    '',
    `**Tier:** ${capitalize(proof.bladeTier)}`,
    `**Stratum:** ${proof.bladeStratum}/6 ${stratumToMoonPhase(proof.bladeStratum)} (${moonInfo.name})`,
    `**Hex:** \`${proof.bladeHex}\``,
    `**Signature:** \`${proof.signature}\``,
    '',
    '### Dimensions',
    `- 🛡️ Protection: ${proof.bladeDimensions.protection ? 'on' : 'off'}`,
    `- 🤝 Delegation: ${proof.bladeDimensions.delegation ? 'on' : 'off'}`,
    `- 📜 Memory: ${proof.bladeDimensions.memory ? 'on' : 'off'}`,
    `- 🔗 Connection: ${proof.bladeDimensions.connection ? 'on' : 'off'}`,
    `- ⚡ Computation: ${proof.bladeDimensions.computation ? 'on' : 'off'}`,
    `- 💎 Value: ${proof.bladeDimensions.value ? 'on' : 'off'}`,
    '',
    '### Proof',
    '```',
    `Signature: ${proof.signature}`,
    `Constellation Hash: ${proof.constellationHash}`,
    `Blade Hash: ${proof.bladeHash}`,
    `Chain: #${proof.chainLength}`,
    `Charge: ${proof.chargeLevel}`,
    `Laps: ${proof.lapCount}`,
    `Duration: ${Math.round(proof.duration / 1000)}s`,
    `Spells: ${proof.spellsCast}`,
    '```',
    '',
    `*Source ceremony: ${active.preset.emoji} ${active.preset.name}*`,
    '*(⚔️⊥⿻⊥🧙)🙂*',
  ];
  return lines.join('\n');
}

/**
 * Parse a constellation `.md` (produced by spellweb's export) back into a
 * pseudo-preset that can drive the ceremony screen for a witness flow.
 *
 * We don't try to reconstruct the original blade — only the path, name,
 * inscribed spell, and ceremony hint. The witness re-traces and forges a
 * new (witness) blade of their own.
 */
function parseConstellationMarkdown(content: string): PresetConstellation | null {
  // Header: # ⚔️ Name
  const titleMatch = content.match(/^#\s+(.+?)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Imported constellation';

  // Match constellation path lines: "1. ⚔️ **Label**" or "1. ⚔️ **Label** — `spell`"
  const pathRegex = /^(\d+)\.\s+(\S+)\s+\*\*(.+?)\*\*(?:\s+[—-]\s+`(.+?)`)?/gm;
  const marks: PresetConstellation['marks'] = [];
  let m: RegExpExecArray | null;
  while ((m = pathRegex.exec(content)) !== null) {
    marks.push({
      nodeId: `imported-${marks.length}`,
      emoji: m[2],
      note: m[3],
      emojiSpell: m[4],
    });
  }

  if (marks.length < 2) return null;

  // Inscribed spell: ## Inscribed Spell\n`...`
  const inscribedMatch = content.match(/##\s+Inscribed Spell\s*\n+`([^`]+)`/);
  const inscribed = inscribedMatch ? inscribedMatch[1] : marks.map(m => m.emoji).join(' → ');

  // Build connections sequentially
  const connections = marks.slice(0, -1).map((mk, i) => ({
    sourceId: mk.nodeId,
    targetId: marks[i + 1].nodeId,
  }));

  // Pull the leading emoji + name from the title
  const titleEmojiMatch = title.match(/^(\S+)\s+(.+)$/);
  const emoji = titleEmojiMatch ? titleEmojiMatch[1] : '📜';
  const name = titleEmojiMatch ? titleEmojiMatch[2] : title;

  return {
    id: `imported-${Date.now()}`,
    name,
    emoji,
    description: 'Imported constellation from a witness',
    proverb: 'Witnessing another\'s path',
    ceremony: 'celestial',
    tier: 'blade',
    nodeCount: marks.length,
    marks,
    connections,
    inscribedSpell: inscribed,
  };
}

// ─────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────

function download(filename: string, content: string, mime: string = 'text/markdown') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(s: string): string {
  return s.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
