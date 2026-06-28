import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Loader2, Trash2, Sparkles, CheckCircle2, Eraser, MousePointerClick, GripVertical } from "lucide-react";
import { useApp } from "../app/AppContext";
import { FEATURES } from "../lib/features";
import { FeatureKey, callFeature } from "../lib/api";
import { AgentAvatar } from "../components/AgentAvatar";

const NODE_W = 160;
const NODE_H = 56;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface Node { id: string; agent: FeatureKey; x: number; y: number }
interface Edge { from: string; to: string }

// active pointer interaction
type IA =
  | { kind: "node"; id: string; dx: number; dy: number }
  | { kind: "link"; from: string }
  | { kind: "spawn"; agent: FeatureKey };

const meta = (k: string) => FEATURES.find((f) => f.key === k)!;

/** Order nodes by following edges from the start node(s); isolated nodes go last. */
function chainOrder(nodes: Node[], edges: Edge[]): Node[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  edges.forEach((e) => indeg.set(e.to, (indeg.get(e.to) || 0) + 1));
  const out = (id: string) => edges.filter((e) => e.from === id).map((e) => e.to);
  const starts = nodes.filter((n) => (indeg.get(n.id) || 0) === 0);
  const seen = new Set<string>();
  const order: Node[] = [];
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const n = byId.get(id); if (n) order.push(n);
    out(id).forEach(visit);
  };
  (starts.length ? starts : nodes).forEach((n) => visit(n.id));
  nodes.forEach((n) => { if (!seen.has(n.id)) order.push(n); });
  return order;
}

