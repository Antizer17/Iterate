import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import {SideNav} from "./iterate-app.jsx"

 
// ── Design tokens (scoped to .cv-root) ──────────────────────────────────────
// Shares the same variable names / font as RevisionTree.jsx's CSS export so
// this page feels like the same app. Safe to render alongside rt-root CSS —
// selectors are all cv- prefixed.

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.cv-root *{box-sizing:border-box;margin:0;padding:0}
.cv-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --amber:#b5842a;--ok:#5f8d63;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  position:relative;overflow:hidden;
}
.cv-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto;position:relative;min-height:200px}
 
/* ── Vault door intro ── */
.cv-doors{position:fixed;inset:0;z-index:20;display:flex;pointer-events:none}
.cv-door{flex:1;background:
    repeating-linear-gradient(135deg, var(--ink) 0 2px, #262622 2px 4px);
  position:relative;transition:transform 0.9s cubic-bezier(.7,0,.2,1);transition-delay:0.05s;
}
.cv-doors.open .cv-door-l{transform:translateX(-101%)}
.cv-doors.open .cv-door-r{transform:translateX(101%)}
 
/* ── Vault wheel: spins in place over the door seam, then fades as the
   doors swing open ── */
.cv-wheel-wrap{position:fixed;top:50%;left:50%;width:132px;height:132px;z-index:25;
  transform:translate(-50%,-50%);pointer-events:none;
  animation:cv-wheelspin 1.05s cubic-bezier(.55,0,.2,1) forwards;}
.cv-wheel-wrap.settle{animation:cv-wheelfade 0.35s ease forwards;}
@keyframes cv-wheelspin{
  0%{transform:translate(-50%,-50%) rotate(0deg)}
  100%{transform:translate(-50%,-50%) rotate(830deg)}
}
@keyframes cv-wheelfade{
  0%{opacity:1;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0;transform:translate(-50%,-50%) scale(0.85)}
}
 
/* ── Seam flash: a bright vertical crack of light that flares along the
   door seam right before the doors actually swing open ── */
.cv-seam-flash{position:fixed;top:0;bottom:0;left:50%;width:4px;
  background:#fff;transform:translateX(-50%);z-index:22;
  opacity:0;pointer-events:none;
  box-shadow:0 0 22px 4px rgba(255,255,255,0.85), 0 0 60px 10px rgba(255,255,255,0.35);}
.cv-seam-flash.flash{animation:cv-seamflash 0.4s ease-out forwards;}
@keyframes cv-seamflash{
  0%{opacity:0;width:1px}
  35%{opacity:1;width:4px}
  100%{opacity:0;width:6px}
}
 
.cv-header{text-align:left;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1.5px solid var(--gray4)}
.cv-title{font-family:var(--font);font-size:44px;font-weight:700;transform:rotate(-0.5deg);display:inline-block}
.cv-sub{font-family:var(--font);font-size:16px;color:var(--gray2);font-style:italic;margin-top:8px}
.cv-rule{flex:1;border:none;border-top:1px dashed var(--gray4);margin:0 8px}
.cv-cracked-tally{font-family:var(--font);font-size:15px;color:var(--gray2);white-space:nowrap;margin-left:auto}
.cv-cracked-tally b{color:var(--ink)}
 
.cv-controls{display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;align-items:center}
.cv-search{font-family:var(--font);font-size:16px;padding:5px 12px;background:var(--paper);
  border:1.5px solid var(--gray4);color:var(--ink);flex:1;min-width:140px;transform:rotate(-0.2deg)}
.cv-search:focus{outline:none;border-color:var(--ink)}
.cv-sort{font-family:var(--font);font-size:15px;padding:5px 10px;background:var(--paper);
  border:1.5px solid var(--gray4);color:var(--gray1);cursor:pointer}
.cv-addbtn{font-family:var(--font);font-size:16px;font-weight:700;padding:5px 16px;
  background:var(--ink);color:var(--paper);border:1.5px solid var(--ink);cursor:pointer;
  transition:transform 0.12s;transform:rotate(-0.4deg)}
.cv-addbtn:hover{transform:rotate(-0.4deg) scale(1.04)}
.cv-addbtn:active{transform:rotate(-0.4deg) scale(0.96)}
 
.cv-tabs{display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap}
.cv-tab{font-family:var(--font);font-size:15px;font-weight:600;padding:3px 12px;background:var(--paper);
  color:var(--gray2);border:1.5px solid var(--gray4);cursor:pointer;transition:all .12s;transform:rotate(-0.3deg)}
.cv-tab.active{background:var(--ink);color:var(--paper);border-color:var(--ink);transform:rotate(0.2deg)}
.cv-tab:hover:not(.active){background:var(--paper3);color:var(--gray1)}
 
/* ── Add form ── */
.cv-form{background:var(--paper2);border:1.5px dashed var(--gray3);padding:0.85rem 1rem;
  margin-bottom:1rem;transform:rotate(-0.15deg);animation:cv-popIn .25s ease}
.cv-form-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.cv-form input[type=text],.cv-form textarea,.cv-form select{
  font-family:var(--font);font-size:16px;padding:5px 10px;background:var(--paper);
  border:1.5px solid var(--gray4);color:var(--ink)}
.cv-form input[type=text]{flex:2;min-width:160px}
.cv-form select{flex:1;min-width:100px}
.cv-form textarea{width:100%;min-height:44px;resize:vertical;font-size:15px}
.cv-level-picker{display:flex;gap:6px;align-items:center}
.cv-level-label{font-size:14px;color:var(--gray2);margin-right:4px}
.cv-dot{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--gray3);cursor:pointer;background:var(--paper)}
.cv-dot.filled{background:var(--ink);border-color:var(--ink)}
.cv-form-actions{display:flex;gap:8px;justify-content:flex-end}
.cv-form-submit{font-family:var(--font);font-weight:700;font-size:15px;padding:4px 14px;
  background:var(--ink);color:var(--paper);border:1.5px solid var(--ink);cursor:pointer}
