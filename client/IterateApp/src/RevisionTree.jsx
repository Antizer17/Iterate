import { useState, useRef, useCallback, useEffect} from "react";
import { useParams } from 'react-router-dom'
import { useUser } from "./context/UserContext.jsx";
import {SideNav} from "./iterate-app.jsx"
import { LiveRevisionTree } from "./LiveRevisionTree.jsx";

// ── Design tokens (scoped to .rt-root) ──────────────────────────────────────
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
.rt-root *{box-sizing:border-box;margin:0;padding:0;}
.rt-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --font:'Caveat',cursive;--font-body:'Inter',sans-serif;
  background:var(--paper);color:var(--ink);font-family:var(--font);
}
.rt-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto;}
.rt-header{display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;border-bottom:1.5px solid var(--gray4);padding-bottom:1rem}
.rt-title{font-family:var(--font);font-size:44px;font-weight:700;transform:rotate(-0.4deg);display:inline-block}
.rt-date{font-family:var(--font-body);font-size:13px;color:var(--gray2);margin-left:auto;font-style:italic}
.rt-rule{flex:1;border:none;border-top:1px dashed var(--gray4);margin:0 8px}
.rt-tabs{display:flex;gap:12px;margin-bottom:1.5rem;flex-wrap:wrap}
button.rt-tab{font-family:var(--font-body);font-size:15px;font-weight:600;padding:8px 22px;
  background-color:var(--paper);color:var(--gray2);border:1.5px solid var(--gray4);
  border-radius:2px 12px 4px 10px;outline:none;cursor:pointer;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05);
  transition:transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease, color 0.12s ease;
  transform:rotate(-0.3deg)}
button.rt-tab.active{background-color:var(--ink);color:var(--paper);border-color:var(--ink);
  box-shadow:2px 3px 0 rgba(26,26,24,0.12);transform:rotate(0.2deg)}
button.rt-tab:hover:not(.active){background-color:var(--paper3);color:var(--gray1);
  transform:translateY(-1px) rotate(-0.3deg);box-shadow:3px 5px 0 rgba(26,26,24,0.08)}
