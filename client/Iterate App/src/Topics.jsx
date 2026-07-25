import { useEffect, useState } from "react";
import { SideNav } from "./iterate-app";

// ── Design tokens (scoped to .tp-root) ──────────────────────────────────────
// Shares variable names / font with RevisionTree.jsx and confusedVault.jsx's
// CSS exports so this page feels like the same app, not a bolted-on screen.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.tp-root *{box-sizing:border-box;margin:0;padding:0}
.tp-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  width:100%;
}
.tp-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto}

.tp-header{text-align:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1.5px solid var(--gray4)}
.tp-title{font-family:var(--font);font-size:44px;font-weight:700;display:inline-block;transform:rotate(-0.6deg)}
.tp-sub{font-family:var(--font);font-size:16px;color:var(--gray2);font-style:italic;margin-top:2px}

.tp-tabs{display:flex;gap:8px;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center;justify-content:center}
.tp-tab{font-family:var(--font);font-size:15px;font-weight:600;padding:4px 14px;background:var(--paper);
  color:var(--gray2);border:1.5px solid var(--gray4);cursor:pointer;transition:all .12s;transform:rotate(-0.3deg)}
.tp-tab.active{background:var(--ink);color:var(--paper);border-color:var(--ink);transform:rotate(0.2deg)}
.tp-tab:hover:not(.active){background:var(--paper3);color:var(--gray1)}
.tp-tabs-divider{width:1.5px;height:20px;background:var(--gray4);margin:0 4px}

/* ── Cards grid ── */
.tp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:1.5rem}
@keyframes tp-popIn{0%{transform:scale(.6) rotate(var(--r,0deg));opacity:0}60%{transform:scale(1.05) rotate(var(--r,0deg))}100%{transform:scale(1) rotate(var(--r,0deg));opacity:1}}
.tp-card{--r:0deg;
  background-color:var(--paper);
  background-image:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%),
    repeating-linear-gradient(to bottom, transparent, transparent 24px, var(--gray4) 24px, var(--gray4) 25px);
  background-position:0 0, 0 4px;
  border:1.5px solid var(--gray4);border-radius:2px 14px 4px 12px;padding:1.1rem 1.1rem 1rem;
  position:relative;transform:rotate(var(--r));animation:tp-popIn .3s ease both;
  display:flex;flex-direction:column;gap:14px;min-height:250px;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25);
  transition:box-shadow .15s ease, transform .15s ease}
.tp-card:hover{box-shadow:3px 5px 0 rgba(26,26,24,0.07), 0 12px 24px -10px rgba(26,26,24,0.28)}
.tp-card::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.tp-card.enrolled{border-color:var(--ink);border-style:solid}
.tp-card.rating{border-color:var(--ink);background-image:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%)}

.tp-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
.tp-card-code{font-family:var(--font);font-size:13px;font-weight:600;padding:2px 10px;background:var(--paper3);
  border:1px solid var(--gray4);border-radius:20px;color:var(--gray1);letter-spacing:.2px;align-self:flex-start}
.tp-card-title{font-family:var(--font);font-size:24px;font-weight:700;line-height:1.15}

.tp-card-tags{display:flex;gap:6px;flex-wrap:wrap}
.tp-card-tag{font-family:var(--font);font-size:13px;padding:1px 10px;border:1px dashed var(--gray3);
  border-radius:14px;color:var(--gray2)}

.tp-enrolled-row{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--gray1);
  padding-top:8px;border-top:1px dashed var(--gray4)}
.tp-enrolled-dot{width:7px;height:7px;border-radius:50%;background:var(--ink);flex-shrink:0}
.tp-enrolled-conf{margin-left:auto;font-size:14px;color:var(--gray2)}

.tp-cta{font-family:var(--font);font-size:16px;font-weight:700;padding:6px 14px;margin-top:auto;
  background:var(--paper);border:1.5px dashed var(--gray2);color:var(--gray1);cursor:pointer;
  border-radius:14px;transition:all .12s;width:100%;text-align:center}
.tp-cta:hover{background:var(--ink);color:var(--paper);border-style:solid;border-color:var(--ink);transform:translateY(-1px)}
.tp-cta:active{transform:scale(0.97)}
.tp-cta.done{background:var(--ink);color:var(--paper);border-color:var(--ink);border-style:solid;cursor:default}
.tp-cta.done:hover{transform:none}