.cv-form-cancel{font-family:var(--font);font-size:15px;padding:4px 14px;background:transparent;
  color:var(--gray2);border:1.5px solid transparent;cursor:pointer}
.cv-form-cancel:hover{color:var(--ink)}
 
/* ── Cards grid ── */
.cv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
@keyframes cv-popIn{0%{transform:scale(.6) rotate(var(--r,0deg));opacity:0}60%{transform:scale(1.06) rotate(var(--r,0deg))}100%{transform:scale(1) rotate(var(--r,0deg));opacity:1}}
@keyframes cv-crumple{0%{transform:scale(1) rotate(var(--r,0deg));opacity:1}40%{transform:scale(.85) rotate(calc(var(--r,0deg) + 8deg));opacity:.9}100%{transform:scale(.2) rotate(calc(var(--r,0deg) + 45deg));opacity:0}}
@keyframes cv-jitter{0%,100%{transform:translate(0,0) rotate(var(--r,0deg))}25%{transform:translate(0.6px,-0.4px) rotate(calc(var(--r,0deg) - 0.3deg))}75%{transform:translate(-0.5px,0.5px) rotate(calc(var(--r,0deg) + 0.3deg))}}
.cv-card{--r:0deg;background:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%);
  border:1.5px solid var(--gray4);border-radius:2px 14px 4px 12px;padding:1rem 1rem 0.85rem;
  position:relative;transform:rotate(var(--r));animation:cv-popIn .3s ease both;
  display:flex;flex-direction:column;min-height:172px;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25);
  transition:box-shadow .15s ease, transform .15s ease}
