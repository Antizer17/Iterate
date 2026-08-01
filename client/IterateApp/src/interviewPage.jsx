import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideNav } from "./iterate-app";

// ── Design tokens (scoped to .ip-root) ──────────────────────────────────────
// Same variable names / font as RevisionTree.jsx, confusedVault.jsx, and
// Topics.jsx so this page reads as the same app, not a bolted-on screen.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.ip-root *{box-sizing:border-box;margin:0;padding:0}
.ip-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  width:100%;
}
.ip-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto}

.ip-header{text-align:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1.5px solid var(--gray4)}
.ip-title{font-family:var(--font);font-size:44px;font-weight:700;display:inline-block;transform:rotate(-0.6deg)}
.ip-sub{font-family:var(--font);font-size:16px;color:var(--gray2);font-style:italic;margin-top:2px}

.ip-search{display:flex;justify-content:center;margin-bottom:1.5rem}
.ip-search input{font-family:var(--font);font-size:16px;padding:5px 14px;background:var(--paper);
  border:1.5px solid var(--gray4);color:var(--ink);width:100%;max-width:340px;transform:rotate(-0.2deg)}
.ip-search input:focus{outline:none;border-color:var(--ink)}

.ip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
@keyframes ip-popIn{0%{transform:scale(.6) rotate(var(--r,0deg));opacity:0}60%{transform:scale(1.05) rotate(var(--r,0deg))}100%{transform:scale(1) rotate(var(--r,0deg));opacity:1}}
.ip-card{--r:0deg;all:unset;cursor:pointer;box-sizing:border-box;
  background-color:var(--paper);
  background-image:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%),
    repeating-linear-gradient(to bottom, transparent, transparent 24px, var(--gray4) 24px, var(--gray4) 25px);
  background-position:0 0, 0 4px;
  border:1.5px solid var(--gray4);border-radius:2px 14px 4px 12px;padding:1.1rem 1.1rem 1rem;
  position:relative;transform:rotate(var(--r));animation:ip-popIn .3s ease both;
  display:flex;flex-direction:column;gap:10px;min-height:190px;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25);
  transition:box-shadow .15s ease, transform .15s ease}
.ip-card:hover{box-shadow:3px 5px 0 rgba(26,26,24,0.07), 0 12px 24px -10px rgba(26,26,24,0.28)}
.ip-card::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}

.ip-card-name{font-family:var(--font);font-size:24px;font-weight:700;line-height:1.15}
.ip-card-intro{font-size:14.5px;color:var(--gray1);font-style:italic;margin:0;
  padding-left:8px;border-left:2px solid var(--gray4);
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.ip-card-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;
  margin-top:auto;padding-top:8px;border-top:1px dashed var(--gray4)}
.ip-card-count{font-family:var(--font);font-size:13px;padding:1px 10px;background:var(--ink);
  border:1px solid var(--gray4);border-radius:20px;color:var(--paper3)}
.ip-card-cta{font-family:var(--font);font-size:14.5px;font-weight:700;color:var(--gray1)}
.ip-card:hover .ip-card-cta{color:var(--ink);text-decoration:underline;text-underline-offset:2px}

.ip-status{font-family:var(--font);font-size:19px;color:var(--gray2);font-style:italic;
  text-align:center;padding:2.5rem 0}
.ip-status--error{color:#c0433d}
.ip-empty{grid-column:1/-1;font-family:var(--font);font-size:17px;color:var(--gray2);font-style:italic;
  text-align:center;padding:2.5rem 0}
`;

export default function InterviewPage() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchCompanies() {
      try {
        const res = await fetch("api.iterate-app.me/api/interview/companies", { credentials: "include" });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCards(data.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCompanies();
    return () => { cancelled = true; };
  }, []);

  const visible = cards.filter((c) =>
    c.company.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Same deterministic wobble used by Topics.jsx / confusedVault.jsx so the
  // grid doesn't look rigid but also isn't re-randomized every render.
  const rotFor = (i) => [-0.5, 0.3, -0.2, 0.4, -0.35, 0.25][i % 6];

  return (
    <div className="ip-root">
      <style>{CSS}</style>
      <div className="ip-wrap">
        <div className="ip-header">
          <span className="ip-title">interview guides</span>
          <p className="ip-sub">company-by-company breakdowns — stages, questions, and what to expect</p>
        </div>

        <div className="ip-search">
          <input
            type="text"
            placeholder="search companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="ip-status">loading company guides…</div>}
        {error && <div className="ip-status ip-status--error">{error}</div>}

        {!loading && !error && (
          <div className="ip-grid">
            {visible.map((card, i) => (
              <button
                key={card.company}
                className="ip-card"
                style={{ "--r": `${rotFor(i)}deg` }}
                onClick={() => navigate(`/interview/${card.company}`)}
              >
                <div className="ip-card-name">{card.company}</div>
                <p className="ip-card-intro">{card.introduction}…</p>
                <div className="ip-card-foot">
                  <span className="ip-card-count">
                    {card.questions.length} question{card.questionCount === 1 ? "" : "s"}
                  </span>
                  <span className="ip-card-cta">view guide →</span>
                </div>
              </button>
            ))}

            {visible.length === 0 && (
              <p className="ip-empty">
                {cards.length === 0 ? "no company guides synced yet" : "no companies match that search"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InterviewPageWithNav() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideNav />
      <InterviewPage />
    </div>
  );
}
export { InterviewPageWithNav };
