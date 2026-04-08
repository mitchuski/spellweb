import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import type { SpellwebNode, SpellwebEdge, FilterState, TypeFilterState, SpellbookFilterState, SpellwebBladePayloadV1 } from '../types/graph';
import { SPELLWEB_STORAGE_KEYS, encodeBladePayloadForUrl, DIMENSION_MAPPING, stratumToMoonPhase, getMoonPhaseInfo } from '../types/graph';
import { NODES } from '../data/nodes';
import { EDGES } from '../data/edges';
import { CONSTELLATION_PRESETS } from '../data/presets';
import { THEME, getNodeVisual, getNodeRadius, getEdgeStyle } from '../data/theme';
import { Header } from './Header';
import { GraphFilters } from './GraphFilters';
import { Legend } from './Legend';
import { HoverTooltip } from './HoverTooltip';
import { NodeInspector } from './NodeInspector';
import { SpellCeremony, type SpellProof } from './SpellCeremony';
import { WanderingOrbs } from './WanderingOrbs';
import { SwordsmanImport } from './SwordsmanImport';

import {
  hasMageIdentity,
  initializeMageIdentity,
  signBlade,
  getMageIdentity,
  getSwordsmanLink,
  saveSwordsmanLink,
  exportMageKeyBackup,
  type SwordsmanLink,
} from '../lib/mageIdentity';
// D3 simulation node type
interface SimulationNode extends SpellwebNode {
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

interface SimulationEdge {
  source: SimulationNode | string;
  target: SimulationNode | string;
  type: string;
}

// Connection mode state
interface ConnectionState {
  active: boolean;
  sourceNode: SpellwebNode | null;
}

// Helper to extract the first emoji from a string (handles multi-emoji strings)
function getFirstEmoji(str: string | undefined): string {
  if (!str) return '✦';
  // Match emoji using Unicode ranges (emojis, symbols, etc.)
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const matches = str.match(emojiRegex);
  return matches && matches[0] ? matches[0] : str.charAt(0) || '✦';
}

export default function SpellWeb() {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimulationNode, SimulationEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInitialized = useRef(false);
  const nodeDataRef = useRef<SimulationNode[]>([]);
  const edgeDataRef = useRef<SimulationEdge[]>([]);

  const [selectedNode, setSelectedNode] = useState<SpellwebNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNode, setHoveredNode] = useState<SpellwebNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [connectionMode, setConnectionMode] = useState<ConnectionState>({ active: false, sourceNode: null });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectTarget, setConnectTarget] = useState<SpellwebNode | null>(null);
  const [reflectNote, setReflectNote] = useState("");
  const [selectedEdgeType, setSelectedEdgeType] = useState<string>("narrates");
  const [castingSpells, setCastingSpells] = useState(false);
  const [incantationActive, setIncantationActive] = useState(false);
  // Casting mode during evoke: 'constellation' (free, path spells) or 'mage' (costs mana, inventory spells)
  const [castingMode, setCastingMode] = useState<'constellation' | 'mage'>('constellation');

  // Constellation - marked nodes with custom emoji/note
  interface ConstellationMark {
    nodeId: string;
    nodeLabel: string;
    emoji: string;
    note: string;
    emojiSpell?: string; // Optional spell sequence for ceremony paths
  }
  interface ConstellationConnection {
    sourceId: string;
    targetId: string;
    note: string;
  }
  // Saved constellation structure
  interface SavedConstellation {
    id: string;
    name: string;
    createdAt: string;
    marks: ConstellationMark[];
    connections: ConstellationConnection[];
    inscribedSpell?: string;
    reflection?: string;
    proof?: SpellProof; // Proof of presence from evoke ceremony
  }

  // Forged blade structure
  interface ForgedBlade {
    id: string;
    name: string;
    emoji: string;
    tier: 'light' | 'heavy' | 'dragon';
    stratum: number;
    proof: SpellProof;
    forgedAt: string;
    constellationNodes: number;
    constellationMarks: ConstellationMark[]; // Store the actual path
    constellationConnections: ConstellationConnection[];
    // Witness blade fields (Promise Theory bilateral exchange)
    isWitness?: boolean;              // True if forged while witnessing another's constellation
    witnessOf?: string;               // Hash of the original constellation being witnessed
    witnessedFrom?: string;           // Optional: identifier of who shared the constellation
  }
  const [constellation, setConstellation] = useState<ConstellationMark[]>([]);
  const [constellationConnections, setConstellationConnections] = useState<ConstellationConnection[]>([]);
  // User-created edges from "Connect from Here" - these persist as real graph edges
  const [userEdges, setUserEdges] = useState<SpellwebEdge[]>(() => {
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.userEdges);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [savedConstellations, setSavedConstellations] = useState<SavedConstellation[]>(() => {
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.constellations);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeConstellationId, setActiveConstellationId] = useState<string | null>(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markEmoji, setMarkEmoji] = useState("");
  const [markNote, setMarkNote] = useState("");

  // Waypoint mode - path building through the graph
  interface WaypointState {
    active: boolean;
    path: string[]; // node IDs in order visited
  }
  const [waypoint, setWaypoint] = useState<WaypointState>({
    active: false,
    path: [],
  });
  // Close Portal modal state
  const [showClosePortalModal, setShowClosePortalModal] = useState(false);
  const [pathMarks, setPathMarks] = useState<Record<string, { emoji: string; note: string }>>({});
  const [constellationName, setConstellationName] = useState("");
  const [inscribedSpell, setInscribedSpell] = useState("");
  const [constellationReflection, setConstellationReflection] = useState("");

  const [showClearMapModal, setShowClearMapModal] = useState(false);
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [showBladesModal, setShowBladesModal] = useState(false); // Unified Blades modal (ZK + Witness)
  const [showRunecraftModal, setShowRunecraftModal] = useState(false); // Runecraft modal for Swordsman linking
  const [runecraftBlade, setRunecraftBlade] = useState<ForgedBlade | null>(null); // Blade being runecrafted
  const [swordsmanLink, setSwordsmanLink] = useState<SwordsmanLink | null>(() => getSwordsmanLink());
  const [showSwordsmanImport, setShowSwordsmanImport] = useState(false); // Swordsman identity import modal
  const [showMageMenu, setShowMageMenu] = useState(false); // Mage spell menu (M key)
  const [showCeremonyMenu, setShowCeremonyMenu] = useState(false); // Ceremony menu (Y key) - ☯️ Sun/Moon poems
  const [latestProof, setLatestProof] = useState<SpellProof | null>(null);
  const [forgePhase, setForgePhase] = useState<'ignite' | 'forge' | 'temper' | 'complete' | 'naming' | 'manifesting'>('ignite');
  const [bladeName, setBladeName] = useState('');
  const [bladeEmoji, setBladeEmoji] = useState('');
  const [forgedBlades, setForgedBlades] = useState<ForgedBlade[]>(() => {
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.forgedBlades);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeBlade, setActiveBlade] = useState<ForgedBlade | null>(null); // Currently highlighted blade
  const [bladeTraceActive, setBladeTraceActive] = useState(false);
  const [isShineMode, setIsShineMode] = useState(true); // Shine (100%) vs Shadow (15%) toggle // Whether orbs are tracing a blade's constellation
  const [orbsAtHome, setOrbsAtHome] = useState(false); // Whether orbs are at ceremony panel vs wandering

  // EQUIPPED BLADE - The blade the swordsman wields (gives his orb its emojis)
  const [equippedBlade, setEquippedBlade] = useState<ForgedBlade | null>(() => {
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.equippedBlade);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // MAGE'S CHOSEN SPELLS - 8 spells she has learned (gives her orb its emojis)
  interface MageSpell {
    nodeId: string;
    label: string;
    emoji?: string;
    emojiSpell?: string;
    proverb?: string;
    hexagramLine: number; // 0-5, which I Ching line this maps to
    learnedAt: number;
  }
  const [mageSpells, setMageSpells] = useState<MageSpell[]>(() => {
    try {
      const saved = localStorage.getItem(SPELLWEB_STORAGE_KEYS.mageSpells);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Spell learning emoji picker modal state
  const [showSpellEmojiPicker, setShowSpellEmojiPicker] = useState(false);
  const [pendingSpellNode, setPendingSpellNode] = useState<SpellwebNode | null>(null);
  const [pendingSpellLine, setPendingSpellLine] = useState<number>(0);
  const [pendingSpellEmoji, setPendingSpellEmoji] = useState<string>('');
  const [pendingSpellProverb, setPendingSpellProverb] = useState<string>('');

  // Selected spell for mage (visual indicator, like equipped blade for swordsman)
  const [selectedSpellIndex, setSelectedSpellIndex] = useState<number | null>(null);

  // Mana points - accumulated through ceremony laps, spent when casting during evocation
  // Golden ratio φ determines max mana based on EQUIPPED BLADE: φ × blade_nodes × 10
  // Mana COST per spell cast depends on blade tier: dragon=1, heavy=3, light/none=6
  const PHI = 1.6180339887; // Golden ratio
  const [manaPoints, setManaPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('spellweb_mana_points');
      return saved ? parseInt(saved, 10) : 8; // Start with 8 mana (one byte)
    } catch { return 8; }
  });
  // Max mana scales with equipped blade's constellation using golden ratio: φ × blade_nodes × 10
  // Full 6-node blade = φ × 6 × 10 ≈ 97 mana
  const bladeNodeCount = equippedBlade?.constellationMarks?.length || 1;
  const MAX_MANA = Math.max(16, Math.floor(PHI * bladeNodeCount * 10));

  // Mana cost per spell cast based on blade tier
  // Dragon blade (powerful): 1 mana per cast
  // Heavy blade (moderate): 3 mana per cast
  // Light blade / no blade (default): 6 mana per cast
  const getManaCostPerCast = () => {
    if (!equippedBlade) return 6; // No blade = expensive casts
    switch (equippedBlade.tier) {
      case 'dragon': return 1;
      case 'heavy': return 3;
      case 'light':
      default: return 6;
    }
  };
  const MANA_COST = getManaCostPerCast();

  // Refs for d3 handlers to access current state (avoids stale closure)
  const manaPointsRef = useRef(manaPoints);
  const incantationActiveRef = useRef(false);
  const selectedSpellIndexRef = useRef(selectedSpellIndex);
  const manaCostRef = useRef(MANA_COST);
  useEffect(() => { manaPointsRef.current = manaPoints; }, [manaPoints]);
  useEffect(() => { incantationActiveRef.current = incantationActive; }, [incantationActive]);
  useEffect(() => { selectedSpellIndexRef.current = selectedSpellIndex; }, [selectedSpellIndex]);
  useEffect(() => { manaCostRef.current = MANA_COST; }, [MANA_COST]);

  // Floating emojis for trajectory effect when clicking with selected spell
  interface FloatingEmoji {
    id: number;
    emoji: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const floatingEmojiIdRef = useRef(0);
  const mageSpellQueueIndexRef = useRef(0); // Cycles through mageSpells on background click

  // Hemispheric Control Scheme State
  // Right Side (Swordsman/Master): [S] key opens blades, right-click marks waypoint
  // Left Side (Mage/Emissary): [M] key opens spells, left-click casts selected spell

  // Witness mode state (Promise Theory bilateral exchange)
  const [witnessMode, setWitnessMode] = useState<{
    active: boolean;
    constellationHash: string;
    witnessedFrom?: string;
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    knowledge: true,
    narrative: true,
    chronicle: true,
  });

  const [typeFilters, setTypeFilters] = useState<TypeFilterState>({
    document: true,
    concept: true,
    theorem: true,
    spell: true,
    act: true,
    persona: true,
    term: true,
    skill: true,
    chronicle: true,
  });

  const [spellbookFilters, setSpellbookFilters] = useState<SpellbookFilterState>({
    first_person: true,
    zero_knowledge: true,
    blockchain_canon: true,
    parallel_society: true,
    plurality: true,
  });

  // Mobile UI state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Persist userEdges to localStorage
  useEffect(() => {
    localStorage.setItem(SPELLWEB_STORAGE_KEYS.userEdges, JSON.stringify(userEdges));
  }, [userEdges]);

  // Persist forgedBlades to localStorage
  useEffect(() => {
    localStorage.setItem(SPELLWEB_STORAGE_KEYS.forgedBlades, JSON.stringify(forgedBlades));
  }, [forgedBlades]);

  // Persist equippedBlade to localStorage
  useEffect(() => {
    if (equippedBlade) {
      localStorage.setItem(SPELLWEB_STORAGE_KEYS.equippedBlade, JSON.stringify(equippedBlade));
    } else {
      localStorage.removeItem(SPELLWEB_STORAGE_KEYS.equippedBlade);
    }
  }, [equippedBlade]);

  // Persist mageSpells to localStorage
  useEffect(() => {
    localStorage.setItem(SPELLWEB_STORAGE_KEYS.mageSpells, JSON.stringify(mageSpells));
  }, [mageSpells]);

  // Keyboard shortcuts for hemispheric control scheme
  // S = Cycle through swordsman blades (right brain, deliberate)
  // M = Cycle through mage spells (left brain, reactive)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        // Cycle through forged blades (swordsman inventory rotation)
        // Forged blades have tier info (light/heavy/dragon) which affects mana cost
        if (forgedBlades.length > 0) {
          const currentBladeIndex = equippedBlade
            ? forgedBlades.findIndex(b => b.id === equippedBlade.id)
            : -1;
          const nextIndex = (currentBladeIndex + 1) % forgedBlades.length;
          const nextBlade = forgedBlades[nextIndex];
          // Set the full blade with tier info for mana calculations
          setEquippedBlade(nextBlade);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        // Cycle through mage spells (mage inventory rotation)
        if (mageSpells.length > 0) {
          setSelectedSpellIndex(prev => {
            if (prev === null) return 0;
            return (prev + 1) % mageSpells.length;
          });
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        // Toggle ceremony menu (yin-yang / sun-moon poems)
        setShowCeremonyMenu(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowMageMenu(false);
        setShowBladesModal(false);
        setShowCeremonyMenu(false);
        setSelectedSpellIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mageSpells.length, forgedBlades, equippedBlade]);

  // Persist savedConstellations to localStorage
  useEffect(() => {
    localStorage.setItem(SPELLWEB_STORAGE_KEYS.constellations, JSON.stringify(savedConstellations));
  }, [savedConstellations]);

  const filteredNodes = useMemo(
    () => NODES.filter((n) => {
      // Layer filter
      if (!filters[n.layer]) return false;
      // Type filter
      if (!typeFilters[n.type]) return false;
      // Spellbook filter (only applies to acts with a spellbook property)
      if (n.type === 'act' && n.spellbook && !spellbookFilters[n.spellbook]) return false;
      return true;
    }),
    [filters, typeFilters, spellbookFilters]
  );

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(
    () => {
      // Combine static edges with user-created edges
      const allEdges = [...EDGES, ...userEdges];
      return allEdges.filter((e) => {
        const sourceId = typeof e.source === "string" ? e.source : e.source.id;
        const targetId = typeof e.target === "string" ? e.target : e.target.id;
        return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
      });
    },
    [filteredNodeIds, userEdges]
  );

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      NODES.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          (n.desc && n.desc.toLowerCase().includes(q)) ||
          (n.emoji && n.emoji.includes(q))
      ).map((n) => n.id)
    );
  }, [searchQuery]);


  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Initialize D3 graph once
  useEffect(() => {
    if (!svgRef.current || graphInitialized.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { w, h } = dimensions;
    const graphW = w;

    // Defs
    const defs = svg.append("defs");

    // Glow filters
    const glow = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const glowMerge = glow.append("feMerge");
    glowMerge.append("feMergeNode").attr("in", "blur");
    glowMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const glowStrong = defs
      .append("filter")
      .attr("id", "glowStrong")
      .attr("x", "-100%")
      .attr("y", "-100%")
      .attr("width", "300%")
      .attr("height", "300%");
    glowStrong.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
    const glowStrongMerge = glowStrong.append("feMerge");
    glowStrongMerge.append("feMergeNode").attr("in", "blur");
    glowStrongMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow markers
    Object.entries(THEME.edges).forEach(([type, style]) => {
      defs
        .append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L10,0L0,4")
        .attr("fill", style.color)
        .attr("opacity", 0.6);
    });

    const g = svg.append("g").attr("class", "graph-container");

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    // Create containers for edges, constellation connections, and nodes
    g.append("g").attr("class", "links");
    g.append("g").attr("class", "constellation-connections");
    g.append("g").attr("class", "nodes");

    // Clone all data for D3 mutation (use ALL nodes initially)
    nodeDataRef.current = NODES.map((n) => ({ ...n, x: graphW / 2 + (Math.random() - 0.5) * 200, y: h / 2 + (Math.random() - 0.5) * 200 }));
    // Include both static EDGES and userEdges
    const allEdges = [...EDGES, ...userEdges];
    edgeDataRef.current = allEdges.map((e) => ({
      ...e,
      source: typeof e.source === "string" ? e.source : e.source.id,
      target: typeof e.target === "string" ? e.target : e.target.id,
    }));

    // Force simulation with all nodes
    const sim = d3
      .forceSimulation(nodeDataRef.current)
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationEdge>(edgeDataRef.current)
          .id((d) => d.id)
          .distance((d) => {
            if (d.type === "contains") return 40;
            if (d.type === "follows") return 60;
            if (d.type === "references") return 120;
            if (d.type === "persona_knows") return 90;
            return 80;
          })
          .strength((d) => {
            if (d.type === "follows") return 1;
            if (d.type === "defines" || d.type === "proves") return 0.7;
            return 0.3;
          })
      )
      .force(
        "charge",
        d3.forceManyBody<SimulationNode>().strength((d) => {
          if (d.type === "document") return -400;
          if (d.type === "concept") return -200;
          if (d.type === "term") return -50;
          return -150;
        })
      )
      .force("center", d3.forceCenter(graphW / 2, h / 2))
      .force(
        "collision",
        d3.forceCollide<SimulationNode>().radius((d) => getNodeRadius(d) + 6)
      )
      .force("x", d3.forceX(graphW / 2).strength(0.03))
      .force("y", d3.forceY(h / 2).strength(0.03));

    simRef.current = sim;

    // Initial zoom to fit
    setTimeout(() => {
      svg
        .transition()
        .duration(800)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(graphW / 2, h / 2)
            .scale(0.65)
            .translate(-graphW / 2, -h / 2)
        );
    }, 1500);

    graphInitialized.current = true;

    return () => {
      sim.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

  // Called when clicking a node during waypoint mode (declared here to be available in useEffect below)
  const handleWaypointAddNode = useCallback((node: SpellwebNode) => {
    setWaypoint(prev => {
      if (!prev.active) return prev;
      // Don't add if already in path
      if (prev.path.includes(node.id)) return prev;

      // Add connection from last node to this one
      const lastNodeId = prev.path[prev.path.length - 1];
      if (lastNodeId) {
        const newConnection: ConstellationConnection = {
          sourceId: lastNodeId,
          targetId: node.id,
          note: "",
        };
        setConstellationConnections(prevConns => {
          const exists = prevConns.some(c =>
            (c.sourceId === newConnection.sourceId && c.targetId === newConnection.targetId) ||
            (c.sourceId === newConnection.targetId && c.targetId === newConnection.sourceId)
          );
          if (!exists) return [...prevConns, newConnection];
          return prevConns;
        });
      }

      return {
        ...prev,
        path: [...prev.path, node.id],
      };
    });
    setSelectedNode(node);
  }, []);

  // Update visible nodes/edges based on filters (without resetting positions)
  useEffect(() => {
    if (!svgRef.current || !graphInitialized.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(".graph-container");
    const linksG = g.select<SVGGElement>(".links");
    const nodesG = g.select<SVGGElement>(".nodes");

    // Filter node data based on current filters
    const visibleNodeData = nodeDataRef.current.filter((n) => {
      if (!filters[n.layer]) return false;
      if (!typeFilters[n.type]) return false;
      // Spellbook filter (only applies to acts with a spellbook property)
      if (n.type === 'act' && n.spellbook && !spellbookFilters[n.spellbook]) return false;
      return true;
    });
    const visibleNodeIds = new Set(visibleNodeData.map((n) => n.id));

    // Filter edge data
    const visibleEdgeData = edgeDataRef.current.filter((e) => {
      const sourceId = typeof e.source === "string" ? e.source : (e.source as SimulationNode).id;
      const targetId = typeof e.target === "string" ? e.target : (e.target as SimulationNode).id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    // Update edges
    const link = linksG.selectAll<SVGLineElement, SimulationEdge>("line").data(visibleEdgeData, (d) => {
      if (!d || !d.source || !d.target) return "unknown";
      const sourceId = typeof d.source === "string" ? d.source : (d.source as SimulationNode)?.id || "unknown";
      const targetId = typeof d.target === "string" ? d.target : (d.target as SimulationNode)?.id || "unknown";
      return `${sourceId}-${targetId}`;
    });

    link.exit().remove();

    const linkEnter = link.enter().append("line");

    const linkMerge = linkEnter.merge(link);
    linkMerge
      .attr("stroke", (d) => getEdgeStyle(d.type as any).color)
      .attr("stroke-width", (d) => getEdgeStyle(d.type as any).width)
      .attr("stroke-dasharray", (d) => getEdgeStyle(d.type as any).dash || null)
      .attr("stroke-opacity", 0.35)
      .attr("marker-end", (d) =>
        ["proves", "follows", "implements"].includes(d.type) ? `url(#arrow-${d.type})` : null
      );

    // Update nodes
    const node = nodesG.selectAll<SVGGElement, SimulationNode>("g.node").data(visibleNodeData, (d) => d.id);

    node.exit().remove();

    const nodeEnter = node.enter().append("g").attr("class", "node").attr("cursor", "pointer");

    // Add circle to new nodes
    nodeEnter
      .append("circle")
      .attr("r", (d) => getNodeRadius(d))
      .attr("fill", (d) => getNodeVisual(d).fill)
      .attr("stroke", (d) => getNodeVisual(d).stroke)
      .attr("stroke-width", (d) => (d.type === "spell" ? 2 : 1.5))
      .attr("filter", (d) => (d.type === "spell" ? "url(#glowStrong)" : "url(#glow)"));

    // Add label to new nodes
    nodeEnter
      .append("text")
      .attr("class", "node-label")
      .text((d) => {
        if (d.type === "spell" && d.emoji) return d.emoji;
        if (d.type === "term") return "";
        return d.label.length > 22 ? d.label.slice(0, 20) + "…" : d.label;
      })
      .attr("dy", (d) => (d.type === "spell" ? 4 : getNodeRadius(d) + 14))
      .attr("text-anchor", "middle")
      .attr("fill", (d) => (d.type === "spell" ? "#ffd700" : THEME.textDim))
      .attr("font-size", (d) => (d.type === "spell" ? 16 : d.type === "term" ? 8 : 10))
      .attr("font-family", (d) => (d.type === "spell" ? "serif" : "'IBM Plex Sans', sans-serif"))
      .attr("pointer-events", "none");

    // Add emoji spell to new nodes
    nodeEnter
      .append("text")
      .attr("class", "emoji-spell")
      .text((d) => d.emojiSpell || "")
      .attr("dy", (d) => -(getNodeRadius(d) + 8))
      .attr("text-anchor", "middle")
      .attr("fill", "#ffd700")
      .attr("font-size", 11)
      .attr("font-family", "sans-serif")
      .attr("opacity", 0)
      .attr("pointer-events", "none")
      .attr("filter", "url(#glow)");

    const nodeMerge = nodeEnter.merge(node);

    // Update all node visuals
    nodeMerge.select("circle")
      .attr("opacity", (d) => {
        // Waypoint mode: grey out nodes not in path, light up path nodes
        if (waypoint.active) {
          return waypoint.path.includes(d.id) ? 1 : 0.2;
        }
        if (searchMatches.size > 0) return searchMatches.has(d.id) ? 1 : 0.15;
        return 0.85;
      })
      .attr("filter", (d) => {
        if (waypoint.active && waypoint.path.includes(d.id)) return "url(#glowStrong)";
        if (d.type === "spell") return "url(#glowStrong)";
        if (searchMatches.size > 0 && searchMatches.has(d.id)) return "url(#glowStrong)";
        return "url(#glow)";
      });

    nodeMerge.select(".node-label")
      .attr("opacity", (d) => {
        if (waypoint.active) {
          return waypoint.path.includes(d.id) ? 1 : 0.15;
        }
        if (searchMatches.size > 0) return searchMatches.has(d.id) ? 1 : 0.1;
        return 0.7;
      });

    // Attach drag behavior
    nodeMerge.call(
      d3
        .drag<SVGGElement, SimulationNode>()
        .on("start", (event, d) => {
          if (!event.active) simRef.current?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simRef.current?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    // Attach click handlers
    nodeMerge.on("click", (event, d) => {
      event.stopPropagation();

      // Emit floating emoji if mage spell is selected (use ref to avoid stale closure)
      if (selectedSpellIndexRef.current !== null) {
        const spell = mageSpells.find(s => s.hexagramLine === selectedSpellIndexRef.current) || mageSpells[selectedSpellIndexRef.current];
        if (spell?.emoji && d.x !== undefined && d.y !== undefined) {
          // Deduct mana when casting during evocation (use refs for current state)
          // Cost depends on blade tier: dragon=1, heavy=3, light/none=6
          if (incantationActiveRef.current && manaPointsRef.current >= manaCostRef.current) {
            setManaPoints(prev => {
              const newMana = Math.max(0, prev - manaCostRef.current);
              localStorage.setItem('spellweb_mana_points', String(newMana));
              return newMana;
            });
          }

          const newEmoji: FloatingEmoji = {
            id: floatingEmojiIdRef.current++,
            emoji: spell.emoji,
            x: d.x,
            y: d.y,
            targetX: d.x + (Math.random() - 0.5) * 100,
            targetY: d.y - 80 - Math.random() * 40,
          };
          setFloatingEmojis(prev => [...prev, newEmoji]);
          // Remove after animation
          setTimeout(() => {
            setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
          }, 1500);
        }
      }

      if (connectionMode.active && connectionMode.sourceNode) {
        if (d.id !== connectionMode.sourceNode.id) {
          setConnectTarget(d);
          setShowConnectModal(true);
        }
      } else if (waypoint.active) {
        // Waypoint mode: add node to path if not already there
        if (!waypoint.path.includes(d.id)) {
          handleWaypointAddNode(d);
        } else {
          setSelectedNode(d);
        }
      } else {
        setSelectedNode(d);
      }
    });
    nodeMerge.on("mouseenter", (_, d) => setHoveredNode(d));
    nodeMerge.on("mouseleave", () => setHoveredNode(null));

    // RIGHT CLICK = SWORDSMAN (Master) - Mark waypoint for constellation
    nodeMerge.on("contextmenu", (event, d) => {
      event.preventDefault();
      event.stopPropagation();
      // Right-click to mark waypoint
      if (!constellation.some(m => m.nodeId === d.id)) {
        setMarkEmoji(d.emoji || '⚔️');
        setShowMarkModal(true);
        setSelectedNode(d);
      }
    });

    // Background right-click - no action
    svg.on("contextmenu", (event) => {
      event.preventDefault();
    });

    // Update simulation tick
    if (simRef.current) {
      simRef.current.on("tick", () => {
        linkMerge
          .attr("x1", (d) => (d.source as SimulationNode).x)
          .attr("y1", (d) => (d.source as SimulationNode).y)
          .attr("x2", (d) => (d.target as SimulationNode).x)
          .attr("y2", (d) => (d.target as SimulationNode).y);
        nodeMerge.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
      simRef.current.alpha(0.1).restart();
    }

    // Background click - fire spell queue toward click position (only during evoke)
    svg.on("click", (event) => {
      if (!connectionMode.active) {
        setSelectedNode(null);
      }

      // Fire spell from mage queue on background click (only during evoke with mana)
      if (incantationActiveRef.current && manaPointsRef.current > 0) {
        let emoji = '✨'; // Default fallback

        // Try to get emoji from mage spells first
        if (mageSpells.length > 0) {
          const spell = mageSpells[mageSpellQueueIndexRef.current % mageSpells.length];
          mageSpellQueueIndexRef.current++;
          if (spell?.emoji) emoji = spell.emoji;
        }

        // Deduct mana (cost depends on blade tier: dragon=1, heavy=3, light/none=6)
        if (manaPointsRef.current < manaCostRef.current) return; // Not enough mana
        setManaPoints(prev => {
          const newMana = Math.max(0, prev - manaCostRef.current);
          localStorage.setItem('spellweb_mana_points', String(newMana));
          return newMana;
        });

        // Mage position: bottom center of viewport (ceremony panel area)
        const mageX = window.innerWidth / 2 + 40; // Offset right for mage orb
        const mageY = window.innerHeight - 120; // Bottom of screen

        // Click position
        const [clickX, clickY] = d3.pointer(event);

        // Create floating emoji that flies from mage toward click
        const newEmoji: FloatingEmoji = {
          id: floatingEmojiIdRef.current++,
          emoji,
          x: mageX,
          y: mageY,
          targetX: clickX,
          targetY: clickY,
        };
        setFloatingEmojis(prev => [...prev, newEmoji]);

        // Remove after animation
        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 1500);
      }
    });
  }, [filters, typeFilters, spellbookFilters, searchMatches, connectionMode, waypoint, handleWaypointAddNode, mageSpells]);

  // Sync userEdges to the D3 graph when they change
  useEffect(() => {
    if (!svgRef.current || !graphInitialized.current || !simRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(".graph-container");
    const linksG = g.select<SVGGElement>(".links");

    // Rebuild edge data with both static and user edges
    const allEdges = [...EDGES, ...userEdges];
    edgeDataRef.current = allEdges.map((e) => ({
      ...e,
      source: typeof e.source === "string" ? e.source : e.source.id,
      target: typeof e.target === "string" ? e.target : e.target.id,
    }));

    // Get visible node IDs
    const visibleNodeData = nodeDataRef.current.filter((n) => {
      if (!filters[n.layer]) return false;
      if (!typeFilters[n.type]) return false;
      if (n.type === 'act' && n.spellbook && !spellbookFilters[n.spellbook]) return false;
      return true;
    });
    const visibleNodeIds = new Set(visibleNodeData.map((n) => n.id));

    // Filter to visible edges
    const visibleEdgeData = edgeDataRef.current.filter((e) => {
      const sourceId = typeof e.source === "string" ? e.source : (e.source as SimulationNode).id;
      const targetId = typeof e.target === "string" ? e.target : (e.target as SimulationNode).id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    // Update D3 edges
    const link = linksG.selectAll<SVGLineElement, SimulationEdge>("line").data(visibleEdgeData, (d) => {
      if (!d || !d.source || !d.target) return "unknown";
      const sourceId = typeof d.source === "string" ? d.source : (d.source as SimulationNode)?.id || "unknown";
      const targetId = typeof d.target === "string" ? d.target : (d.target as SimulationNode)?.id || "unknown";
      return `${sourceId}-${targetId}-${d.type}`;
    });

    link.exit().remove();

    const linkEnter = link.enter().append("line");
    const linkMerge = linkEnter.merge(link);

    linkMerge
      .attr("stroke", (d) => getEdgeStyle(d.type as any).color)
      .attr("stroke-width", (d) => getEdgeStyle(d.type as any).width)
      .attr("stroke-dasharray", (d) => getEdgeStyle(d.type as any).dash || null)
      .attr("stroke-opacity", 0.35)
      .attr("marker-end", (d) =>
        ["proves", "follows", "implements"].includes(d.type) ? `url(#arrow-${d.type})` : null
      );

    // Update simulation with new edges
    const forceLink = simRef.current.force("link") as d3.ForceLink<SimulationNode, SimulationEdge>;
    if (forceLink) {
      forceLink.links(edgeDataRef.current);
    }

    // Restart simulation to position new edges
    simRef.current.alpha(0.1).restart();

    // Update tick handler for edges
    simRef.current.on("tick.userEdges", () => {
      linkMerge
        .attr("x1", (d) => (d.source as SimulationNode).x)
        .attr("y1", (d) => (d.source as SimulationNode).y)
        .attr("x2", (d) => (d.target as SimulationNode).x)
        .attr("y2", (d) => (d.target as SimulationNode).y);
    });

  }, [userEdges, filters, typeFilters, spellbookFilters]);

  // Constellation node IDs for quick lookup
  const constellationNodeIds = useMemo(() => new Set(constellation.map(m => m.nodeId)), [constellation]);

  // Find all nodes connected to constellation via compresses_to edges (spell nodes)
  const compressionSpellNodes = useMemo(() => {
    if (!incantationActive || constellation.length === 0) return new Set<string>();

    const spellNodes = new Set<string>();

    // For each constellation node, find connected spell nodes via compresses_to
    constellation.forEach(mark => {
      EDGES.forEach(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

        if (edge.type === 'compresses_to') {
          // If constellation node is source, add target (the spell)
          if (sourceId === mark.nodeId) {
            spellNodes.add(targetId);
          }
          // If constellation node is target (a spell), add source (the concept)
          if (targetId === mark.nodeId) {
            spellNodes.add(sourceId);
          }
        }
      });
    });

    return spellNodes;
  }, [incantationActive, constellation]);

  // Combined set of highlighted nodes during incantation
  const incantationHighlightNodes = useMemo(() => {
    if (!incantationActive) return new Set<string>();
    const nodes = new Set<string>(constellationNodeIds);
    compressionSpellNodes.forEach(id => nodes.add(id));
    return nodes;
  }, [incantationActive, constellationNodeIds, compressionSpellNodes]);

  // Update constellation visuals when castingSpells or incantationActive changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Blade trace uses lighter dimming (0.5), not full highlight mode (0.15)
    const isHighlightMode = castingSpells || incantationActive;

    // Get tier color for active blade trace
    const activeBladeNodeIds = new Set(
      bladeTraceActive && activeBlade?.constellationMarks
        ? activeBlade.constellationMarks.map(m => m.nodeId)
        : []
    );
    const bladeTraceColor = activeBlade?.tier === 'dragon' ? '#ffd700' :
      activeBlade?.tier === 'heavy' ? '#c0c0c0' : '#87ceeb';

    // Update emoji spell text to show constellation marks OR actual emoji spells during incantation
    svg.selectAll<SVGTextElement, SimulationNode>(".emoji-spell")
      .text((d) => {
        // During incantation, show the actual emojiSpell for highlighted nodes
        if (incantationActive && incantationHighlightNodes.has(d.id)) {
          return d.emojiSpell || d.emoji || "✦";
        }
        // During constellation mode, show the user's custom emoji
        const mark = constellation.find(m => m.nodeId === d.id);
        if (mark) return mark.emoji;
        return "";
      })
      .transition()
      .duration(400)
      .attr("opacity", (d) => {
        if (incantationActive) {
          return incantationHighlightNodes.has(d.id) ? 1 : 0;
        }
        if (!castingSpells) return 0;
        if (!constellationNodeIds.has(d.id)) return 0;
        return 1;
      })
      .attr("font-size", (d) => {
        // Make emoji spells larger during incantation to show the full spell
        if (incantationActive && incantationHighlightNodes.has(d.id) && d.emojiSpell) {
          return 10; // Smaller for long emoji spells
        }
        return 14;
      })
      .attr("dy", (d) => {
        // Position above node
        return -(getNodeRadius(d) + 8);
      });

    // Highlight constellation/incantation nodes, dim others
    // Shadow mode is a simple global toggle - dims everything to 15%
    svg.selectAll<SVGGElement, SimulationNode>("g.node").select("circle")
      .transition()
      .duration(400)
      .attr("opacity", (d) => {
        // Shadow mode: simple global dim (overrides everything)
        if (!isShineMode) {
          return 0.15;
        }
        // Shine mode ON - check if we should still dim for special modes
        // Evoke mode - dark (38%) for non-highlighted
        if (incantationActive) {
          return incantationHighlightNodes.has(d.id) ? 1 : 0.38;
        }
        // Blade trace - light dim (62%) for non-traced
        if (bladeTraceActive && activeBladeNodeIds.size > 0) {
          return activeBladeNodeIds.has(d.id) ? 1 : 0.62;
        }
        // Search filter
        if (searchMatches.size > 0) {
          return searchMatches.has(d.id) ? 1 : 0.15;
        }
        // Default shine mode: everything at full opacity
        // Constellation nodes get highlighted stroke but same opacity
        return 1;
      })
      .attr("stroke", (d) => {
        if (incantationActive && incantationHighlightNodes.has(d.id)) {
          // Orange/fire color for incantation, gold for constellation nodes
          return compressionSpellNodes.has(d.id) ? "#ff6600" : "#ffd700";
        }
        if (castingSpells && constellationNodeIds.has(d.id)) return "#ffd700";
        // Blade trace: use tier color (gold=dragon, silver=heavy, blue=light)
        if (bladeTraceActive && activeBladeNodeIds.has(d.id)) return bladeTraceColor;
        return getNodeVisual(d).stroke;
      })
      .attr("stroke-width", (d) => {
        if (incantationActive && incantationHighlightNodes.has(d.id)) return 3;
        if (castingSpells && constellationNodeIds.has(d.id)) return 3;
        if (bladeTraceActive && activeBladeNodeIds.has(d.id)) return 3;
        return d.type === "spell" ? 2 : 1.5;
      });

    // Dim labels when casting/incanting/tracing, except highlighted nodes
    svg.selectAll<SVGTextElement, SimulationNode>(".node-label")
      .transition()
      .duration(400)
      .attr("opacity", (d) => {
        // Shadow mode: simple global dim (overrides everything)
        if (!isShineMode) {
          return 0.1;
        }
        // Shine mode ON - check if we should still dim for special modes
        // Evoke mode - dark (38%) for non-highlighted
        if (incantationActive) {
          return incantationHighlightNodes.has(d.id) ? 0.9 : 0.38;
        }
        // Blade trace - light dim (62%) for non-traced
        if (bladeTraceActive && activeBladeNodeIds.size > 0) {
          return activeBladeNodeIds.has(d.id) ? 0.9 : 0.62;
        }
        // Search filter
        if (searchMatches.size > 0) {
          return searchMatches.has(d.id) ? 1 : 0.1;
        }
        // Default shine mode: labels at good visibility
        return constellationNodeIds.has(d.id) ? 0.9 : 0.7;
      });

    // Dim edges, highlight constellation path and compresses_to edges during incantation
    svg.selectAll<SVGLineElement, SimulationEdge>("line")
      .transition()
      .duration(400)
      .attr("stroke-opacity", (d) => {
        // Shadow mode: dim but keep edges somewhat visible
        if (!isShineMode) {
          return 0.25;
        }
        if (!isHighlightMode) return 0.35;
        if (!d || !d.source || !d.target) return 0.35;
        const sourceId = typeof d.source === "string" ? d.source : (d.source as SimulationNode)?.id;
        const targetId = typeof d.target === "string" ? d.target : (d.target as SimulationNode)?.id;
        if (!sourceId || !targetId) return 0.35;

        if (incantationActive) {
          // Highlight compresses_to edges connected to incantation nodes
          if (d.type === "compresses_to" &&
              (incantationHighlightNodes.has(sourceId) || incantationHighlightNodes.has(targetId))) {
            return 1;
          }
          // Also highlight edges between incantation nodes
          if (incantationHighlightNodes.has(sourceId) && incantationHighlightNodes.has(targetId)) {
            return 0.8;
          }
          return 0.05;
        }

        // Constellation mode: highlight edges between constellation nodes
        if (constellationNodeIds.has(sourceId) && constellationNodeIds.has(targetId)) return 0.8;
        return 0.35;
      })
      .attr("stroke", (d) => {
        if (!d || !d.source || !d.target) return getEdgeStyle(d?.type as any).color;
        if (incantationActive && d.type === "compresses_to") {
          const sourceId = typeof d.source === "string" ? d.source : (d.source as SimulationNode)?.id;
          const targetId = typeof d.target === "string" ? d.target : (d.target as SimulationNode)?.id;
          if (sourceId && targetId && (incantationHighlightNodes.has(sourceId) || incantationHighlightNodes.has(targetId))) {
            return "#ff6600"; // Fire color for compression edges
          }
        }
        return getEdgeStyle(d.type as any).color;
      });
  }, [castingSpells, incantationActive, constellation, constellationNodeIds, compressionSpellNodes, incantationHighlightNodes, searchMatches, bladeTraceActive, activeBlade, isShineMode]);

  // Render constellation connections (user-drawn lines between constellation nodes)
  useEffect(() => {
    if (!svgRef.current || !graphInitialized.current) return;

    const svg = d3.select(svgRef.current);
    const constellationG = svg.select<SVGGElement>(".constellation-connections");

    // Prepare connection data with actual node positions
    const connectionData = constellationConnections.map(conn => {
      const sourceNode = nodeDataRef.current.find(n => n.id === conn.sourceId);
      const targetNode = nodeDataRef.current.find(n => n.id === conn.targetId);
      return { ...conn, sourceNode, targetNode };
    }).filter(c => c.sourceNode && c.targetNode);

    // Bind data
    const lines = constellationG.selectAll<SVGLineElement, typeof connectionData[0]>("line.constellation-line")
      .data(connectionData, d => `${d.sourceId}-${d.targetId}`);

    // Remove old lines
    lines.exit().remove();

    // Add new lines
    const linesEnter = lines.enter()
      .append("line")
      .attr("class", "constellation-line")
      .attr("stroke", "#ffd700")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8,4")
      .attr("stroke-linecap", "round")
      .attr("opacity", 0);

    // Merge and update
    const linesMerge = linesEnter.merge(lines);

    linesMerge
      .attr("x1", d => d.sourceNode!.x || 0)
      .attr("y1", d => d.sourceNode!.y || 0)
      .attr("x2", d => d.targetNode!.x || 0)
      .attr("y2", d => d.targetNode!.y || 0)
      .transition()
      .duration(400)
      .attr("opacity", (castingSpells || bladeTraceActive || constellationConnections.length > 0) ? 0.8 : 0);

    // Update positions on simulation tick
    if (simRef.current) {
      simRef.current.on("tick.constellation", () => {
        linesMerge
          .attr("x1", d => d.sourceNode!.x || 0)
          .attr("y1", d => d.sourceNode!.y || 0)
          .attr("x2", d => d.targetNode!.x || 0)
          .attr("y2", d => d.targetNode!.y || 0);
      });
    }
  }, [constellationConnections, castingSpells, bladeTraceActive]);

  const toggleLayer = useCallback((layer: keyof FilterState) => {
    setFilters((f) => ({ ...f, [layer]: !f[layer] }));
  }, []);

  const toggleType = useCallback((type: keyof TypeFilterState) => {
    setTypeFilters((f) => ({ ...f, [type]: !f[type] }));
  }, []);

  const toggleSpellbook = useCallback((spellbook: keyof SpellbookFilterState) => {
    setSpellbookFilters((f) => ({ ...f, [spellbook]: !f[spellbook] }));
  }, []);

  const navigateToNode = useCallback((node: SpellwebNode) => {
    const found = NODES.find((n) => n.id === node.id);
    if (found) setSelectedNode(found);
  }, []);

  // Action handlers
  const handleCancelConnect = useCallback(() => {
    setConnectionMode({ active: false, sourceNode: null });
    setShowConnectModal(false);
    setConnectTarget(null);
    setReflectNote("");
    setSelectedEdgeType("narrates");
  }, []);

  const handleConfirmConnect = useCallback(() => {
    if (connectionMode.sourceNode && connectTarget) {
      // Auto-add target node to constellation if not already in it
      setConstellation(prev => {
        const targetExists = prev.some(m => m.nodeId === connectTarget.id);
        if (!targetExists) {
          return [...prev, {
            nodeId: connectTarget.id,
            nodeLabel: connectTarget.label,
            emoji: connectTarget.emoji || "✦",
            note: "",
          }];
        }
        return prev;
      });

      // Add the connection to constellationConnections
      const newConnection: ConstellationConnection = {
        sourceId: connectionMode.sourceNode.id,
        targetId: connectTarget.id,
        note: reflectNote.trim(),
      };

      // Check if connection already exists (in either direction)
      setConstellationConnections((prev) => {
        const exists = prev.some(c =>
          (c.sourceId === newConnection.sourceId && c.targetId === newConnection.targetId) ||
          (c.sourceId === newConnection.targetId && c.targetId === newConnection.sourceId)
        );
        if (exists) {
          // Update existing connection
          return prev.map(c =>
            (c.sourceId === newConnection.sourceId && c.targetId === newConnection.targetId) ||
            (c.sourceId === newConnection.targetId && c.targetId === newConnection.sourceId)
              ? newConnection : c
          );
        }
        return [...prev, newConnection];
      });

      // Create edge with selected type for this connection
      const newEdge: SpellwebEdge = {
        source: connectionMode.sourceNode.id,
        target: connectTarget.id,
        type: selectedEdgeType as any,
      };

      // Add to userEdges if not already present
      setUserEdges((prev) => {
        const exists = prev.some(e => {
          const srcId = typeof e.source === 'string' ? e.source : e.source.id;
          const tgtId = typeof e.target === 'string' ? e.target : e.target.id;
          return (srcId === connectionMode.sourceNode!.id && tgtId === connectTarget.id) ||
                 (srcId === connectTarget.id && tgtId === connectionMode.sourceNode!.id);
        });
        if (exists) return prev;
        return [...prev, newEdge];
      });

      console.log(`${selectedEdgeType} edge created:`, connectionMode.sourceNode.label, "→", connectTarget.label);
    }
    handleCancelConnect();
  }, [connectionMode.sourceNode, connectTarget, reflectNote, selectedEdgeType, handleCancelConnect]);

  // Waypoint handlers - simplified path building
  const handleStartWaypoint = useCallback(() => {
    if (selectedNode) {
      setWaypoint({
        active: true,
        path: [selectedNode.id],
      });
      // Auto-add connection line will be handled when next node is added
    }
  }, [selectedNode]);

  // Close Portal - opens the summary modal
  const handleClosePortal = useCallback(() => {
    // Initialize path marks with default emojis from nodes
    const initialMarks: Record<string, { emoji: string; note: string }> = {};
    const marks: ConstellationMark[] = [];
    const connections: ConstellationConnection[] = [];

    waypoint.path.forEach((nodeId, i) => {
      const node = NODES.find(n => n.id === nodeId);
      initialMarks[nodeId] = {
        emoji: node?.emoji || "✦",
        note: "",
      };
      marks.push({
        nodeId,
        nodeLabel: node?.label || nodeId,
        emoji: node?.emoji || "✦",
        note: "",
      });
      // Build connections from path order
      if (i > 0) {
        connections.push({
          sourceId: waypoint.path[i - 1],
          targetId: nodeId,
          note: "",
        });
      }
    });

    // Set constellation immediately so evoke can work before saving
    setConstellation(marks);
    setConstellationConnections(connections);

    setPathMarks(initialMarks);
    setConstellationName("");
    setInscribedSpell("");
    setConstellationReflection("");
    setShowClosePortalModal(true);
  }, [waypoint.path]);

  // Save constellation from Close Portal modal
  const handleSaveConstellation = useCallback(() => {
    const marks: ConstellationMark[] = waypoint.path.map(nodeId => {
      const node = NODES.find(n => n.id === nodeId);
      return {
        nodeId,
        nodeLabel: node?.label || nodeId,
        emoji: pathMarks[nodeId]?.emoji || node?.emoji || "✦",
        note: pathMarks[nodeId]?.note || "",
      };
    });

    // Build connections from path order
    const connections: ConstellationConnection[] = [];
    for (let i = 0; i < waypoint.path.length - 1; i++) {
      connections.push({
        sourceId: waypoint.path[i],
        targetId: waypoint.path[i + 1],
        note: pathMarks[waypoint.path[i + 1]]?.note || "",
      });
    }

    const newConstellation: SavedConstellation = {
      id: `constellation-${Date.now()}`,
      name: constellationName.trim() || `Path ${savedConstellations.length + 1}`,
      createdAt: new Date().toISOString(),
      marks,
      connections,
      inscribedSpell: inscribedSpell.trim() || undefined,
      reflection: constellationReflection.trim() || undefined,
    };

    setSavedConstellations(prev => [...prev, newConstellation]);

    // Also add to current constellation for display
    setConstellation(marks);
    setConstellationConnections(connections);
    setActiveConstellationId(newConstellation.id);

    // Close modal and waypoint mode
    setShowClosePortalModal(false);
    setWaypoint({ active: false, path: [] });
    setCastingSpells(true);
  }, [waypoint.path, pathMarks, constellationName, inscribedSpell, constellationReflection, savedConstellations.length]);

  const handleCancelClosePortal = useCallback(() => {
    setShowClosePortalModal(false);
  }, []);

  // Handle proof generated from evoke ceremony - update the active constellation
  const handleProofGenerated = useCallback((proof: SpellProof) => {
    // Store latest proof for forging
    setLatestProof(proof);

    // Add mana from completed laps
    if (proof.lapCount > 0) {
      setManaPoints(prev => {
        const newMana = Math.min(prev + proof.lapCount, MAX_MANA);
        localStorage.setItem('spellweb_mana_points', String(newMana));
        return newMana;
      });
    }

    if (!activeConstellationId) return;
    // Update the active constellation with the proof
    setSavedConstellations(prev => {
      const idx = prev.findIndex(c => c.id === activeConstellationId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], proof };
      return updated;
    });
  }, [activeConstellationId]);

  // Export constellation to markdown (only enabled when blade is forged)
  const handleExportConstellation = useCallback((saved: SavedConstellation) => {
    // Get the forged blade for this constellation
    const forgedBlade = saved.proof
      ? forgedBlades.find(b => b.proof.signature === saved.proof?.signature)
      : null;

    // Build dimension status table for blade
    const dimensionTable = forgedBlade ? [
      "### Blade Dimensions",
      "| Dimension | Status |",
      "|-----------|--------|",
      `| 🛡️ Protection | ${forgedBlade.proof.bladeDimensions.protection ? '✅ Active' : '⬜ Dormant'} |`,
      `| 🤝 Delegation | ${forgedBlade.proof.bladeDimensions.delegation ? '✅ Active' : '⬜ Dormant'} |`,
      `| 📜 Memory | ${forgedBlade.proof.bladeDimensions.memory ? '✅ Active' : '⬜ Dormant'} |`,
      `| 🔗 Connection | ${forgedBlade.proof.bladeDimensions.connection ? '✅ Active' : '⬜ Dormant'} |`,
      `| ⚡ Computation | ${forgedBlade.proof.bladeDimensions.computation ? '✅ Active' : '⬜ Dormant'} |`,
      `| 💎 Value | ${forgedBlade.proof.bladeDimensions.value ? '✅ Active' : '⬜ Dormant'} |`,
      "",
    ] : [];

    const md = [
      `# ${forgedBlade ? `${forgedBlade.emoji} ${forgedBlade.name}` : saved.name}`,
      `*Created: ${new Date(saved.createdAt).toLocaleString()}*`,
      "",
      ...(forgedBlade ? [
        forgedBlade.isWitness ? "## Witness Blade" : "## Forged Blade",
        `**${forgedBlade.emoji} ${forgedBlade.name}**`,
        `- **Tier:** ${forgedBlade.tier.charAt(0).toUpperCase() + forgedBlade.tier.slice(1)} Blade`,
        `- **Stratum:** ${forgedBlade.stratum}/6 ${stratumToMoonPhase(forgedBlade.stratum)} (${getMoonPhaseInfo(forgedBlade.stratum).name})`,
        `- **Forged:** ${new Date(forgedBlade.forgedAt).toLocaleString()}`,
        `- **Nodes:** ${forgedBlade.constellationNodes}`,
        ...(forgedBlade.isWitness ? [
          "",
          "### Promise Exchange",
          `- **Type:** Witness (Bilateral Promise)`,
          `- **Witnessed:** ${forgedBlade.witnessedFrom || 'Unknown'}`,
          `- **Original Hash:** \`${forgedBlade.witnessOf}\``,
        ] : []),
        "",
        ...dimensionTable,
      ] : []),
      ...(saved.proof ? [
        "## Proof of Presence",
        `- **Charge Level:** ${saved.proof.chargeLevel.toUpperCase()} 🔥`,
        `- **Laps:** ${saved.proof.lapCount}`,
        `- **Duration:** ${Math.round(saved.proof.duration / 1000)}s`,
        `- **Spells Cast:** ${saved.proof.spellsCast || 0}`,
        "",
        "### Cryptographic Proof",
        "```",
        `Signature: ${saved.proof.signature}`,
        `Hash: ${saved.proof.constellationHash}`,
        `Hex: ${saved.proof.bladeHex}`,
        `Blade Hash: ${saved.proof.bladeHash}`,
        `Chain: #${saved.proof.chainLength}${saved.proof.previousBladeHash ? ` (prev: ${saved.proof.previousBladeHash.slice(0,8)}...)` : ' (inception)'}`,
        "```",
        "",
      ] : []),
      ...(saved.proof?.mageId ? [
        "### Mage Identity",
        `- **Mage ID:** \`${saved.proof.mageId}\``,
        `- **Signature:** \`${saved.proof.mageSignature?.slice(0,32)}...\``,
        "",
      ] : []),
      ...(saved.proof?.runecrafted ? [
        "### Runecraft (Dual-Key Binding)",
        `- **Swordsman ID:** \`${saved.proof.swordsmanId}\``,
        `- **Runecrafted:** ${new Date(saved.proof.runecraftedAt || 0).toLocaleString()}`,
        "- **Status:** 🔮 Dual-key proof established",
        "",
      ] : []),
      ...(saved.inscribedSpell ? [
        "## Inscribed Spell",
        `\`${saved.inscribedSpell}\``,
        "",
      ] : []),
      ...(saved.reflection ? [
        "## Reflection",
        `> ${saved.reflection}`,
        "",
      ] : []),
      ...(mageSpells.length > 0 ? [
        "## Mage's Grimoire",
        `*${mageSpells.length}/8 Spells Learned*`,
        "",
        "| Line | Emoji | Spell | Proverb |",
        "|------|-------|-------|---------|",
        ...mageSpells.map(spell => {
          const dimNames = ['Hide', 'Commit', 'Prove', 'Connect', 'Reflect', 'Delegate'];
          return `| d${spell.hexagramLine + 1}${dimNames[spell.hexagramLine]} | ${spell.emoji || '✦'} | ${spell.label} | ${spell.proverb ? `"${spell.proverb}"` : '-'} |`;
        }),
        "",
      ] : []),
      "## Constellation Path",
      ...saved.marks.map((m, i) =>
        `${i + 1}. ${m.emoji} **${m.nodeLabel}**${m.note ? ` - ${m.note}` : ""}`
      ),
      "",
      ...(saved.connections.length > 0 ? [
        "## Connections",
        ...saved.connections.map(c => {
          const source = saved.marks.find(m => m.nodeId === c.sourceId);
          const target = saved.marks.find(m => m.nodeId === c.targetId);
          return `- ${source?.emoji || "◆"} ${source?.nodeLabel} → ${target?.emoji || "◆"} ${target?.nodeLabel}`;
        }),
        "",
      ] : []),
      "---",
      `*Forged in the 64-Tetrahedra Lattice*`,
      `*(⚔️⊥⿻⊥🧙)🙂*`,
    ].join("\n");

    // Download as file - use blade name if forged
    const filename = forgedBlade
      ? `${forgedBlade.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-blade.md`
      : `${saved.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Also copy spell to clipboard if exists
    if (saved.inscribedSpell) {
      window.navigator.clipboard.writeText(saved.inscribedSpell).catch(() => {});
    }
  }, [forgedBlades, mageSpells]);

  // Load a saved constellation
  const handleLoadConstellation = useCallback((saved: SavedConstellation) => {
    setConstellation(saved.marks);
    setConstellationConnections(saved.connections);
    setActiveConstellationId(saved.id);
    setCastingSpells(true);
    setIsShineMode(true);
  }, []);


  // Handle witness blade file import
  const handleWitnessBladeFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      // Parse blade info
      const bladeMatch = content.match(/\*\*(.+?) (.+?)\*\*/);
      const tierMatch = content.match(/\*\*Tier:\*\* (\w+)/i);
      const stratumMatch = content.match(/\*\*Stratum:\*\* (\d+)/i);

      // Parse proof
      const chargeMatch = content.match(/\*\*Charge Level:\*\* (\w+)/i);
      const lapsMatch = content.match(/\*\*Laps:\*\* (\d+)/);
      const durationMatch = content.match(/\*\*Duration:\*\* (\d+)s/);
      const spellsCastMatch = content.match(/\*\*Spells Cast:\*\* (\d+)/);
      const signatureMatch = content.match(/Signature: (SPELL-[\w-]+)/);
      const hashMatch = content.match(/Hash: ([a-f0-9]+)/);
      const hexMatch = content.match(/Hex: ([01]+)/);

      // Parse dimensions
      const dimProtection = content.includes('Protection | ✅');
      const dimDelegation = content.includes('Delegation | ✅');
      const dimMemory = content.includes('Memory | ✅');
      const dimConnection = content.includes('Connection | ✅');
      const dimComputation = content.includes('Computation | ✅');
      const dimValue = content.includes('Value | ✅');

      // Parse path
      const pathMatches = content.matchAll(/^\d+\.\s+(.+?)\s+\*\*(.+?)\*\*/gm);
      const marks: ConstellationMark[] = [];
      for (const match of pathMatches) {
        const emoji = match[1].trim();
        const label = match[2].trim();
        const node = NODES.find(n => n.label === label);
        marks.push({
          nodeId: node?.id || `imported-${marks.length}`,
          nodeLabel: label,
          emoji,
          note: "",
        });
      }

      if (marks.length === 0) {
        alert("Could not parse constellation path from file");
        return;
      }

      // Build connections
      const connections: ConstellationConnection[] = [];
      for (let i = 0; i < marks.length - 1; i++) {
        connections.push({
          sourceId: marks[i].nodeId,
          targetId: marks[i + 1].nodeId,
          note: "",
        });
      }

      // Create proof if we have the data
      const proof: SpellProof | undefined = signatureMatch && hashMatch ? {
        signature: signatureMatch[1],
        constellationHash: hashMatch[1],
        bladeHex: hexMatch?.[1] || "",
        lapCount: parseInt(lapsMatch?.[1] || "0"),
        duration: parseInt(durationMatch?.[1] || "0") * 1000,
        startedAt: 0,
        completedAt: 0,
        nodeCount: marks.length,
        chargeLevel: (chargeMatch?.[1]?.toLowerCase() || "ember") as 'spark' | 'ember' | 'flame' | 'inferno' | 'dragon',
        spellsCast: parseInt(spellsCastMatch?.[1] || "0"),
        bladeDimensions: {
          protection: dimProtection,
          delegation: dimDelegation,
          memory: dimMemory,
          connection: dimConnection,
          computation: dimComputation,
          value: dimValue,
        },
        bladeStratum: parseInt(stratumMatch?.[1] || "0"),
        bladeTier: (tierMatch?.[1]?.toLowerCase() || "light") as 'light' | 'heavy' | 'dragon',
        // Hash chain (imported blades start their own chain)
        previousBladeHash: null,
        bladeHash: hashMatch[1], // Use constellation hash as blade hash for imports
        chainLength: 0, // Imported blade, no chain history
        // Commitment (imported blades are pre-verified by their creator)
        commitment: '',
        commitmentNonce: '',
        commitmentVerified: true, // Trust the import
      } : undefined;

      // Set up witness mode
      const witnessHash = proof?.constellationHash || hashMatch?.[1] || `imported-${Date.now()}`;
      const creatorName = bladeMatch ? `${bladeMatch[1]} ${bladeMatch[2]}` : file.name.replace('.md', '');

      setWitnessMode({
        active: true,
        constellationHash: witnessHash,
        witnessedFrom: creatorName,
      });

      // Load constellation for tracing
      setConstellation(marks);
      setConstellationConnections(connections);
      setCastingSpells(true);
      setMobileFiltersOpen(false);
    };
    reader.readAsText(file);
  }, []);

  const handleConfirmMark = useCallback(() => {
    if (selectedNode && (markEmoji.trim() || markNote.trim())) {
      const newMark: ConstellationMark = {
        nodeId: selectedNode.id,
        nodeLabel: selectedNode.label,
        emoji: markEmoji.trim() || "✦",
        note: markNote.trim(),
      };
      // Remove if already exists, then add (allows updating)
      setConstellation((prev) => [...prev.filter(m => m.nodeId !== selectedNode.id), newMark]);
    }
    setShowMarkModal(false);
    setMarkEmoji("");
    setMarkNote("");
  }, [selectedNode, markEmoji, markNote]);

  const handleRemoveFromConstellation = useCallback((nodeId: string) => {
    setConstellation((prev) => prev.filter(m => m.nodeId !== nodeId));
  }, []);


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: "'IBM Plex Sans', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        nodeCount={filteredNodes.length}
        edgeCount={filteredEdges.length}
        spellbookFilters={spellbookFilters}
        onToggleSpellbook={toggleSpellbook}
        hasConstellation={constellation.length > 0}
        onClearConstellation={() => setShowClearMapModal(true)}
        windowWidth={dimensions.w}
      />

      {/* Mage Modal - Full screen popup like Blades (M key) */}
      {showMageMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={() => setShowMageMenu(false)}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #9b59b6`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 550,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "#9b59b6", fontSize: 20, fontFamily: "'Cormorant Garamond', serif" }}>
                🧙 Mage Spellbook
              </h3>
              <button
                onClick={() => setShowMageMenu(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: THEME.textDim,
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >×</button>
            </div>

            {/* Mana Bar Section */}
            <div style={{
              padding: 16,
              background: mageSpells.length > 0 ? '#9b59b610' : '#ffffff05',
              borderRadius: 8,
              border: `1px solid ${mageSpells.length > 0 ? '#9b59b650' : '#333'}`,
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: mageSpells.length > 0 ? '#9b59b6' : '#666',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                ✦ MANA (Privacy Budget)
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, color: "#9b59b6", fontFamily: "'JetBrains Mono', monospace" }}>
                  {mageSpells.length}/8 spells equipped
                </span>
                <span style={{ fontSize: 10, color: "#666" }}>
                  {8 - mageSpells.length} slots available
                </span>
              </div>
              <div style={{
                width: "100%",
                height: 10,
                background: "rgba(155, 89, 182, 0.15)",
                borderRadius: 5,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${(mageSpells.length / 8) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #9b59b6, #7b68ee)",
                  borderRadius: 5,
                  transition: "width 0.3s ease",
                  boxShadow: mageSpells.length > 0 ? '0 0 10px #9b59b680' : 'none',
                }} />
              </div>
            </div>

            {/* Equipped Spells Section */}
            <div style={{
              padding: 16,
              background: '#ffffff05',
              borderRadius: 8,
              border: '1px solid #333',
              marginBottom: 16,
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 11, color: "#9b59b6", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
                  EQUIPPED SPELLS
                </span>
                <span style={{ fontSize: 9, color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>
                  Drag to reorder
                </span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: 8,
              }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((slotIndex) => {
                  const spell = mageSpells[slotIndex];
                  const isSelected = selectedSpellIndex === slotIndex;
                  return (
                    <div
                      key={slotIndex}
                      draggable={!!spell}
                      onDragStart={(e) => {
                        if (spell) {
                          e.dataTransfer.setData('mageMenuSpellIndex', String(slotIndex));
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('mageMenuSpellIndex'));
                        if (!isNaN(fromIndex) && fromIndex !== slotIndex) {
                          const newSpells = [...mageSpells];
                          const [moved] = newSpells.splice(fromIndex, 1);
                          if (slotIndex < newSpells.length) {
                            newSpells.splice(slotIndex, 0, moved);
                          } else {
                            newSpells.push(moved);
                          }
                          setMageSpells(newSpells.filter(Boolean));
                        }
                      }}
                      title={spell
                        ? `${spell.label}\n${spell.proverb || ''}\n\nDrag to reorder • Click to ${isSelected ? 'deselect' : 'select'}`
                        : `Slot ${slotIndex + 1}: Empty`}
                      onClick={() => {
                        if (spell) {
                          setSelectedSpellIndex(prev => prev === slotIndex ? null : slotIndex);
                        }
                      }}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 8,
                        background: spell
                          ? isSelected
                            ? "linear-gradient(135deg, #9b59b680, #9b59b650)"
                            : "linear-gradient(135deg, #9b59b640, #9b59b620)"
                          : "rgba(60, 60, 80, 0.3)",
                        border: isSelected
                          ? "2px solid #9b59b6"
                          : `1px solid ${spell ? "#9b59b660" : "#444"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: spell ? 18 : 12,
                        cursor: spell ? "grab" : "default",
                        boxShadow: isSelected ? "0 0 15px #9b59b680" : "none",
                        color: spell ? "#fff" : "#555",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                    >
                      {spell ? getFirstEmoji(spell.emoji) : `${slotIndex + 1}`}
                      {spell && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSpells = mageSpells.filter((_, i) => i !== slotIndex);
                            setMageSpells(newSpells);
                            if (selectedSpellIndex === slotIndex) {
                              setSelectedSpellIndex(null);
                            }
                          }}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#ff4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: "#fff",
                            cursor: "pointer",
                          }}
                          title="Remove spell"
                        >✕</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Selected spell info */}
              {selectedSpellIndex !== null && mageSpells[selectedSpellIndex] && (
                <div style={{
                  marginTop: 12,
                  padding: 10,
                  background: '#9b59b615',
                  borderRadius: 6,
                  border: '1px solid #9b59b640',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{mageSpells[selectedSpellIndex].emoji}</span>
                    <span style={{ fontSize: 13, color: '#9b59b6', fontWeight: 600 }}>
                      {mageSpells[selectedSpellIndex].label}
                    </span>
                  </div>
                  {mageSpells[selectedSpellIndex].proverb && (
                    <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>
                      "{mageSpells[selectedSpellIndex].proverb}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Available Spells from Constellation */}
            <div style={{
              padding: 16,
              background: constellation.length > 0 ? '#9b59b608' : '#ffffff05',
              borderRadius: 8,
              border: `1px solid ${constellation.length > 0 ? '#9b59b640' : '#333'}`,
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: constellation.length > 0 ? '#9b59b6' : '#666',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                🌟 CONSTELLATION SPELLS ({constellation.length})
              </div>
              {constellation.length > 0 ? (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  maxHeight: 120,
                  overflowY: "auto",
                }}>
                  {constellation.map((mark, idx) => {
                    const isLearned = mageSpells.some(s => s.nodeId === mark.nodeId);
                    const node = NODES.find(n => n.id === mark.nodeId);
                    return (
                      <div
                        key={`${mark.nodeId}-${idx}`}
                        title={`${mark.nodeLabel}\n${node?.proverb || ''}\n\n${isLearned ? 'Already learned' : 'Click to learn'}`}
                        onClick={() => {
                          if (!isLearned && mageSpells.length < 8) {
                            setMageSpells([...mageSpells, {
                              nodeId: mark.nodeId,
                              label: mark.nodeLabel,
                              emoji: mark.emoji || node?.emoji || '✦',
                              proverb: node?.proverb,
                              emojiSpell: node?.emojiSpell,
                              hexagramLine: mageSpells.length,
                              learnedAt: Date.now(),
                            }]);
                          }
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: isLearned
                            ? "rgba(155, 89, 182, 0.3)"
                            : "rgba(60, 60, 80, 0.3)",
                          border: `1px solid ${isLearned ? '#9b59b6' : '#444'}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          cursor: isLearned ? "default" : mageSpells.length >= 8 ? "not-allowed" : "pointer",
                          opacity: isLearned ? 0.5 : 1,
                          color: "#fff",
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {getFirstEmoji(mark.emoji)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#666', textAlign: 'center', padding: 20 }}>
                  Create a constellation to discover spells
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              {mageSpells.length > 0 && (
                <button
                  onClick={() => setMageSpells([])}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    background: "rgba(255, 100, 100, 0.1)",
                    border: "1px solid #ff666660",
                    color: "#ff6666",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Clear All Spells
                </button>
              )}
              <button
                onClick={() => setShowMageMenu(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #9b59b630, #7b68ee20)",
                  border: "1px solid #9b59b6",
                  color: "#9b59b6",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Done
              </button>
            </div>

            {/* Ceremony Paths Section */}
            <div style={{
              padding: 16,
              background: '#1a1a2e',
              borderRadius: 8,
              border: '1px solid #333',
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: '#888',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                ☀️⊥🌑 CEREMONY PATHS
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {/* Emissary Path (Sun) */}
                <div style={{
                  flex: 1,
                  padding: 12,
                  background: 'linear-gradient(135deg, #ffd70010, #ff8c0010)',
                  borderRadius: 8,
                  border: '1px solid #ffd70040',
                }}>
                  <div style={{ fontSize: 10, color: '#ffd700', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                    ☀️ EMISSARY PATH
                  </div>
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 8 }}>
                    The Emissary Who Forgot the Master
                  </div>
                  <audio
                    controls
                    src="https://voice.agentprivacy.ai/The_Emissary_Who_Forgot_the_Master.mp3"
                    style={{ width: '100%', height: 32 }}
                  />
                </div>
                {/* Amnesia Path (Moon) */}
                <div style={{
                  flex: 1,
                  padding: 12,
                  background: 'linear-gradient(135deg, #c0c0c010, #87ceeb10)',
                  borderRadius: 8,
                  border: '1px solid #c0c0c040',
                }}>
                  <div style={{ fontSize: 10, color: '#c0c0c0', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                    🌑 AMNESIA PATH
                  </div>
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 8 }}>
                    The Amnesia Protocol
                  </div>
                  <audio
                    controls
                    src="https://voice.agentprivacy.ai/The_Amnesia_Protocol.mp3"
                    style={{ width: '100%', height: 32 }}
                  />
                </div>
              </div>
            </div>

            {/* Saved Constellations Section */}
            <div style={{
              padding: 16,
              background: savedConstellations.length > 0 ? '#7b68ee08' : '#ffffff05',
              borderRadius: 8,
              border: `1px solid ${savedConstellations.length > 0 ? '#7b68ee40' : '#333'}`,
              marginBottom: 16,
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}>
                <span style={{
                  fontSize: 11,
                  color: savedConstellations.length > 0 ? '#7b68ee' : '#666',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 1,
                }}>
                  🌌 SAVED CONSTELLATIONS ({savedConstellations.length})
                </span>
                {/* Export Mage Identity button */}
                {hasMageIdentity() && (
                  <button
                    onClick={() => {
                      const backup = exportMageKeyBackup();
                      if (!backup) {
                        alert('No mage identity found to export');
                        return;
                      }
                      // Download as JSON file
                      const json = JSON.stringify(backup, null, 2);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `mage-${backup.mageId.slice(5, 13)}-backup.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "linear-gradient(135deg, #9b59b620, #7b68ee15)",
                      border: "1px solid #9b59b6",
                      color: "#9b59b6",
                      fontSize: 10,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Export mage identity keys (backup)"
                  >
                    <span>🔑</span> Export Keys
                  </button>
                )}
              </div>
              {/* Celestial Ceremony Presets */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>☀️⊥🌙</span> Ceremony Presets
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CONSTELLATION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        // Load preset constellation - find node labels from NODES
                        const marks = preset.marks.map(m => {
                          const node = NODES.find(n => n.id === m.nodeId);
                          return {
                            nodeId: m.nodeId,
                            nodeLabel: node?.label || m.nodeId,
                            emoji: m.emoji || '✦',
                            note: m.note || '',
                            emojiSpell: m.emojiSpell,
                          };
                        });
                        setConstellation(marks);
                        setConstellationConnections(preset.connections.map(c => ({
                          sourceId: c.sourceId,
                          targetId: c.targetId,
                          note: c.note || '',
                        })));
                        setInscribedSpell(preset.inscribedSpell);
                        setConstellationReflection(preset.reflection || '');
                        setConstellationName(preset.name);
                        setCastingSpells(true);
                        setIsShineMode(true);
                        setShowMageMenu(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: preset.ceremony === 'sun'
                          ? 'linear-gradient(135deg, #ffd70015, #ff8c0010)'
                          : 'linear-gradient(135deg, #7b68ee15, #9b59b610)',
                        border: `1px solid ${preset.ceremony === 'sun' ? '#ffd700' : '#7b68ee'}`,
                        color: preset.ceremony === 'sun' ? '#ffd700' : '#7b68ee',
                        fontSize: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      title={`${preset.description}\n\n"${preset.proverb}"\n\n${preset.nodeCount} nodes • ${preset.tier} tier`}
                    >
                      <span style={{ fontSize: 14 }}>{preset.emoji}</span>
                      <span>{preset.name}</span>
                      <span style={{ opacity: 0.6, fontSize: 9 }}>({preset.nodeCount})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 8 }}>
                Saved Paths
              </div>
              {savedConstellations.length === 0 ? (
                <div style={{ fontSize: 12, color: '#666', textAlign: 'center', padding: 16 }}>
                  No saved constellations yet. Trace a path through the stars to create one.
                </div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {savedConstellations.map((saved) => (
                    <div
                      key={saved.id}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        background: activeConstellationId === saved.id ? "#7b68ee15" : "#ffffff06",
                        borderRadius: 6,
                        border: `1px solid ${activeConstellationId === saved.id ? '#7b68ee' : '#333'}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 12, color: THEME.text, fontWeight: 500 }}>
                            {saved.name}
                          </div>
                          <div style={{ fontSize: 9, color: THEME.textDim }}>
                            {new Date(saved.createdAt).toLocaleDateString()} • {saved.marks.length} nodes
                          </div>
                        </div>
                        {saved.proof && (
                          <span style={{
                            fontSize: 9,
                            padding: '2px 6px',
                            borderRadius: 3,
                            background: saved.proof.chargeLevel === 'dragon' ? '#ffd70020' : saved.proof.chargeLevel === 'inferno' ? '#ff6b6b20' : '#9b59b620',
                            color: saved.proof.chargeLevel === 'dragon' ? '#ffd700' : saved.proof.chargeLevel === 'inferno' ? '#ff6b6b' : '#9b59b6',
                          }}>
                            {saved.proof.chargeLevel.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {saved.inscribedSpell && (
                        <div style={{ fontSize: 14, marginBottom: 6, letterSpacing: 2, color: "#ffd700" }}>
                          {saved.inscribedSpell}
                        </div>
                      )}
                      <div style={{ fontSize: 11, marginBottom: 6, color: THEME.textDim }}>
                        {saved.marks.map(m => m.emoji).join(" → ")}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleLoadConstellation(saved)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            background: "#7b68ee20",
                            border: `1px solid #7b68ee`,
                            color: "#7b68ee",
                            fontSize: 10,
                            cursor: "pointer",
                          }}
                        >
                          ✨ View
                        </button>
                        <button
                          onClick={() => {
                            handleLoadConstellation(saved);
                            setInscribedSpell(saved.inscribedSpell || "");
                            setConstellationReflection(saved.reflection || "");
                            setShowMageMenu(false);
                            setShowClosePortalModal(true);
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            background: "#ffd70020",
                            border: `1px solid #ffd700`,
                            color: "#ffd700",
                            fontSize: 10,
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>
                        {(() => {
                          const hasForgedBlade = saved.proof
                            ? forgedBlades.some(b => b.proof.signature === saved.proof?.signature)
                            : false;
                          return (
                            <button
                              onClick={() => hasForgedBlade && handleExportConstellation(saved)}
                              disabled={!hasForgedBlade}
                              title={hasForgedBlade ? "Export constellation with blade" : "Forge a blade to enable export"}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 4,
                                background: hasForgedBlade ? "#50c87815" : "transparent",
                                border: `1px solid ${hasForgedBlade ? "#50c878" : '#444'}`,
                                color: hasForgedBlade ? "#50c878" : '#555',
                                fontSize: 10,
                                cursor: hasForgedBlade ? "pointer" : "not-allowed",
                                opacity: hasForgedBlade ? 1 : 0.5,
                              }}
                            >
                              📄 Export
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{
              marginTop: 12,
              fontSize: 10,
              color: "#666",
              textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Press [M] to toggle • Click constellation nodes to learn spells
            </div>
          </div>
        </div>
      )}

      <GraphFilters
        filters={filters}
        typeFilters={typeFilters}
        onToggleLayer={toggleLayer}
        onToggleType={toggleType}
        isOpen={mobileFiltersOpen}
        // Mobile action props
        onOpenConstellations={() => { setShowMageMenu(true); setMobileFiltersOpen(false); }}
        onOpenZKBlades={() => {
          if (latestProof) {
            setForgePhase('ignite');
            setShowForgeModal(true);
            setTimeout(() => setForgePhase('forge'), 800);
            setTimeout(() => setForgePhase('temper'), 2000);
            setTimeout(() => setForgePhase('complete'), 3500);
            setMobileFiltersOpen(false);
          }
        }}
        onWitnessBlade={handleWitnessBladeFile}
        hasLatestProof={!!latestProof}
        constellationCount={savedConstellations.length}
        forgedBladesCount={forgedBlades.filter(b => !b.isWitness).length}
        witnessBladesCount={forgedBlades.filter(b => b.isWitness).length}
      />

      {/* Mobile Menu Toggle Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileFiltersOpen(o => !o)}
        style={{
          position: "absolute",
          top: 68,
          left: 12,
          zIndex: 90,
          padding: "10px 12px",
          borderRadius: 6,
          background: mobileFiltersOpen ? `${THEME.panelBg}` : `${THEME.panelBg}e0`,
          border: `1px solid ${mobileFiltersOpen ? '#00d9ff' : THEME.panelBorder}`,
          color: mobileFiltersOpen ? '#00d9ff' : THEME.text,
          fontSize: 16,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          display: "none",
        }}
      >
        {mobileFiltersOpen ? '✕' : '☰'}
      </button>

      <Legend hasSelectedNode={!!selectedNode} />

      {/* Show HoverTooltip only when constellation exists (otherwise shows in ceremony panel) */}
      {hoveredNode && !selectedNode && constellation.length > 0 && <HoverTooltip node={hoveredNode} />}

      {/* Connection Mode Cancel - only when connecting */}
      {connectionMode.active && (
        <div
          style={{
            position: "absolute",
            top: 68,
            right: selectedNode ? 396 : 16,
            zIndex: 80,
          }}
        >
          <button
            onClick={handleCancelConnect}
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              background: `${THEME.panelBg}e0`,
              border: `1px solid #ff4444`,
              color: "#ff4444",
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              backdropFilter: "blur(8px)",
            }}
          >
            <span>✕</span> Cancel Connection
          </button>
        </div>
      )}

      {/* Connection Mode Indicator */}
      {connectionMode.active && connectionMode.sourceNode && (
        <div
          style={{
            position: "absolute",
            top: 68,
            left: "50%",
            transform: "translateX(-50%)",
            background: `${THEME.panelBg}f0`,
            border: `1px solid #2ecc71`,
            borderRadius: 8,
            padding: "12px 20px",
            zIndex: 100,
            textAlign: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 12, color: "#2ecc71", marginBottom: 4 }}>
            🔗 Connect Mode
          </div>
          <div style={{ fontSize: 11, color: THEME.text }}>
            Click any node to draw edge from <strong>{connectionMode.sourceNode.label}</strong>
          </div>
        </div>
      )}

      {/* Mark for Constellation Modal */}
      {showMarkModal && selectedNode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={() => setShowMarkModal(false)}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #7b68ee`,
              borderRadius: 12,
              padding: 24,
              width: 360,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", color: "#7b68ee", fontSize: 16 }}>
              ✨ Cast a Spell
            </h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: THEME.text, marginBottom: 12 }}>
                {selectedNode.emoji && <span style={{ marginRight: 8 }}>{selectedNode.emoji}</span>}
                {selectedNode.label}
              </div>
              <label style={{ fontSize: 12, color: THEME.textDim, display: "block", marginBottom: 6 }}>
                Choose an Emoji (or leave default)
              </label>
              <input
                type="text"
                value={markEmoji}
                onChange={(e) => setMarkEmoji(e.target.value)}
                placeholder="✦"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  background: "#ffffff08",
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 18,
                  fontFamily: "sans-serif",
                  textAlign: "center",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: THEME.textDim, display: "block", marginBottom: 6 }}>
                🪞 Reflect Note (optional)
              </label>
              <textarea
                value={markNote}
                onChange={(e) => setMarkNote(e.target.value)}
                placeholder="Why is this node significant to you?"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  background: "#ffffff08",
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  resize: "vertical",
                  minHeight: 60,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
              {constellationNodeIds.has(selectedNode.id) && (
                <button
                  onClick={() => {
                    handleRemoveFromConstellation(selectedNode.id);
                    setShowMarkModal(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 6,
                    background: "transparent",
                    border: `1px solid #ff4444`,
                    color: "#ff4444",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
              <div style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
                <button
                  onClick={() => setShowMarkModal(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 6,
                    background: "transparent",
                    border: `1px solid ${THEME.panelBorder}`,
                    color: THEME.text,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmMark}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 6,
                    background: "#00d9ff",
                    border: "none",
                    color: "#000",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {constellationNodeIds.has(selectedNode.id) ? 'Update Spell' : 'Cast Spell'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Left Side: Mage + Blades Inventories (Side by Side) */}
      {(() => {
        const mageColor = '#9b59b6';
        const bladesColor = '#e74c3c';
        const allBlades = forgedBlades;

        // Panel dimensions - BIGGER
        const slotSize = 44;
        const slotGap = 4;
        const panelPadding = 8;

        return (
          <div
            className="mobile-hide"
            style={{
              position: "absolute",
              bottom: 20,
              left: 16,
              zIndex: 100,
              display: 'flex',
              gap: 12,
            }}
          >
            {/* MAGE INVENTORY */}
            <div
              style={{
                borderRadius: 10,
                background: "rgba(10, 10, 30, 0.95)",
                border: `1px solid ${mageColor}50`,
                backdropFilter: "blur(12px)",
                overflow: 'hidden',
              }}
            >
              {/* Mage Header - emoji + hotkey */}
              <button
                onClick={() => setShowMageMenu(true)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: `linear-gradient(135deg, ${mageColor}25, ${mageColor}10)`,
                  border: 'none',
                  borderBottom: `1px solid ${mageColor}30`,
                  color: mageColor,
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 14 }}>🧙</span>
                <span style={{ opacity: 0.7 }}>[M]</span>
              </button>

              {/* Spell Grid */}
              <div style={{ padding: panelPadding }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(2, ${slotSize}px)`,
                  gap: slotGap,
                }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((slotIndex) => {
                    const spell = mageSpells[slotIndex];
                    const isSelected = selectedSpellIndex === slotIndex;
                    return (
                      <div
                        key={slotIndex}
                        draggable={!!spell}
                        onDragStart={(e) => {
                          if (spell) e.dataTransfer.setData('mageSpellIndex', String(slotIndex));
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('mageSpellIndex'));
                          if (!isNaN(fromIndex) && fromIndex !== slotIndex) {
                            const newSpells = [...mageSpells];
                            const temp = newSpells[fromIndex];
                            newSpells[fromIndex] = newSpells[slotIndex];
                            newSpells[slotIndex] = temp;
                            setMageSpells(newSpells.filter(Boolean));
                          }
                        }}
                        title={spell ? `${spell.label}\n${spell.proverb || ''}` : `Empty slot`}
                        onClick={() => spell && setSelectedSpellIndex(isSelected ? null : slotIndex)}
                        style={{
                          width: slotSize,
                          height: slotSize,
                          borderRadius: 6,
                          background: spell
                            ? isSelected
                              ? `linear-gradient(135deg, ${mageColor}80, ${mageColor}50)`
                              : `linear-gradient(135deg, ${mageColor}30, ${mageColor}15)`
                            : 'rgba(60, 60, 80, 0.2)',
                          border: isSelected ? `2px solid ${mageColor}` : `1px solid ${spell ? mageColor + '50' : '#444'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: spell ? 20 : 10,
                          cursor: spell ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? `0 0 12px ${mageColor}60` : 'none',
                        }}
                      >
                        {spell?.emoji || ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ☯️ CEREMONY PANEL - Between Mage and Blades */}
            <div
              style={{
                borderRadius: 10,
                background: "rgba(10, 10, 25, 0.95)",
                border: `1px solid #88888850`,
                backdropFilter: "blur(12px)",
                overflow: 'hidden',
                width: showCeremonyMenu ? 200 : 'auto',
                transition: 'width 0.2s',
              }}
            >
              {/* Ceremony Header - yin-yang + hotkey */}
              <button
                onClick={() => setShowCeremonyMenu(prev => !prev)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: showCeremonyMenu
                    ? 'linear-gradient(135deg, #ffd70030, #7b68ee30)'
                    : 'linear-gradient(135deg, #88888825, #88888810)',
                  border: 'none',
                  borderBottom: `1px solid #88888830`,
                  color: '#aaa',
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 14 }}>☯️</span>
                <span style={{ opacity: 0.7 }}>[Y]</span>
              </button>

              {/* Ceremony Content - Collapsed: just preset buttons, Expanded: with audio */}
              <div style={{ padding: panelPadding }}>
                {!showCeremonyMenu ? (
                  /* Collapsed: 2x1 grid with Sun and Moon preset buttons */
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: slotGap,
                    alignItems: 'center',
                  }}>
                    {/* Sun Preset */}
                    <button
                      onClick={() => {
                        const preset = CONSTELLATION_PRESETS[0];
                        const marks = preset.marks.map(m => {
                          const node = NODES.find(n => n.id === m.nodeId);
                          return {
                            nodeId: m.nodeId,
                            nodeLabel: node?.label || m.nodeId,
                            emoji: m.emoji || '✦',
                            note: m.note || '',
                            emojiSpell: m.emojiSpell,
                          };
                        });
                        setConstellation(marks);
                        setConstellationConnections(preset.connections.map(c => ({
                          sourceId: c.sourceId,
                          targetId: c.targetId,
                          note: c.note || '',
                        })));
                        setInscribedSpell(preset.inscribedSpell);
                        setConstellationReflection(preset.reflection || '');
                        setConstellationName(preset.name);
                        setCastingSpells(true);
                        setIsShineMode(true);
                      }}
                      title={`☀️ The Emissary Path\n"Just as the Sun, promises space, between."\n13 nodes • Dragon tier`}
                      style={{
                        width: slotSize,
                        height: slotSize,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #ffd70025, #ff8c0015)',
                        border: '1px solid #ffd70050',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        transition: 'all 0.15s',
                      }}
                    >
                      ☀️
                    </button>
                    {/* Gap indicator */}
                    <div
                      title="⊥ The Gap — the irreducible separation"
                      style={{
                        width: slotSize,
                        height: 16,
                        borderRadius: 4,
                        background: '#22222280',
                        border: '1px solid #444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#666',
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      ⊥
                    </div>
                    {/* Moon Preset */}
                    <button
                      onClick={() => {
                        const preset = CONSTELLATION_PRESETS[1];
                        const marks = preset.marks.map(m => {
                          const node = NODES.find(n => n.id === m.nodeId);
                          return {
                            nodeId: m.nodeId,
                            nodeLabel: node?.label || m.nodeId,
                            emoji: m.emoji || '✦',
                            note: m.note || '',
                            emojiSpell: m.emojiSpell,
                          };
                        });
                        setConstellation(marks);
                        setConstellationConnections(preset.connections.map(c => ({
                          sourceId: c.sourceId,
                          targetId: c.targetId,
                          note: c.note || '',
                        })));
                        setInscribedSpell(preset.inscribedSpell);
                        setConstellationReflection(preset.reflection || '');
                        setConstellationName(preset.name);
                        setCastingSpells(true);
                        setIsShineMode(true);
                      }}
                      title={`🌙 The Amnesia Path\n"The amnesia is the protocol. The wound is the trust."\n15 nodes • Dragon tier`}
                      style={{
                        width: slotSize,
                        height: slotSize,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #7b68ee25, #9b59b615)',
                        border: '1px solid #7b68ee50',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        transition: 'all 0.15s',
                      }}
                    >
                      🌙
                    </button>
                  </div>
                ) : (
                  /* Expanded: Full ceremony menu with audio players */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Sun Ceremony */}
                    <div style={{
                      padding: 8,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #ffd70015, #ff8c0008)',
                      border: '1px solid #ffd70040',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>☀️</span>
                        <div>
                          <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 500 }}>Sun Ceremony</div>
                          <div style={{ fontSize: 9, color: '#888' }}>13 nodes • The Emissary Path</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const preset = CONSTELLATION_PRESETS[0];
                          const marks = preset.marks.map(m => {
                            const node = NODES.find(n => n.id === m.nodeId);
                            return {
                              nodeId: m.nodeId,
                              nodeLabel: node?.label || m.nodeId,
                              emoji: m.emoji || '✦',
                              note: m.note || '',
                              emojiSpell: m.emojiSpell,
                            };
                          });
                          setConstellation(marks);
                          setConstellationConnections(preset.connections.map(c => ({
                            sourceId: c.sourceId,
                            targetId: c.targetId,
                            note: c.note || '',
                          })));
                          setInscribedSpell(preset.inscribedSpell);
                          setConstellationReflection(preset.reflection || '');
                          setConstellationName(preset.name);
                          setCastingSpells(true);
                          setIsShineMode(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          marginBottom: 8,
                          borderRadius: 6,
                          background: '#ffd70020',
                          border: '1px solid #ffd700',
                          color: '#ffd700',
                          fontSize: 10,
                          cursor: 'pointer',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        Load Constellation
                      </button>
                      <div style={{ fontSize: 9, color: '#888', marginBottom: 4 }}>🎙️ The Emissary Who Forgot the Master</div>
                      <audio
                        controls
                        src="https://voice.agentprivacy.ai/The_Emissary_Who_Forgot_the_Master.mp3"
                        style={{ width: '100%', height: 32 }}
                      />
                    </div>

                    {/* Gap */}
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      background: '#22222280',
                      border: '1px solid #444',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 12, color: '#666' }}>⊥</div>
                      <div style={{ fontSize: 8, color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>
                        The irreducible separation
                      </div>
                    </div>

                    {/* Moon Ceremony */}
                    <div style={{
                      padding: 8,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #7b68ee15, #9b59b608)',
                      border: '1px solid #7b68ee40',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>🌙</span>
                        <div>
                          <div style={{ fontSize: 11, color: '#7b68ee', fontWeight: 500 }}>Moon Ceremony</div>
                          <div style={{ fontSize: 9, color: '#888' }}>15 nodes • The Amnesia Path</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const preset = CONSTELLATION_PRESETS[1];
                          const marks = preset.marks.map(m => {
                            const node = NODES.find(n => n.id === m.nodeId);
                            return {
                              nodeId: m.nodeId,
                              nodeLabel: node?.label || m.nodeId,
                              emoji: m.emoji || '✦',
                              note: m.note || '',
                              emojiSpell: m.emojiSpell,
                            };
                          });
                          setConstellation(marks);
                          setConstellationConnections(preset.connections.map(c => ({
                            sourceId: c.sourceId,
                            targetId: c.targetId,
                            note: c.note || '',
                          })));
                          setInscribedSpell(preset.inscribedSpell);
                          setConstellationReflection(preset.reflection || '');
                          setConstellationName(preset.name);
                          setCastingSpells(true);
                          setIsShineMode(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          marginBottom: 8,
                          borderRadius: 6,
                          background: '#7b68ee20',
                          border: '1px solid #7b68ee',
                          color: '#7b68ee',
                          fontSize: 10,
                          cursor: 'pointer',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        Load Constellation
                      </button>
                      <div style={{ fontSize: 9, color: '#888', marginBottom: 4 }}>🎙️ The Amnesia Protocol</div>
                      <audio
                        controls
                        src="https://voice.agentprivacy.ai/The_Amnesia_Protocol.mp3"
                        style={{ width: '100%', height: 32 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BLADES INVENTORY */}
            <div
              style={{
                borderRadius: 10,
                background: "rgba(10, 10, 20, 0.95)",
                border: `1px solid ${bladesColor}50`,
                backdropFilter: "blur(12px)",
                overflow: 'hidden',
              }}
            >
              {/* Blade Header - emoji + hotkey */}
              <button
                onClick={() => setShowBladesModal(true)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: `linear-gradient(135deg, ${bladesColor}25, ${bladesColor}10)`,
                  border: 'none',
                  borderBottom: `1px solid ${bladesColor}30`,
                  color: bladesColor,
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 14 }}>⚔️</span>
                <span style={{ opacity: 0.7 }}>[S]</span>
              </button>

              {/* Blade Grid */}
              <div style={{ padding: panelPadding }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(2, ${slotSize}px)`,
                  gap: slotGap,
                }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((slotIndex) => {
                    const blade = allBlades[slotIndex];
                    const isEquipped = blade && equippedBlade?.id === blade.id;
                    const isActive = blade && activeBlade?.id === blade.id;
                    const tierColor = blade?.tier === 'dragon' ? '#ffd700' :
                      blade?.tier === 'heavy' ? '#c0c0c0' : '#87ceeb';

                    return (
                      <div
                        key={slotIndex}
                        draggable={!!blade}
                        onDragStart={(e) => {
                          if (blade) e.dataTransfer.setData('bladeIndex', String(slotIndex));
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('bladeIndex'));
                          if (!isNaN(fromIndex) && fromIndex !== slotIndex) {
                            const newBlades = [...forgedBlades];
                            const temp = newBlades[fromIndex];
                            newBlades[fromIndex] = newBlades[slotIndex];
                            newBlades[slotIndex] = temp;
                            const filtered = newBlades.filter(Boolean);
                            setForgedBlades(filtered);
                            localStorage.setItem(SPELLWEB_STORAGE_KEYS.forgedBlades, JSON.stringify(filtered));
                          }
                        }}
                        title={blade ? `${blade.name} ${stratumToMoonPhase(blade.stratum)} (${blade.tier})${isEquipped ? ' ⚔️ EQUIPPED' : ''}` : `Empty slot`}
                        onClick={() => {
                          if (blade) {
                            if (isActive) {
                              setActiveBlade(null);
                              setBladeTraceActive(false);
                              setIsShineMode(true); // Restore shine when stopping trace
                            } else {
                              setActiveBlade(blade);
                              setBladeTraceActive(true);
                              setOrbsAtHome(false);
                              if (blade.constellationMarks) {
                                setConstellation(blade.constellationMarks);
                                setConstellationConnections(blade.constellationConnections || []);
                              }
                            }
                          }
                        }}
                        onDoubleClick={() => blade && setEquippedBlade(isEquipped ? null : blade)}
                        style={{
                          width: slotSize,
                          height: slotSize,
                          borderRadius: 6,
                          background: blade
                            ? isEquipped
                              ? 'linear-gradient(135deg, #e74c3c50, #e74c3c30)'
                              : isActive
                                ? `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`
                                : `linear-gradient(135deg, ${tierColor}25, ${tierColor}10)`
                            : 'rgba(60, 60, 80, 0.2)',
                          border: isEquipped ? '2px solid #e74c3c' : `1px solid ${blade ? tierColor + '50' : '#444'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: blade ? 20 : 10,
                          cursor: blade ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          boxShadow: isEquipped ? '0 0 12px #e74c3c60' : isActive ? `0 0 10px ${tierColor}40` : 'none',
                          position: 'relative',
                        }}
                      >
                        {blade?.emoji || ''}
                        {isEquipped && (
                          <span style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            fontSize: 8,
                            background: '#e74c3c',
                            borderRadius: '50%',
                            width: 14,
                            height: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: '0 0 6px #e74c3c',
                          }}>⚔</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* Connect Modal - Edge Drawing */}
      {showConnectModal && connectionMode.sourceNode && connectTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 120,
            zIndex: 300,
          }}
          onClick={handleCancelConnect}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #2ecc71`,
              borderRadius: 12,
              padding: 24,
              width: 440,
              maxWidth: "90vw",
              boxShadow: "0 8px 32px rgba(46,204,113,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px", color: "#2ecc71", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔗</span> Connect + Reflect
            </h3>

            {/* Connection Preview */}
            <div style={{
              marginBottom: 20,
              padding: 16,
              background: "#ffffff05",
              borderRadius: 8,
              border: `1px solid ${THEME.panelBorder}`,
            }}>
              <div style={{ fontSize: 14, color: THEME.text, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{connectionMode.sourceNode.emoji || "◆"}</span>
                <span>{connectionMode.sourceNode.label}</span>
              </div>
              <div style={{ fontSize: 20, color: "#2ecc71", textAlign: "center", margin: "8px 0" }}>
                ↓
              </div>
              <div style={{ fontSize: 14, color: THEME.text, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{connectTarget.emoji || "◆"}</span>
                <span>{connectTarget.label}</span>
              </div>
            </div>

            {/* Edge Type Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, letterSpacing: 1, color: THEME.textDim, display: "block", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                EDGE TYPE
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { type: "narrates", label: "Narrates", color: "#2ecc71" },
                  { type: "defines", label: "Defines", color: "#3498db" },
                  { type: "proves", label: "Proves", color: "#e74c3c" },
                  { type: "implements", label: "Implements", color: "#9b59b6" },
                  { type: "extends", label: "Extends", color: "#f39c12" },
                  { type: "references", label: "References", color: "#1abc9c" },
                  { type: "follows", label: "Follows", color: "#e67e22" },
                  { type: "compresses_to", label: "Compresses", color: "#ffd700" },
                  { type: "contradicts", label: "Contradicts", color: "#c0392b" },
                ].map(({ type, label, color }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedEdgeType(type)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      background: selectedEdgeType === type ? `${color}30` : "transparent",
                      border: `1px solid ${selectedEdgeType === type ? color : THEME.panelBorder}`,
                      color: selectedEdgeType === type ? color : THEME.textDim,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflect Note - Required */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, letterSpacing: 1, color: THEME.textDim, display: "block", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                🪞 REFLECT <span style={{ color: "#e74c3c" }}>*</span>
              </label>
              <textarea
                value={reflectNote}
                onChange={(e) => setReflectNote(e.target.value)}
                placeholder="Why does this connection exist? What insight does it capture?"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 6,
                  background: "#ffffff08",
                  border: `1px solid ${reflectNote.trim() ? '#2ecc71' : THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  resize: "vertical",
                  minHeight: 100,
                  transition: "border-color 0.15s",
                }}
              />
              {!reflectNote.trim() && (
                <div style={{ fontSize: 11, color: "#e74c3c", marginTop: 6 }}>
                  Reflection required to draw the line
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={handleCancelConnect}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "transparent",
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConnect}
                disabled={!reflectNote.trim()}
                style={{
                  padding: "10px 24px",
                  borderRadius: 6,
                  background: reflectNote.trim() ? "#2ecc71" : "#2ecc7140",
                  border: "none",
                  color: reflectNote.trim() ? "#000" : "#ffffff60",
                  fontSize: 12,
                  cursor: reflectNote.trim() ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                Draw Edge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Map Confirmation Modal */}
      {showClearMapModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={() => setShowClearMapModal(false)}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #ff4444`,
              borderRadius: 12,
              padding: 24,
              width: 360,
              maxWidth: "90vw",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ margin: "0 0 12px", color: "#ff4444", fontSize: 18 }}>
              Clear Map?
            </h3>
            <p style={{ fontSize: 13, color: THEME.text, marginBottom: 8, lineHeight: 1.5 }}>
              This will remove all {constellation.length} constellation marks and {constellationConnections.length} connections you've made.
            </p>
            <p style={{ fontSize: 12, color: THEME.textDim, marginBottom: 20 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setShowClearMapModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: `${THEME.panelBg}`,
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConstellation([]);
                  setConstellationConnections([]);
                  setCastingSpells(false);
                  setIncantationActive(false);
                  setShowClearMapModal(false);
                  setIsShineMode(true); // Restore shine when clearing map
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: `linear-gradient(135deg, #ff444430, #ff220030)`,
                  border: `1px solid #ff4444`,
                  color: "#ff4444",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Yes, Clear Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Portal Modal - Summary of path with emoji inscription */}
      {showClosePortalModal && (waypoint.path.length > 0 || constellation.length > 0) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={handleCancelClosePortal}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #7b68ee`,
              borderRadius: 12,
              padding: 28,
              maxWidth: 550,
              width: "90%",
              maxHeight: "85vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", color: "#7b68ee", fontSize: 20, fontFamily: "'Cormorant Garamond', serif" }}>
              🌀 {waypoint.path.length > 0 ? "Close Portal" : "Edit Constellation"}
            </h3>
            <p style={{ margin: "0 0 20px", color: THEME.textDim, fontSize: 12 }}>
              {waypoint.path.length > 0
                ? `Your journey through ${waypoint.path.length} stars is complete. Inscribe your spell.`
                : `Edit your constellation of ${constellation.length} stars.`
              }
            </p>

            {/* Your Path - Visual journey */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: THEME.textDim, marginBottom: 10, letterSpacing: 1 }}>
                YOUR PATH
              </label>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: 16,
                background: "#ffffff08",
                borderRadius: 8,
                border: `1px solid ${THEME.panelBorder}`,
              }}>
                {(waypoint.path.length > 0 ? waypoint.path : constellation.map(m => m.nodeId)).map((nodeId, i, arr) => {
                  const node = NODES.find(n => n.id === nodeId);
                  const mark = constellation.find(m => m.nodeId === nodeId);
                  return (
                    <div key={nodeId} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 20,
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: "#7b68ee20",
                          border: "1px solid #7b68ee40",
                          transition: "all 0.15s",
                        }}
                        onClick={() => setInscribedSpell(prev => prev + (mark?.emoji || node?.emoji || "✦"))}
                        title={`Click to add ${mark?.emoji || node?.emoji || "✦"} to your spell`}
                      >
                        {mark?.emoji || node?.emoji || "✦"}
                      </span>
                      <span style={{ fontSize: 11, color: THEME.textDim, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {node?.label}
                      </span>
                      {i < arr.length - 1 && (
                        <span style={{ color: "#7b68ee50", fontSize: 12, margin: "0 4px" }}>→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inscribe Your Spell */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: "#ffd700", marginBottom: 10, letterSpacing: 1 }}>
                ✨ INSCRIBE YOUR SPELL
              </label>
              <p style={{ fontSize: 11, color: THEME.textDim, marginBottom: 10 }}>
                Click emojis above or type your own to craft your spell:
              </p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={inscribedSpell}
                  onChange={(e) => setInscribedSpell(e.target.value)}
                  placeholder="✦ ✧ ⟡ ◇ ❖"
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 6,
                    background: "#ffd70010",
                    border: `1px solid #ffd700`,
                    color: THEME.text,
                    fontSize: 20,
                    fontFamily: "sans-serif",
                    textAlign: "center",
                    letterSpacing: 4,
                  }}
                />
                <button
                  onClick={() => setInscribedSpell("")}
                  style={{
                    padding: "14px 12px",
                    borderRadius: 6,
                    background: "transparent",
                    border: `1px solid ${THEME.panelBorder}`,
                    color: THEME.textDim,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Reflection */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: THEME.textDim, marginBottom: 10, letterSpacing: 1 }}>
                🪞 REFLECT
              </label>
              <textarea
                value={constellationReflection}
                onChange={(e) => setConstellationReflection(e.target.value)}
                placeholder="What meaning did you find in this path? What connections revealed themselves?"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 6,
                  background: "#ffffff08",
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  resize: "vertical",
                  minHeight: 80,
                }}
              />
            </div>

            {/* Constellation name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, color: THEME.textDim, marginBottom: 10, letterSpacing: 1 }}>
                NAME YOUR CONSTELLATION
              </label>
              <input
                type="text"
                value={constellationName}
                onChange={(e) => setConstellationName(e.target.value)}
                placeholder={`Path ${savedConstellations.length + 1}`}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: "#ffffff08",
                  border: `1px solid #7b68ee`,
                  color: THEME.text,
                  fontSize: 15,
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={handleCancelClosePortal}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "transparent",
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConstellation}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "#7b68ee",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ✨ Save Constellation
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Spell Learning Emoji Picker Modal */}
      {showSpellEmojiPicker && pendingSpellNode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={() => {
            setShowSpellEmojiPicker(false);
            setPendingSpellNode(null);
            setPendingSpellEmoji('');
            setPendingSpellProverb('');
          }}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #9b59b6`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 450,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", color: "#9b59b6", fontSize: 20, fontFamily: "'Cormorant Garamond', serif" }}>
              🔮 Learn Spell
            </h3>
            <p style={{ margin: "0 0 16px", color: THEME.textDim, fontSize: 12 }}>
              Choose one emoji to represent this spell in your hexagram line {pendingSpellLine + 1}.
            </p>

            {/* Spell info */}
            <div style={{
              padding: 12,
              background: '#9b59b610',
              borderRadius: 8,
              marginBottom: 16,
              border: '1px solid #9b59b630',
            }}>
              <div style={{ fontSize: 14, color: THEME.text, fontWeight: 500 }}>
                {pendingSpellNode.emoji && <span style={{ marginRight: 6 }}>{pendingSpellNode.emoji}</span>}
                {pendingSpellNode.label}
              </div>
              <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>
                {pendingSpellNode.desc?.slice(0, 100)}{pendingSpellNode.desc && pendingSpellNode.desc.length > 100 ? '...' : ''}
              </div>
            </div>

            {/* Emoji selection from emojiSpell */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "#9b59b6", marginBottom: 10, letterSpacing: 1 }}>
                ✨ CHOOSE YOUR SPELL EMOJI
              </label>
              {pendingSpellNode.emojiSpell ? (
                <>
                  <p style={{ fontSize: 10, color: THEME.textDim, marginBottom: 8 }}>
                    Click one emoji from the spell to inscribe:
                  </p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    padding: 12,
                    background: '#ffffff08',
                    borderRadius: 8,
                    border: `1px solid ${THEME.panelBorder}`,
                  }}>
                    {/* Parse emojis from emojiSpell */}
                    {[...pendingSpellNode.emojiSpell].filter(char => {
                      // Keep emojis only (basic check for emoji ranges)
                      const code = char.codePointAt(0) || 0;
                      return code > 0x1F300 || (code >= 0x2600 && code <= 0x27BF);
                    }).map((emoji, i) => (
                      <span
                        key={i}
                        onClick={() => setPendingSpellEmoji(emoji)}
                        style={{
                          fontSize: 24,
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: pendingSpellEmoji === emoji ? '#9b59b640' : '#9b59b610',
                          border: `2px solid ${pendingSpellEmoji === emoji ? '#9b59b6' : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}
                        title={`Select ${emoji}`}
                      >
                        {emoji}
                      </span>
                    ))}
                    {/* Also allow node's primary emoji */}
                    {pendingSpellNode.emoji && !pendingSpellNode.emojiSpell?.includes(pendingSpellNode.emoji) && (
                      <span
                        onClick={() => setPendingSpellEmoji(pendingSpellNode.emoji || '')}
                        style={{
                          fontSize: 24,
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: pendingSpellEmoji === pendingSpellNode.emoji ? '#9b59b640' : '#9b59b610',
                          border: `2px solid ${pendingSpellEmoji === pendingSpellNode.emoji ? '#9b59b6' : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}
                        title={`Select ${pendingSpellNode.emoji}`}
                      >
                        {pendingSpellNode.emoji}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                // No emojiSpell, use node emoji or allow custom
                <div style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}>
                  {pendingSpellNode.emoji && (
                    <span
                      onClick={() => setPendingSpellEmoji(pendingSpellNode.emoji || '')}
                      style={{
                        fontSize: 28,
                        cursor: 'pointer',
                        padding: '10px 14px',
                        borderRadius: 6,
                        background: pendingSpellEmoji === pendingSpellNode.emoji ? '#9b59b640' : '#9b59b610',
                        border: `2px solid ${pendingSpellEmoji === pendingSpellNode.emoji ? '#9b59b6' : 'transparent'}`,
                      }}
                    >
                      {pendingSpellNode.emoji}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: THEME.textDim }}>or type:</span>
                  <input
                    type="text"
                    value={pendingSpellEmoji}
                    onChange={(e) => setPendingSpellEmoji(e.target.value.slice(-2))}
                    placeholder="✦"
                    style={{
                      width: 60,
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: '#9b59b610',
                      border: `1px solid #9b59b6`,
                      color: THEME.text,
                      fontSize: 20,
                      textAlign: 'center',
                    }}
                  />
                </div>
              )}
              {pendingSpellEmoji && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#9b59b6' }}>
                  Selected: <span style={{ fontSize: 20 }}>{pendingSpellEmoji}</span>
                </div>
              )}
            </div>

            {/* Proverb inscription */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: "#ffd700", marginBottom: 10, letterSpacing: 1 }}>
                📜 INSCRIBE YOUR PROVERB
              </label>
              <p style={{ fontSize: 10, color: THEME.textDim, marginBottom: 8 }}>
                Write a short wisdom or intention for this spell:
              </p>
              <textarea
                value={pendingSpellProverb}
                onChange={(e) => setPendingSpellProverb(e.target.value)}
                placeholder={pendingSpellNode.proverb || "A brief wisdom about this spell..."}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 6,
                  background: "#ffd70010",
                  border: `1px solid #ffd70080`,
                  color: THEME.text,
                  fontSize: 13,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  resize: "vertical",
                  minHeight: 60,
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowSpellEmojiPicker(false);
                  setPendingSpellNode(null);
                  setPendingSpellEmoji('');
                  setPendingSpellProverb('');
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "transparent",
                  border: `1px solid ${THEME.panelBorder}`,
                  color: THEME.text,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingSpellNode && pendingSpellEmoji) {
                    const newSpell: MageSpell = {
                      nodeId: pendingSpellNode.id,
                      label: pendingSpellNode.label,
                      emoji: pendingSpellEmoji,
                      emojiSpell: pendingSpellNode.emojiSpell,
                      proverb: pendingSpellProverb || pendingSpellNode.proverb || '',
                      hexagramLine: pendingSpellLine,
                      learnedAt: Date.now(),
                    };
                    setMageSpells(prev => [...prev, newSpell]);
                    setShowSpellEmojiPicker(false);
                    setPendingSpellNode(null);
                    setPendingSpellEmoji('');
                    setPendingSpellProverb('');
                  }
                }}
                disabled={!pendingSpellEmoji}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: pendingSpellEmoji ? "#9b59b6" : "#9b59b640",
                  border: "none",
                  color: pendingSpellEmoji ? "#fff" : "#ffffff60",
                  fontSize: 12,
                  cursor: pendingSpellEmoji ? "pointer" : "default",
                  fontWeight: 600,
                }}
              >
                ✨ Learn Spell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Inscription & Branding */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 40,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: `${THEME.accent}60`,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: 4,
            marginBottom: 4,
          }}
        >
          (⚔️⊥⿻⊥🧙)🙂
        </div>
        <div
          style={{
            fontSize: 9,
            color: THEME.textDim,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 1,
            opacity: 0.6,
          }}
        >
          <a href="https://agentprivacy.ai" target="_blank" rel="noopener noreferrer" style={{ color: THEME.textDim, textDecoration: "none", pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 4 }}>
            agentprivacy
            <img src="/assets/favicon-16x16.png" alt="" style={{ width: 10, height: 10, opacity: 0.35, verticalAlign: "middle" }} />
            universe
          </a>
        </div>
      </div>


      {/* Graph Canvas */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 56,
          left: 0,
          right: selectedNode ? 380 : 0,
          bottom: 0,
          transition: "right 0.2s",
        }}
      >
        <svg ref={svgRef} width="100%" height="100%" style={{ display: "block" }} />

        {/* Floating Emojis - Trajectory effect when clicking/casting spells */}
        {floatingEmojis.map(fe => {
          const dx = fe.targetX - fe.x;
          const dy = fe.targetY - fe.y;
          return (
            <div
              key={fe.id}
              style={{
                position: 'fixed',
                left: fe.x,
                top: fe.y,
                fontSize: 24,
                pointerEvents: 'none',
                zIndex: 200,
                textShadow: '0 0 10px #9b59b6, 0 0 20px #9b59b680',
                // @ts-ignore - CSS custom properties
                '--dx': `${dx}px`,
                '--dy': `${dy}px`,
                animation: 'spellEmojiTrajectory 1.5s ease-out forwards',
              } as React.CSSProperties}
            >
              {fe.emoji}
            </div>
          );
        })}


        {/* Hovered Node Tooltip - Bottom right above domains key */}
        {hoveredNode && !selectedNode && (
          <div
            style={{
              position: 'fixed',
              bottom: 140,
              right: 16,
              maxWidth: 280,
              background: `${THEME.panelBg}f0`,
              borderRadius: 8,
              padding: '12px 16px',
              zIndex: 60,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${THEME.panelBorder}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{hoveredNode.emoji || '✦'}</span>
              <span style={{
                fontSize: 14,
                color: THEME.textBright,
                fontWeight: 600,
                fontFamily: "'Cormorant Garamond', serif"
              }}>
                {hoveredNode.label}
              </span>
            </div>
            {hoveredNode.desc && (
              <div style={{
                fontSize: 11,
                color: THEME.textDim,
                lineHeight: 1.5,
                marginBottom: 8,
              }}>
                {hoveredNode.desc.slice(0, 150)}{hoveredNode.desc.length > 150 ? '…' : ''}
              </div>
            )}
            <div style={{
              fontSize: 9,
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }}>
              {hoveredNode.type} · {hoveredNode.domain}
            </div>
          </div>
        )}

        {/* Spell Ceremony - Floating panel with orbs traveling the constellation circuit */}
        {/* Always visible - SpellCeremony handles its own minimize state */}
        {(
          <SpellCeremony
          isActive={true}
          isCasting={incantationActive}
          circuitNodes={constellation.map(mark => {
            // Get the simulation node with x/y position
            const simNode = nodeDataRef.current.find(n => n.id === mark.nodeId);
            const staticNode = NODES.find(n => n.id === mark.nodeId);
            if (!simNode || !staticNode) return null;
            return {
              id: mark.nodeId,
              x: simNode.x,
              y: simNode.y,
              emoji: mark.emoji || staticNode.emoji,
              emojiSpell: staticNode.emojiSpell,
              label: staticNode.label,
              proverb: staticNode.proverb,
            };
          }).filter(Boolean) as Array<{id: string; x: number; y: number; emoji?: string; emojiSpell?: string; label: string; proverb?: string}>}
          onProofGenerated={handleProofGenerated}
          onToggleEvoke={() => { setIncantationActive(i => { if (i) setIsShineMode(true); return !i; }); }}
          onClearConstellation={() => {
            setConstellation([]);
            setConstellationConnections([]);
            setIncantationActive(false);
            setActiveConstellationId(null);
            setIsShineMode(true); // Restore shine when clearing constellation
          }}
          isShineMode={isShineMode}
          onShine={() => {
            // Toggle Shine (100%) vs Shadow (15%) mode
            setIsShineMode(prev => !prev);
          }}
          onSavePath={() => {
            if (constellation.length > 0 && !activeConstellationId) {
              // Quick save current path
              const connections: ConstellationConnection[] = [];
              for (let i = 0; i < constellation.length - 1; i++) {
                connections.push({
                  sourceId: constellation[i].nodeId,
                  targetId: constellation[i + 1].nodeId,
                  note: '',
                });
              }
              const newId = `constellation-${Date.now()}`;
              const newConstellation: SavedConstellation = {
                id: newId,
                name: `Path ${savedConstellations.length + 1}`,
                marks: constellation,
                connections,
                createdAt: new Date().toISOString(),
              };
              setSavedConstellations(prev => [...prev, newConstellation]);
              setActiveConstellationId(newId);
            }
          }}
          onConnect={() => {
            if (selectedNode) {
              setConnectionMode({ active: true, sourceNode: selectedNode });
            }
          }}
          onStartWaypoint={handleStartWaypoint}
          onClosePortal={handleClosePortal}
          canStartWaypoint={!waypoint.active && !!selectedNode}
          canClosePortal={waypoint.active && waypoint.path.length > 0}
          canConnect={!!selectedNode && !connectionMode.active}
          canSave={constellation.length > 0 && !activeConstellationId && !bladeTraceActive}
          waypointActive={waypoint.active}
          orbsAtHome={orbsAtHome}
          onToggleOrbsHome={() => setOrbsAtHome(h => !h)}
          equippedBlade={equippedBlade ? {
            id: equippedBlade.id,
            name: equippedBlade.name,
            emoji: equippedBlade.emoji,
            constellationMarks: equippedBlade.constellationMarks.map(mark => {
              const staticNode = NODES.find(n => n.id === mark.nodeId);
              return {
                nodeId: mark.nodeId,
                emoji: mark.emoji || staticNode?.emoji,
                emojiSpell: staticNode?.emojiSpell,
              };
            }),
          } : null}
          mageSpells={mageSpells.map(spell => ({
            nodeId: spell.nodeId,
            label: spell.label,
            emoji: spell.emoji,
            emojiSpell: spell.emojiSpell,
            proverb: spell.proverb,
            hexagramLine: spell.hexagramLine,
          }))}
          hoveredNode={hoveredNode && !selectedNode ? {
            label: hoveredNode.label,
            emoji: hoveredNode.emoji,
            type: hoveredNode.type,
            desc: hoveredNode.desc,
          } : null}
          selectedSpell={selectedSpellIndex !== null && mageSpells[selectedSpellIndex] ? {
            label: mageSpells[selectedSpellIndex].label,
            emoji: mageSpells[selectedSpellIndex].emoji,
            proverb: mageSpells[selectedSpellIndex].proverb,
          } : null}
          manaPoints={manaPoints}
          maxMana={MAX_MANA}
          onSpellCast={() => {
            // Deduct mana when casting spell during ceremony
            // Cost depends on blade tier: dragon=1, heavy=3, light/none=6
            // Use ref to avoid stale closure issues
            const cost = manaCostRef.current;
            setManaPoints(prev => {
              if (prev >= cost) {
                const newMana = Math.max(0, prev - cost);
                localStorage.setItem('spellweb_mana_points', String(newMana));
                return newMana;
              }
              return prev; // Not enough mana
            });
          }}
          castingMode={castingMode}
          onToggleCastingMode={() => setCastingMode(m => m === 'constellation' ? 'mage' : 'constellation')}
          manaFloor={7}
          hasProof={!!latestProof}
          onForge={() => {
            if (latestProof) {
              setForgePhase('ignite');
              setShowForgeModal(true);
              setTimeout(() => setForgePhase('forge'), 800);
              setTimeout(() => setForgePhase('temper'), 2000);
              setTimeout(() => setForgePhase('complete'), 3500);
            }
          }}
          onOpenMageMenu={() => setShowMageMenu(true)}
          onOpenBladesModal={() => setShowBladesModal(true)}
        />
        )}

      </div>

      {/* Node Inspector */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          edges={EDGES}
          onClose={() => setSelectedNode(null)}
          onNavigate={navigateToNode}
          onAddToPath={() => handleWaypointAddNode(selectedNode)}
          isWaypointActive={waypoint.active}
          isInPath={waypoint.path.includes(selectedNode.id)}
          // Mage spell learning - opens emoji picker modal
          onLearnSpell={(node, hexagramLine) => {
            // Open emoji picker modal instead of directly adding
            if (mageSpells.length < 8 && !mageSpells.some(s => s.nodeId === node.id)) {
              setPendingSpellNode(node);
              setPendingSpellLine(hexagramLine);
              setShowSpellEmojiPicker(true);
            }
          }}
          mageSpellCount={mageSpells.length}
          isSpellLearned={mageSpells.some(s => s.nodeId === selectedNode.id)}
        />
      )}


      {/* Wandering Orbs - Float through graph when not evoking and not at home */}
      {!incantationActive && !orbsAtHome && (
        <WanderingOrbs
          width={dimensions.w}
          height={dimensions.h}
          isEvoking={incantationActive}
          waypointNodes={
            // When tracing a blade, scale constellation to fit above ceremony panel
            bladeTraceActive && activeBlade?.constellationMarks
              ? (() => {
                  // Get raw node positions
                  const rawNodes = activeBlade.constellationMarks.map(mark => {
                    const node = nodeDataRef.current.find(n => n.id === mark.nodeId);
                    return node ? { x: node.x!, y: node.y!, id: mark.nodeId, emoji: mark.emoji } : null;
                  }).filter(Boolean) as Array<{ x: number; y: number; id: string; emoji?: string }>;

                  if (rawNodes.length === 0) return rawNodes;

                  // Calculate bounding box
                  const minX = Math.min(...rawNodes.map(n => n.x));
                  const maxX = Math.max(...rawNodes.map(n => n.x));
                  const minY = Math.min(...rawNodes.map(n => n.y));
                  const maxY = Math.max(...rawNodes.map(n => n.y));
                  const width = maxX - minX || 1;
                  const height = maxY - minY || 1;

                  // Target area: center of upper-left quadrant
                  const targetCenterX = dimensions.w / 4;
                  const targetCenterY = dimensions.h / 3;
                  const targetSize = 180; // Max size of trace area
                  const scale = Math.min(targetSize / width, targetSize / height, 1);

                  // Scale and center
                  const sourceCenterX = (minX + maxX) / 2;
                  const sourceCenterY = (minY + maxY) / 2;

                  return rawNodes.map(n => ({
                    ...n,
                    x: targetCenterX + (n.x - sourceCenterX) * scale,
                    y: targetCenterY + (n.y - sourceCenterY) * scale,
                  }));
                })()
              : waypoint.path.map(id => {
                  const node = nodeDataRef.current.find(n => n.id === id);
                  return node ? { x: node.x, y: node.y, id } : null;
                }).filter(Boolean) as Array<{ x: number; y: number; id: string }>
          }
          ceremonyPosition={{ x: dimensions.w / 2, y: dimensions.h - 150 }}
          isTracing={bladeTraceActive && !!activeBlade}
          traceColor={
            activeBlade?.tier === 'dragon' ? '#ffd700' :
            activeBlade?.tier === 'heavy' ? '#c0c0c0' : '#87ceeb'
          }
          // Swordsman orb: emojis from equipped blade's constellation
          swordsmanOrbitEmojis={
            equippedBlade?.constellationMarks
              .map(mark => mark.emoji)
              .filter((e): e is string => !!e)
              .slice(0, 6) || []
          }
          // Mage orb: emojis from learned spells
          mageOrbitEmojis={
            mageSpells
              .map(spell => spell.emoji)
              .filter((e): e is string => !!e)
              .slice(0, 6)
          }
        />
      )}

      {/* Constellation Cut Overlay - Shows sword cutting through actual graph */}
      {showForgeModal && forgePhase === 'manifesting' && (() => {
        // Get constellation node positions
        const cutNodes = constellation.map(mark => {
          const node = nodeDataRef.current.find(n => n.id === mark.nodeId);
          return node ? { x: node.x, y: node.y, id: mark.nodeId, emoji: mark.emoji } : null;
        }).filter(Boolean) as Array<{ x: number; y: number; id: string; emoji: string }>;

        if (cutNodes.length < 2) return null;

        const tierColors = {
          light: '#87ceeb',
          heavy: '#c0c0c0',
          dragon: '#ffd700',
        };
        const tierColor = tierColors[latestProof?.bladeTier || 'light'];

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: 'none',
          }}>
            <svg
              width={dimensions.w}
              height={dimensions.h}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="cutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={tierColor} stopOpacity="0" />
                  <stop offset="50%" stopColor={tierColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={tierColor} stopOpacity="0" />
                </linearGradient>
                <filter id="cutGlow">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Draw constellation path being "cut" */}
              <g filter="url(#cutGlow)">
                {cutNodes.map((node, i) => {
                  if (i === 0) return null;
                  const prev = cutNodes[i - 1];
                  return (
                    <line
                      key={`cut-${i}`}
                      x1={prev.x}
                      y1={prev.y}
                      x2={node.x}
                      y2={node.y}
                      stroke={tierColor}
                      strokeWidth="3"
                      strokeDasharray="1000"
                      strokeDashoffset="1000"
                      opacity="0.8"
                      style={{
                        animation: `cutLine 0.8s ease-out ${i * 0.5}s forwards`,
                      }}
                    />
                  );
                })}
                {/* Close the loop */}
                {cutNodes.length > 2 && (
                  <line
                    x1={cutNodes[cutNodes.length - 1].x}
                    y1={cutNodes[cutNodes.length - 1].y}
                    x2={cutNodes[0].x}
                    y2={cutNodes[0].y}
                    stroke={tierColor}
                    strokeWidth="3"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    opacity="0.8"
                    style={{
                      animation: `cutLine 0.8s ease-out ${cutNodes.length * 0.5}s forwards`,
                    }}
                  />
                )}
              </g>

              {/* Node burst effects */}
              {cutNodes.map((node, i) => (
                <g key={`burst-${i}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="5"
                    fill={tierColor}
                    opacity="0"
                    style={{
                      animation: `nodeBurst 0.8s ease-out ${i * 0.5}s forwards`,
                    }}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill="none"
                    stroke={tierColor}
                    strokeWidth="2"
                    opacity="0"
                    style={{
                      animation: `nodeRing 1s ease-out ${i * 0.5}s forwards`,
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y - 30}
                    textAnchor="middle"
                    fontSize="20"
                    opacity="0"
                    style={{
                      animation: `emojiFloat 1.2s ease-out ${i * 0.5}s forwards`,
                    }}
                  >
                    {node.emoji}
                  </text>
                </g>
              ))}

              {/* Animated sword following the path - completes full lap */}
              <text
                fontSize="32"
                textAnchor="middle"
                dominantBaseline="middle"
                filter="url(#cutGlow)"
                style={{
                  animation: `swordTrace ${cutNodes.length * 0.5 + 0.8}s ease-out forwards`,
                }}
              >
                <animateMotion
                  dur={`${cutNodes.length * 0.5 + 0.8}s`}
                  fill="freeze"
                  path={`M ${cutNodes.map(n => `${n.x},${n.y}`).join(' L ')} L ${cutNodes[0].x},${cutNodes[0].y}`}
                />
                ⚔️
              </text>
            </svg>

            {/* Blade name reveal after animation completes full lap */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              opacity: 0,
              animation: `fadeIn 1s ease-out ${cutNodes.length * 0.5 + 1.5}s forwards`,
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 8,
              }}>
                {bladeEmoji}
              </div>
              <div style={{
                fontSize: 36,
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 'bold',
                color: tierColor,
                letterSpacing: 4,
                textTransform: 'uppercase',
                textShadow: `0 0 20px ${tierColor}, 0 0 40px #4a9eff`,
              }}>
                {bladeName}
              </div>
              <div style={{
                marginTop: 12,
                fontSize: 14,
                color: '#888',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Forged in the 64-Tetrahedra Lattice
              </div>
            </div>
          </div>
        );
      })()}

      {/* Runecraft Modal - Link Swordsman identity to blade */}
      {showRunecraftModal && runecraftBlade && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 350,
          }}
          onClick={() => {
            setShowRunecraftModal(false);
            setRunecraftBlade(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, #1a1a2e, #16162a)",
              borderRadius: 16,
              padding: 28,
              maxWidth: 440,
              width: "90%",
              border: "2px solid #9333ea40",
              boxShadow: "0 0 60px rgba(147, 51, 234, 0.2)",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔮</div>
              <h2 style={{
                color: '#9333ea',
                fontSize: 18,
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
                letterSpacing: 2,
              }}>
                RUNECRAFT
              </h2>
              <div style={{
                color: '#888',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: 8,
              }}>
                Bind Swordsman identity to blade
              </div>
            </div>

            {/* Blade Info */}
            <div style={{
              background: 'rgba(147, 51, 234, 0.1)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              border: '1px solid #9333ea30',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{runecraftBlade.emoji}</span>
                <div>
                  <div style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                    {runecraftBlade.name}
                  </div>
                  <div style={{ color: '#888', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                    Mage: {runecraftBlade.proof.mageId || 'unsigned'}
                  </div>
                </div>
              </div>
            </div>

            {/* Swordsman Link Status */}
            {!swordsmanLink ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  color: '#f59e0b',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 12,
                  textAlign: 'center',
                }}>
                  ⚠️ No Swordsman linked
                </div>
                <div style={{
                  color: '#888',
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 12,
                  textAlign: 'center',
                }}>
                  Import your Swordsman identity from agentprivacy to enable runecraft.
                  Paste the JSON export below:
                </div>
                <textarea
                  placeholder='{"participantId":"ap-...","displayName":"...","publicKeyHex":"..."}'
                  style={{
                    width: '100%',
                    height: 80,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid #444',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: 8,
                    resize: 'none',
                  }}
                  onChange={(e) => {
                    try {
                      const data = JSON.parse(e.target.value);
                      if (data.participantId && data.publicKeyHex) {
                        const link = {
                          participantId: data.participantId,
                          displayName: data.displayName || 'Swordsman',
                          publicKeyHex: data.publicKeyHex,
                          trustTier: data.trustTier || 'blade',
                          constellationPath: data.constellationPath,
                          linkedAt: new Date().toISOString(),
                        };
                        saveSwordsmanLink(link);
                        setSwordsmanLink(link);
                      }
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid #22c55e30',
                }}>
                  <div style={{
                    color: '#22c55e',
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 8,
                  }}>
                    ✓ Swordsman Linked
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⚔️</span>
                    <div>
                      <div style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                        {swordsmanLink.displayName}
                      </div>
                      <div style={{ color: '#888', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
                        {swordsmanLink.participantId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  setShowRunecraftModal(false);
                  setRunecraftBlade(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #444',
                  color: '#888',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                disabled={!swordsmanLink}
                onClick={() => {
                  if (swordsmanLink && runecraftBlade) {
                    // Mark blade as runecrafted
                    const updatedProof = {
                      ...runecraftBlade.proof,
                      runecrafted: true,
                      swordsmanId: swordsmanLink.participantId,
                      runecraftedAt: Date.now(),
                      // Note: actual swordsmanSignature would require cross-app signing
                      // For now, we mark the link as established
                    };
                    const updatedBlade = {
                      ...runecraftBlade,
                      proof: updatedProof,
                    };
                    // Update in forgedBlades
                    const newBlades = forgedBlades.map(b =>
                      b.id === runecraftBlade.id ? updatedBlade : b
                    );
                    setForgedBlades(newBlades);
                    localStorage.setItem(SPELLWEB_STORAGE_KEYS.forgedBlades, JSON.stringify(newBlades));

                    setShowRunecraftModal(false);
                    setRunecraftBlade(null);
                    console.log(`[Runecraft] Blade "${runecraftBlade.name}" linked to ${swordsmanLink.participantId}`);
                  }
                }}
                style={{
                  flex: 2,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: swordsmanLink ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'rgba(147, 51, 234, 0.2)',
                  border: 'none',
                  color: swordsmanLink ? '#fff' : '#666',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: swordsmanLink ? 'pointer' : 'not-allowed',
                  letterSpacing: 1,
                }}
              >
                🔮 Runecraft Blade
              </button>
            </div>

            {/* Info */}
            <div style={{
              color: '#666',
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 16,
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              Runecraft binds both Mage (knowledge graph) and Swordsman (promise graph)
              identities to this blade, creating a dual-key proof of presence.
            </div>
          </div>
        </div>
      )}

      {/* Blades Modal - Unified ZK Blades + Witness */}
      {showBladesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={() => setShowBladesModal(false)}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid ${THEME.panelBorder}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 550,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "#ffd700", fontSize: 20, fontFamily: "'Cormorant Garamond', serif" }}>
                ⚔️ Blades
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Send to Soulbis - when blade is equipped */}
                {equippedBlade && (
                  <button
                    onClick={() => {
                      // Build spellweb blade payload for agentprivacy (per Chronicle mirroring spec)
                      const dims = equippedBlade.proof.bladeDimensions;
                      const marks = equippedBlade.constellationMarks || [];
                      // Use DIMENSION_MAPPING emojis for active dimensions, fallback to mark emojis
                      const dimEmojis = [
                        dims.protection ? DIMENSION_MAPPING.L1.emoji : (marks[0]?.emoji || '·'),
                        dims.delegation ? DIMENSION_MAPPING.L2.emoji : (marks[1]?.emoji || '·'),
                        dims.memory ? DIMENSION_MAPPING.L3.emoji : (marks[2]?.emoji || '·'),
                        dims.connection ? DIMENSION_MAPPING.L4.emoji : (marks[3]?.emoji || '·'),
                        dims.computation ? DIMENSION_MAPPING.L5.emoji : (marks[4]?.emoji || '·'),
                        dims.value ? DIMENSION_MAPPING.L6.emoji : (marks[5]?.emoji || '·'),
                      ];
                      const payload: SpellwebBladePayloadV1 = {
                        v: 1,
                        bladeId: equippedBlade.id,
                        name: equippedBlade.name,
                        primaryEmoji: equippedBlade.emoji,
                        markEmojis: dimEmojis,
                        proofSignature: equippedBlade.proof.signature,
                        isWitness: equippedBlade.isWitness || false,
                      };
                      const b64 = encodeBladePayloadForUrl(payload);
                      window.open(`https://agentprivacy.ai/spells?spellwebBlade=${b64}`, '_blank');
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #e74c3c30, #c0392b20)",
                      border: "1px solid #e74c3c",
                      color: "#e74c3c",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title={`Send ${equippedBlade.name} to agentprivacy.ai Soulbis orbit`}
                  >
                    <span>⚔️</span> Soulbis
                  </button>
                )}
                {/* Export blade.md button - green, copies/downloads current blade+spells+constellation */}
                {(equippedBlade || constellation.length > 0) && (
                  <button
                    onClick={() => {
                      // Build a SavedConstellation from current state
                      const currentConstellation: SavedConstellation = {
                        id: `export-${Date.now()}`,
                        name: equippedBlade?.name || 'My Constellation',
                        marks: constellation,
                        connections: constellationConnections,
                        createdAt: new Date().toISOString(),
                        proof: equippedBlade?.proof || latestProof || undefined,
                        inscribedSpell: undefined,
                        reflection: undefined,
                      };
                      handleExportConstellation(currentConstellation);
                      setShowBladesModal(false);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #22c55e30, #16a34a20)",
                      border: "1px solid #22c55e",
                      color: "#22c55e",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>📋</span> blade.md
                  </button>
                )}
                <button
                  onClick={() => setShowBladesModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: THEME.textDim,
                    cursor: 'pointer',
                    fontSize: 18,
                  }}
                >×</button>
              </div>
            </div>

            {/* ZK Blades Section - Forge a new blade */}
            <div style={{
              padding: 16,
              background: latestProof ? '#ffd70010' : '#ffffff05',
              borderRadius: 8,
              border: `1px solid ${latestProof ? '#ffd70050' : '#333'}`,
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: latestProof ? '#ffd700' : '#666',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                ⚡ FORGE ZK BLADE
              </div>
              {latestProof ? (
                <div>
                  <p style={{ fontSize: 12, color: THEME.text, marginBottom: 12 }}>
                    Proof ready! Forge your constellation into a cryptographic blade.
                  </p>
                  <button
                    onClick={() => {
                      setShowBladesModal(false);
                      setForgePhase('ignite');
                      setShowForgeModal(true);
                      setTimeout(() => setForgePhase('forge'), 800);
                      setTimeout(() => setForgePhase('temper'), 2000);
                      setTimeout(() => setForgePhase('complete'), 3500);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #ffd70050, #ff660030)",
                      border: "1px solid #ffd700",
                      color: "#ffd700",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>🔥</span> Forge Blade
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
                  Complete a constellation and generate a proof to forge a blade.
                </p>
              )}
            </div>

            {/* Swordsman Link Section - Import from agentprivacy */}
            <div style={{
              padding: 16,
              background: swordsmanLink ? 'rgba(233, 69, 96, 0.05)' : '#e9456008',
              borderRadius: 8,
              border: `1px solid ${swordsmanLink ? 'rgba(233, 69, 96, 0.3)' : '#e9456030'}`,
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: '#e94560',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                ⚔️ SWORDSMAN LINK
              </div>
              {swordsmanLink ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>⚔️</span>
                    <div>
                      <div style={{ color: '#e94560', fontWeight: 600, fontSize: 13 }}>
                        {swordsmanLink.displayName}
                      </div>
                      <div style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#666',
                      }}>
                        {swordsmanLink.participantId}
                      </div>
                      {swordsmanLink.constellationPath && (
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          {swordsmanLink.constellationPath}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setShowSwordsmanImport(true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(233, 69, 96, 0.1)',
                        border: '1px solid rgba(233, 69, 96, 0.3)',
                        color: '#e94560',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Update Link
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('spellweb-swordsman-link');
                        setSwordsmanLink(null);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 100, 100, 0.1)',
                        border: '1px solid rgba(255, 100, 100, 0.3)',
                        color: '#ff6666',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 11, color: THEME.textDim, marginBottom: 12 }}>
                    Link your agentprivacy.ai Swordsman identity to inscribe blades with runes.
                  </p>
                  <button
                    onClick={() => setShowSwordsmanImport(true)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(233, 69, 96, 0.1))',
                      border: '1px solid #e94560',
                      color: '#e94560',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>⚔️</span> Link Swordsman
                  </button>
                </div>
              )}
            </div>

            {/* Witness Blades Section - Upload/Import */}
            <div style={{
              padding: 16,
              background: '#3b82f608',
              borderRadius: 8,
              border: '1px solid #3b82f630',
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: '#3b82f6',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                👁️ WITNESS BLADES
              </div>
              <p style={{ fontSize: 11, color: THEME.textDim, marginBottom: 12 }}>
                Upload a blade.md file to witness another's constellation.
              </p>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: "10px 16px",
                borderRadius: 6,
                background: "#3b82f620",
                border: "1px solid #3b82f6",
                color: "#3b82f6",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <span>📄</span> Import blade.md
                <input
                  type="file"
                  accept=".md"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (!content) return;

                      // Parse blade info for name
                      const bladeMatch = content.match(/\*\*(.+?) (.+?)\*\*/);
                      const hashMatch = content.match(/Hash: ([a-f0-9]+)/);

                      // Parse path - the constellation waypoints
                      const pathMatches = content.matchAll(/^\d+\.\s+(.+?)\s+\*\*(.+?)\*\*/gm);
                      const marks: ConstellationMark[] = [];
                      for (const match of pathMatches) {
                        const emoji = match[1].trim();
                        const label = match[2].trim();
                        const node = NODES.find(n => n.label === label);
                        marks.push({
                          nodeId: node?.id || `imported-${marks.length}`,
                          nodeLabel: label,
                          emoji,
                          note: "",
                        });
                      }

                      if (marks.length === 0) {
                        alert("Could not parse constellation path from blade.md file");
                        return;
                      }

                      // Build connections between waypoints
                      const connections: ConstellationConnection[] = [];
                      for (let i = 0; i < marks.length - 1; i++) {
                        connections.push({
                          sourceId: marks[i].nodeId,
                          targetId: marks[i + 1].nodeId,
                          note: "",
                        });
                      }

                      // Set up witness mode
                      const witnessHash = hashMatch?.[1] || `imported-${Date.now()}`;
                      const creatorName = bladeMatch ? `${bladeMatch[1]} ${bladeMatch[2]}` : file.name.replace('.md', '');

                      setWitnessMode({
                        active: true,
                        constellationHash: witnessHash,
                        witnessedFrom: creatorName,
                      });

                      // Load constellation for tracing - THIS ENABLES EVOKE
                      setConstellation(marks);
                      setConstellationConnections(connections);
                      setCastingSpells(true);
                      setShowBladesModal(false);
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
              {forgedBlades.filter(b => b.isWitness).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}>
                    Witnessed blades: {forgedBlades.filter(b => b.isWitness).length}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {forgedBlades.filter(b => b.isWitness).map(blade => (
                      <div
                        key={blade.id}
                        title={`${blade.name} - Witnessed from ${blade.witnessedFrom}`}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f630, #3b82f615)',
                          border: '2px solid #3b82f680',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveBlade(blade);
                          setBladeTraceActive(true);
                          setShowBladesModal(false);
                          if (blade.constellationMarks) {
                            setConstellation(blade.constellationMarks);
                            setConstellationConnections(blade.constellationConnections || []);
                          }
                        }}
                      >
                        {blade.emoji}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Blade Inventory Manager */}
            <div style={{
              padding: 16,
              background: '#ffd70008',
              borderRadius: 8,
              border: '1px solid #ffd70030',
            }}>
              {/* Equipped Blade Section */}
              <div style={{
                fontSize: 11,
                color: '#e74c3c',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                marginBottom: 10,
              }}>
                ⚔️ EQUIPPED BLADE
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: equippedBlade ? 'rgba(231, 76, 60, 0.1)' : 'rgba(100, 100, 100, 0.1)',
                borderRadius: 8,
                border: `1px solid ${equippedBlade ? '#e74c3c50' : '#44444450'}`,
                marginBottom: 16,
              }}>
                {equippedBlade ? (
                  <>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${equippedBlade.tier === 'dragon' ? '#ffd700' : equippedBlade.tier === 'heavy' ? '#c0c0c0' : '#87ceeb'}40, ${equippedBlade.tier === 'dragon' ? '#ffd700' : equippedBlade.tier === 'heavy' ? '#c0c0c0' : '#87ceeb'}20)`,
                      border: `2px solid ${equippedBlade.tier === 'dragon' ? '#ffd700' : equippedBlade.tier === 'heavy' ? '#c0c0c0' : '#87ceeb'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      boxShadow: `0 0 15px ${equippedBlade.tier === 'dragon' ? '#ffd700' : equippedBlade.tier === 'heavy' ? '#c0c0c0' : '#87ceeb'}40`,
                    }}>
                      {equippedBlade.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{equippedBlade.name}</div>
                      <div style={{ color: '#888', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                        {equippedBlade.tier} blade • stratum {equippedBlade.stratum}
                      </div>
                    </div>
                    <button
                      onClick={() => setEquippedBlade(null)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        background: 'rgba(255, 68, 68, 0.2)',
                        border: '1px solid #ff4444',
                        color: '#ff4444',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Unequip
                    </button>
                  </>
                ) : (
                  <div style={{ color: '#666', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    No blade equipped — click a blade below to equip
                  </div>
                )}
              </div>

              {/* All Blades Grid - Drag to reorder */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 11,
                  color: '#ffd700',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 1,
                }}>
                  🗡️ ALL BLADES ({forgedBlades.length})
                </div>
                <div style={{ fontSize: 9, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                  Drag to reorder
                </div>
              </div>
              {forgedBlades.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {forgedBlades.map((blade, index) => {
                    const isEquipped = equippedBlade?.id === blade.id;
                    const tierColor = blade.tier === 'dragon' ? '#ffd700' :
                      blade.tier === 'heavy' ? '#c0c0c0' : '#87ceeb';
                    return (
                      <div
                        key={blade.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('modalBladeIndex', String(index));
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('modalBladeIndex'));
                          if (!isNaN(fromIndex) && fromIndex !== index) {
                            const newBlades = [...forgedBlades];
                            const [moved] = newBlades.splice(fromIndex, 1);
                            newBlades.splice(index, 0, moved);
                            setForgedBlades(newBlades);
                            localStorage.setItem(SPELLWEB_STORAGE_KEYS.forgedBlades, JSON.stringify(newBlades));
                          }
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          position: 'relative',
                        }}
                      >
                        <div
                          title={`${blade.name} (${blade.tier}${blade.isWitness ? ' witnessed' : ''} blade, stratum ${blade.stratum})\n\nDrag to reorder • Click to equip`}
                          onClick={() => {
                            if (isEquipped) {
                              setEquippedBlade(null);
                            } else {
                              setEquippedBlade(blade);
                            }
                          }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            background: isEquipped
                              ? `linear-gradient(135deg, #e74c3c40, #e74c3c20)`
                              : blade.isWitness
                                ? 'linear-gradient(135deg, #3b82f625, #3b82f610)'
                                : `linear-gradient(135deg, ${tierColor}25, ${tierColor}10)`,
                            border: `2px solid ${isEquipped ? '#e74c3c' : blade.isWitness ? '#3b82f6' : tierColor + '60'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            cursor: 'grab',
                            boxShadow: isEquipped ? '0 0 15px rgba(231, 76, 60, 0.4)' : 'none',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {blade.emoji}
                          {isEquipped && (
                            <span style={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              fontSize: 10,
                              background: '#e74c3c',
                              borderRadius: '50%',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              boxShadow: '0 0 6px #e74c3c',
                            }}>⚔</span>
                          )}
                          {blade.isWitness && !isEquipped && (
                            <span style={{
                              position: 'absolute',
                              top: -4,
                              left: -4,
                              fontSize: 8,
                              background: '#3b82f6',
                              borderRadius: '50%',
                              width: 14,
                              height: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                            }}>👁</span>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveBlade(blade);
                              setBladeTraceActive(true);
                              setShowBladesModal(false);
                              if (blade.constellationMarks) {
                                setConstellation(blade.constellationMarks);
                                setConstellationConnections(blade.constellationConnections || []);
                              }
                            }}
                            style={{
                              padding: '2px 5px',
                              borderRadius: 3,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid #444',
                              color: '#888',
                              fontSize: 8,
                              cursor: 'pointer',
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            ▶
                          </button>
                          {/* Runecraft button - lights up when Swordsman linked */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!blade.proof.runecrafted) {
                                setRunecraftBlade(blade);
                                setShowRunecraftModal(true);
                              }
                            }}
                            title={blade.proof.runecrafted
                              ? `Runecrafted with ${blade.proof.swordsmanId}`
                              : swordsmanLink
                                ? 'Runecraft with Swordsman key'
                                : 'Link Swordsman to enable runecraft'}
                            style={{
                              padding: '2px 5px',
                              borderRadius: 3,
                              background: blade.proof.runecrafted
                                ? 'rgba(147, 51, 234, 0.3)'
                                : swordsmanLink
                                  ? 'rgba(147, 51, 234, 0.15)'
                                  : 'rgba(255, 255, 255, 0.02)',
                              border: `1px solid ${blade.proof.runecrafted
                                ? '#9333ea'
                                : swordsmanLink
                                  ? '#9333ea50'
                                  : '#333'}`,
                              color: blade.proof.runecrafted
                                ? '#9333ea'
                                : swordsmanLink
                                  ? '#9333ea80'
                                  : '#444',
                              fontSize: 8,
                              cursor: blade.proof.runecrafted ? 'default' : 'pointer',
                              fontFamily: "'JetBrains Mono', monospace",
                              opacity: blade.proof.runecrafted || swordsmanLink ? 1 : 0.4,
                            }}
                          >
                            {blade.proof.runecrafted ? '🔮' : '✧'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${blade.name}"?`)) {
                                const updated = forgedBlades.filter(b => b.id !== blade.id);
                                setForgedBlades(updated);
                                localStorage.setItem(SPELLWEB_STORAGE_KEYS.forgedBlades, JSON.stringify(updated));
                                if (equippedBlade?.id === blade.id) {
                                  setEquippedBlade(null);
                                }
                                if (activeBlade?.id === blade.id) {
                                  setActiveBlade(null);
                                  setBladeTraceActive(false);
                                  setIsShineMode(true); // Restore shine when blade deleted
                                }
                              }
                            }}
                            style={{
                              padding: '2px 5px',
                              borderRadius: 3,
                              background: 'rgba(255, 68, 68, 0.1)',
                              border: '1px solid #ff444450',
                              color: '#ff4444',
                              fontSize: 8,
                              cursor: 'pointer',
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        {/* Blade name */}
                        <div style={{
                          fontSize: 8,
                          color: '#888',
                          maxWidth: 50,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                        }}>
                          {blade.name} {stratumToMoonPhase(blade.stratum)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: '#666', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  No blades forged yet — complete an evoke and forge your first blade!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Swordsman Import Modal */}
      {showSwordsmanImport && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 350,
          }}
          onClick={() => setShowSwordsmanImport(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SwordsmanImport
              onImportComplete={(link) => {
                setSwordsmanLink(link);
                setShowSwordsmanImport(false);
              }}
              onClose={() => setShowSwordsmanImport(false)}
            />
          </div>
        </div>
      )}

      {/* Forge ZK Blades Modal */}
      {showForgeModal && latestProof && (() => {
        const tierColors = {
          light: { primary: '#87ceeb', glow: 'rgba(135, 206, 235, 0.3)', icon: '🗡️', name: 'Light' },
          heavy: { primary: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.4)', icon: '⚔️', name: 'Heavy' },
          dragon: { primary: '#ffd700', glow: 'rgba(255, 215, 0, 0.5)', icon: '🐉', name: 'Dragon' },
        };
        const tier = latestProof.bladeTier || 'light';
        const colors = tierColors[tier];
        const dims = latestProof.bladeDimensions || { protection: false, delegation: false, memory: false, connection: false, computation: true, value: false };
        const stratum = latestProof.bladeStratum || 1;
        const hex = latestProof.bladeHex || '10';

        const dimensionLabels = [
          { key: 'protection', label: 'Protection', desc: 'Boundaries forged', icon: '🛡️' },
          { key: 'delegation', label: 'Delegation', desc: 'Agency transferred', icon: '🤝' },
          { key: 'memory', label: 'Memory', desc: 'State accumulated', icon: '📜' },
          { key: 'connection', label: 'Connection', desc: 'Multi-party coordination', icon: '🔗' },
          { key: 'computation', label: 'Computation', desc: 'ZK proof active', icon: '⚡' },
          { key: 'value', label: 'Value', desc: 'Economic flow', icon: '💎' },
        ];

        const phaseMessages: Record<string, { text: string; sub: string }> = {
          ignite: { text: 'Igniting the Forge...', sub: 'Gathering proof elements from the lattice' },
          forge: { text: 'Forging the Blade...', sub: 'Tempering dimensions in the toroidal field' },
          temper: { text: 'Tempering Complete', sub: 'Inscribing the maker\'s mark' },
          complete: { text: `${colors.name} Blade`, sub: 'Forged from the 64-Tetrahedra Lattice' },
          naming: { text: 'Name Your Blade', sub: 'Inscribe its identity into the lattice' },
          manifesting: { text: bladeName || 'Blade', sub: 'The blade manifests...' },
        };

        const isAnimating = forgePhase === 'ignite' || forgePhase === 'forge';
        const showDimensions = ['forge', 'temper', 'complete', 'naming'].includes(forgePhase);
        const showStats = ['temper', 'complete', 'naming'].includes(forgePhase);
        const showSignature = forgePhase === 'complete';
        const isNaming = forgePhase === 'naming';
        const isManifesting = forgePhase === 'manifesting';

        return (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: forgePhase === 'ignite'
                ? "radial-gradient(circle at center, #1a0a00 0%, #000 100%)"
                : "rgba(0,0,0,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
              transition: "background 1s ease",
            }}
            onClick={() => !isAnimating && setShowForgeModal(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "linear-gradient(135deg, #0a0a15, #1a1a2e)",
                borderRadius: 20,
                padding: 32,
                maxWidth: 550,
                width: "95%",
                border: `2px solid ${isAnimating ? '#ff6600' : colors.primary}`,
                boxShadow: isAnimating
                  ? `0 0 100px rgba(255, 102, 0, 0.6), inset 0 0 60px rgba(255, 102, 0, 0.1)`
                  : `0 0 80px ${colors.glow}, inset 0 0 40px rgba(0,0,0,0.5)`,
                transition: "all 0.5s ease",
              }}
            >
              {/* Header with Blade Tier */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  fontSize: 72,
                  marginBottom: 8,
                  filter: showSignature
                    ? `drop-shadow(0 0 15px ${colors.primary}80) drop-shadow(0 0 30px #4a9eff60)`
                    : `drop-shadow(0 0 ${isAnimating ? '15' : '10'}px ${isAnimating ? '#ff660080' : colors.primary + '80'})`,
                  animation: isAnimating
                    ? 'pulse 1s ease-in-out infinite'
                    : showSignature
                      ? 'bladeForged 2s ease-in-out infinite'
                      : 'none',
                  transform: showSignature ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.5s ease',
                }}>
                  {forgePhase === 'ignite' ? '🔥' : forgePhase === 'forge' ? '⚒️' : colors.icon}
                </div>
                <h2 style={{
                  color: isAnimating ? '#ff6600' : colors.primary,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 32,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 6,
                  textShadow: showSignature
                    ? `0 0 30px ${colors.primary}, 0 0 60px #4a9eff`
                    : `0 0 20px ${isAnimating ? 'rgba(255, 102, 0, 0.5)' : colors.glow}`,
                  transition: "all 0.5s ease",
                  animation: showSignature ? 'textGlow 2s ease-in-out infinite' : 'none',
                }}>
                  {phaseMessages[forgePhase].text}
                </h2>
                <p style={{
                  color: showSignature ? colors.primary : "#888",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: 0.8,
                  transition: "color 0.5s ease",
                }}>
                  {phaseMessages[forgePhase].sub}
                </p>
              </div>

              {/* Blade Dimensions Grid - Animated reveal */}
              <div style={{
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: `1px solid ${showDimensions ? colors.primary + '40' : '#222'}`,
                opacity: showDimensions ? 1 : 0.3,
                transition: "all 0.5s ease",
              }}>
                <div style={{ color: "#666", fontSize: 10, marginBottom: 12, textAlign: "center", letterSpacing: 2 }}>
                  BLADE DIMENSIONS • STRATUM {stratum}/6 {stratumToMoonPhase(stratum)} • 0x{hex}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {dimensionLabels.map(({ key, label, desc, icon }, idx) => {
                    const active = dims[key as keyof typeof dims];
                    const revealed = showDimensions && (forgePhase === 'complete' || idx <= 5);
                    return (
                      <div
                        key={key}
                        title={desc}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          background: active && revealed ? `${colors.primary}20` : "rgba(30, 30, 40, 0.5)",
                          border: `1px solid ${active && revealed ? colors.primary : '#333'}`,
                          textAlign: "center",
                          opacity: revealed ? (active ? 1 : 0.4) : 0.2,
                          transition: "all 0.3s ease",
                          transitionDelay: `${idx * 100}ms`,
                        }}
                      >
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                        <div style={{ color: active && revealed ? colors.primary : "#555", fontSize: 10, fontWeight: "bold" }}>
                          {label}
                        </div>
                        <div style={{ color: "#444", fontSize: 8 }}>{active && revealed ? '●' : '○'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tier & Moon Phase - Two paths to blade identity */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
                opacity: showStats ? 1 : 0.2,
                transition: "all 0.5s ease",
              }}>
                {/* TIER: Determined by LAPS */}
                <div style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  borderRadius: 12,
                  padding: 14,
                  border: `1px solid ${colors.primary}40`,
                  textAlign: "center",
                }}>
                  <div style={{ color: "#666", fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>
                    LAPS → TIER
                  </div>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{colors.icon}</div>
                  <div style={{ color: colors.primary, fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                    {tier} Blade
                  </div>
                  <div style={{ color: "#555", fontSize: 10, marginTop: 4 }}>
                    {latestProof.lapCount} laps • {latestProof.chargeLevel}
                  </div>
                </div>

                {/* MOON PHASE: Determined by DIMENSIONS */}
                <div style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  borderRadius: 12,
                  padding: 14,
                  border: "1px solid #c0c0c040",
                  textAlign: "center",
                }}>
                  <div style={{ color: "#666", fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>
                    DIMENSIONS → VISIBILITY
                  </div>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{stratumToMoonPhase(stratum)}</div>
                  <div style={{ color: "#c0c0c0", fontSize: 14, fontWeight: "bold" }}>
                    {getMoonPhaseInfo(stratum).name}
                  </div>
                  <div style={{ color: "#555", fontSize: 10, marginTop: 4 }}>
                    {stratum}/6 dimensions • 0x{hex}
                  </div>
                </div>
              </div>

              {/* Ceremony Stats */}
              <div style={{
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                border: `1px solid ${colors.primary}20`,
                opacity: showStats ? 1 : 0.2,
                transition: "all 0.5s ease",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>SPELLS</div>
                    <div style={{ color: "#9b59b6", fontSize: 16, fontWeight: "bold" }}>{latestProof.spellsCast || 0}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>NODES</div>
                    <div style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{latestProof.nodeCount}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>TIME</div>
                    <div style={{ color: "#fff", fontSize: 14 }}>{Math.round(latestProof.duration / 1000)}s</div>
                  </div>
                </div>
              </div>

              {/* Proof Explanation - Shows when complete */}
              <div style={{
                background: `linear-gradient(135deg, ${colors.primary}10, #4a9eff08)`,
                borderRadius: 10,
                padding: 14,
                marginBottom: 16,
                border: `1px solid ${colors.primary}30`,
                opacity: showSignature ? 1 : 0,
                maxHeight: showSignature ? 200 : 0,
                overflow: 'hidden',
                transition: "all 0.5s ease",
              }}>
                <p style={{
                  color: "#a0a0b0",
                  fontSize: 11,
                  lineHeight: 1.6,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  margin: 0,
                  fontStyle: 'italic',
                }}>
                  This blade is proof of your attention—a witness to time spent traversing
                  a constellation of knowledge. The forge doesn't care how you struck the metal.
                  It only cares what blade you hold.
                </p>
                <p style={{
                  color: "#666",
                  fontSize: 10,
                  marginTop: 10,
                  marginBottom: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Save it to preserve the record, or let it exist only as a blade proof—your choice on building within the gap.
                </p>
              </div>

              {/* Proof Signature - Only shows when complete */}
              <div style={{
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: showSignature ? 1 : 0,
                maxHeight: showSignature ? 100 : 0,
                overflow: 'hidden',
                transition: "all 0.5s ease",
              }}>
                <div style={{ color: "#555", fontSize: 9, marginBottom: 6 }}>PROOF SIGNATURE</div>
                <div style={{ color: colors.primary, fontSize: 12, wordBreak: "break-all" }}>
                  {latestProof.signature}
                </div>
                <div style={{ color: "#333", fontSize: 9, marginTop: 6 }}>
                  Hash: {latestProof.constellationHash}
                </div>
              </div>

              {/* Actions - Only enabled when complete */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: showSignature ? 1 : 0.3,
                transition: "opacity 0.5s ease"
              }}>
                {/* Copy proof action */}
                <button
                  onClick={() => {
                    if (showSignature) window.navigator.clipboard.writeText(JSON.stringify(latestProof, null, 2));
                  }}
                  disabled={!showSignature}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(0, 0, 0, 0.3)",
                    border: `1px solid ${colors.primary}40`,
                    color: colors.primary,
                    fontSize: 10,
                    cursor: showSignature ? "pointer" : "default",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  📋 Copy Proof
                </button>
                <button
                  onClick={() => {
                    if (showSignature) {
                      setBladeName('');
                      setBladeEmoji('');
                      setForgePhase('naming');
                    }
                  }}
                  disabled={!showSignature}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: 10,
                    background: showSignature
                      ? `linear-gradient(135deg, ${colors.primary}50, #4a9eff30, ${colors.primary}30)`
                      : "rgba(50, 50, 60, 0.3)",
                    border: `2px solid ${showSignature ? colors.primary : '#444'}`,
                    color: showSignature ? '#fff' : "#666",
                    fontSize: 13,
                    cursor: showSignature ? "pointer" : "default",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    boxShadow: showSignature ? `0 0 15px ${colors.glow}80, 0 0 30px #4a9eff30` : 'none',
                    transition: "all 0.5s ease",
                    animation: showSignature ? 'buttonPulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {showSignature ? `${colors.icon} Claim Blade` : '⏳ Forging...'}
                </button>
              </div>

              {/* Naming Phase */}
              {isNaming && (() => {
                const bladeEmojis = ['⚔️', '🗡️', '🐉', '🔥', '⚡', '💎', '🌟', '✨', '🛡️', '🌙', '☀️', '🔮', '👁️', '🦅', '🐺', '🦁'];
                const alreadyForged = forgedBlades.some(b => b.proof.signature === latestProof?.signature);
                const canManifest = bladeName.trim() && bladeEmoji && !alreadyForged;

                const handleManifest = async () => {
                  if (canManifest && latestProof) {
                    // Initialize mage identity on first forge (key generation)
                    let mageIdentity = getMageIdentity();
                    if (!hasMageIdentity()) {
                      console.log('[Forge] First blade - initializing Mage identity...');
                      mageIdentity = await initializeMageIdentity();
                      console.log(`[Forge] Mage identity created: ${mageIdentity.mageId}`);
                    }

                    // Sign the blade with Mage key (claiming ownership)
                    const signatureData = {
                      constellationHash: latestProof.constellationHash,
                      bladeHash: latestProof.bladeHash,
                      lapCount: latestProof.lapCount,
                      timestamp: latestProof.completedAt,
                    };
                    const mageSignatureResult = await signBlade(signatureData);

                    // Create signed proof (Mage claims the blade)
                    const signedProof: SpellProof = {
                      ...latestProof,
                      mageSignature: mageSignatureResult?.signature,
                      mageId: mageSignatureResult?.mageId,
                      // Runecraft fields (populated later if Swordsman linked)
                      runecrafted: false,
                    };

                    // Save blade to inventory with constellation data
                    const newBlade: ForgedBlade = {
                      id: `blade-${Date.now()}`,
                      name: bladeName.trim(),
                      emoji: bladeEmoji,
                      tier: tier,
                      stratum: stratum,
                      proof: signedProof,
                      forgedAt: new Date().toISOString(),
                      constellationNodes: latestProof.nodeCount,
                      constellationMarks: [...constellation],
                      constellationConnections: [...constellationConnections],
                      // Witness fields (Promise Theory bilateral exchange)
                      ...(witnessMode?.active ? {
                        isWitness: true,
                        witnessOf: witnessMode.constellationHash,
                        witnessedFrom: witnessMode.witnessedFrom,
                      } : {}),
                    };
                    setForgedBlades(prev => [...prev, newBlade]);
                    setForgePhase('manifesting');
                    // Clear witness mode and proof - longer timeout to complete the full animation lap
                    setTimeout(() => {
                      setShowForgeModal(false);
                      setLatestProof(null);
                      setWitnessMode(null); // Clear witness mode after forging
                    }, 10000);
                  }
                };

                return (
                  <div style={{
                    marginTop: 20,
                    padding: 20,
                    background: `linear-gradient(135deg, ${colors.primary}15, #4a9eff10)`,
                    borderRadius: 12,
                    border: `2px solid ${colors.primary}`,
                    animation: 'fadeIn 0.5s ease',
                  }}>
                    {/* Emoji Selection */}
                    <label style={{
                      display: 'block',
                      color: colors.primary,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: 10,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                    }}>
                      Choose blade sigil
                    </label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      {bladeEmojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setBladeEmoji(emoji)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            background: bladeEmoji === emoji
                              ? `linear-gradient(135deg, ${colors.primary}50, #4a9eff30)`
                              : 'rgba(0, 0, 0, 0.3)',
                            border: `2px solid ${bladeEmoji === emoji ? colors.primary : '#333'}`,
                            fontSize: 22,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: bladeEmoji === emoji ? 'scale(1.1)' : 'scale(1)',
                            boxShadow: bladeEmoji === emoji ? `0 0 15px ${colors.glow}` : 'none',
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Name Input */}
                    <label style={{
                      display: 'block',
                      color: colors.primary,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: 10,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                    }}>
                      Inscribe the blade's name
                    </label>
                    <input
                      type="text"
                      value={bladeName}
                      onChange={(e) => setBladeName(e.target.value)}
                      placeholder="Enter blade name..."
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: 8,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: `1px solid ${colors.primary}60`,
                        color: '#fff',
                        fontSize: 18,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 'bold',
                        textAlign: 'center',
                        letterSpacing: 2,
                        outline: 'none',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && canManifest) {
                          handleManifest();
                        }
                      }}
                    />
                    {alreadyForged && (
                      <div style={{
                        marginBottom: 12,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(255, 100, 100, 0.1)',
                        border: '1px solid rgba(255, 100, 100, 0.4)',
                        color: '#ff8888',
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                        textAlign: 'center',
                      }}>
                        ⚠️ This proof has already been forged into a blade
                      </div>
                    )}
                    <button
                      onClick={handleManifest}
                      disabled={!canManifest}
                      style={{
                        width: '100%',
                        marginTop: 14,
                        padding: '14px 20px',
                        borderRadius: 10,
                        background: canManifest
                          ? `linear-gradient(135deg, ${colors.primary}60, #4a9eff40)`
                          : 'rgba(50, 50, 60, 0.3)',
                        border: `2px solid ${canManifest ? colors.primary : '#444'}`,
                        color: canManifest ? '#fff' : '#666',
                        fontSize: 14,
                        cursor: canManifest ? 'pointer' : 'default',
                        fontFamily: "'Cormorant Gararaph', serif",
                        fontWeight: 'bold',
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {bladeEmoji || colors.icon} Manifest Blade
                    </button>
                  </div>
                );
              })()}

              {/* Manifesting Phase - Semi-transparent while graph overlay shows cut animation */}
              {isManifesting && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 20,
                  animation: 'fadeIn 0.5s ease',
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: 20,
                  }}>
                    <div style={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: colors.primary,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      marginBottom: 10,
                    }}>
                      Inscribing constellation...
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#666',
                    }}>
                      {colors.name} Blade • Stratum {stratum}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${THEME.panelBorder}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.textDim}; }
        input::placeholder { color: ${THEME.textDim}; }
        textarea::placeholder { color: ${THEME.textDim}; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes bladeForged {
          0%, 100% {
            filter: drop-shadow(0 0 15px #ffd70080) drop-shadow(0 0 30px #4a9eff60);
            transform: scale(1.05);
          }
          50% {
            filter: drop-shadow(0 0 25px #ffd70090) drop-shadow(0 0 50px #4a9eff80);
            transform: scale(1.08);
          }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 15px currentColor, 0 0 30px #4a9eff60; }
          50% { text-shadow: 0 0 20px currentColor, 0 0 40px #4a9eff80; }
        }
        @keyframes buttonPulse {
          0%, 100% { box-shadow: 0 0 10px currentColor, 0 0 20px #4a9eff30; }
          50% { box-shadow: 0 0 15px currentColor, 0 0 30px #4a9eff50; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes energyPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.8; }
        }
        @keyframes bladeManifest {
          0% { opacity: 0; transform: translateY(50px) scale(0.5); }
          30% { opacity: 1; transform: translateY(0) scale(1.1); }
          50% { transform: translateY(0) scale(1); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nodeGlow {
          0%, 100% { opacity: 0.6; r: 3; }
          50% { opacity: 1; r: 4; }
        }
        @keyframes cutLine {
          from { stroke-dashoffset: 1000; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 0.9; }
        }
        @keyframes nodeBurst {
          0% { r: 5; opacity: 0; }
          30% { r: 25; opacity: 1; }
          100% { r: 40; opacity: 0; }
        }
        @keyframes nodeRing {
          0% { r: 10; opacity: 0; stroke-width: 4; }
          50% { opacity: 0.8; }
          100% { r: 50; opacity: 0; stroke-width: 1; }
        }
        @keyframes emojiFloat {
          0% { opacity: 0; transform: translateY(0); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        @keyframes swordTrace {
          0% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