.cv-card:hover{box-shadow:3px 5px 0 rgba(26,26,24,0.07), 0 12px 24px -10px rgba(26,26,24,0.28)}
.cv-card::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.cv-card.high{animation:cv-popIn .3s ease both, cv-jitter 3.2s ease-in-out infinite}
.cv-card.cracking{animation:cv-crumple .45s ease forwards !important}
.cv-card.solved{border-color:var(--ok);border-style:solid;background:linear-gradient(178deg, var(--paper) 0%, #f1f6f1 100%)}
.cv-solved-badge{align-self:flex-start;display:inline-flex;align-items:center;gap:3px;font-size:12px;
  color:var(--ok);background:rgba(95,141,99,0.14);border:1px solid rgba(95,141,99,0.5);
  padding:1px 8px 1px 6px;border-radius:20px;margin-bottom:8px;transform:rotate(-1.5deg)}
.cv-remove-btn{position:absolute;top:-9px;right:-9px;width:23px;height:23px;border-radius:50%;
  border:1.5px solid var(--gray4);background:var(--paper);color:var(--gray2);font-size:14px;
  line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 2px 5px rgba(26,26,24,0.15);transition:all .12s}
.cv-remove-btn:hover{background:#c0433d;border-color:#c0433d;color:#fff;transform:rotate(90deg) scale(1.08)}
.cv-remove-btn:active{transform:rotate(90deg) scale(0.92)}
.cv-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:10px}
.cv-card-topic{font-family:var(--font);font-size:19px;font-weight:700;line-height:1.15}
.cv-scribble{flex-shrink:0}
/* Draws the path in (0→55%), holds it fully drawn, flicks invisible to
   reset the dash offset without a visible jump, then fades back in blank
   to redraw on the next loop. --dash-len is set per-instance from the
   path's real measured length. */
@keyframes cv-scribble-draw{
  0%{stroke-dashoffset:var(--dash-len);opacity:1}
  55%{stroke-dashoffset:0;opacity:1}
  70%{stroke-dashoffset:0;opacity:1}
  80%{stroke-dashoffset:0;opacity:0}
  82%{stroke-dashoffset:var(--dash-len);opacity:0}
  100%{stroke-dashoffset:var(--dash-len);opacity:1}
}
.cv-scribble-path{animation:cv-scribble-draw 2.6s ease-in-out infinite}
.cv-card-course{display:inline-block;font-size:12.5px;padding:2px 10px;background:var(--paper3);
  border:1px solid var(--gray4);border-radius:20px;color:var(--gray1);margin-bottom:8px;
  align-self:flex-start;letter-spacing:.2px}
.cv-card-note{font-size:14.5px;color:var(--gray1);font-style:italic;margin:0 0 10px;
  padding-left:8px;border-left:2px solid var(--gray4);
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.cv-card-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;
  margin-top:auto;padding-top:8px;border-top:1px dashed var(--gray4)}
.cv-card-date{font-size:12.5px;color:var(--gray3)}
.cv-crack-btn{font-family:var(--font);font-size:14.5px;font-weight:700;padding:4px 14px;
  background:var(--paper);border:1.5px dashed var(--gray2);color:var(--gray1);cursor:pointer;
  border-radius:3px;transition:all .12s}
.cv-crack-btn:hover{background:var(--ink);color:var(--paper);border-style:solid;border-color:var(--ink);transform:translateY(-1px)}
.cv-crack-btn:active{transform:scale(0.94)}

/* ── Flipped face: resources list ── */
.cv-card-back-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;
  padding-bottom:8px;border-bottom:1px dashed var(--gray4);width:100%}
.cv-card-back-title{font-size:22px;font-weight:700}
.cv-resource-list{display:flex;flex-direction:column;gap:6px;width:100%;flex:1}
.cv-resource-row{display:flex;align-items:center;gap:8px;padding:6px 9px;border:1px solid var(--gray4);
  background:var(--paper2);border-radius:9px;text-decoration:none;color:var(--ink);font-size:14.5px;
  transition:all .12s;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cv-resource-row:hover{background:var(--ink);color:var(--paper);border-color:var(--ink);transform:translateX(2px)}
.cv-resource-row .cv-play{flex-shrink:0;width:15px;height:15px;display:flex;align-items:center;justify-content:center}
.cv-resource-empty{font-size:14px;color:var(--gray3);font-style:italic;text-align:center;
  padding:18px 8px;flex:1;display:flex;align-items:center;justify-content:center}
.cv-back-btn{align-self:center;font-family:var(--font);font-size:14.5px;font-weight:700;
  padding:4px 18px;margin-top:12px;background:transparent;border:1.5px solid var(--gray3);
  color:var(--gray2);border-radius:14px;cursor:pointer;transition:all .12s}
.cv-back-btn:hover{border-color:var(--ink);color:var(--ink)}
 
.cv-empty{border:1.5px dashed var(--gray3);padding:2rem 1rem;text-align:center;
  color:var(--gray2);font-style:italic;font-size:17px;transform:rotate(-0.2deg)}
`;
 
// ── Constants ────────────────────────────────────────────────────────────────
// Matches the enum on the User schema's enRolledCourses field.
const COURSE_CODES = ["CSE111","CSE220","CSE221","CSE370","CSE321","CSE421","CSE470","CSE422","CSE471"];
 
// ── Sketch helpers (same wobble approach as RevisionTree.jsx) ───────────────
function confusionScribble(level=5) {
  // More loops + wider wobble = more tangled = more confused. level: 1-5.
  const loops = 1 + level * 0.6;
  const pts = 48;
  const r = 9;
  let d = "";
  for (let i = 0; i <= pts; i++) {
    const t = i / pts;
    const a = t * Math.PI * 2 * loops;
    const wobble = Math.sin(a * 2.3 ) * (level * 0.9) + Math.cos(a * 3.1 ) * (level * 0.5);
    const rr = r * (0.35 + t * 0.65) + wobble;
    d += `${i === 0 ? "M" : "L"}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `;
  }
  return d;
}
 
function ConfusionScribble({ level, seed = 0 }) {
  const d = useMemo(() => confusionScribble(level), [level]);
  const pathRef = useRef(null);
  const [dashLen, setDashLen] = useState(null);

  // Measure the real path length so stroke-dasharray/dashoffset line up
  // exactly — a fixed guessed length would draw too fast/slow or leave a
  // gap, since it depends on `level` (more loops = longer path).
  useLayoutEffect(() => {
    if (pathRef.current) {
      setDashLen(pathRef.current.getTotalLength());
    }
  }, [d]);

  return (
    <svg width="26" height="26" viewBox="-13 -13 26 26" className="cv-scribble">
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#000"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={dashLen ? "cv-scribble-path" : undefined}
        style={
          dashLen
            ? { "--dash-len": dashLen, strokeDasharray: dashLen, strokeDashoffset: dashLen }
            : { opacity: 0 } // hidden for the one frame before length is measured
        }
      />
    </svg>
  );
}
 
function timeAgo(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
 
// ── Vault doors intro ────────────────────────────────────────────────────────
// The wheel spins in place over the seam; once it's spun down (settle=true)
// it fades out and the doors swing open, like a handle being cranked before
// the gate releases.
function VaultWheel({ settle }) {
  const spokes = Array.from({ length: 6 }, (_, i) => (i / 6) * 360);
  const rivets = Array.from({ length: 20 }, (_, i) => (i / 20) * 360);
  return (
    <div className={`cv-wheel-wrap${settle ? " settle" : ""}`} aria-hidden="true">
      <svg width="132" height="132" viewBox="-60 -60 120 120">
        {/* outer knurled rim — short radial teeth like a valve wheel */}
        {rivets.map((deg) => (
          <line key={`rv-${deg}`} x1="0" y1="-51" x2="0" y2="-58"
            stroke="var(--gray2)" strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${deg})`} />
        ))}
        <circle r="53" fill="none" stroke="var(--gray3)" strokeWidth="3.5" />
        <circle r="45" fill="none" stroke="var(--gray4)" strokeWidth="1.5" />

        {/* spokes with T-shaped grip bars, like a ship/safe wheel */}
        {spokes.map((deg) => (
          <g key={`sp-${deg}`} transform={`rotate(${deg})`}>
            <line x1="0" y1="-15" x2="0" y2="-41" stroke="var(--gray2)" strokeWidth="6.5" strokeLinecap="round" />
            <line x1="-9" y1="-41" x2="9" y2="-41" stroke="var(--ink)" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        ))}

        {/* central bolted hub */}
        <circle r="17" fill="var(--paper2)" stroke="var(--ink)" strokeWidth="3" />
        <circle r="17" fill="none" stroke="var(--gray3)" strokeWidth="1" strokeDasharray="2 3.4" />
        <circle r="6.5" fill="var(--ink)" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--paper2)" strokeWidth="2" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--paper2)" strokeWidth="2" />
      </svg>
    </div>
  );
}
 
