import { useEffect, useState } from "react";
import { SideNav } from "./iterate-app";

// ─── Data ─────────────────────────────────────────────────────────────────────
// const COURSES = [
//   { id: "CSE101", name: "Intro to Computer Science", topics: 12, desc: "Core programming concepts, problem-solving, and computational thinking." },
//   { id: "CSE221", name: "Algorithm Design & Analysis", topics: 15, desc: "Divide & conquer, dynamic programming, graph algorithms, and NP-completeness." },
//   { id: "CSE331", name: "Data Structures", topics: 15, desc: "Arrays, trees, heaps, hash tables, graphs — and when to reach for each." },
//   { id: "CSE341", name: "Operating Systems", topics: 11, desc: "Processes, threads, memory management, file systems, and concurrency." },
//   { id: "CSE351", name: "Computer Networks", topics: 10, desc: "TCP/IP, routing, DNS, HTTP, and the full network stack." },
//   { id: "CSE461", name: "Database Systems", topics: 13, desc: "Relational algebra, SQL, indexing, transactions, and query optimisation." },
//   { id: "CSE471", name: "Machine Learning", topics: 14, desc: "Supervised & unsupervised learning, neural networks, and model evaluation." },
//   { id: "MAT201", name: "Discrete Mathematics",topics: 10, desc:  "Logic, proofs, combinatorics, graph theory, and probability basics." },
//   { id: "MAT301", name: "Linear Algebra", topics: 9, desc: "Vectors, matrices, eigenvalues, and applications in ML and graphics." },
//   { id: "CSE481", name: "Compilers & Languages", topics: 12, desc: "Lexing, parsing, semantic analysis, IR generation, and code optimisation." },
// ];


const DEPTS  = ["All", "CSE", "MAT"];
const LEVELS = ["All levels", "Foundation", "Intermediate", "Advanced"];