export function WorkflowBuilder({ onBack }: { onBack: () => void }) {
  const { t, lang } = useApp();
  const idc = useRef(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const iaRef = useRef<IA | null>(null);
  const nodesRef = useRef<Node[]>([]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [ia, setIa] = useState<IA | null>(null);                       // mirror for rendering
  const [pt, setPt] = useState<{ cx: number; cy: number; vx: number; vy: number } | null>(null);
  const [seed, setSeed] = useState("");
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { agent: string; reply: string }>>({});

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  const nodeAt = (cx: number, cy: number) =>
    [...nodesRef.current].reverse().find((n) => cx >= n.x && cx <= n.x + NODE_W && cy >= n.y && cy <= n.y + NODE_H) || null;

  function begin(next: IA, e: React.PointerEvent) {
    e.preventDefault();
    iaRef.current = next; setIa(next);
    const r = canvasRef.current?.getBoundingClientRect();
    setPt({ cx: r ? e.clientX - r.left : 0, cy: r ? e.clientY - r.top : 0, vx: e.clientX, vy: e.clientY });
  }

  // global pointer move/up so dragging stays smooth even outside the canvas
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const cur = iaRef.current; if (!cur) return;
      const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      if (cur.kind === "node") {
        const x = clamp(cx - cur.dx, 0, r.width - NODE_W);
        const y = clamp(cy - cur.dy, 0, r.height - NODE_H);
        setNodes((p) => p.map((n) => (n.id === cur.id ? { ...n, x, y } : n)));
      } else {
        setPt({ cx, cy, vx: e.clientX, vy: e.clientY });
      }
    };
    const up = (e: PointerEvent) => {
      const cur = iaRef.current; if (!cur) return;
      const r = canvasRef.current?.getBoundingClientRect();
      if (r) {
        const cx = e.clientX - r.left, cy = e.clientY - r.top;
        const inCanvas = cx >= 0 && cy >= 0 && cx <= r.width && cy <= r.height;
        if (cur.kind === "spawn") {
          const x = inCanvas ? clamp(cx - NODE_W / 2, 0, r.width - NODE_W) : 16 + (nodesRef.current.length % 4) * 24;
          const y = inCanvas ? clamp(cy - NODE_H / 2, 0, r.height - NODE_H) : 16 + (nodesRef.current.length % 4) * 24;
          setNodes((p) => [...p, { id: `n${idc.current++}`, agent: cur.agent, x, y }]);
        } else if (cur.kind === "link") {
          const target = nodeAt(cx, cy);
          if (target && target.id !== cur.from) {
            setEdges((p) => (p.some((ed) => ed.from === cur.from && ed.to === target.id) ? p : [...p, { from: cur.from, to: target.id }]));
          }
        }
      }
      iaRef.current = null; setIa(null); setPt(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  function removeNode(id: string) {
    setNodes((p) => p.filter((n) => n.id !== id));
    setEdges((p) => p.filter((e) => e.from !== id && e.to !== id));
    setResults((p) => { const n = { ...p }; delete n[id]; return n; });
  }
  function clearAll() { setNodes([]); setEdges([]); setResults({}); }

  async function run() {
    if (!nodes.length || !seed.trim()) return;
    setRunning(true); setResults({}); setActive(null);
    const order = chainOrder(nodes, edges);
    let context = seed;
    const acc: Record<string, { agent: string; reply: string }> = {};
    try {
      for (const n of order) {
        setActive(n.id);
        const r = await callFeature<{ agent: string; agentName: string; reply: string }>("assist", { problem: context, agentHint: n.agent, language: lang.name });
        acc[n.id] = { agent: n.agent, reply: r.reply };
        setResults({ ...acc });
        context = `${context}\n\n${r.agentName || t(meta(n.agent).nameKey)} said: ${r.reply}`;
      }
    } catch {
      /* keep calm */
    } finally {
      setActive(null); setRunning(false);
    }
  }

  const outPt = (n: Node) => ({ x: n.x + NODE_W, y: n.y + NODE_H / 2 });
  const inPt = (n: Node) => ({ x: n.x, y: n.y + NODE_H / 2 });
  const linking = ia?.kind === "link" ? nodes.find((n) => n.id === ia.from) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-6xl px-5 pb-24 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="btn-ghost px-4 py-2 text-sm"><ArrowLeft className="h-4 w-4" /> All workflows</button>
        {nodes.length > 0 && <button onClick={clearAll} className="btn-ghost text-sm"><Eraser className="h-4 w-4" /> Clear</button>}
      </div>

      <div className="mt-6">
        <h1 className="display text-3xl font-bold deva">Build your own workflow</h1>
        <p className="mt-1 max-w-2xl text-[15px] text-muted deva">Drag an agent onto the canvas, drag again to arrange, then drag from an agent's right dot to another to link them. Run it and each answer flows into the next.</p>
      </div>

      {/* palette — drag a chip onto the canvas */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FEATURES.map((f) => (
          <button
            key={f.key}
            onPointerDown={(e) => begin({ kind: "spawn", agent: f.key }, e)}
            className={`inline-flex touch-none items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-3 transition-colors hover:bg-mist ${ia?.kind === "spawn" && ia.agent === f.key ? "opacity-40" : ""}`}
            style={{ cursor: "grab" }}
          >
            <AgentAvatar photo={f.photo} name={t(f.nameKey)} tint={f.tint} accent={f.accent} rounded="rounded-full" className="h-6 w-6 flex-none" />
            <span className="text-xs font-semibold text-ink deva">{t(f.nameKey)}</span>
            <GripVertical className="h-3.5 w-3.5 text-faint" />
          </button>
        ))}
      </div>

      {/* canvas */}
      <div
        ref={canvasRef}
        className="relative mt-4 h-[460px] w-full touch-none overflow-hidden rounded-3xl border-2 transition-colors"
        style={{
          borderColor: ia?.kind === "spawn" ? "#2D6BFF" : "var(--line,#e7e3da)",
          borderStyle: ia?.kind === "spawn" ? "dashed" : "solid",
          background: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px) 0 0 / 22px 22px, #FBFAF7",
        }}
      >
        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-muted">
            <MousePointerClick className="h-7 w-7 text-faint" />
            <p className="text-sm">Drag an agent here. Then drag from its right dot to another agent to connect them.</p>
          </div>
        )}

        {/* edges + live link line */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <marker id="wb-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#8B79c4" /></marker>
          </defs>
          {edges.map((e, i) => {
            const a = nodes.find((n) => n.id === e.from), b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            const s = outPt(a), d = inPt(b), mx = (s.x + d.x) / 2;
            return <path key={i} d={`M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${d.y}, ${d.x} ${d.y}`} fill="none" stroke="#8B79c4" strokeWidth="2.5" markerEnd="url(#wb-arrow)" />;
          })}
          {linking && pt && (() => {
            const s = outPt(linking), mx = (s.x + pt.cx) / 2;
            return <path d={`M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${pt.cy}, ${pt.cx} ${pt.cy}`} fill="none" stroke="#2D6BFF" strokeWidth="2.5" strokeDasharray="5 4" />;
          })()}
        </svg>

        {/* nodes */}
        {nodes.map((n) => {
          const f = meta(n.agent);
          const isActive = active === n.id;
          const isDone = !!results[n.id];
          const isLinkSrc = ia?.kind === "link" && ia.from === n.id;
          const dragging = ia?.kind === "node" && ia.id === n.id;
          return (
            <div
              key={n.id}
              onPointerDown={(e) => { const r = canvasRef.current!.getBoundingClientRect(); begin({ kind: "node", id: n.id, dx: e.clientX - r.left - n.x, dy: e.clientY - r.top - n.y }, e); }}
              onDragStart={(e) => e.preventDefault()}
              className="absolute flex touch-none select-none items-center gap-2 rounded-2xl border bg-white px-2.5 shadow-soft"
              style={{
                left: n.x, top: n.y, width: NODE_W, height: NODE_H,
                cursor: dragging ? "grabbing" : "grab",
                borderColor: isLinkSrc || isActive ? f.accent : "var(--line,#e7e3da)",
                boxShadow: isActive ? `0 0 0 3px ${f.accent}33` : dragging ? "0 12px 30px rgba(0,0,0,0.14)" : undefined,
                zIndex: dragging ? 20 : 10,
              }}
            >
              {/* input port (left) */}
              <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 bg-white" style={{ borderColor: f.accent }} />

              <AgentAvatar photo={f.photo} name={t(f.nameKey)} tint={f.tint} accent={f.accent} rounded="rounded-lg" className="h-9 w-9 flex-none" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink deva">{t(f.nameKey)}</div>
                <div className="truncate text-[11px] text-muted deva">{t(f.tagKey)}</div>
              </div>
              {isActive ? <Loader2 className="h-4 w-4 flex-none animate-spin" style={{ color: f.accent }} />
                : isDone ? <CheckCircle2 className="h-4 w-4 flex-none text-[#2E6F52]" /> : null}

              {/* output port (right) — drag from here to another node to link */}
              <span
                onPointerDown={(e) => { e.stopPropagation(); begin({ kind: "link", from: n.id }, e); }}
                title="Drag to another agent to connect"
                className="absolute -right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full border-2 bg-white"
                style={{ borderColor: f.accent }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: f.accent }} />
              </span>

              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeNode(n.id); }} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"><Trash2 className="h-3 w-3" /></button>
            </div>
          );
        })}
      </div>

      {/* floating ghost while dragging a new agent from the palette */}
      {ia?.kind === "spawn" && pt && (() => {
        const f = meta(ia.agent);
        return (
          <div className="pointer-events-none fixed z-50 inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 shadow-float" style={{ left: pt.vx + 12, top: pt.vy + 12 }}>
            <AgentAvatar photo={f.photo} name={t(f.nameKey)} tint={f.tint} accent={f.accent} rounded="rounded-full" className="h-6 w-6 flex-none" />
            <span className="text-xs font-semibold text-ink deva">{t(f.nameKey)}</span>
          </div>
        );
      })()}

      {/* run */}
      <div className="card mt-5 p-5">
        <textarea value={seed} onChange={(e) => setSeed(e.target.value)} rows={3} placeholder="Your input for the chain… e.g. I got an SMS saying my electricity will be cut tonight unless I pay now." className="field resize-none deva" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={running || !nodes.length || !seed.trim()} className="btn-accent text-[15px]" style={{ background: "#2D6BFF" }}>
            {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</> : <><Play className="h-4 w-4" /> Run my workflow</>}
          </button>
          <span className="text-xs text-faint">{nodes.length} agent{nodes.length === 1 ? "" : "s"} · {edges.length} link{edges.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* results */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6 space-y-3">
          {chainOrder(nodes, edges).filter((n) => results[n.id]).map((n, i) => {
            const f = meta(n.agent);
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: f.accent }}>{i + 1}</span>
                  <AgentAvatar photo={f.photo} name={t(f.nameKey)} tint={f.tint} accent={f.accent} rounded="rounded-lg" className="h-8 w-8 flex-none" />
                  <span className="font-semibold text-ink deva">{t(f.nameKey)}</span>
                  <CheckCircle2 className="ml-auto h-5 w-5 text-[#2E6F52]" />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-graphite deva">{results[n.id].reply}</p>
              </motion.div>
            );
          })}
          {!running && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-mist py-4 text-sm font-medium text-graphite">
              <Sparkles className="h-4 w-4 text-[#2D6BFF]" /> Your custom workflow ran end-to-end.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