function VaultDoors({ open, wheelSettle }) {
  // The flash rides on wheelSettle rather than `open`: it needs to fire the
  // instant the wheel finishes spinning down, so the light seam is already
  // flaring by the time the doors actually start their swing a beat later.
  return (
    <>
      <div className={`cv-doors${open ? " open" : ""}`} aria-hidden="true">
        <div className="cv-door cv-door-l" />
        <div className="cv-door cv-door-r" />
      </div>
      <div className={`cv-seam-flash${wheelSettle ? " flash" : ""}`} aria-hidden="true" />
      <VaultWheel settle={wheelSettle} />
    </>
  );
}
 
// ── Add topic form ───────────────────────────────────────────────────────────
function AddTopicForm({ onAdd, onCancel, defaultCourse }) {
  const [topic, setTopic] = useState("");
  const [course, setCourse] = useState(defaultCourse || COURSE_CODES[0]);
  const [level, setLevel] = useState(3);
  const [note, setNote] = useState("");
 
  const submit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onAdd({
      id: `local-${Date.now()}`,
      topic: topic.trim(),
      courseCode: course,
      confusionLevel: level,
      note: note.trim(),
      addedAt: new Date().toISOString(),
      resolved: false,
    });
    setTopic(""); setNote(""); setLevel(3);
  };
 
  return (
    <form className="cv-form" onSubmit={submit}>
      <div className="cv-form-row">
        <input
          type="text" placeholder="what's confusing you?"
          value={topic} onChange={(e) => setTopic(e.target.value)} autoFocus
        />
        <select value={course} onChange={(e) => setCourse(e.target.value)}>
          {COURSE_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="cv-form-row">
        <textarea
          placeholder="optional note — what specifically tripped you up?"
          value={note} onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="cv-form-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="cv-level-picker">
          <span className="cv-level-label">how confused</span>
          {[1,2,3,4,5].map((n) => (
            <div
              key={n}
              className={`cv-dot${n <= level ? " filled" : ""}`}
              onClick={() => setLevel(n)}
              role="button"
              aria-label={`confusion level ${n}`}
            />
          ))}
        </div>
        <div className="cv-form-actions">
          <button type="button" className="cv-form-cancel" onClick={onCancel}>cancel</button>
          <button type="submit" className="cv-form-submit">drop it in the vault</button>
        </div>
      </div>
    </form>
  );
}
 