// ─── CourseCard ───────────────────────────────────────────────────────────────
function CourseCard({ course, onEnroll }) {
  console.log(`courseCode is ${course.courseCode}`)
  // state: 'default' | 'rating' | 'enrolled'
  const [cardState, setCardState] = useState("default");
  const [confidence, setConfidence] = useState(0);
  const [enrolledConf, setEnrolledConf] = useState(null);

  function startRating() { setCardState("rating"); setConfidence(0); }
  function cancel()      { setCardState("default"); setConfidence(0); }

  function confirm() {
    if (!confidence) return;
    setEnrolledConf(confidence);
    setCardState("enrolled");
    onEnroll({ courseId: course.courseCode, confidence });
  }

  // lined paper background shared with the rest of the app
  const linedBg = {
    backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 23px, #EAE8E2 23px, #EAE8E2 24px)",
    backgroundPositionY: "8px",
  };

  const cardBase = {
    background: "#fff",
    border: `1px solid ${cardState === "enrolled" ? "#1A1A1A" : cardState === "rating" ? "#1A1A1A" : "#E0DDD5"}`,
    borderRadius: 8,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "box-shadow 0.15s, border-color 0.15s",
    position: "relative",
    ...(cardState === "rating" ? {} : linedBg),
  };

  // ── Rating mode ──
  if (cardState === "rating") {
    return (
      <div style={cardBase}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#1A1A1A", lineHeight: 1.3, marginBottom: 4 }}>
            How confident are you in<br /><em>{course.courseCode}</em>?
          </p>
          <p style={{ fontSize: 11, color: "#AAA" }}>{course.id}</p>
        </div>

        {/* 1–10 scale */}
        <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setConfidence(n)}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                border: `1.5px solid ${confidence === n ? "#1A1A1A" : "#DDD9D0"}`,
                background: confidence === n ? "#1A1A1A" : "#F7F6F2",
                color: confidence === n ? "#fff" : "#888",
                fontSize: 12, fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer", transition: "all 0.1s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {n}
            </button>
          ))}
        </div>

        {/* bar */}
        <div style={{ padding: "0 4px" }}>
          <div style={{ height: 3, background: "#EAE8E2", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${confidence * 10}%`, background: "#1A1A1A", borderRadius: 2, transition: "width 0.25s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#AAA", marginTop: 4 }}>
            <span>not at all</span><span>total expert</span>
          </div>
        </div>

        <button
          onClick={confirm}
          disabled={!confidence}
          style={{
            width: "100%", padding: "9px",
            borderRadius: 5, border: "1.5px solid #1A1A1A",
            background: "#1A1A1A", color: "#fff",
            fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            cursor: confidence ? "pointer" : "not-allowed",
            opacity: confidence ? 1 : 0.35, transition: "opacity 0.15s",
          }}
        >
          Confirm enrolment
        </button>

        <button
          onClick={cancel}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 11, color: "#AAA", textDecoration: "underline",
            textUnderlineOffset: 2, fontFamily: "'Inter', sans-serif",
          }}
        >
          cancel
        </button>
      </div>
    );
  }

  // ── Default & Enrolled ──
  return (
    <div style={cardBase}>
      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontSize: 10, fontWeight: 600, color: "#888",
          letterSpacing: "0.08em", textTransform: "uppercase",
          background: "#F7F6F2", border: "1px solid #E0DDD5",
          borderRadius: 3, padding: "2px 7px",
        }}>{course.courseCode}</span>
        {/* <span style={{ fontSize: 10, color: "#AAA", fontWeight: 500 }}>{course.dept}</span> */}
      </div>

      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#1A1A1A", lineHeight: 1.25, letterSpacing: "-0.2px" }}>
        {course.course}
      </div>

      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>{course.desc}</div>

      {/* meta tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[`${course.courseCode} topics`].map(t => (
          <span key={t} style={{ fontSize: 10, border: "1px solid #DDD9D0", borderRadius: 3, padding: "2px 8px", color: "#666" }}>{t}</span>
        ))}
      </div>

      {/* enrolled badge */}
      {cardState === "enrolled" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1A1A1A", flexShrink: 0 }} />
          <span>Enrolled</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#666" }}>confidence {enrolledConf}/10</span>
        </div>
      )}

      {/* CTA button */}
      {cardState === "enrolled" ? (
        <button
          disabled
          style={{
            width: "100%", padding: "9px", borderRadius: 5,
            border: "1.5px solid #1A1A1A", background: "#1A1A1A",
            color: "#fff", fontSize: 13, fontWeight: 600,
            fontFamily: "'Inter', sans-serif", cursor: "default", marginTop: "auto",
          }}
        >
          ✓ Enrolled
        </button>
      ) : (
        <button
          onClick={startRating}
          style={{
            width: "100%", padding: "9px", borderRadius: 5,
            border: "1.5px solid #1A1A1A", background: "transparent",
            color: "#1A1A1A", fontSize: 13, fontWeight: 600,
            fontFamily: "'Inter', sans-serif", cursor: "pointer",
            transition: "background 0.15s, color 0.15s", marginTop: "auto",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A1A"; }}
        >
          Enroll →
        </button>
      )}
    </div>
  );
}

// ─── Topics ───────────────────────────────────────────────────────────────────
export default function Topics() {
  const [activeDept,  setActiveDept]  = useState("All");
  const [activeLevel, setActiveLevel] = useState("All levels");
  const [enrollments, setEnrollments] = useState({}); // [{ courseId, confidence, enrolledAt }]
  const [toast, setToast]             = useState(null);
  const [syncing, setSyncing]         = useState(false);
  const [courses,setCourses]          = useState([])

  useEffect(()=>{
    fetch("http://localhost:1700/api/materials/")
      .then(res=>res.json())
      .then(data=>{setCourses(data['data']['allTopics'])})
      
  },[])
  console.log(courses)

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function handleEnroll(data) {
    setEnrollments(data);
    const course = courses.find(c => c.courseCode === data.courseId);
    showToast(`✓ Enrolled in ${course?.courseCode} — confidence ${data.confidence}/10`);
  }

  async function syncToBackend() {
    setSyncing(true);
    try {
      await fetch("https://your-api.com/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollments }),
      });
      showToast(`✓ ${enrollments.length} enrolment${enrollments.length !== 1 ? "s" : ""} synced`);
    } catch {
      showToast("Sync failed — check your connection");
    } finally {
      setSyncing(false);
    }
  }

  // const filtered = courses.filter(c =>
  //   (activeDept  === "All"        || c.dept  === activeDept) &&
  //   (activeLevel === "All levels" || c.level === activeLevel)
  // );

  // const enrolledIds  = new Set(enrollments.map(e => e.courseId));
  // const enrolledCount = enrolledIds.size;
  // const topicsUnlocked = enrollments.reduce((a, e) => {
  //   const c = courses.find(x => x.courseCode === e.courseId);
  //   return a + (c?.topics ?? 0);
  // }, 0);
  // const avgConf = enrolledCount
  //   ? (enrollments.reduce((a, e) => a + e.confidence, 0) / enrolledCount).toFixed(1)
  //   : "—";

  // ── Filter pill ──
  const FilterBtn = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        border: `1px solid ${active ? "#1A1A1A" : "#C8C5BC"}`,
        borderRadius: 4,
        background: active ? "#1A1A1A" : "#F7F6F2",
        color: active ? "#fff" : "#666",
        fontSize: 12, fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer", transition: "all 0.12s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: "32px 36px",minWidth:"88%", maxWidth: 860, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#1A1A1A", letterSpacing: "-0.4px", marginBottom: 4 }}>
          Topics
        </h1>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
          Enroll in courses and rate your confidence — we'll calibrate your revision tree accordingly.
        </p>
      </div>

      {/* Summary bar */}
      {/* <div style={{
        background: "#fff", border: "1px solid #E0DDD5", borderRadius: 6,
        padding: "14px 20px", marginBottom: 20,
        display: "flex", gap: 24, alignItems: "center",
      }}>
        {[
          { val: enrolledCount, lbl: "enrolled" },
          { val: avgConf,       lbl: "avg confidence" },
          { val: topicsUnlocked, lbl: "topics unlocked" },
        ].map(({ val, lbl }, i) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {i > 0 && <div style={{ width: 1, height: 32, background: "#E0DDD5" }} />}
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1A1A1A", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10, color: "#999", textTransform: "lowercase", letterSpacing: "0.05em", marginTop: 2 }}>{lbl}</div>
            </div>
          </div>
        ))}
        <button
          onClick={syncToBackend}
          disabled={enrolledCount === 0 || syncing}
          style={{
            marginLeft: "auto", padding: "8px 16px",
            border: "1.5px solid #1A1A1A", borderRadius: 5,
            background: "transparent", color: "#1A1A1A",
            fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            cursor: enrolledCount === 0 || syncing ? "not-allowed" : "pointer",
            opacity: enrolledCount === 0 ? 0.35 : 1,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (enrolledCount > 0 && !syncing) { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#fff"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A1A"; }}
        >
          {syncing ? "Syncing…" : "Sync to backend ↗"}
        </button>
      </div> */}

      {/* Filter row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        {DEPTS.map(d => (
          <FilterBtn key={d} label={d} active={activeDept === d} onClick={() => setActiveDept(d)} />
        ))}
        <div style={{ width: 1, height: 24, background: "#DDD9D0", margin: "0 4px" }} />
        {LEVELS.map(l => (
          <FilterBtn key={l} label={l} active={activeLevel === l} onClick={() => setActiveLevel(l)} />
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {courses.map(course => (
          <CourseCard key={course.courseCode} course={course} onEnroll={handleEnroll} />
        ))}
        {courses.length === 0 && (
          <p style={{ gridColumn: "1/-1", fontSize: 13, color: "#AAA", textAlign: "center", padding: "40px 0" }}>
            No courses match this filter.
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1A1A1A", color: "#fff", padding: "10px 20px", borderRadius: 6,
          fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif",
          whiteSpace: "nowrap", zIndex: 999,
          animation: "fadeIn 0.2s ease",
        }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
function TopicPage(){
  return(
    <div style={{display:"flex", flexDirection:"row"}}>
      <SideNav/>
      <Topics/>
    </div>
  )
}
export {TopicPage};