button.rt-tab:active{transform:scale(0.97) rotate(-0.3deg)}
.rt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1.25rem}
.rt-stat{background:var(--paper);border:1.5px solid var(--gray4);padding:0.65rem 0.85rem;position:relative}
.rt-stat:nth-child(1){transform:rotate(-0.5deg)}.rt-stat:nth-child(2){transform:rotate(0.3deg)}.rt-stat:nth-child(3){transform:rotate(-0.2deg)}
.rt-stat::before{content:'';position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.rt-stat-label{font-family:var(--font-body);font-size:12px;color:var(--gray2);margin-bottom:1px;text-transform:lowercase;letter-spacing:.02em}
.rt-stat-value{font-family:var(--font);font-size:26px;font-weight:700}
.rt-tree-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0.5rem 0 0.75rem;margin-bottom:0.75rem;width:100%;display:flex;}
.rt-detail{background:var(--paper);border:1.5px solid var(--gray4);padding:0.9rem 1rem;margin-top:0.5rem;min-height:72px;position:relative;transform:rotate(-0.15deg);transition:border-color 0.3s}
.rt-detail::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gray4)}
.rt-detail.highlight{border-color:var(--ink)}.rt-detail.highlight::after{background:var(--ink)}
.rt-detail-name{font-family:var(--font);font-size:20px;font-weight:700;margin-bottom:2px}
.rt-detail-meta{font-family:var(--font-body);font-size:13px;color:var(--gray2);font-style:italic}
.rt-chips{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center}
.rt-chip{font-family:var(--font-body);font-size:12.5px;padding:2px 10px;background:var(--paper2);border:1px solid var(--gray4);color:var(--gray1)}
.rt-chip.done{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.rt-chip.amber{background:var(--paper2);color:var(--gray1);border:1px dashed var(--gray3)}
.rt-ace-btn{font-family:var(--font-body);font-size:13.5px;font-weight:600;padding:4px 14px;background:var(--paper);border:1.5px dashed var(--gray2);color:var(--gray1);cursor:pointer;transition:all 0.12s;transform:rotate(-0.5deg)}
.rt-ace-btn:hover{background:var(--ink);color:var(--paper);border-style:solid;border-color:var(--ink)}
.rt-ace-btn:active{transform:scale(0.96) rotate(-0.5deg)}
@keyframes rt-popIn{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
.rt-acedlog{margin-top:0.75rem}
.rt-acedlog-title{font-family:var(--font);font-size:17px;font-weight:700;color:var(--gray1);display:inline-block;transform:rotate(-0.3deg);margin-bottom:8px}
.rt-acedlog-list{display:flex;flex-direction:column;gap:6px}
.rt-acedlog-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;background:var(--paper);border:1.5px solid var(--gray4);padding:0.45rem 0.85rem;position:relative;transform:rotate(-0.15deg)}
.rt-acedlog-row:nth-child(even){transform:rotate(0.2deg)}
.rt-acedlog-row::before{content:'';position:absolute;top:-1px;right:-1px;width:7px;height:7px;border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.rt-acedlog-topic{font-family:var(--font-body);font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-acedlog-date{font-family:var(--font-body);font-size:13px;color:var(--gray2);font-style:italic;white-space:nowrap}
.rt-acedlog-empty{font-family:var(--font-body);font-size:14px;color:var(--gray2);font-style:italic;padding:0.4rem 0.1rem}

@media (max-width: 768px) {
  .rt-wrap { padding: 1rem 0.75rem 1.5rem; }
  .rt-header { flex-direction: column; align-items: flex-start; margin-bottom: 1rem; }
  .rt-date { margin-left: 0; margin-top: 0.5rem; }
  .rt-stats { grid-template-columns: 1fr; gap: 8px; }
  .rt-tree-wrap { margin-bottom: 1rem; }
  svg { max-width: 100%; height: auto !important; }
  .rt-detail { min-height: 60px; padding: 0.75rem 0.8rem; }
  .rt-detail-name { font-size: 18px; }
  .rt-chips { gap: 6px; }
  .rt-chip { font-size: 12px; padding: 1px 8px; }
  .rt-acedlog-topic { max-width: 200px; }
}
`;

// ── Constants ────────────────────────────────────────────────────────────────
const NODE_R = 21;
// Fallback defaults only — real trees get dynamic levelCounts/levelY from buildRevisionTree()
const DEFAULT_LEVEL_Y = [32, 108, 196, 294];
const DEFAULT_LEVEL_COUNTS = [1, 2, 4, 8];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── Helpers ──────────────────────────────────────────────────────────────────
// levelCounts must be sized to however many levels the current course actually has —
// this is what makes node count/spacing dynamic instead of fixed at 15 (1+2+4+8).
function xFor(level, pos, levelCounts, svgW) { return (svgW / (levelCounts[level] + 1)) * (pos + 1); }
function findNode(nodes, seq) {
  if (seq === undefined || seq === null) {
    console.warn('findNode called with null/undefined seq — this should never happen');
    return undefined;
  }
  return nodes.find(n => n.seq === seq);
}
function isUnlocked(nodes, edges, node) {
  if (node.level === 0) return true;
  return edges.filter(([,t]) => t === node.seq).map(([s]) => s).some(pSeq => findNode(nodes, pSeq)?.done);
}
function todayStr() { const d = new Date(); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; }
function formatDate() { const d = new Date(); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`; }

function wobbleLine(x1, y1, x2, y2, amt = 2.5, seed = 0) {
  const r = s => (Math.abs(Math.sin(s) * 43758.5453) % 1);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1+x2)/2+(r(seed)-.5)*amt*2).toFixed(1)} ${((y1+y2)/2+(r(seed+1)-.5)*amt*2).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function sketchCirclePath(cx, cy, r, seed = 0) {
  return Array.from({length: 21}, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const rr = r + Math.sin(a*3.1+seed)*1.2 + Math.cos(a*5.7+seed)*0.7;
    return `${i===0?"M":"L"}${(cx+Math.cos(a)*rr).toFixed(1)} ${(cy+Math.sin(a)*rr).toFixed(1)}`;
  }).join(" ") + "Z";
}