// ── Accessors ────────────────────────────────────────────────────────────────
// Real fetched items are shaped like { moduleId: { topic, courseCode, confusionLevel }, addedAt },
// vs demo items which are flat. These read either shape so filtering/sorting
// works regardless of which data source is active.
function getTopicText(item) { return item.moduleId?.topic ?? item.topic ?? ""; }
function getCourseCode(item) { return item.moduleId?.courseCode ?? item.courseCode ?? ""; }
function getConfusionLevel(item) { return item.moduleId?.confusionLevel ?? item.confusionLevel ?? 0; }
function getId(item) {
  return item.id ?? item._id ?? item.moduleId?._id ?? getTopicText(item);
}
function getNote(item) { return item.note ?? item.moduleId?.note ?? ""; }
function getResolved(item) { return item.resolved ?? item.moduleId?.resolved ?? false; }

// ── Card ─────────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg className="cv-play" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v11l10-5.5z" />
    </svg>
  );
}

function ConfusedCard({ item, cracking, viewMode = null, onToggle, resolved = false, onRemove }) {
  // Keying the inner face on `viewMode` re-triggers cv-popIn (already used
  // for cards entering the grid) every time it flips, so the swap between
  // "topic" and "resources" gets the same snappy little bounce instead of
  // an instant, jarring content swap.
  const cardClass = `cv-card${cracking ? " cracking" : ""}${resolved ? " solved" : ""}`;

  if (!viewMode) {
    return (
      <div className={cardClass} style={cracking ? undefined : { animation: "cv-popIn .28s ease both" }}>
        {resolved && (
          <button
            className="cv-remove-btn"
            onClick={onRemove}
            title="clear this — it's solved"
            aria-label="remove solved topic"
          >
            ×
          </button>
        )}
        {resolved && <span className="cv-solved-badge">✓ solved</span>}
        <div className="cv-card-top">
          <span className="cv-card-topic">{getTopicText(item)}</span>
          <ConfusionScribble level={getConfusionLevel(item)} />
        </div>
        <span className="cv-card-course">{getCourseCode(item)}</span>
        {getNote(item) && <p className="cv-card-note">{getNote(item)}</p>}
        <div className="cv-card-foot">
          <span className="cv-card-date">{timeAgo(item.addedAt)}</span>
          <button className="cv-crack-btn" onClick={onToggle}>resources</button>
        </div>
      </div>
    );
  } else {
    const resources = item.resources ?? [];
    return (
      <div className={cardClass} style={cracking ? undefined : { alignItems: "center", animation: "cv-popIn .28s ease both" }}>
        <div className="cv-card-back-head">
          <span className="cv-card-back-title">resources</span>
          <ConfusionScribble level={getConfusionLevel(item)} />
        </div>
        {resources.length > 0 ? (
          <div className="cv-resource-list">
            {resources.map((res, i) => (
              <a className="cv-resource-row" key={res.url ?? i} href={res.url} target="_blank" rel="noreferrer">
                <PlayIcon />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{res.title}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="cv-resource-empty">no videos found yet</div>
        )}
        <button className="cv-back-btn" onClick={onToggle}>← back</button>
      </div>
    );
  }
}
 
// ── Main component ───────────────────────────────────────────────────────────
// Controlled/uncontrolled hybrid: pass `topics` + `onAdd` + `onResolve` to
// wire this up to real data (e.g. a confusedVault collection populated from
// the User model's confusedVault ref). Without props it runs on local state
// with demo data so it's previewable on its own.
export function ConfusedVault({ topics: topicsProp ,onAdd: onAddProp, onResolve: onResolveProp }) {
  const isControlled = Array.isArray(topicsProp);
  const [localTopics, setLocalTopics] = useState(() => topicsProp );
  const topics = isControlled ? topicsProp : localTopics;
  const [loading, setLoading] = useState(true)

  const[objs,setObjs] =useState({})
 
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [vaultTopics, setVaultTopics] = useState([]);
  const [wheelSettle, setWheelSettle] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCourse, setActiveCourse] = useState("all");
  const [sortBy, setSortBy] = useState("confusion"); // "confusion" | "recent"
  const [crackedCount, setCrackedCount] = useState(0);
  const [crackingIds, setCrackingIds] = useState(() => new Set());
  // Tracks which cards are flipped to their "resources" face. A Set of ids
  // rather than one global flag, so each card's toggle state is independent.
  const [flippedIds, setFlippedIds] = useState(() => new Set());
  const toggleView = useCallback((id) => {
    console.log("iddd", id, flippedIds)

    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [flippedIds]);

  // Solved topics get a × on their card. Clicking it plays the existing
  // crumple animation (cv-crumple, already defined for the "cracking" state)
  // and then actually removes the item once the animation finishes, rather
  // than yanking it out instantly.
  const handleRemove = useCallback((item) => {
    const id = getId(item);
    setCrackingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setVaultTopics((prev) => prev.filter((t) => getId(t) !== id));
      setCrackingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCrackedCount((c) => c + 1);
      onResolveProp?.(id);
    }, 460); // matches cv-crumple's .45s duration
  }, [onResolveProp]);
 
  useEffect(() => {
    // Wheel spins for ~1.05s, then settles/fades (~0.35s), then the doors
    // swing open — a crank-then-release sequence instead of everything
    // happening at once.
    async function loadVaultData(){
      try{
        const response = await fetch("https://api.iterate-app.me/api/streak/getConfusedTopics", { credentials: "include" })
        if(!response.ok){
        throw new Error("Failed to load vault data.")
      }
        const data = await response.json()
        setVaultTopics(data)
      }catch(err){
        console.error(`Error fetching data:${err}`)
      }finally{
        setLoading(false)
      }
    }
    loadVaultData()
  
    



    const settle = setTimeout(() => setWheelSettle(true), 1050);
    const open = setTimeout(() => setDoorsOpen(true), 1200);
    return () => { clearTimeout(settle); clearTimeout(open); };
  }, []);
 
 
  
 
  const coursesPresent = useMemo(
    () => Array.from(new Set(vaultTopics.map(getCourseCode))).filter(Boolean),
    [vaultTopics]
  );

  // Actually apply search / course tab / sort — previously `visible` was
  // just `vaultTopics` with no filtering at all, which is why the search
  // box and course tabs rendered but did nothing.
  const visible = useMemo(() => {
    let list = vaultTopics;

    if (activeCourse !== "all") {
      list = list.filter((item) => getCourseCode(item) === activeCourse);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => getTopicText(item).toLowerCase().includes(q));
    }

    list = [...list].sort((a, b) =>
      sortBy === "recent"
        ? new Date(b.addedAt) - new Date(a.addedAt)
        : getConfusionLevel(b) - getConfusionLevel(a)
    );

    return list;
  }, [vaultTopics, activeCourse, search, sortBy]);
  return (
    <div className="cv-root" style={{width:"100%", height:"100%"}}>
      <style>{CSS}</style>
      <div className="cv-wrap">
        <VaultDoors open={doorsOpen} wheelSettle={wheelSettle} />
        <div className="cv-header">
          <span className="cv-title">confused vault</span>
          <p className="cv-sub">everything you weren't sure about, in one place</p>
        </div>
 
        <div className="cv-controls">
          <input
            className="cv-search" type="text" placeholder="search confused topics…"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <select className="cv-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="confusion">most confused first</option>
            <option value="recent">most recent first</option>
          </select>
          <span className="cv-cracked-tally"><b>{crackedCount}</b> cracked this session</span>
        </div>
 
  
 
        {coursesPresent.length > 1 && (
          <div className="cv-tabs">
            <button className={`cv-tab${activeCourse === "all" ? " active" : ""}`} onClick={() => setActiveCourse("all")}>all</button>
            {coursesPresent.map((c) => (
              <button key={c} className={`cv-tab${activeCourse === c ? " active" : ""}`} onClick={() => setActiveCourse(c)}>{c}</button>
            ))}
          </div>
        )}
 
        {visible.length === 0 ? (
          <div className="cv-empty">
            {console.log(`testiiiing ${visible}`)}
            {vaultTopics.length === 0
              ? "vault's empty — nothing to crack yet"
              : "nothing matches that search"}
          </div>
        ) : (
          <div className="cv-grid">
            {visible.map((item) => (
  
              <ConfusedCard
                key={getId(item)}
                item={item}
                cracking={crackingIds.has(getId(item))}
                viewMode={flippedIds.has(getId(item))}
                onToggle={() => toggleView(getId(item))}
                resolved={getResolved(item)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
// ── Demo data / default export for standalone preview ───────────────────────

function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
 
export default function ConfusedVaultDemo() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%" , display:"flex",flexDirection:"row"}}>
        <SideNav/>
        <div style={{width:"100%" ,display:"flex", justifyContent:"center"}}>
            <ConfusedVault />
        </div>
        
      </div>
    </div>
  );
}