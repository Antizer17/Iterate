import { useState, useRef, useCallback, useEffect } from "react";

// ── Design tokens (scoped to .rt-root) ──────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.rt-root *{box-sizing:border-box;margin:0;padding:0}
.rt-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
}
.rt-wrap{padding:1.25rem 1rem 2rem}
.rt-header{display:flex;align-items:center;gap:12px;margin-bottom:1.25rem;border-bottom:1.5px solid var(--gray4);padding-bottom:8px}
.rt-title{font-family:var(--font);font-size:22px;font-weight:700;transform:rotate(-0.4deg);display:inline-block}
.rt-date{font-family:var(--font);font-size:14px;color:var(--gray2);margin-left:auto;font-style:italic}
.rt-rule{flex:1;border:none;border-top:1px dashed var(--gray4);margin:0 8px}
.rt-tabs{display:flex;gap:10px;margin-bottom:1.25rem;flex-wrap:wrap}
.rt-tab{font-family:var(--font);font-size:16px;font-weight:600;padding:4px 14px;background:var(--paper);color:var(--gray2);border:1.5px solid var(--gray4);cursor:pointer;transition:all 0.12s;transform:rotate(-0.3deg)}
.rt-tab.active{background:var(--ink);color:var(--paper);border-color:var(--ink);transform:rotate(0.2deg)}
.rt-tab:hover:not(.active){background:var(--paper3);color:var(--gray1)}
.rt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1.25rem}
.rt-stat{background:var(--paper);border:1.5px solid var(--gray4);padding:0.65rem 0.85rem;position:relative}
.rt-stat:nth-child(1){transform:rotate(-0.5deg)}.rt-stat:nth-child(2){transform:rotate(0.3deg)}.rt-stat:nth-child(3){transform:rotate(-0.2deg)}
.rt-stat::before{content:'';position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.rt-stat-label{font-family:var(--font);font-size:13px;color:var(--gray2);margin-bottom:1px}
.rt-stat-value{font-family:var(--font);font-size:26px;font-weight:700}
.rt-tree-wrap{overflow-x:auto;padding:0.5rem 0 0.75rem;margin-bottom:0.75rem}
.rt-detail{background:var(--paper);border:1.5px solid var(--gray4);padding:0.9rem 1rem;margin-top:0.5rem;min-height:72px;position:relative;transform:rotate(-0.15deg);transition:border-color 0.3s}
.rt-detail::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gray4)}
.rt-detail.highlight{border-color:var(--ink)}.rt-detail.highlight::after{background:var(--ink)}
.rt-detail-name{font-family:var(--font);font-size:20px;font-weight:700;margin-bottom:2px}
.rt-detail-meta{font-family:var(--font);font-size:14px;color:var(--gray2);font-style:italic}
.rt-chips{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center}
.rt-chip{font-family:var(--font);font-size:13px;padding:2px 10px;background:var(--paper2);border:1px solid var(--gray4);color:var(--gray1)}
.rt-chip.done{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.rt-chip.amber{background:var(--paper2);color:var(--gray1);border:1px dashed var(--gray3)}
.rt-ace-btn{font-family:var(--font);font-size:14px;font-weight:700;padding:4px 14px;background:var(--paper);border:1.5px dashed var(--gray2);color:var(--gray1);cursor:pointer;transition:all 0.12s;transform:rotate(-0.5deg)}
.rt-ace-btn:hover{background:var(--ink);color:var(--paper);border-style:solid;border-color:var(--ink)}
.rt-ace-btn:active{transform:scale(0.96) rotate(-0.5deg)}
@keyframes rt-popIn{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
`;

// ── Constants ────────────────────────────────────────────────────────────────
const SVG_W = 660, SVG_H = 350, NODE_R = 21;
const LEVEL_Y = [32, 108, 196, 294];
const LEVEL_COUNTS = [1, 2, 4, 8];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── Helpers ──────────────────────────────────────────────────────────────────
function xFor(level, pos) { return (SVG_W / (LEVEL_COUNTS[level] + 1)) * (pos + 1); }
function findNode(nodes, id) { return nodes.find(n => n.id === id); }
function isUnlocked(nodes, edges, node) {
  if (node.level === 0) return true;
  return edges.filter(([,t]) => t === node.id).map(([s]) => s).some(pid => findNode(nodes, pid)?.done);
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
function TreeNode({ node, nodes, edges, animateId, onSelect }) {
  const x = xFor(node.level, node.pos), y = LEVEL_Y[node.level];
  const unlocked = isUnlocked(nodes, edges, node);
  const visible = node.done || unlocked;
  const seed = node.id * 1.7;
  const d = sketchCirclePath(x, y, NODE_R, seed);
  const cs = NODE_R * 0.38;
  const isNew = node.id === animateId;

  return (
    <g style={{ cursor: visible ? "pointer" : "default" }} onClick={() => visible && onSelect(node)}>
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
export function TreeSVG({ nodes, edges, animateId, onSelectNode }) {
  const rules = [];
  for (let y = 18; y < SVG_H; y += 18)
    rules.push(<line key={y} x1={0} y1={y} x2={SVG_W} y2={y} stroke="#e8e5dc" strokeWidth="0.6" />);

  return (
    <svg width={SVG_W} height={SVG_H} display="block">
      {rules}
      <line x1={26} y1={0} x2={26} y2={SVG_H} stroke="#f0c0b0" strokeWidth="1" />
      {edges.map(([fromId, toId], i) => {
        const from = findNode(nodes, fromId), to = findNode(nodes, toId);
        if (!from || !to) return null;
        const x1=xFor(from.level,from.pos), y1=LEVEL_Y[from.level]+NODE_R;
        const x2=xFor(to.level,to.pos),     y2=LEVEL_Y[to.level]-NODE_R;
        return (
          <path key={i} d={wobbleLine(x1,y1,x2,y2,3,i)} fill="none"
            stroke={from.done&&to.done?"#7a7870":"#ccc9c0"}
            strokeWidth={from.done&&to.done?1.5:1}
            strokeDasharray={from.done&&to.done?undefined:"4 3"} />
        );
      })}
      {nodes.map(node => (
        <TreeNode key={node.id} node={node} nodes={nodes} edges={edges}
          animateId={animateId} onSelect={onSelectNode} />
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

// ── CourseTabs ───────────────────────────────────────────────────────────────
export function CourseTabs({ courses, activeKey, onChange }) {
  return (
    <div className="rt-tabs">
      {Object.entries(courses).map(([key, val]) => (
        <button key={key} className={`rt-tab${key===activeKey?" active":""}`} onClick={() => onChange(key)}>
          {key} · {val.label}
        </button>
      ))}
    </div>
  );
}

// ── NodeDetail ───────────────────────────────────────────────────────────────
export function NodeDetail({ node, completedDate, onAce }) {
  const [hl, setHl] = useState(false);
  useEffect(() => {
    if (!node) return;
    setHl(true);
    const t = setTimeout(() => setHl(false), 900);
    return () => clearTimeout(t);
  }, [node?.id]);

  if (!node) return (
    <div className="rt-detail"><div className="rt-detail-name">↑ tap a node to inspect</div></div>
  );

  const chips = [
    { text: node.done ? "✓ done" : "up next", cls: node.done ? "done" : "amber" },
    { text: `level ${node.level+1}`, cls: "" },
    ...(completedDate ? [{ text: completedDate, cls: "" }] : []),
  ];

  return (
    <div className={`rt-detail${hl?" highlight":""}`}>
      <div className="rt-detail-name">{node.topic}</div>
      <div className="rt-detail-meta">
        {node.done ? (completedDate ? `completed on ${completedDate}` : "completed") : "up next — ace this session to unlock the next branch"}
      </div>
      <div className="rt-chips">
        {chips.map((c, i) => (
          <span key={i} className={`rt-chip${c.cls?" "+c.cls:""}`}
            style={{ transform: `rotate(${[-0.5,0.4,-0.3,0.6][i%4]}deg)` }}>
            {c.text}
          </span>
        ))}
        {!node.done && <button className="rt-ace-btn" onClick={() => onAce(node)}>✓ aced it</button>}
      </div>
    </div>
  );
}

// ── useRevisionTree hook ─────────────────────────────────────────────────────
export function useRevisionTree(initialCourses) {
  const [courses, setCourses] = useState(() => JSON.parse(JSON.stringify(initialCourses)));
  const [activeKey, setActiveKey] = useState(() => Object.keys(initialCourses)[0]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [animateId, setAnimateId] = useState(null);
  const sessionDates = useRef({});

  const activeCourse = courses[activeKey];

  const handleSelectNode = useCallback((node) => {
    setSelectedNode(activeCourse.nodes.find(n => n.id === node.id) ?? node);
  }, [activeCourse]);

  const handleAce = useCallback((node) => {
    const date = todayStr();
    setCourses(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const n = next[activeKey].nodes.find(n => n.id === node.id);
      if (n) n.done = true;
      return next;
    });
    if (!sessionDates.current[activeKey]) sessionDates.current[activeKey] = {};
    sessionDates.current[activeKey][node.id] = date;
    setAnimateId(node.id);
    setTimeout(() => setAnimateId(null), 700);
    setSelectedNode(prev => prev?.id === node.id ? { ...prev, done: true } : prev);
  }, [activeKey]);

  const completedDate = selectedNode
    ? (sessionDates.current[activeKey]?.[selectedNode.id] ?? courses[activeKey]?.completedDates?.[selectedNode.id] ?? null)
    : null;

  return {
    courses, activeKey, setActiveKey,
    activeNodes: activeCourse.nodes,
    activeEdges: activeCourse.edges,
    selectedNode, completedDate, animateId,
    handleSelectNode, handleAce,
  };
}

// ── RevisionTree (all-in-one) ────────────────────────────────────────────────
export function RevisionTree({ courses: initialCourses, title = "revision tree" }) {
  const {
    courses, activeKey, setActiveKey,
    activeNodes, activeEdges,
    selectedNode, completedDate, animateId,
    handleSelectNode, handleAce,
  } = useRevisionTree(initialCourses);

  return (
    <div className="rt-root">
      <style>{CSS}</style>
      <div className="rt-wrap">
        <div className="rt-header">
          <span className="rt-title">{title}</span>
          <hr className="rt-rule" />
          <span className="rt-date">{formatDate()}</span>
        </div>
        <CourseTabs courses={courses} activeKey={activeKey} onChange={setActiveKey} />
        <StatsBar nodes={activeNodes} />
        <div className="rt-tree-wrap">
          <TreeSVG nodes={activeNodes} edges={activeEdges} animateId={animateId} onSelectNode={handleSelectNode} />
        </div>
        <NodeDetail node={selectedNode} completedDate={completedDate} onAce={handleAce} />
      </div>
    </div>
  );
}

// ── Sample data + default export (preview entry point) ───────────────────────
const SAMPLE_COURSES = {
  CSE221: {
    label: "Algorithms",
    nodes: [
      {id:1,label:"Intro", topic:"Introduction to Algorithms",level:0,pos:0,done:true},
      {id:2,label:"D&C",  topic:"Divide & Conquer",          level:1,pos:0,done:true},
      {id:3,label:"Sort", topic:"Merge & Quick Sort",        level:1,pos:1,done:true},
      {id:4,label:"Heap", topic:"Heaps & Priority Queues",   level:2,pos:0,done:true},
      {id:5,label:"Hash", topic:"Hashing",                   level:2,pos:1,done:true},
      {id:6,label:"BST",  topic:"Binary Search Trees",       level:2,pos:2,done:false},
      {id:7,label:"Grph", topic:"Graph Basics",              level:2,pos:3,done:false},
      {id:8,label:"BFS",  topic:"Breadth First Search",      level:3,pos:0,done:false},
      {id:9,label:"DFS",  topic:"Depth First Search",        level:3,pos:1,done:false},
      {id:10,label:"DP",  topic:"Dynamic Programming",       level:3,pos:2,done:false},
      {id:11,label:"Grdy",topic:"Greedy Algorithms",         level:3,pos:3,done:false},
      {id:12,label:"Flow",topic:"Network Flow",              level:3,pos:4,done:false},
      {id:13,label:"NP",  topic:"NP Completeness",           level:3,pos:5,done:false},
      {id:14,label:"Apx", topic:"Approximation Algorithms",  level:3,pos:6,done:false},
      {id:15,label:"Revw",topic:"Final Review",              level:3,pos:7,done:false},
    ],
    edges:[[1,2],[1,3],[2,4],[2,5],[3,6],[3,7],[4,8],[4,9],[5,10],[5,11],[6,12],[6,13],[7,14],[7,15]],
    completedDates:{1:"May 2",2:"May 8",3:"May 14",4:"May 21",5:"May 28"},
  },
  CSE331: {
    label: "Data Structures",
    nodes: [
      {id:1,label:"Array",topic:"Arrays & Strings",    level:0,pos:0,done:true},
      {id:2,label:"List", topic:"Linked Lists",        level:1,pos:0,done:true},
      {id:3,label:"Stack",topic:"Stacks & Queues",     level:1,pos:1,done:true},
      {id:4,label:"Tree", topic:"Binary Trees",        level:2,pos:0,done:true},
      {id:5,label:"BST",  topic:"BST Operations",      level:2,pos:1,done:false},
      {id:6,label:"Heap", topic:"Heap Operations",     level:2,pos:2,done:false},
      {id:7,label:"Hash", topic:"Hash Tables",         level:2,pos:3,done:false},
      {id:8,label:"AVL",  topic:"AVL Trees",           level:3,pos:0,done:false},
      {id:9,label:"RBT",  topic:"Red-Black Trees",     level:3,pos:1,done:false},
      {id:10,label:"Trie",topic:"Tries",               level:3,pos:2,done:false},
      {id:11,label:"Seg", topic:"Segment Trees",       level:3,pos:3,done:false},
      {id:12,label:"Grph",topic:"Graph Structures",    level:3,pos:4,done:false},
      {id:13,label:"Dijk",topic:"Dijkstra's Algorithm",level:3,pos:5,done:false},
      {id:14,label:"Unin",topic:"Union Find",          level:3,pos:6,done:false},
      {id:15,label:"Revw",topic:"Final Review",        level:3,pos:7,done:false},
    ],
    edges:[[1,2],[1,3],[2,4],[2,5],[3,6],[3,7],[4,8],[4,9],[5,10],[5,11],[6,12],[6,13],[7,14],[7,15]],
    completedDates:{1:"May 3",2:"May 10",3:"May 17",4:"Jun 1"},
  },
};

export default function Dashboard() {
  return <RevisionTree courses={SAMPLE_COURSES} />;
}