// ── TreeNode ─────────────────────────────────────────────────────────────────
function TreeNode({ node, nodes, edges, animateId, onSelect, levelCounts, levelY, svgW }) {
  const x = xFor(node.level, node.pos, levelCounts, svgW), y = levelY[node.level];
  const unlocked = isUnlocked(nodes, edges, node);
  const visible = node.done || unlocked;
  const seed = node.seq * 1.7;
  const d = sketchCirclePath(x, y, NODE_R, seed);
  const cs = NODE_R * 0.38;
  const isNew = node.id === animateId;

  return (
    <g style={{ cursor: visible ? "pointer" : "default" }} onClick={() => visible && onSelect(node)}>
      {isNew && (
        <>
          {/* Ripple rings — a synced-in node gets two staggered pulses
              expanding outward from the node and fading, distinct from
              the steady dashed pulse used for merely-unlocked nodes. */}
          <circle cx={x} cy={y} r={NODE_R} fill="none" stroke="#1a1a18" strokeWidth="2">
            <animate attributeName="r" from={NODE_R} to={NODE_R * 2.4} dur="1.1s" begin="0.1s" fill="freeze" />
            <animate attributeName="opacity" from="0.7" to="0" dur="1.1s" begin="0.1s" fill="freeze" />
          </circle>
          <circle cx={x} cy={y} r={NODE_R} fill="none" stroke="#1a1a18" strokeWidth="1.5">
            <animate attributeName="r" from={NODE_R} to={NODE_R * 2.4} dur="1.1s" begin="0.4s" fill="freeze" />
            <animate attributeName="opacity" from="0.5" to="0" dur="1.1s" begin="0.4s" fill="freeze" />
          </circle>
          <text x={x} y={y - NODE_R - 8} textAnchor="middle" fontSize="13"
            fontFamily="Caveat, cursive" fontWeight="700" fill="#1a1a18" opacity="0">
            synced!
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.75;1"
              dur="1.5s" begin="0.1s" fill="freeze" />
          </text>
        </>
      )}
      {node.done ? (
        <>
          <path d={d} fill="#1a1a18" stroke="#1a1a18" strokeWidth="1.5"
            style={isNew ? { animation: "rt-popIn 0.35s ease forwards" } : undefined} />
          <path d={`M${x-cs} ${y} L${x-cs*.2} ${y+cs*.7} L${x+cs} ${y-cs*.6}`}
            fill="none" stroke="#faf8f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : unlocked ? (
        <path d={d} fill="#faf8f4" stroke="#1a1a18" strokeWidth="1.6" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.8s"
            repeatCount="indefinite" begin={`${(node.id*.35)%2.5}s`} />
        </path>
      ) : (
        <path d={d} fill="#f3f1eb" stroke="#ccc9c0" strokeWidth="1" strokeDasharray="2 5" />
      )}
      <text x={x} y={y+5} textAnchor="middle" fontSize="11" fontFamily="Caveat, cursive"
        fontWeight="700" fill={node.done ? "#faf8f4" : unlocked ? "#1a1a18" : "#aaa89f"}>
        {visible ? node.label : "?"}
      </text>
    </g>
  );
}