/* ── Rating mode ── */
.tp-rate-prompt{text-align:center}
.tp-rate-q{font-family:var(--font);font-size:19px;font-weight:700;line-height:1.25}
.tp-rate-q em{color:var(--gray1);font-style:italic}
.tp-rate-id{font-size:13px;color:var(--gray3);margin-top:2px}
.tp-dots{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.tp-dot{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--gray4);background:var(--paper);
  color:var(--gray2);font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .1s}
.tp-dot.filled{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.tp-bar-track{height:4px;background:var(--paper3);border-radius:2px;overflow:hidden;margin:0 2px}
.tp-bar-fill{height:100%;background:var(--ink);border-radius:2px;transition:width .25s}
.tp-bar-labels{display:flex;justify-content:space-between;font-size:12px;color:var(--gray3);margin-top:3px;font-style:italic}
.tp-rate-cancel{background:none;border:none;cursor:pointer;font-family:var(--font);font-size:14px;
  color:var(--gray2);text-decoration:underline;text-underline-offset:2px}
.tp-rate-cancel:hover{color:var(--ink)}

.tp-empty{grid-column:1/-1;font-family:var(--font);font-size:17px;color:var(--gray2);font-style:italic;
  text-align:center;padding:2.5rem 0}

/* ── Toast ── */
.tp-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);
  color:var(--paper);padding:8px 20px;border-radius:2px 10px 2px 10px;font-family:var(--font);
  font-size:16px;font-weight:600;white-space:nowrap;z-index:999;animation:tp-toastIn .2s ease;
  border:1.5px solid var(--ink)}
@keyframes tp-toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

const DEPTS  = ["All", "CSE", "MAT"];
const LEVELS = ["All levels", "Foundation", "Intermediate", "Advanced"];

