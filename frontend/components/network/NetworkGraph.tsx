"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

// ── Shared types ───────────────────────────────────────────────────────────

export interface NodeData {
  id: string;
  label: string;
  type: string;
  community_id: number | null;
  risk_score: number | null;
  metadata: Record<string, unknown>;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  link_type: string;
  weight: number;
  directed: boolean;
  metadata: Record<string, unknown>;
}

export interface GraphResponse {
  nodes: NodeData[];
  edges: EdgeData[];
}

// ── D3 simulation types ────────────────────────────────────────────────────

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  community_id: number | null;
  risk_score: number | null;
  metadata: Record<string, unknown>;
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  link_type: string;
  weight: number;
}

// ── Community palette ──────────────────────────────────────────────────────

export const COMMUNITY_PALETTE = [
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
] as const;

export function communityColour(id: number | null | undefined): string {
  if (id == null) return "#71717a"; // zinc-500 for unknown community
  return COMMUNITY_PALETTE[Math.abs(id) % COMMUNITY_PALETTE.length];
}

// ── Component ──────────────────────────────────────────────────────────────

interface NetworkGraphProps {
  data: GraphResponse;
  searchTerm: string;
  onNodeSelect: (node: NodeData | null) => void;
}

export default function NetworkGraph({
  data,
  searchTerm,
  onNodeSelect,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimEdge> | null>(null);
  const nodeSelRef = useRef<d3.Selection<
    SVGCircleElement,
    SimNode,
    SVGGElement,
    unknown
  > | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Keep a stable ref so click handlers always call the latest callback
  // without needing it in the effect dependency array.
  const onNodeSelectRef = useRef<(node: NodeData | null) => void>(onNodeSelect);
  onNodeSelectRef.current = onNodeSelect;

  // ── Build / rebuild graph when data changes ──────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const rect = svgRef.current.getBoundingClientRect();
    const w = rect.width || svgRef.current.clientWidth || 800;
    const h = rect.height || svgRef.current.clientHeight || 600;

    // Shallow-copy nodes / edges so D3 can mutate freely
    const nodes: SimNode[] = data.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      community_id: n.community_id,
      risk_score: n.risk_score,
      metadata: n.metadata,
    }));

    const links: SimEdge[] = data.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      link_type: e.link_type,
      weight: e.weight,
    }));

    // Main group that zoom/pan will transform
    const g = svg.append("g");

    // Zoom / pan
    const zoomBehaviour = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform.toString()));

    svg.call(zoomBehaviour);
    zoomRef.current = zoomBehaviour;

    // Force simulation
    const simulation = d3
      .forceSimulation<SimNode, SimEdge>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(links)
          .id((d) => d.id)
          .distance(80),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide(18));

    simulationRef.current = simulation;

    // ── Edges ──────────────────────────────────────────────────────────────
    const linkSel = g
      .append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#27272a")
      .attr("stroke-width", (d) => Math.max(1, d.weight * 0.5))
      .attr("stroke-dasharray", (d) => {
        if (d.link_type === "association") return "4 2";
        if (d.link_type === "hierarchy") return "1 3";
        return null; // co_accused — solid
      });

    // ── Nodes ──────────────────────────────────────────────────────────────
    const nodeSelection = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGCircleElement, SimNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) => communityColour(d.community_id))
      .attr("stroke", "#09090b")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    nodeSelRef.current = nodeSelection;

    // Drag behaviour
    const drag = d3
      .drag<SVGCircleElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeSelection.call(drag);

    // Click — select node; SVG background click — deselect
    nodeSelection.on("click", (event, d) => {
      event.stopPropagation();
      onNodeSelectRef.current(d);
    });

    svg.on("click", () => onNodeSelectRef.current(null));

    // ── Labels ─────────────────────────────────────────────────────────────
    const labelSel = g
      .append("g")
      .attr("class", "labels")
      .selectAll<SVGTextElement, SimNode>("text")
      .data(nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dy", 22)
      .attr("font-size", 9)
      .attr("fill", "#71717a")
      .attr("pointer-events", "none")
      .text((d) => (d.label.length > 12 ? d.label.slice(0, 12) : d.label));

    // ── Tick ───────────────────────────────────────────────────────────────
    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d: any) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d: any) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d: any) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d: any) => (d.target as SimNode).y ?? 0);

      nodeSelection
        .attr("cx", (d: any) => d.x ?? 0)
        .attr("cy", (d: any) => d.y ?? 0);

      labelSel.attr("x", (d: any) => d.x ?? 0).attr("y", (d: any) => d.y ?? 0);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  // ── Search highlight + pan-to ─────────────────────────────────────────────
  useEffect(() => {
    if (!nodeSelRef.current || !svgRef.current || !zoomRef.current) return;

    const term = searchTerm.toLowerCase().trim();

    // Highlight matching nodes with amber stroke
    nodeSelRef.current.attr("stroke", (d) =>
      term && d.label.toLowerCase().includes(term) ? "#fbbf24" : "#09090b",
    );

    if (!term) return;

    // Pan the viewport to the first matching node
    const matchNode = nodeSelRef.current
      .data()
      .find((d) => d.label.toLowerCase().includes(term));

    if (!matchNode || matchNode.x == null || matchNode.y == null) return;

    const rect = svgRef.current.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 600;

    const transform = d3.zoomIdentity.translate(
      w / 2 - matchNode.x,
      h / 2 - matchNode.y,
    );

    // Cast required because D3's overloaded zoom.transform types are complex
    (d3.select(svgRef.current).transition().duration(500) as any).call(
      zoomRef.current.transform,
      transform,
    );
  }, [searchTerm]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: "#09090b" }}
    />
  );
}