// ── TreeSVG ──────────────────────────────────────────────────────────────────
// nodes/edges/levelCounts/levelY all come from buildRevisionTree(materials, progress),
// so however many topics a course has, the tree grows/shrinks to match — nothing here
// is hardcoded to a 15-node (1+2+4+8) shape anymore.
export function TreeSVG({ nodes, edges, animateId, onSelectNode, levelCounts, levelY }) {
  const [svgW, setSvgW] = useState(1500);

  useEffect(() => {
    const updateWidth = () => {
      setSvgW(window.innerWidth < 768 ? Math.max(window.innerWidth * 1.5, 600) : 1500);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const counts = levelCounts?.length ? levelCounts : DEFAULT_LEVEL_COUNTS;
  const yPositions = levelY?.length ? levelY : DEFAULT_LEVEL_Y;
  const svgHeight = Math.max(...yPositions) + NODE_R + 32;

  const rules = [];
  for (let y = 18; y < svgHeight; y += 18)
    rules.push(<line key={y} x1={0} y1={y} x2={svgW} y2={y} stroke="#e8e5dc" strokeWidth="0.6" />);

  return (
    <svg width={svgW} height={svgHeight} viewBox={`0 0 ${svgW} ${svgHeight}`} display="block" style={{ maxWidth: "100%", height: "auto" }}>
      {rules}
      <line x1={26} y1={0} x2={26} y2={svgHeight} stroke="#f0c0b0" strokeWidth="1" />
      {edges.map(([fromId, toId], i) => {
        const from = findNode(nodes, fromId), to = findNode(nodes, toId);
        if (!from || !to) {
        console.warn('Edge lookup failed:', { fromId, toId, from, to });
        return null;
      } 
        const x1=xFor(from.level,from.pos,counts,svgW), y1=yPositions[from.level]+NODE_R;
        const x2=xFor(to.level,to.pos,counts,svgW),     y2=yPositions[to.level]-NODE_R;
        return (
          <path key={i} d={wobbleLine(x1,y1,x2,y2,3,i)} fill="none"
            stroke={from.done&&to.done?"#7a7870":"#ccc9c0"}
            strokeWidth={from.done&&to.done?1.5:1}
            strokeDasharray={from.done&&to.done?undefined:"4 3"} />
        );
      })}
      {nodes.map(node => (
        <TreeNode key={node.seq} node={node} nodes={nodes} edges={edges}
          animateId={animateId} onSelect={onSelectNode}
          levelCounts={counts} levelY={yPositions} svgW={svgW} />
      ))}
    </svg>
  );
}

// ── StatsBar ─────────────────────────────────────────────────────────────────
export function StatsBar({ nodes }) {
  const done = nodes.filter(n => n.done).length;
  return (
    <div className="rt-stats">
      <div className="rt-stat"><div className="rt-stat-label">done</div><div className="rt-stat-value">{done}</div></div>
      <div className="rt-stat"><div className="rt-stat-label">left</div><div className="rt-stat-value">{nodes.length-done}</div></div>
      <div className="rt-stat"><div className="rt-stat-value">{Math.round(done/nodes.length*100)}%</div><div className="rt-stat-label">progress</div></div>
    </div>
  );
}

// ── NodeDetail ───────────────────────────────────────────────────────────────
// Dynamic card driven by whichever node was last clicked in the tree
// (selectedNode, set by handleSelectNode in LiveRevisionTree). TreeNode only
// calls onSelect for visible nodes (node.done || unlocked — see isUnlocked),
// so by the time we get a node here it's always safe to show.
// completedDate is looked up by the caller from progress.completedTopics
// (joined on order, same convention as AcedLog) and passed in as a prop —
// this component doesn't know about progress shape at all.
// Strictly read-only: "done" reflects progress.currentOrderStep and nothing
// else. There is no ace-from-here action — acing only happens through the
// canonical flow (the other page's button → API → currentOrderStep), so the
// tree can never show a state the database doesn't also have.
export function NodeDetail({ node, completedDate }) {
  if (!node) {
    return (
      <div className="rt-detail">
        <div className="rt-detail-meta">tap a node above to see its details</div>
      </div>
    );
  }

  return (
    <div className="rt-detail highlight">
      <div className="rt-detail-name">{node.topic}</div>
      <div className="rt-detail-meta">
        {node.done
          ? completedDate
            ? `aced ${formatAcedDate(completedDate)}`
            : "aced — date not tracked yet"
          : "unlocked — not aced yet"}
      </div>
      <div className="rt-chips">
        <span className={`rt-chip ${node.done ? "done" : "amber"}`}>
          {node.done ? "done" : "unlocked"}
        </span>
      </div>
    </div>
  );
}

// ── AcedLog ──────────────────────────────────────────────────────────────────
// completedTopics comes from progress.completedTopics: [{ order, acedAt }],
// populated server-side when the /api/progress/ace route fires (see
// progress.js schema). Joined against `nodes` by `order` (not `id` or `seq` —
// same reasoning as everywhere else in this file: order is the only field
// both materials and progress agree on).
// Until the backend actually pushes to completedTopics, done nodes will
// still show up here with a "date not tracked yet" placeholder instead of
// silently disappearing — makes the gap obvious instead of hiding it.
export function AcedLog({ nodes, completedTopics = [] }) {
  const dateByOrder = new Map(completedTopics.map((c) => [c.order, c.acedAt]));
  

  const rows = nodes
    .filter((n) => n.done)
    .sort((a, b) => b.order - a.order) // most recently aced first
    .map((n) => ({ id: n.id, topic: n.topic, date: dateByOrder.get(n.order) }));
  
  

  return (
    <div className="rt-acedlog">
      <span className="rt-acedlog-title">aced log</span>
      {rows.length === 0 ? (
        <div className="rt-acedlog-empty">nothing aced yet — get to it!</div>
      ) : (
        <div className="rt-acedlog-list">
          {rows.map((r) => (

            <div className="rt-acedlog-row" key={r.id}>
              <span className="rt-acedlog-topic">{r.topic}</span>
              <span className="rt-acedlog-date">
                {r.date ? formatAcedDate(r.date) : "date not tracked yet"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatAcedDate(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "date not tracked yet";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}





export default function Dashboard() {
  const { courseCode } = useParams();
  const [activeKey, setActiveKey] = useState(courseCode);
  const { user, loading } = useUser();

  return (
    <div style={{ display: "flex", minHeight: "100vh", minWidth: "100vw", background: "#F7F6F2", flexDirection: "row" }}>
      <SideNav />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }} className="rt-root">
        <style>{CSS}</style>
        <div className="rt-tabs" style={{ padding: "1rem 1rem 0" }}>
          {user.enRolledCourses.map((code) => (
            <button
              key={code}
              className={`rt-tab${code === activeKey ? " active" : ""}`}
              onClick={() => setActiveKey(code)}
            >
              {code}
            </button>
          ))}
        </div>
        <LiveRevisionTree courseCode={activeKey} />
      </div>
    </div>
  );
}