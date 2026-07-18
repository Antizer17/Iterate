import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SideNav } from "./iterate-app";

// ── Design tokens (scoped to .cg-root) ──────────────────────────────────────
// Same variable names / font as RevisionTree.jsx / confusedVault.jsx /
// Topics.jsx / InterviewPage.jsx.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.cg-root *{box-sizing:border-box;margin:0;padding:0}
.cg-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --ok:#5f8d63;--amber:#b5842a;--danger:#c0433d;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  width:100%;
}
.cg-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto}

.cg-back{font-family:var(--font);font-size:15px;color:var(--gray2);background:none;border:none;
  cursor:pointer;margin-bottom:1rem;padding:2px 0}
.cg-back:hover{color:var(--ink);text-decoration:underline;text-underline-offset:2px}

.cg-header{margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1.5px solid var(--gray4)}
.cg-title{font-family:var(--font);font-size:42px;font-weight:700;display:inline-block;transform:rotate(-0.5deg)}
.cg-intro{font-size:16.5px;color:var(--gray1);font-style:italic;margin-top:8px;
  padding-left:10px;border-left:2px solid var(--gray4)}

.cg-section-title{font-family:var(--font);font-size:24px;font-weight:700;margin-bottom:0.75rem;
  display:inline-block;transform:rotate(-0.3deg)}

.cg-stages{list-style:none;margin-bottom:2rem}
.cg-stage{display:flex;align-items:baseline;gap:10px;background:var(--paper);
  border:1.5px solid var(--gray4);padding:0.55rem 0.85rem;margin-bottom:8px;
  position:relative;transform:rotate(-0.15deg)}
.cg-stage::before{content:'';position:absolute;top:-1px;right:-1px;width:7px;height:7px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.cg-stage-num{font-family:var(--font);font-size:15px;font-weight:700;color:var(--paper);
  background:var(--ink);width:22px;height:22px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center}
.cg-stage-text{font-size:16.5px;color:var(--gray1)}

.cg-questions{display:flex;flex-direction:column;gap:14px}
@keyframes cg-popIn{0%{transform:scale(.6) rotate(var(--r,0deg));opacity:0}60%{transform:scale(1.03) rotate(var(--r,0deg))}100%{transform:scale(1) rotate(var(--r,0deg));opacity:1}}
.cg-qcard{--r:0deg;background:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%);
  border:1.5px solid var(--gray4);border-radius:2px 14px 4px 12px;padding:1rem 1.1rem;
  position:relative;transform:rotate(var(--r));animation:cg-popIn .3s ease both;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25)}
.cg-qcard::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.cg-qcard-meta{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}
.cg-chip{font-family:var(--font);font-size:13px;padding:1px 10px;background:var(--paper3);
  border:1px solid var(--gray4);border-radius:20px;color:var(--gray1)}
.cg-chip--easy{border-color:var(--ok);color:var(--ok);background:rgba(95,141,99,0.1)}
.cg-chip--medium{border-color:var(--amber);color:var(--amber);background:rgba(181,132,42,0.1)}
.cg-chip--hard{border-color:var(--danger);color:var(--danger);background:rgba(192,67,61,0.1)}
.cg-qcard-text{font-family:var(--font);font-size:19px;font-weight:700;line-height:1.25;margin-bottom:6px}
.cg-qcard-details{font-size:14.5px;color:var(--gray1);font-style:italic;margin-bottom:8px;
  padding-left:8px;border-left:2px solid var(--gray4)}
.cg-qcard-code{font-family:'Courier New',monospace;font-size:13.5px;background:var(--ink);color:var(--paper);
  padding:0.75rem 0.9rem;border-radius:2px;overflow-x:auto;white-space:pre}

.cg-status{font-family:var(--font);font-size:19px;color:var(--gray2);font-style:italic;
  text-align:center;padding:2.5rem 0}
.cg-status--error{color:var(--danger)}
`;

function difficultyClass(difficulty) {
  switch ((difficulty || "").toLowerCase()) {
    case "easy": return "cg-chip--easy";
    case "hard": return "cg-chip--hard";
    default: return "cg-chip--medium";
  }
}

export default function CompanyGuidePage() {
  const { company } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGuide() {
      setLoading(true);
      try {
        const res = await fetch(`/api/interview/${company}`, { credentials: "include" });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setGuide(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGuide();
    return () => { cancelled = true; };
  }, [company]);

  // Same deterministic wobble as the card grids elsewhere in the app.
  const rotFor = (i) => [-0.4, 0.25, -0.15, 0.35, -0.3, 0.2][i % 6];

  return (
    <div className="cg-root">
      <style>{CSS}</style>
      <div className="cg-wrap">
        <button className="cg-back" onClick={() => navigate("/interview")}>
          ← back to all companies
        </button>

        {loading && <div className="cg-status">loading guide…</div>}
        {error && <div className="cg-status cg-status--error">{error}</div>}

        {guide && (
          <>
            <div className="cg-header">
              <span className="cg-title">{guide.data.company}</span>
              {guide.data.introduction && <p className="cg-intro">{guide.data.introduction}</p>}
            </div>

            {guide.data.interviewStages?.length > 0 && (
              <>
                <span className="cg-section-title">interview stages</span>
                <ol className="cg-stages">
                  {guide.data.interviewStages.map((stage, i) => (
                    <li className="cg-stage" key={i}>
                      <span className="cg-stage-num">{i + 1}</span>
                      <span className="cg-stage-text">{stage}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <span className="cg-section-title">questions ({guide.data.questions?.length || 0})</span>
            <div className="cg-questions" style={{ marginTop: "0.75rem" }}>
              {guide.data.questions?.map((q, i) => (
                <div className="cg-qcard" style={{ "--r": `${rotFor(i)}deg` }} key={i}>
                  <div className="cg-qcard-meta">
                    <span className="cg-chip">{q.category}</span>
                    <span className={`cg-chip ${difficultyClass(q.difficulty)}`}>{q.difficulty}</span>
                  </div>
                  <p className="cg-qcard-text">{q.questionText}</p>
                  {q.details && <p className="cg-qcard-details">{q.details}</p>}
                  {q.solutionCode && (
                   <details className="cg-solution-dropdown" style={{ marginTop: "1rem" }}>
    <summary style={{ cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", color: "var(--gray1)" }}>
      View Solution Code
    </summary>
    <pre className="cg-qcard-code" style={{ marginTop: "0.5rem" }}>
      <code>{q.solutionCode}</code>
    </pre>
  </details>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CompanyGuidePageWithNav() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideNav />
      <CompanyGuidePage />
    </div>
  );
}
export { CompanyGuidePageWithNav };