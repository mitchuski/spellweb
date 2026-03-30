import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import type { SpellwebNode, SpellwebEdge, FilterState, TypeFilterState, SpellbookFilterState } from '../types/graph';
import { NODES } from '../data/nodes';
import { EDGES } from '../data/edges';
import { THEME, getNodeVisual, getNodeRadius, getEdgeStyle } from '../data/theme';
import { Header } from './Header';
import { GraphFilters } from './GraphFilters';
import { Legend } from './Legend';
import { HoverTooltip } from './HoverTooltip';
import { NodeInspector } from './NodeInspector';
import { SpellCeremony, type SpellProof } from './SpellCeremony';
import { WanderingOrbs } from './WanderingOrbs';

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

  // Constellation - marked nodes with custom emoji/note
  interface ConstellationMark {
    nodeId: string;
    nodeLabel: string;
    emoji: string;
    note: string;
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
      const saved = localStorage.getItem('spellweb-user-edges');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [savedConstellations, setSavedConstellations] = useState<SavedConstellation[]>(() => {
    try {
      const saved = localStorage.getItem('spellweb-constellations');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeConstellationId, setActiveConstellationId] = useState<string | null>(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markEmoji, setMarkEmoji] = useState("");
  const [markNote, setMarkNote] = useState("");
  const [showMyConstellations, setShowMyConstellations] = useState(false);

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

  // Legacy navigator state (kept for compatibility)
  interface NavigatorState {
    active: boolean;
    currentNode: SpellwebNode | null;
    path: string[]; // node IDs in order
    pendingMark: boolean; // waiting for user to mark current node
  }
  const [navigator, _setNavigator] = useState<NavigatorState>({
    active: false,
    currentNode: null,
    path: [],
    pendingMark: false,
  });
  const [showNavigatorModal, _setShowNavigatorModal] = useState(false);
  const [showClearMapModal, setShowClearMapModal] = useState(false);
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [latestProof, setLatestProof] = useState<SpellProof | null>(null);
  const [forgePhase, setForgePhase] = useState<'ignite' | 'forge' | 'temper' | 'complete' | 'naming' | 'manifesting'>('ignite');
  const [bladeName, setBladeName] = useState('');
  const [bladeEmoji, setBladeEmoji] = useState('');
  const [forgedBlades, setForgedBlades] = useState<ForgedBlade[]>(() => {
    try {
      const saved = localStorage.getItem('spellweb-forged-blades');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeBlade, setActiveBlade] = useState<ForgedBlade | null>(null); // Currently highlighted blade
  const [bladeTraceActive, setBladeTraceActive] = useState(false); // Whether orbs are tracing a blade's constellation
  const [orbsAtHome, setOrbsAtHome] = useState(false); // Whether orbs are at ceremony panel vs wandering

  // Delete mode for blade inventories
  const [deleteMode, setDeleteMode] = useState<'forged' | 'witness' | null>(null);
  const [bladesToDelete, setBladesToDelete] = useState<Set<string>>(new Set());

  // Witness mode state (Promise Theory bilateral exchange)
  const [witnessMode, setWitnessMode] = useState<{
    active: boolean;
    constellationHash: string;
    witnessedFrom?: string;
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    knowledge: true,
    narrative: true,
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
    localStorage.setItem('spellweb-user-edges', JSON.stringify(userEdges));
  }, [userEdges]);

  // Persist forgedBlades to localStorage
  useEffect(() => {
    localStorage.setItem('spellweb-forged-blades', JSON.stringify(forgedBlades));
  }, [forgedBlades]);

  // Persist savedConstellations to localStorage
  useEffect(() => {
    localStorage.setItem('spellweb-constellations', JSON.stringify(savedConstellations));
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

  // Get connected nodes from current navigator position (grouped by edge type)
  const navigatorConnections = useMemo(() => {
    if (!navigator.active || !navigator.currentNode) return new Map<string, Array<{ node: SpellwebNode; edge: SpellwebEdge; direction: 'outgoing' | 'incoming' }>>();

    const connections = new Map<string, Array<{ node: SpellwebNode; edge: SpellwebEdge; direction: 'outgoing' | 'incoming' }>>();
    const currentId = navigator.currentNode.id;

    EDGES.forEach(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

      let connectedNodeId: string | null = null;
      let direction: 'outgoing' | 'incoming' = 'outgoing';

      if (sourceId === currentId) {
        connectedNodeId = targetId;
        direction = 'outgoing';
      } else if (targetId === currentId) {
        connectedNodeId = sourceId;
        direction = 'incoming';
      }

      if (connectedNodeId && !navigator.path.includes(connectedNodeId)) {
        const connectedNode = NODES.find(n => n.id === connectedNodeId);
        if (connectedNode) {
          const edgeType = edge.type || 'references';
          if (!connections.has(edgeType)) {
            connections.set(edgeType, []);
          }
          connections.get(edgeType)!.push({ node: connectedNode, edge, direction });
        }
      }
    });

    return connections;
  }, [navigator.active, navigator.currentNode, navigator.path]);

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

    // Background click
    svg.on("click", () => {
      if (!connectionMode.active) {
        setSelectedNode(null);
      }
    });
  }, [filters, typeFilters, spellbookFilters, searchMatches, connectionMode, waypoint, handleWaypointAddNode]);

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

    const isHighlightMode = castingSpells || incantationActive;

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
    svg.selectAll<SVGGElement, SimulationNode>("g.node").select("circle")
      .transition()
      .duration(400)
      .attr("opacity", (d) => {
        if (!isHighlightMode) {
          if (searchMatches.size > 0) return searchMatches.has(d.id) ? 1 : 0.15;
          return 0.85;
        }
        if (incantationActive) {
          return incantationHighlightNodes.has(d.id) ? 1 : 0.15;
        }
        return constellationNodeIds.has(d.id) ? 1 : 0.2;
      })
      .attr("stroke", (d) => {
        if (incantationActive && incantationHighlightNodes.has(d.id)) {
          // Orange/fire color for incantation, gold for constellation nodes
          return compressionSpellNodes.has(d.id) ? "#ff6600" : "#ffd700";
        }
        if (castingSpells && constellationNodeIds.has(d.id)) return "#ffd700";
        return getNodeVisual(d).stroke;
      })
      .attr("stroke-width", (d) => {
        if (incantationActive && incantationHighlightNodes.has(d.id)) return 3;
        if (castingSpells && constellationNodeIds.has(d.id)) return 3;
        return d.type === "spell" ? 2 : 1.5;
      });

    // Dim labels when casting/incanting, except highlighted nodes
    svg.selectAll<SVGTextElement, SimulationNode>(".node-label")
      .transition()
      .duration(400)
      .attr("opacity", (d) => {
        if (!isHighlightMode) {
          if (searchMatches.size > 0) return searchMatches.has(d.id) ? 1 : 0.1;
          return 0.7;
        }
        if (incantationActive) {
          return incantationHighlightNodes.has(d.id) ? 0.9 : 0.1;
        }
        return constellationNodeIds.has(d.id) ? 0.3 : 0.1;
      });

    // Dim edges, highlight constellation path and compresses_to edges during incantation
    svg.selectAll<SVGLineElement, SimulationEdge>("line")
      .transition()
      .duration(400)
      .attr("stroke-opacity", (d) => {
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
        return 0.05;
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
  }, [castingSpells, incantationActive, constellation, constellationNodeIds, compressionSpellNodes, incantationHighlightNodes, searchMatches]);

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
      .attr("opacity", castingSpells ? 0.8 : 0);

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
  }, [constellationConnections, castingSpells]);

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

  const handleCancelWaypoint = useCallback(() => {
    // Remove connections that were auto-added during this waypoint session
    setConstellationConnections([]);
    setWaypoint({ active: false, path: [] });
  }, []);

  // Handle proof generated from evoke ceremony - update the active constellation
  const handleProofGenerated = useCallback((proof: SpellProof) => {
    // Store latest proof for forging
    setLatestProof(proof);

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
        `- **Stratum:** ${forgedBlade.stratum}/6`,
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
        "```",
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
  }, [forgedBlades]);

  // Load a saved constellation
  const handleLoadConstellation = useCallback((saved: SavedConstellation) => {
    setConstellation(saved.marks);
    setConstellationConnections(saved.connections);
    setActiveConstellationId(saved.id);
    setCastingSpells(true);
    setShowMyConstellations(false);
  }, []);

  // Navigator handlers (used for waypoint navigation flow)
  const handleNavigatorMarkConfirm = useCallback(() => {
    // Confirm mark - handled by waypoint flow now
  }, []);

  const handleNavigatorStep = useCallback((nextNode: SpellwebNode) => {
    handleWaypointAddNode(nextNode);
  }, [handleWaypointAddNode]);

  const handleNavigatorWaypoint = useCallback(() => {
    // Legacy - not used in new flow
  }, []);

  const handleNavigatorEnd = useCallback(() => {
    handleClosePortal();
  }, [handleClosePortal]);

  const handleNavigatorCancel = useCallback(() => {
    handleCancelWaypoint();
  }, [handleCancelWaypoint]);

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
        chargeLevel: (chargeMatch?.[1]?.toLowerCase() || "ember") as 'ember' | 'blaze' | 'inferno',
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
      />

      <GraphFilters
        filters={filters}
        typeFilters={typeFilters}
        spellbookFilters={spellbookFilters}
        onToggleLayer={toggleLayer}
        onToggleType={toggleType}
        onToggleSpellbook={toggleSpellbook}
        isOpen={mobileFiltersOpen}
        // Mobile action props
        onOpenConstellations={() => { setShowMyConstellations(true); setMobileFiltersOpen(false); }}
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

      {hoveredNode && !selectedNode && <HoverTooltip node={hoveredNode} />}

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

      {/* Navigator Modal - Mark current step */}
      {showNavigatorModal && navigator.currentNode && (
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
          onClick={handleNavigatorCancel}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid #00d9ff`,
              borderRadius: 12,
              padding: 24,
              width: 400,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", color: "#00d9ff", fontSize: 16 }}>
              {navigator.path.length === 1 ? "🧭 Open Portal" : `📍 Mark Waypoint (Step ${navigator.path.length})`}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: THEME.text, marginBottom: 12 }}>
                {navigator.currentNode.emoji && <span style={{ marginRight: 8 }}>{navigator.currentNode.emoji}</span>}
                {navigator.currentNode.label}
              </div>
              {navigator.currentNode.desc && (
                <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 12 }}>
                  {navigator.currentNode.desc}
                </div>
              )}
              <label style={{ fontSize: 12, color: THEME.textDim, display: "block", marginBottom: 6 }}>
                {navigator.path.length === 1 ? "Choose your portal symbol" : "Choose an emoji for this waypoint"}
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
                🪞 Reflect (optional)
              </label>
              <textarea
                value={markNote}
                onChange={(e) => setMarkNote(e.target.value)}
                placeholder={navigator.path.length > 1 ? "Why did you follow this path?" : "Why start here?"}
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
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={handleNavigatorCancel}
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
                onClick={handleNavigatorMarkConfirm}
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
                {navigator.path.length === 1 ? "🧭 Begin Journey" : "📍 Mark Waypoint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigator Panel - Shows connected nodes by edge type */}
      {navigator.active && !showNavigatorModal && navigator.currentNode && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            right: 16,
            width: 350,
            maxHeight: "60vh",
            overflow: "auto",
            background: `${THEME.panelBg}f0`,
            border: `1px solid #00d9ff`,
            borderRadius: 12,
            padding: 16,
            zIndex: 100,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#00d9ff", fontFamily: "'JetBrains Mono', monospace" }}>
              🧭 Navigate from: {navigator.currentNode.emoji || "◆"} {navigator.currentNode.label}
            </div>
          </div>

          {/* Path so far */}
          {navigator.path.length > 1 && (
            <div style={{ marginBottom: 16, padding: "8px 12px", background: "#ffffff08", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6, letterSpacing: 1 }}>PATH ({navigator.path.length} steps)</div>
              <div style={{ fontSize: 12, color: THEME.text }}>
                {navigator.path.map((nodeId, i) => {
                  const node = NODES.find(n => n.id === nodeId);
                  const mark = constellation.find(m => m.nodeId === nodeId);
                  return (
                    <span key={nodeId}>
                      {i > 0 && <span style={{ color: THEME.textDim }}> → </span>}
                      <span>{mark?.emoji || node?.emoji || "◆"}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connected nodes by edge type */}
          {navigatorConnections.size > 0 ? (
            Array.from(navigatorConnections.entries()).map(([edgeType, connections]) => (
              <div key={edgeType} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 10,
                  color: THEME.edges[edgeType as keyof typeof THEME.edges]?.color || THEME.textDim,
                  marginBottom: 8,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}>
                  {edgeType.replace(/_/g, ' ')} ({connections.length})
                </div>
                {connections.slice(0, 8).map(({ node, direction }) => (
                  <button
                    key={node.id}
                    onClick={() => handleNavigatorStep(node)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      marginBottom: 6,
                      borderRadius: 6,
                      background: "#ffffff08",
                      border: `1px solid ${THEME.panelBorder}`,
                      color: THEME.text,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{node.emoji || "◆"}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {node.label}
                    </span>
                    <span style={{ fontSize: 10, color: THEME.textDim }}>
                      {direction === 'outgoing' ? '→' : '←'}
                    </span>
                  </button>
                ))}
                {connections.length > 8 && (
                  <div style={{ fontSize: 10, color: THEME.textDim, textAlign: "center" }}>
                    +{connections.length - 8} more
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontSize: 12, color: THEME.textDim, textAlign: "center", padding: 20 }}>
              No more connections to explore
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {/* Waypoint button - mark current position */}
            <button
              onClick={handleNavigatorWaypoint}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 6,
                background: `${THEME.panelBg}e0`,
                border: `1px solid #7b68ee`,
                color: "#7b68ee",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>📍</span> Waypoint
            </button>

            {/* Close Portal button */}
            <button
              onClick={handleNavigatorEnd}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 6,
                background: `linear-gradient(135deg, #e9456030, #7b68ee30)`,
                border: `1px solid #e94560`,
                color: "#e94560",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>🌀</span> Close Portal
            </button>
          </div>
        </div>
      )}

      {/* Blade Inventories - Left side grid between Witness and ZK buttons */}

      {/* Left menu buttons with blade inventories */}
      {(() => {
        const ownBlades = forgedBlades.filter(b => !b.isWitness);
        const witnessBlades = forgedBlades.filter(b => b.isWitness);
        const witnessColor = '#3b82f6';

        // Calculate inventory heights (5 blades per row, up to 2 rows each)
        const ownRows = Math.ceil(Math.min(ownBlades.length, 10) / 5);
        const witnessRows = Math.ceil(Math.min(witnessBlades.length, 10) / 5);
        const ownInventoryHeight = ownBlades.length > 0 ? (ownRows * 38 + 28) : 0;
        const witnessInventoryHeight = witnessBlades.length > 0 ? (witnessRows * 38 + 28) : 0;

        // Stack positions from bottom up: Share(16), Constellations(70), ZK Blades, Inventories, Witness Button
        const zkBladesBottom = 124;
        const ownInventoryBottom = zkBladesBottom + 54;
        const witnessInventoryBottom = ownInventoryBottom + ownInventoryHeight;
        const witnessButtonBottom = witnessInventoryBottom + witnessInventoryHeight;

        return (
          <>
            {/* Witness Blade Import Button - Top of stack */}
            <label
              className="mobile-hide"
              style={{
                position: "absolute",
                bottom: witnessButtonBottom,
                left: 16,
                padding: "10px 16px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f620, #1e40af20)",
                border: "1px solid #3b82f6",
                color: "#3b82f6",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s",
                zIndex: 100,
              }}
            >
              <span>👁️</span> Witness Blade
              <input
                type="file"
                accept=".md"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleWitnessBladeFile(file);
                  e.target.value = "";
                }}
              />
            </label>

            {/* Witness Blades Inventory (blue, round) */}
            {witnessBlades.length > 0 && (
              <div
                className="mobile-hide"
                style={{
                  position: "absolute",
                  bottom: witnessInventoryBottom,
                  left: 16,
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "rgba(10, 10, 30, 0.9)",
                  border: `1px solid ${deleteMode === 'witness' ? '#ff4444' : witnessColor + '40'}`,
                  backdropFilter: "blur(8px)",
                  zIndex: 100,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <div style={{
                    fontSize: 8,
                    color: witnessColor,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    opacity: 0.8,
                  }}>
                    👁️ Witnessed ({witnessBlades.length})
                  </div>
                  {/* Delete toggle */}
                  <div
                    title={deleteMode === 'witness' ? "Cancel delete" : "Delete blades"}
                    onClick={() => {
                      if (deleteMode === 'witness') {
                        setDeleteMode(null);
                        setBladesToDelete(new Set());
                      } else {
                        setDeleteMode('witness');
                        setBladesToDelete(new Set());
                      }
                    }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: deleteMode === 'witness' ? '#ff444440' : 'rgba(255,255,255,0.1)',
                      border: `1px solid ${deleteMode === 'witness' ? '#ff4444' : '#666'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 8,
                      cursor: 'pointer',
                      color: deleteMode === 'witness' ? '#ff4444' : '#888',
                    }}
                  >
                    {deleteMode === 'witness' ? '✕' : '−'}
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 32px)',
                  gap: 4,
                }}>
                  {witnessBlades.slice(0, 10).map((blade) => {
                    const isActive = activeBlade?.id === blade.id;
                    const isMarkedForDelete = bladesToDelete.has(blade.id);
                    return (
                      <div
                        key={blade.id}
                        title={deleteMode === 'witness'
                          ? (isMarkedForDelete ? `Click to unmark ${blade.name}` : `Click to mark ${blade.name} for deletion`)
                          : `${blade.name} - Witnessed: ${blade.witnessedFrom} - Click to trace`}
                        onClick={() => {
                          if (deleteMode === 'witness') {
                            const newSet = new Set(bladesToDelete);
                            if (isMarkedForDelete) {
                              newSet.delete(blade.id);
                            } else {
                              newSet.add(blade.id);
                            }
                            setBladesToDelete(newSet);
                          } else {
                            if (isActive) {
                              setActiveBlade(null);
                              setBladeTraceActive(false);
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
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: isMarkedForDelete
                            ? 'linear-gradient(135deg, #ff444450, #ff444430)'
                            : isActive
                              ? `linear-gradient(135deg, ${witnessColor}50, ${witnessColor}30)`
                              : `linear-gradient(135deg, ${witnessColor}25, ${witnessColor}10)`,
                          border: `2px solid ${isMarkedForDelete ? '#ff4444' : isActive ? witnessColor : witnessColor + '70'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isMarkedForDelete
                            ? '0 0 12px #ff444480'
                            : isActive ? `0 0 12px ${witnessColor}80` : `0 0 6px ${witnessColor}25`,
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          opacity: deleteMode === 'witness' && !isMarkedForDelete ? 0.7 : 1,
                          position: 'relative',
                        }}
                      >
                        {blade.emoji}
                        {isMarkedForDelete && (
                          <div style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: '#ff4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 8,
                            color: '#fff',
                          }}>✕</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Confirm delete button */}
                {deleteMode === 'witness' && bladesToDelete.size > 0 && (
                  <div
                    onClick={() => {
                      const updated = forgedBlades.filter(b => !bladesToDelete.has(b.id));
                      setForgedBlades(updated);
                      localStorage.setItem('spellweb-forged-blades', JSON.stringify(updated));
                      setDeleteMode(null);
                      setBladesToDelete(new Set());
                    }}
                    style={{
                      marginTop: 6,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: '#ff4444',
                      color: '#fff',
                      fontSize: 9,
                      fontFamily: "'JetBrains Mono', monospace",
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    Delete {bladesToDelete.size} blade{bladesToDelete.size > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Own Forged Blades Inventory (gold/tier, square) */}
            {ownBlades.length > 0 && (
              <div
                className="mobile-hide"
                style={{
                  position: "absolute",
                  bottom: ownInventoryBottom,
                  left: 16,
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "rgba(10, 10, 20, 0.9)",
                  border: `1px solid ${deleteMode === 'forged' ? '#ff4444' : '#ffd70040'}`,
                  backdropFilter: "blur(8px)",
                  zIndex: 100,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <div style={{
                    fontSize: 8,
                    color: '#ffd700',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    opacity: 0.8,
                  }}>
                    ⚔️ Forged ({ownBlades.length})
                  </div>
                  {/* Delete toggle */}
                  <div
                    title={deleteMode === 'forged' ? "Cancel delete" : "Delete blades"}
                    onClick={() => {
                      if (deleteMode === 'forged') {
                        setDeleteMode(null);
                        setBladesToDelete(new Set());
                      } else {
                        setDeleteMode('forged');
                        setBladesToDelete(new Set());
                      }
                    }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: deleteMode === 'forged' ? '#ff444440' : 'rgba(255,255,255,0.1)',
                      border: `1px solid ${deleteMode === 'forged' ? '#ff4444' : '#666'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 8,
                      cursor: 'pointer',
                      color: deleteMode === 'forged' ? '#ff4444' : '#888',
                    }}
                  >
                    {deleteMode === 'forged' ? '✕' : '−'}
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 32px)',
                  gap: 4,
                }}>
                  {ownBlades.slice(0, 10).map((blade) => {
                    const isActive = activeBlade?.id === blade.id;
                    const isMarkedForDelete = bladesToDelete.has(blade.id);
                    const tierColor = blade.tier === 'dragon' ? '#ffd700' :
                      blade.tier === 'heavy' ? '#c0c0c0' : '#87ceeb';
                    return (
                      <div
                        key={blade.id}
                        title={deleteMode === 'forged'
                          ? (isMarkedForDelete ? `Click to unmark ${blade.name}` : `Click to mark ${blade.name} for deletion`)
                          : `${blade.name} (${blade.tier} blade, stratum ${blade.stratum}) - Click to trace`}
                        onClick={() => {
                          if (deleteMode === 'forged') {
                            const newSet = new Set(bladesToDelete);
                            if (isMarkedForDelete) {
                              newSet.delete(blade.id);
                            } else {
                              newSet.add(blade.id);
                            }
                            setBladesToDelete(newSet);
                          } else {
                            if (isActive) {
                              setActiveBlade(null);
                              setBladeTraceActive(false);
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
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: isMarkedForDelete
                            ? 'linear-gradient(135deg, #ff444450, #ff444430)'
                            : isActive
                              ? `linear-gradient(135deg, ${tierColor}50, ${tierColor}30)`
                              : blade.tier === 'dragon'
                                ? 'linear-gradient(135deg, #ffd70030, #ff660020)'
                                : blade.tier === 'heavy'
                                  ? 'linear-gradient(135deg, #c0c0c030, #88888820)'
                                  : 'linear-gradient(135deg, #87ceeb30, #4a9eff20)',
                          border: `2px solid ${isMarkedForDelete ? '#ff4444' : isActive ? tierColor : tierColor + '50'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isMarkedForDelete
                            ? '0 0 12px #ff444480'
                            : isActive ? `0 0 12px ${tierColor}80` : 'none',
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          opacity: deleteMode === 'forged' && !isMarkedForDelete ? 0.7 : 1,
                          position: 'relative',
                        }}
                      >
                        {blade.emoji}
                        {isMarkedForDelete && (
                          <div style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: '#ff4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 8,
                            color: '#fff',
                          }}>✕</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Confirm delete button */}
                {deleteMode === 'forged' && bladesToDelete.size > 0 && (
                  <div
                    onClick={() => {
                      const updated = forgedBlades.filter(b => !bladesToDelete.has(b.id));
                      setForgedBlades(updated);
                      localStorage.setItem('spellweb-forged-blades', JSON.stringify(updated));
                      setDeleteMode(null);
                      setBladesToDelete(new Set());
                    }}
                    style={{
                      marginTop: 6,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: '#ff4444',
                      color: '#fff',
                      fontSize: 9,
                      fontFamily: "'JetBrains Mono', monospace",
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    Delete {bladesToDelete.size} blade{bladesToDelete.size > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Forge ZK Blades Button */}
            <button
              className="mobile-hide"
              onClick={() => {
                if (latestProof) {
                  setForgePhase('ignite');
                  setShowForgeModal(true);
                  setTimeout(() => setForgePhase('forge'), 800);
                  setTimeout(() => setForgePhase('temper'), 2000);
                  setTimeout(() => setForgePhase('complete'), 3500);
                }
              }}
              style={{
                position: "absolute",
                bottom: zkBladesBottom,
                left: 16,
                padding: "12px 20px",
                borderRadius: 8,
                background: latestProof
                  ? "linear-gradient(135deg, #ffd70050, #ff660040)"
                  : "linear-gradient(135deg, #33333330, #22222220)",
                border: latestProof ? "1px solid #ffd700" : "1px solid #444",
                color: latestProof ? "#ffd700" : "#666",
                fontSize: 12,
                cursor: latestProof ? "pointer" : "default",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s",
                boxShadow: latestProof ? "0 0 20px rgba(255, 215, 0, 0.3)" : "none",
                opacity: latestProof ? 1 : 0.5,
                zIndex: 100,
              }}
            >
              <span>⚔️</span> ZK Blades
            </button>
          </>
        );
      })()}

      {/* Constellations Button - Glows when proofs exist */}
      {(() => {
        const hasProofs = savedConstellations.some(c => c.proof);
        return (
          <button
            className="mobile-hide"
            onClick={() => setShowMyConstellations(true)}
            style={{
              position: "absolute",
              bottom: 70,
              left: 16,
              padding: "10px 16px",
              borderRadius: 8,
              background: hasProofs
                ? "linear-gradient(135deg, #7b68ee40, #9b59b630)"
                : "rgba(123, 104, 238, 0.15)",
              border: `1px solid ${hasProofs ? '#9b59b6' : '#7b68ee'}`,
              color: hasProofs ? "#c9a0dc" : "#7b68ee",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s",
              boxShadow: hasProofs ? "0 0 15px rgba(155, 89, 182, 0.3)" : "none",
              zIndex: 100,
            }}
          >
            <span>🌌</span> Constellations
          </button>
        );
      })()}

      {/* Share Knowledge Button - Bottom Left */}
      <a
        className="mobile-hide"
        href="https://agentprivacy.ai/evoke"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          padding: "10px 16px",
          borderRadius: 8,
          background: `linear-gradient(135deg, #7b68ee20, #e9456020)`,
          border: `1px solid #7b68ee80`,
          color: "#aaa",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backdropFilter: "blur(8px)",
          zIndex: 50,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `linear-gradient(135deg, #7b68ee40, #e9456040)`;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `linear-gradient(135deg, #7b68ee20, #e9456020)`;
          e.currentTarget.style.color = "#aaa";
        }}
      >
        <span>🔮</span> Share Knowledge
      </a>

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

      {/* My Constellations Modal */}
      {showMyConstellations && (
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
          onClick={() => setShowMyConstellations(false)}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid ${THEME.panelBorder}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: "90%",
              maxHeight: "70vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", color: "#7b68ee", fontSize: 18 }}>
              🌌 My Constellations
            </h3>

            {savedConstellations.length === 0 ? (
              <p style={{ color: THEME.textDim, fontSize: 13 }}>
                No saved constellations yet. Use the Waypoint feature to trace a path through the stars.
              </p>
            ) : (
              <div>
                {savedConstellations.map((saved) => (
                  <div
                    key={saved.id}
                    style={{
                      padding: 16,
                      marginBottom: 12,
                      background: "#ffffff08",
                      borderRadius: 8,
                      border: `1px solid ${THEME.panelBorder}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, color: THEME.text, fontWeight: 500 }}>
                          {saved.name}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.textDim }}>
                          {new Date(saved.createdAt).toLocaleDateString()} • {saved.marks.length} nodes
                        </div>
                      </div>
                    </div>
                    {saved.inscribedSpell && (
                      <div style={{ fontSize: 20, marginBottom: 8, letterSpacing: 4, color: "#ffd700" }}>
                        {saved.inscribedSpell}
                      </div>
                    )}
                    {saved.proof && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        padding: "6px 10px",
                        background: "rgba(255, 107, 107, 0.1)",
                        borderRadius: 6,
                        fontSize: 11,
                      }}>
                        <span>🔥</span>
                        <span style={{ color: saved.proof.chargeLevel === 'inferno' ? '#ff6b6b' : saved.proof.chargeLevel === 'blaze' ? '#ffd700' : '#888' }}>
                          {saved.proof.chargeLevel.toUpperCase()}
                        </span>
                        <span style={{ color: THEME.textDim }}>•</span>
                        <span style={{ color: THEME.textDim }}>{saved.proof.lapCount} laps</span>
                        <span style={{ color: THEME.textDim }}>•</span>
                        <span style={{ color: THEME.textDim }}>{saved.proof.spellsCast || 0} spells</span>
                        <span style={{ color: THEME.textDim }}>•</span>
                        <span style={{ color: "#9b59b6", fontFamily: "monospace", fontSize: 9 }}>
                          {saved.proof.signature}
                        </span>
                      </div>
                    )}
                    <div style={{ fontSize: 14, marginBottom: 8, color: THEME.textDim }}>
                      {saved.marks.map(m => m.emoji).join(" → ")}
                    </div>
                    {saved.reflection && (
                      <div style={{ fontSize: 11, color: THEME.textDim, fontStyle: "italic", marginBottom: 8 }}>
                        "{saved.reflection}"
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleLoadConstellation(saved)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 4,
                          background: "#7b68ee30",
                          border: `1px solid #7b68ee`,
                          color: "#7b68ee",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        ✨ View
                      </button>
                      <button
                        onClick={() => {
                          // Load constellation and open edit modal
                          handleLoadConstellation(saved);
                          setInscribedSpell(saved.inscribedSpell || "");
                          setConstellationReflection(saved.reflection || "");
                          setShowMyConstellations(false);
                          setShowClosePortalModal(true);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 4,
                          background: "#ffd70030",
                          border: `1px solid #ffd700`,
                          color: "#ffd700",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      {(() => {
                        // Export only enabled when blade is forged
                        const hasForgedBlade = saved.proof
                          ? forgedBlades.some(b => b.proof.signature === saved.proof?.signature)
                          : false;
                        return (
                          <button
                            onClick={() => hasForgedBlade && handleExportConstellation(saved)}
                            disabled={!hasForgedBlade}
                            title={hasForgedBlade ? "Export constellation with blade" : "Forge a blade to enable export"}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 4,
                              background: hasForgedBlade ? "#50c87820" : "transparent",
                              border: `1px solid ${hasForgedBlade ? "#50c878" : THEME.panelBorder}`,
                              color: hasForgedBlade ? "#50c878" : THEME.textDim,
                              fontSize: 11,
                              cursor: hasForgedBlade ? "pointer" : "not-allowed",
                              opacity: hasForgedBlade ? 1 : 0.5,
                            }}
                          >
                            📄 Export .md
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setShowMyConstellations(false)}
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
                Close
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

      {/* Clear Map - Small button in bottom right */}
      {constellation.length > 0 && (
        <button
          onClick={() => setShowClearMapModal(true)}
          style={{
            position: "absolute",
            bottom: 16,
            right: selectedNode ? 396 : 16,
            padding: "6px 10px",
            borderRadius: 4,
            background: `${THEME.panelBg}c0`,
            border: `1px solid #ff444480`,
            color: "#ff4444",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            backdropFilter: "blur(8px)",
            zIndex: 50,
            transition: "right 0.2s",
          }}
        >
          <span style={{ fontSize: 10 }}>🗑️</span> Clear
        </button>
      )}

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

        {/* Spell Ceremony - Floating panel with orbs traveling the constellation circuit */}
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
          onToggleEvoke={() => setIncantationActive(i => !i)}
          onClearConstellation={() => {
            setConstellation([]);
            setConstellationConnections([]);
            setIncantationActive(false);
            setActiveConstellationId(null);
          }}
          onShine={() => {
            // Reset everything to fresh state - close all modals and clear all state
            setConstellation([]);
            setConstellationConnections([]);
            setCastingSpells(false);
            setIncantationActive(false);
            setActiveConstellationId(null);
            setSelectedNode(null);
            setConnectionMode({ active: false, sourceNode: null });
            setConnectTarget(null);
            setWaypoint({ active: false, path: [] });
            _setNavigator({ active: false, currentNode: null, path: [], pendingMark: false });
            // Close all modals
            setShowClosePortalModal(false);
            setShowMyConstellations(false);
            setShowMarkModal(false);
            setShowConnectModal(false);
            setShowClearMapModal(false);
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
        />
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
                        animation: `cutLine 0.5s ease-out ${i * 0.3}s forwards`,
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
                      animation: `cutLine 0.5s ease-out ${cutNodes.length * 0.3}s forwards`,
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
                      animation: `nodeBurst 0.6s ease-out ${i * 0.3}s forwards`,
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
                      animation: `nodeRing 0.8s ease-out ${i * 0.3}s forwards`,
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y - 30}
                    textAnchor="middle"
                    fontSize="20"
                    opacity="0"
                    style={{
                      animation: `emojiFloat 1s ease-out ${i * 0.3}s forwards`,
                    }}
                  >
                    {node.emoji}
                  </text>
                </g>
              ))}

              {/* Animated sword following the path */}
              <text
                fontSize="32"
                textAnchor="middle"
                dominantBaseline="middle"
                filter="url(#cutGlow)"
                style={{
                  animation: `swordTrace ${cutNodes.length * 0.3 + 0.5}s ease-out forwards`,
                }}
              >
                <animateMotion
                  dur={`${cutNodes.length * 0.3 + 0.5}s`}
                  fill="freeze"
                  path={`M ${cutNodes.map(n => `${n.x},${n.y}`).join(' L ')} L ${cutNodes[0].x},${cutNodes[0].y}`}
                />
                ⚔️
              </text>
            </svg>

            {/* Blade name reveal after animation */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              opacity: 0,
              animation: `fadeIn 1s ease-out ${cutNodes.length * 0.3 + 1}s forwards`,
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
                  BLADE DIMENSIONS • STRATUM {stratum}/6 • 0x{hex}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {dimensionLabels.map(({ key, label, desc, icon }, idx) => {
                    const active = dims[key as keyof typeof dims];
                    const revealed = showDimensions && (forgePhase === 'complete' || idx <= (forgePhase === 'forge' ? 3 : 6));
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

              {/* Stats Grid - Fades in during temper phase */}
              <div style={{
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: `1px solid ${colors.primary}30`,
                opacity: showStats ? 1 : 0.2,
                transition: "all 0.5s ease",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>LAPS</div>
                    <div style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>{latestProof.lapCount}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>SPELLS</div>
                    <div style={{ color: "#9b59b6", fontSize: 18, fontWeight: "bold" }}>{latestProof.spellsCast || 0}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>CHARGE</div>
                    <div style={{ color: latestProof.chargeLevel === 'inferno' ? '#ff6600' : colors.primary, fontSize: 12, fontWeight: "bold", textTransform: "uppercase" }}>
                      {latestProof.chargeLevel}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>NODES</div>
                    <div style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>{latestProof.nodeCount}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#555", fontSize: 9 }}>TIME</div>
                    <div style={{ color: "#fff", fontSize: 16 }}>{Math.round(latestProof.duration / 1000)}s</div>
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

                const handleManifest = () => {
                  if (canManifest && latestProof) {
                    // Save blade to inventory with constellation data
                    const newBlade: ForgedBlade = {
                      id: `blade-${Date.now()}`,
                      name: bladeName.trim(),
                      emoji: bladeEmoji,
                      tier: tier,
                      stratum: stratum,
                      proof: latestProof,
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
                    // Clear witness mode and proof
                    setTimeout(() => {
                      setShowForgeModal(false);
                      setLatestProof(null);
                      setWitnessMode(null); // Clear witness mode after forging
                    }, 4000);
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