// ─── CourseCard ─────────────────────────────────────────────────────────────
function CourseCard({ course, onEnroll, user, state, courseConfidence, rot }) {
  // state: 'default' | 'rating' | 'enrolled'
  const [cardState, setCardState] = useState(state);
  const [confidence, setConfidence] = useState(courseConfidence);
  const [enrolledConf, setEnrolledConf] = useState(null);

  function startRating() { setCardState("rating"); setConfidence(0); }
  function cancel()      { setCardState("default"); setConfidence(0); }

  function confirm() {
    if (!confidence) return;
    setEnrolledConf(confidence);
    setCardState("enrolled");
    onEnroll({ userID:user, course:course, courseCode: course.courseCode, confidenceScore: confidence });
  }

  const cardClass = `tp-card${cardState === "enrolled" ? " enrolled" : ""}${cardState === "rating" ? " rating" : ""}`;
  const style = { "--r": `${rot}deg` };

  // ── Rating mode ──
  if (cardState === "rating") {
    return (
      <div className={cardClass} style={style}>
        <div className="tp-rate-prompt">
          <p className="tp-rate-q">How confident are you in<br /><em>{course.courseCode}</em>?</p>
          <p className="tp-rate-id">{course.id}</p>
        </div>

        <div className="tp-dots">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`tp-dot${confidence === n ? " filled" : ""}`}
              onClick={() => setConfidence(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <div>
          <div className="tp-bar-track">
            <div className="tp-bar-fill" style={{ width: `${confidence * 10}%` }} />
          </div>
          <div className="tp-bar-labels">
            <span>not at all</span><span>total expert</span>
          </div>
        </div>

        <button className="tp-cta" disabled={!confidence} onClick={confirm} style={{ opacity: confidence ? 1 : 0.4 }}>
          confirm enrolment
        </button>
        <button className="tp-rate-cancel" onClick={cancel}>cancel</button>
      </div>
    );
  }

  // ── Default & Enrolled ──
  return (
    <div className={cardClass} style={style}>
      <div className="tp-card-top">
        <span className="tp-card-code">{course.courseCode}</span>
      </div>

      <div className="tp-card-title">{course.course}</div>

      <div className="tp-card-tags">
        <span className="tp-card-tag">{course.courseCode} topics</span>
      </div>

      {cardState === "enrolled" && (
        <div className="tp-enrolled-row">
          <div className="tp-enrolled-dot" />
          <span>enrolled</span>
          <span className="tp-enrolled-conf">confidence {enrolledConf || courseConfidence}/10</span>
        </div>
      )}

      {cardState === "enrolled" ? (
        <button className="tp-cta done" disabled>✓ enrolled</button>
      ) : (
        <button className="tp-cta" onClick={startRating}>enroll →</button>
      )}
    </div>
  );
}

// ─── Topics ───────────────────────────────────────────────────────────────────
export default function Topics() {
  const [activeDept,  setActiveDept]  = useState("All");
  const [activeLevel, setActiveLevel] = useState("All levels");
  const [enrollments, setEnrollments] = useState([]); // [{ courseId, confidence, enrolledAt }]
  const [toast, setToast]             = useState(null);
  const [syncing, setSyncing]         = useState(false);
  const [courses,setCourses]          = useState([])
  const [user,setUser]                = useState("none")
  const [enrolled,setEnrolled]        = useState([])
  const [confidenceArray,setConfidenceArray]    = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function callApis(){
      try{
        console.log("initiating connection")
        const [userRes, materialsRes, progressRes] = await Promise.all([
          fetch("/api/users/",{ credentials: 'include' }).then(res=>res.json()),
          fetch("/api/materials/",{ credentials: 'include' }).then(res => res.json()),
          fetch("/api/progress/user",{ credentials: 'include' }).then(res => res.json())
        ])
        if (materialsRes?.data?.allTopics) {
          setCourses(materialsRes.data.allTopics);
        }

        if (userRes?.data) {
          setUser(userRes.data._id);
          setEnrolled(userRes.data.enRolledCourses || []); 
        }
        if (progressRes?.data){
          setConfidenceArray(progressRes.data)
        }
      }catch(err){
        console.error(`Error fetching data: ${err}`)
      }finally{
        setLoading(false)
      }
    }
    callApis()
  },[])

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function handleEnroll(data) {
    try{
      fetch("/api/users/enroll",{
      credentials: "include",
      method: 'put',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
          userID: data.userID,
          course: data.course?.course || cardData.course?.title || "Computer Science Course",
          courseCode: data.courseCode,
          confidenceScore: data.confidenceScore       // Or grab this from a form input state
        })}) 
    }catch(err){
      console.error(err)
    }
    const course = courses.find(c => c.courseCode === data.courseId);
    showToast(`✓ Enrolled in ${course?.courseCode} — confidence ${data.confidence}/10`);
  }

  // async function syncToBackend() {
  //   setSyncing(true);
  //   try {
  //     await fetch("https://your-api.com/api/enrollments", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ enrollments }),
  //     });
  //     showToast(`✓ ${enrollments.length} enrolment${enrollments.length !== 1 ? "s" : ""} synced`);
  //   } catch {
  //     showToast("Sync failed — check your connection");
  //   } finally {
  //     setSyncing(false);
  //   }
  // }

  // Small deterministic wobble per card, same spirit as the vault's --r tilt —
  // keeps cards from looking like a rigid grid without being random each render.
  const rotFor = (i) => [-0.5, 0.3, -0.2, 0.4, -0.35, 0.25][i % 6];

  return (
    <div className="tp-root">
      <style>{CSS}</style>
      <div className="tp-wrap">

        <div className="tp-header">
          <span className="tp-title">courses</span>
          <p className="tp-sub">enroll and rate your confidence — we'll calibrate your revision tree accordingly</p>
        </div>

        <div className="tp-tabs">
          {DEPTS.map(d => (
            <button key={d} className={`tp-tab${activeDept === d ? " active" : ""}`} onClick={() => setActiveDept(d)}>{d}</button>
          ))}
          <div className="tp-tabs-divider" />
          {LEVELS.map(l => (
            <button key={l} className={`tp-tab${activeLevel === l ? " active" : ""}`} onClick={() => setActiveLevel(l)}>{l}</button>
          ))}
        </div>

        <div className="tp-grid">
          {courses.map((course, i) => {
            const isEnrolled = enrolled.includes(course.courseCode);
            const currentConfidence = confidenceArray.filter(obj => obj.courseCode === course.courseCode);
            return isEnrolled ? (
              <CourseCard key={course.courseCode} course={course} onEnroll={handleEnroll} user={user} state="enrolled" courseConfidence={currentConfidence[0].confidenceScore} rot={rotFor(i)} />
            ) : (
              <CourseCard key={course.courseCode} course={course} onEnroll={handleEnroll} user={user} state="default" rot={rotFor(i)} />
            );
          })}
          {courses.length === 0 && (
            <p className="tp-empty">
              {loading ? "loading courses…" : "no courses match this filter"}
            </p>
          )}
        </div>

        {toast && <div className="tp-toast">{toast}</div>}
      </div>
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