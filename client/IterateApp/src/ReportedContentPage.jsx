import { useEffect, useState } from "react";
import { SideNav } from "./iterate-app";

// ── Design tokens (scoped to .rc-root) ──────────────────────────────────────
// Same variable names / font as InterviewPage.jsx / CompanyGuidePage.jsx so
// this reads as the same app.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.rc-root *{box-sizing:border-box;margin:0;padding:0}
.rc-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --danger:#c0433d;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  width:100%;
}
.rc-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto}

.rc-header{margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1.5px solid var(--gray4)}
.rc-title{font-family:var(--font);font-size:42px;font-weight:700;display:inline-block;transform:rotate(-0.5deg)}
.rc-sub{font-family:var(--font);font-size:16px;color:var(--gray2);font-style:italic;margin-top:2px}

.rc-list{display:flex;flex-direction:column;gap:14px}
@keyframes rc-popIn{0%{transform:scale(.6) rotate(var(--r,0deg));opacity:0}60%{transform:scale(1.02) rotate(var(--r,0deg))}100%{transform:scale(1) rotate(var(--r,0deg));opacity:1}}
.rc-card{--r:0deg;background:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%);
  border:1.5px solid var(--gray4);border-left:3px solid var(--danger);
  border-radius:2px 14px 4px 12px;padding:1rem 1.1rem;
  position:relative;transform:rotate(var(--r));animation:rc-popIn .3s ease both;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25)}
.rc-card::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}

.rc-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;
  flex-wrap:wrap;margin-bottom:8px}
.rc-material{font-family:var(--font);font-size:20px;font-weight:700;line-height:1.2}
.rc-material-type{font-size:13px;color:var(--gray2);font-style:italic;margin-top:2px}
.rc-reporter{font-family:var(--font);font-size:14px;color:var(--gray1);
  background:var(--paper3);border:1px solid var(--gray4);border-radius:20px;
  padding:2px 12px;white-space:nowrap}

.rc-message-label{font-size:13px;color:var(--gray2);font-style:italic;margin-bottom:2px}
.rc-message{font-size:16.5px;color:var(--ink);padding-left:8px;border-left:2px solid var(--gray4)}
.rc-no-message{font-size:15px;color:var(--gray3);font-style:italic;padding-left:8px}

.rc-status{font-family:var(--font);font-size:19px;color:var(--gray2);font-style:italic;
  text-align:center;padding:2.5rem 0}
.rc-status--error{color:var(--danger)}
.rc-empty{font-family:var(--font);font-size:17px;color:var(--gray2);font-style:italic;
  text-align:center;padding:2.5rem 0}
`;

export default function ReportedContentPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      setLoading(true);
      try {
        const res = await fetch("https://api.iterate-app.me/api/streak/getReportedContents", { credentials: "include" });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        console.log(data)
        if (!cancelled) setReports(data.data ?? data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReports();
    return () => { cancelled = true; };
  }, []);

  // Same deterministic wobble used across the card grids elsewhere in the app.
  const rotFor = (i) => [-0.4, 0.25, -0.15, 0.35, -0.3, 0.2][i % 6];

  return (
    <div className="rc-root">
      <style>{CSS}</style>
      <div className="rc-wrap">
        <div className="rc-header">
          <span className="rc-title">Reported Content</span>
          <p className="rc-sub">{reports.length} item{reports.length === 1 ? "" : "s"} flagged for review</p>
        </div>

        {loading && <div className="rc-status">loading reports…</div>}
        {error && <div className="rc-status rc-status--error">{error}</div>}

        {!loading && !error && (
          <div className="rc-list">
            {reports.map((r, i) => (
              <div className="rc-card" style={{ "--r": `${rotFor(i)}deg` }} key={r._id ?? i}>
                <div className="rc-card-top">
                  <div>
                    <div className="rc-material">
                      {r.material?.topic || r.material?.name || "untitled material"}
                    </div>
                    {r.material?.courseCode && <div className="rc-material-type">{r.material.courseCode}</div>}
                    
                  </div>
                  <span className="rc-reporter">
                    reported by {r.addedBy?.name || r.addedBy?.username || r.addedBy?.email || "unknown user"}
                  </span>
                </div>

                {r.message ? (
                  <>
                    <p className="rc-message-label">reason</p>
                    <p className="rc-message">{r.message}</p>
                  </>
                ) : (
                  <p className="rc-no-message">no message provided</p>
                )}
              </div>
            ))}

            {reports.length === 0 && (
              <p className="rc-empty">no reported content — all clear</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportedContentPageWithNav() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideNav />
      <ReportedContentPage />
    </div>
  );
}
export { ReportedContentPageWithNav };